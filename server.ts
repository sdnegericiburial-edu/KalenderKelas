import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Kalender Kegiatan Kelas SD" });
});

// API endpoint for generating SD class events / ideas using Gemini AI
app.post("/api/ai/generate-events", async (req, res) => {
  try {
    const { prompt, academicYear, classLevel, theme } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Anda adalah asisten kurikulum dan guru Sekolah Dasar (SD) profesional di Indonesia. 
Tugas Anda adalah menghasilkan daftar kegiatan/agenda kalender pendidikan atau kegiatan kelas SD secara realistis dan sesuai Kurikulum Merdeka / Kalender Pendidikan Indonesia.
Hasil HARUS berupa JSON array yang berisi objek kegiatan.
Masing-masing objek kegiatan wajib memiliki properti:
- title: Nama kegiatan singkat (misal: "Projek P5: Olah Sampah Plastik", "Ulangan Harian Matematika Bab 2", "Peringatan Hari Sumpah Pemuda")
- startDate: Tanggal mulai dalam format YYYY-MM-DD
- endDate: Tanggal selesai dalam format YYYY-MM-DD (sama dengan startDate jika 1 hari)
- category: Salah satu dari: "libur_nasional", "ujian", "mpls", "rapor", "projek_p5", "kegiatan_sekolah", "kegiatan_kelas"
- description: Penjelasan singkat tujuan/persiapan kegiatan
- color: Kode warna HEX acuan (contoh: "#ef4444" untuk libur, "#f59e0b" untuk ujian, "#10b981" untuk mpls/rapor, "#8b5cf6" untuk projek p5, "#06b6d4" untuk kelas)
Tahun ajaran saat ini adalah ${academicYear || "2026/2027"}. Kelas: ${classLevel || "SD"}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Buatkan usulan jadwal kegiatan kelas SD berdasarkan permintaan berikut: ${prompt}. Tema/Topik: ${theme || "Umum"}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              color: { type: Type.STRING },
            },
            required: ["title", "startDate", "endDate", "category", "description"],
          },
        },
      },
    });

    const jsonText = response.text || "[]";
    const events = JSON.parse(jsonText);
    res.json({ success: true, events });
  } catch (error: any) {
    console.error("Gemini AI error:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan kegiatan dengan AI" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
