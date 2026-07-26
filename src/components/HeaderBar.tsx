import React from "react";
import { ViewMode, SchoolInfo, TeacherUser } from "../types";
import { ACADEMIC_YEAR_OPTIONS } from "../utils/calendarUtils";
import {
  CalendarDays,
  Calendar,
  List,
  Sparkles,
  Printer,
  Plus,
  Settings,
  RotateCcw,
  Download,
  School,
  FileSpreadsheet,
  UserCheck,
  Tag,
  ChevronDown,
} from "lucide-react";

interface HeaderBarProps {
  schoolInfo: SchoolInfo;
  activeTeacher: TeacherUser;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAcademicYearChange?: (academicYear: string) => void;
  onOpenSettings: () => void;
  onOpenCategoryManager?: () => void;
  onOpenSheetsSync?: () => void;
  onOpenLogin: () => void;
  onAddEvent: () => void;
  onOpenPrint: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  schoolInfo,
  activeTeacher,
  activeView,
  onViewChange,
  onAcademicYearChange,
  onOpenSettings,
  onOpenCategoryManager,
  onOpenSheetsSync,
  onOpenLogin,
  onAddEvent,
  onOpenPrint,
  onResetData,
  onExportCSV,
  onExportJSON,
  onImportJSON,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="bg-white border-b-4 border-yellow-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Title & School Info Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl border-2 border-pink-200 shadow-2xs flex items-center justify-center font-black overflow-hidden p-1 shrink-0">
              {schoolInfo.schoolLogoUrl ? (
                <img
                  src={schoolInfo.schoolLogoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl">🍎</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Kalender Kegiatan Kelas SD
                </h1>
                
                {/* Academic Year Filter Selector */}
                <div className="relative inline-flex items-center">
                  <select
                    value={schoolInfo.academicYear}
                    onChange={(e) => onAcademicYearChange && onAcademicYearChange(e.target.value)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-amber-950 text-xs font-black pl-3 pr-7 py-1 rounded-full border-2 border-yellow-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-2xs transition-colors"
                    title="Pilih / Filter Tahun Ajaran"
                  >
                    {Array.from(new Set([schoolInfo.academicYear, ...ACADEMIC_YEAR_OPTIONS]))
                      .filter(Boolean)
                      .map((year) => (
                        <option key={year} value={year}>
                          TP {year}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-900 absolute right-2 pointer-events-none stroke-[3]" />
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <School className="w-3.5 h-3.5 text-pink-500" />
                <span className="font-bold text-slate-700">{schoolInfo.schoolName}</span>
                {schoolInfo.className && <span className="font-semibold text-pink-600">• {schoolInfo.className}</span>}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Teacher Login / Account Switcher Button */}
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-100/80 hover:bg-yellow-200 text-amber-950 text-xs font-black rounded-full border-2 border-yellow-300 transition-all cursor-pointer shadow-2xs"
              title="Ganti Akun / Profil Guru Kelas"
            >
              <div
                className="w-6 h-6 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-2xs"
                style={{ backgroundColor: activeTeacher.avatarColor || "#FF5C8D" }}
              >
                {activeTeacher.name.charAt(0)}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[11px] font-black">{activeTeacher.name}</div>
                <div className="text-[9px] text-pink-700 font-bold">{activeTeacher.className}</div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-pink-600 ml-0.5" />
            </button>

            <button
              onClick={onAddEvent}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 active:translate-y-0.5 text-white text-xs font-black rounded-full shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tambah Kegiatan</span>
            </button>

            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full shadow-2xs transition-colors cursor-pointer"
              title="Cetak Kalender & Laporan PDF"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>

            <div className="h-6 w-px bg-yellow-200 mx-1 hidden sm:block" />

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-yellow-50 hover:bg-yellow-100 text-amber-900 text-xs font-bold rounded-full border border-yellow-200 transition-colors cursor-pointer"
              title="Pengaturan Sekolah & Tanda Tangan"
            >
              <Settings className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>

            {onOpenCategoryManager && (
              <button
                onClick={onOpenCategoryManager}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-900 text-xs font-bold rounded-full border border-pink-200 transition-colors cursor-pointer"
                title="Kelola Kategori Kegiatan Agenda"
              >
                <Tag className="w-4 h-4 text-pink-600" />
                <span className="hidden sm:inline">Kategori</span>
              </button>
            )}

            {onOpenSheetsSync && (
              <button
                onClick={onOpenSheetsSync}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-black rounded-full border border-emerald-300 transition-colors cursor-pointer"
                title="Integrasi & Sinkronisasi Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Google Sheets</span>
              </button>
            )}

            <div className="relative group">
              <button
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-yellow-50 hover:bg-yellow-100 text-amber-900 text-xs font-bold rounded-full border border-yellow-200 transition-colors cursor-pointer"
                title="Ekspor & Impor Data"
              >
                <Download className="w-4 h-4 text-amber-700" />
                <span className="hidden md:inline">Ekspor</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border-2 border-yellow-100 py-2 hidden group-hover:block z-40">
                <button
                  onClick={onExportCSV}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ekspor ke Excel / CSV</span>
                </button>
                <button
                  onClick={onExportJSON}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cadangkan File (JSON)</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-600" />
                  <span>Impor File JSON</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onImportJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1 p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 rounded-full transition-colors cursor-pointer"
              title="Reset ke Contoh Kalender SD Ciburial 2025/2026"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-t border-yellow-100 mt-3.5 pt-3">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onViewChange("sheet")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                activeView === "sheet"
                  ? "bg-[#FFD166] text-slate-900 border-2 border-amber-300 shadow-2xs"
                  : "text-slate-600 hover:bg-yellow-50 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tampilan Lembaran (12 Bulan)</span>
            </button>

            <button
              onClick={() => onViewChange("monthly")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                activeView === "monthly"
                  ? "bg-[#FFD166] text-slate-900 border-2 border-amber-300 shadow-2xs"
                  : "text-slate-600 hover:bg-yellow-50 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Tampilan Bulanan</span>
            </button>

            <button
              onClick={() => onViewChange("agenda")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                activeView === "agenda"
                  ? "bg-[#FFD166] text-slate-900 border-2 border-amber-300 shadow-2xs"
                  : "text-slate-600 hover:bg-yellow-50 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
              <span>Daftar Agenda</span>
            </button>
          </nav>

          <button
            onClick={() => onViewChange("ai")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer border-b-4 ${
              activeView === "ai"
                ? "bg-purple-600 border-purple-800 text-white shadow-xs"
                : "bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Asisten Kegiatan SD</span>
          </button>
        </div>
      </div>
    </header>
  );
};
