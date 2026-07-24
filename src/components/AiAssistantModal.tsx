import React, { useState } from "react";
import { SchoolInfo, CalendarEvent } from "../types";
import { Sparkles, Send, Plus, Check, Loader2, Lightbulb, BookOpen, Calendar, HelpCircle } from "lucide-react";

interface AiAssistantModalProps {
  schoolInfo: SchoolInfo;
  onAddEventsBatch: (newEvents: Omit<CalendarEvent, "id">[]) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  schoolInfo,
  onAddEventsBatch,
}) => {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("Projek P5 & Kegiatan Kelas");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedEvents, setGeneratedEvents] = useState<any[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const samplePrompts = [
    {
      title: "Rencana Projek P5 (Gaya Hidup Berkelanjutan)",
      prompt: "Buatkan rancangan kegiatan Projek P5 Tema Gaya Hidup Berkelanjutan untuk siswa SD Kelas 4 selama 2 minggu di bulan Oktober.",
      theme: "P5",
    },
    {
      title: "Jadwal Ulangan & Remedial Matematika",
      prompt: "Buatkan usulan jadwal ulangan harian, pembahasan, dan remedial Matematika Bab 2 untuk bulan November.",
      theme: "Ujian & Remedial",
    },
    {
      title: "Masa Pengenalan Lingkungan Sekolah (MPLS)",
      prompt: "Buatkan urutan agenda MPLS SD 3 hari pertama masuk sekolah lengkap dengan kegiatan perkenalan dan materi budi pekerti.",
      theme: "MPLS",
    },
    {
      title: "Peringatan Hari Sumpah Pemuda & Bulan Bahasa",
      prompt: "Buatkan usulan kegiatan lomba dan peringatan Sumpah Pemuda & Bulan Bahasa SD di akhir bulan Oktober.",
      theme: "Kegiatan Kelas",
    },
  ];

  const handleGenerate = async (customPrompt?: string, customTheme?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedEvents([]);
    setAddedIds(new Set());

    try {
      const response = await fetch("/api/ai/generate-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          academicYear: schoolInfo.academicYear,
          classLevel: schoolInfo.className || "SD",
          theme: customTheme || theme,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menghubungi AI Server.");
      }

      setGeneratedEvents(data.events || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat meminta saran kegiatan dari AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingle = (idx: number, item: any) => {
    const month = new Date(item.startDate).getMonth() + 1;
    const semester: 1 | 2 = month >= 7 ? 1 : 2;

    onAddEventsBatch([
      {
        title: item.title,
        startDate: item.startDate,
        endDate: item.endDate || item.startDate,
        category: item.category || "kegiatan_kelas",
        color: item.color || "#8b5cf6",
        description: item.description || "",
        semester,
      },
    ]);

    setAddedIds((prev) => new Set([...prev, idx]));
  };

  const handleAddAll = () => {
    const batch = generatedEvents.map((item) => {
      const month = new Date(item.startDate).getMonth() + 1;
      const semester: 1 | 2 = month >= 7 ? 1 : 2;
      return {
        title: item.title,
        startDate: item.startDate,
        endDate: item.endDate || item.startDate,
        category: item.category || "kegiatan_kelas",
        color: item.color || "#8b5cf6",
        description: item.description || "",
        semester,
      };
    });

    onAddEventsBatch(batch);
    setAddedIds(new Set(generatedEvents.map((_, i) => i)));
  };

  return (
    <div className="bg-[#FDFCF0] min-h-screen p-3 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 rounded-3xl p-6 text-white shadow-md border-2 border-pink-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                AI Asisten Kegiatan Kelas & P5 SD
              </h2>
              <p className="text-xs font-bold text-white/90 mt-0.5">
                Rencanakan agenda kegiatan kelas, projek Kurikulum Merdeka, ulangan, dan kegiatan peringatan hari besar secara otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Input & Prompt Presets */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-yellow-200 space-y-5">
          
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-950">
              💡 Pilih Contoh Rancangan Kegiatan Siap Pakai:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(sp.prompt);
                    setTheme(sp.theme);
                    handleGenerate(sp.prompt, sp.theme);
                  }}
                  className="text-left p-4 bg-yellow-50/70 hover:bg-yellow-100/90 border-2 border-yellow-200 rounded-2xl transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 font-black text-xs text-amber-950 group-hover:text-pink-600">
                    <Lightbulb className="w-4 h-4 text-pink-500 shrink-0" />
                    <span>{sp.title}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 line-clamp-2 mt-1.5">
                    "{sp.prompt}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t-2 border-yellow-100">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-950">
              ✍️ Atau Tuliskan Instruksi Khusus Anda:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="misal: Buatkan jadwal peringatan Hari Pahlawan tanggal 10 November dan lomba puisi..."
                className="flex-1 px-5 py-3 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 disabled:bg-slate-300 text-white font-black text-xs rounded-full shadow-xs transition-colors cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Buat Agenda</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl text-rose-700 text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* AI Results */}
        {generatedEvents.length > 0 && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-yellow-200 space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-yellow-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <h3 className="font-black text-sm text-slate-900">
                  Hasil Usulan Kegiatan dari AI ({generatedEvents.length} Item)
                </h3>
              </div>

              <button
                onClick={handleAddAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 text-white text-xs font-black rounded-full shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Tambah Semua ke Kalender</span>
              </button>
            </div>

            <div className="space-y-3">
              {generatedEvents.map((item, idx) => {
                const isAdded = addedIds.has(idx);

                return (
                  <div
                    key={idx}
                    className="p-4 bg-yellow-50/40 border-2 border-yellow-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: item.color || "#FF5C8D" }}
                        />
                        <h4 className="font-black text-sm text-slate-900">{item.title}</h4>
                      </div>

                      <div className="text-xs font-bold text-pink-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {item.startDate} {item.endDate !== item.startDate && `s/d ${item.endDate}`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleAddSingle(idx, item)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-black shrink-0 transition-colors cursor-pointer ${
                        isAdded
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-pink-500 hover:bg-pink-600 text-white shadow-2xs"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Sudah Ditambah</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>+ Tambahkan</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
