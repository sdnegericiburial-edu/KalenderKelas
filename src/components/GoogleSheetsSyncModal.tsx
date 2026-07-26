import React, { useState } from "react";
import { SchoolInfo, CalendarEvent, EventCategory, GoogleSheetsConfig, TeacherUser } from "../types";
import { GOOGLE_APPS_SCRIPT_CODE } from "../data/gasCode";
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertCircle,
  Code2,
  ExternalLink,
  Zap,
  Info,
} from "lucide-react";

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  config: GoogleSheetsConfig;
  schoolInfo: SchoolInfo;
  events: CalendarEvent[];
  categories: EventCategory[];
  teachers?: TeacherUser[];
  onClose: () => void;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  onImportData: (data: { schoolInfo?: SchoolInfo; events?: CalendarEvent[]; categories?: EventCategory[]; teachers?: TeacherUser[] }) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  config,
  schoolInfo,
  events,
  categories,
  teachers = [],
  onClose,
  onSaveConfig,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<"sync" | "code" | "instructions">("sync");
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || "");
  const [autoSync, setAutoSync] = useState(config.autoSync || false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveConfigOnly = () => {
    onSaveConfig({
      webAppUrl: webAppUrl.trim(),
      autoSync: autoSync,
      lastSyncedAt: config.lastSyncedAt,
    });
    setStatusMessage({
      type: "success",
      text: "Konfigurasi URL Google Apps Script berhasil disimpan!",
    });
  };

  // Pull / Sync From Google Sheets
  const handleSyncFromSheets = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        type: "error",
        text: "Masukkan URL Web App Google Apps Script terlebih dahulu!",
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "info", text: "Menghubungkan ke Google Sheets..." });

    try {
      const response = await fetch(webAppUrl.trim());
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Silakan periksa URL Web App Anda.`);
      }

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Respon berupa HTML/Halaman Google (bukan JSON). Pastikan Deployment Web App di Apps Script diatur ke 'Anyone' (Siapa saja) dan URL berakhiran /exec."
        );
      }

      if (data.status === "success") {
        const importedSchool = data.schoolInfo && data.schoolInfo.schoolName ? data.schoolInfo : undefined;
        const importedEvents = Array.isArray(data.events) && data.events.length > 0 ? data.events : undefined;
        const importedCategories = Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : undefined;
        const importedTeachers = Array.isArray(data.teachers) && data.teachers.length > 0 ? data.teachers : undefined;

        onImportData({
          schoolInfo: importedSchool,
          events: importedEvents,
          categories: importedCategories,
          teachers: importedTeachers,
        });

        const now = new Date().toLocaleString("id-ID");
        onSaveConfig({
          webAppUrl: webAppUrl.trim(),
          autoSync: autoSync,
          lastSyncedAt: now,
        });

        setStatusMessage({
          type: "success",
          text: `Berhasil mengambil data dari Google Sheets! (${data.events?.length || 0} Agenda, ${data.teachers?.length || 0} Akun Guru)`,
        });
      } else {
        throw new Error(data.message || "Gagal mengambil data dari Google Sheets.");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: `Koneksi Gagal: ${err.message || "Pastikan Deployment Web App diatur ke 'Anyone/Siapa saja'."}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Push / Sync To Google Sheets
  const handleSyncToSheets = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        type: "error",
        text: "Masukkan URL Web App Google Apps Script terlebih dahulu!",
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "info", text: "Mengirim data ke Google Sheets..." });

    try {
      const payload = {
        action: "save",
        schoolInfo: schoolInfo,
        events: events,
        categories: categories,
        teachers: teachers,
      };

      const response = await fetch(webAppUrl.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Respon berupa HTML/Halaman Google (bukan JSON). Pastikan Deployment Web App di Apps Script diatur ke 'Anyone' (Siapa saja) dan URL berakhiran /exec."
        );
      }

      if (data.status === "success") {
        const now = new Date().toLocaleString("id-ID");
        onSaveConfig({
          webAppUrl: webAppUrl.trim(),
          autoSync: autoSync,
          lastSyncedAt: now,
        });

        setStatusMessage({
          type: "success",
          text: `Berhasil menyimpan data ke Google Sheets! (${events.length} Agenda, ${teachers.length} Guru tersimpan)`,
        });
      } else {
        throw new Error(data.message || "Gagal menyimpan data ke Google Sheets.");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: `Gagal Sinkronisasi: ${err.message || "Periksa izin deployment Web App di Google Apps Script."}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-amber-950/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 max-w-2xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between border-b-2 border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Integrasi Google Sheets</h3>
              <p className="text-[11px] font-bold text-emerald-100">
                Hubungkan Kalender Pendidikan ke Spreadsheet & Database Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-200 p-1.5 rounded-full hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("sync")}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sync"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-950 hover:bg-emerald-100"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Koneksi & Sinkronkan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "code"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-950 hover:bg-emerald-100"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kode Apps Script (Code.gs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("instructions")}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "instructions"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-950 hover:bg-emerald-100"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Panduan Setup (5 Langkah)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: SINKRONISASI DATA & KONEKSI */}
          {activeTab === "sync" && (
            <div className="space-y-4">
              
              {/* Endpoint Input Card */}
              <div className="bg-emerald-50/50 border-2 border-emerald-200 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                  URL Web App Google Apps Script
                </label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 bg-white border-2 border-emerald-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveConfigOnly}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Simpan URL
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                  <span>
                    Status: {config.lastSyncedAt ? (
                      <span className="text-emerald-700 font-extrabold">Terakhir Disinkronkan: {config.lastSyncedAt}</span>
                    ) : (
                      <span className="text-amber-600 italic">Belum pernah disinkronkan</span>
                    )}
                  </span>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-emerald-900 font-bold">Auto Sync Saat Perubahan</span>
                  </label>
                </div>
              </div>

              {/* Status Message Alert */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : statusMessage.type === "error"
                      ? "bg-red-50 border-red-300 text-red-800"
                      : "bg-blue-50 border-blue-300 text-blue-800"
                  }`}
                >
                  {statusMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                  {statusMessage.type === "error" && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                  {statusMessage.type === "info" && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSyncFromSheets}
                  className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl flex items-center gap-3 text-left transition-colors cursor-pointer group disabled:opacity-60"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <CloudDownload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-blue-950 uppercase tracking-tight">Ambil Data dari Sheets</h4>
                    <p className="text-[11px] font-medium text-blue-800/80">
                      Tarik data agenda & setting sekolah dari Google Sheets ke kalender
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSyncToSheets}
                  className="p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-2xl flex items-center gap-3 text-left transition-colors cursor-pointer group disabled:opacity-60"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-emerald-950 uppercase tracking-tight">Kirim Data ke Sheets</h4>
                    <p className="text-[11px] font-medium text-emerald-800/80">
                      Simpan seluruh agenda ({events.length}) & setting saat ini ke Google Sheets
                    </p>
                  </div>
                </button>
              </div>

              {/* Notice Box */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 font-medium">
                <p className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                  💡 Belum punya Google Sheets / Apps Script?
                </p>
                Buka tab <strong>"Panduan Setup"</strong> di bagian atas untuk menyalin kode <code>Code.gs</code> dan membuat database otomatis di Google Sheets baru Anda secara gratis.
              </div>

            </div>
          )}

          {/* TAB 2: KODE APPS SCRIPT (Code.gs) */}
          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Kode Apps Script (Code.gs)</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Lengkap dengan fungsi <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-pink-600">setupDatabase()</code>, <code className="font-bold text-blue-600">doGet()</code>, & <code className="font-bold text-emerald-600">doPost()</code>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? "Tersalin!" : "Salin Kode Apps Script"}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] max-h-[380px] overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN SETUP (5 LANGKAH) */}
          {activeTab === "instructions" && (
            <div className="space-y-4 text-xs text-slate-800">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <span className="font-black text-emerald-950 uppercase tracking-tight">Langkah 1 dari 5: Buat Spreadsheet Baru</span>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-[11px] hover:bg-emerald-700 transition-colors"
                >
                  <span>Buka Google Sheets Baru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-3 font-medium">
                <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                  <h5 className="font-black text-slate-900">1. Buka Google Apps Script</h5>
                  <p className="text-slate-600">Di Google Sheets baru Anda, klik menu atas: <strong>Ekstensi</strong> ➔ <strong>Apps Script</strong>.</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                  <h5 className="font-black text-slate-900">2. Tempel Kode Code.gs</h5>
                  <p className="text-slate-600">Hapus semua isi editor bawaan, lalu salin dan tempel kode dari tab <strong>"Kode Apps Script (Code.gs)"</strong>.</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                  <h5 className="font-black text-slate-900">3. Jalankan setupDatabase()</h5>
                  <p className="text-slate-600">
                    Di bagian atas editor Apps Script, pilih fungsi <strong>setupDatabase</strong> lalu klik tombol ▶ <strong>Jalankan (Run)</strong>. Ini akan secara otomatis membuat 3 Sheet (Agendas, SchoolSettings, Categories) lengkap dengan header & data contoh.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                  <h5 className="font-black text-slate-900">4. Deploy sebagai Aplikasi Web</h5>
                  <p className="text-slate-600">
                    Klik tombol biru <strong>Terapkan (Deploy)</strong> ➔ <strong>Terapkan sebagai aplikasi web (New Deployment)</strong>.
                    <br />
                    • Jalankan sebagai: <strong>Saya (Me)</strong>
                    <br />
                    • Siapa yang memiliki akses: <strong className="text-pink-600 uppercase">Siapa saja (Anyone)</strong>
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                  <h5 className="font-black text-slate-900">5. Salin URL Web App Ke Sini</h5>
                  <p className="text-slate-600">
                    Salin <strong>URL Aplikasi Web</strong> yang dihasilkan Google, lalu tempel pada input kotak di tab <strong>"Koneksi & Sinkronkan"</strong>.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-emerald-50 px-6 py-3 border-t border-emerald-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 hover:text-emerald-950 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Kode Apps Script</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-full transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
