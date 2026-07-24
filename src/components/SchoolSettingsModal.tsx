import React, { useState, useEffect } from "react";
import { SchoolInfo, TeacherUser, GoogleSheetsConfig } from "../types";
import { X, Save, School, UserCheck, Upload, Image as ImageIcon, Trash2, Tag, FileSpreadsheet, RefreshCw, CheckCircle2 } from "lucide-react";

interface SchoolSettingsModalProps {
  isOpen: boolean;
  schoolInfo: SchoolInfo;
  activeTeacher?: TeacherUser;
  sheetsConfig?: GoogleSheetsConfig;
  onClose: () => void;
  onSave: (info: SchoolInfo) => void;
  onOpenCategoryManager?: () => void;
  onOpenSheetsSync?: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  schoolInfo,
  activeTeacher,
  sheetsConfig,
  onClose,
  onSave,
  onOpenCategoryManager,
  onOpenSheetsSync,
}) => {
  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...schoolInfo });
    }
  }, [isOpen, schoolInfo]);

  if (!isOpen) return null;

  const handleSyncActiveTeacher = () => {
    if (!activeTeacher) return;
    setFormData((prev) => ({
      ...prev,
      teacherName: activeTeacher.name,
      teacherNip: activeTeacher.nip || "-",
      className: activeTeacher.className || prev.className,
      schoolName: activeTeacher.schoolName || prev.schoolName,
      city: activeTeacher.city || prev.city,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData({ ...formData, schoolLogoUrl: evt.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#FFD166] text-amber-950 px-6 py-4 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black">
              <span>🏫</span>
            </div>
            <h3 className="font-black text-base uppercase tracking-tight">Pengaturan Informasi Sekolah</h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-950 hover:text-pink-600 p-1.5 rounded-full hover:bg-amber-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Logo Sekolah Section */}
          <div className="bg-yellow-50/60 border-2 border-yellow-200 p-3.5 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-pink-600" />
                Logo Sekolah (Untuk Kop Kalender & Laporan)
              </span>
            </h4>

            <div className="flex items-center gap-4">
              {/* Logo Preview */}
              <div className="w-16 h-16 rounded-2xl border-2 border-yellow-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {formData.schoolLogoUrl ? (
                  <img
                    src={formData.schoolLogoUrl}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="text-center p-1 text-slate-300">
                    <School className="w-7 h-7 mx-auto text-slate-400" />
                    <span className="text-[9px] font-bold block text-slate-400">Default</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-1.5 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black rounded-full cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo Gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {formData.schoolLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, schoolLogoUrl: undefined })}
                    className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold rounded-full transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Logo</span>
                  </button>
                )}

                <p className="text-[10px] font-medium text-slate-500">
                  Format PNG, JPG, atau WebP (Maksimal 2MB).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
              Identitas Sekolah & Kelas
            </h4>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Nama Sekolah SD
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="contoh: SD Negeri Ciburial"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Kelas / Rombel
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="contoh: Kelas 4"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    const years = val.split("/").map(Number);
                    setFormData({
                      ...formData,
                      academicYear: val,
                      startYear: years[0] || formData.startYear,
                      endYear: years[1] || formData.endYear,
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="contoh: 2025/2026"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="contoh: Bandung Barat"
              />
            </div>
          </div>

          <div className="border-t-2 border-yellow-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-pink-600" />
                Tanda Tangan Pengesahan (Untuk Laporan Cetak)
              </h4>
            </div>

            {/* Active Teacher Banner */}
            {activeTeacher && (
              <div className="bg-[#FFD166]/20 border-2 border-amber-300 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs border-2 border-white"
                    style={{ backgroundColor: activeTeacher.avatarColor || "#FF5C8D" }}
                  >
                    {activeTeacher.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-amber-950 uppercase bg-yellow-200 px-2 py-0.5 rounded-full inline-block mb-0.5">
                      Akun Guru Aktif Saat Ini
                    </span>
                    <p className="text-xs font-black text-slate-900 truncate">{activeTeacher.name}</p>
                    <p className="text-[10px] font-semibold text-slate-600 truncate">
                      {activeTeacher.className} • NIP: {activeTeacher.nip || "-"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSyncActiveTeacher}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black rounded-full cursor-pointer transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                  title="Salin Nama, NIP, dan Kelas dari Akun Guru Aktif ke Form Tanda Tangan"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sesuaikan Data</span>
                </button>
              </div>
            )}

            {/* Kepala Sekolah */}
            <div className="bg-yellow-50/70 p-3.5 rounded-2xl space-y-2 border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">1. Penandatangan Kepala Sekolah (Kiri):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Lengkap Kepala Sekolah</label>
                  <input
                    type="text"
                    placeholder="contoh: Hj. Siti Rohmah, S.Pd., M.M."
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border-2 border-yellow-200 focus:border-pink-500 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    placeholder="197203151994032001"
                    value={formData.principalNip}
                    onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border-2 border-yellow-200 focus:border-pink-500 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Guru Kelas */}
            <div className="bg-yellow-50/70 p-3.5 rounded-2xl space-y-2 border-2 border-yellow-200">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-black text-slate-900 uppercase">2. Penandatangan Guru Kelas (Kanan):</span>
                {activeTeacher && (
                  <button
                    type="button"
                    onClick={handleSyncActiveTeacher}
                    className="text-[10px] font-black text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Pakai Akun {activeTeacher.name.split(" ")[0]}</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Guru Kelas</label>
                  <input
                    type="text"
                    placeholder="contoh: Ratna Juwita, S.Pd."
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border-2 border-yellow-200 focus:border-pink-500 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">NIP Guru Kelas</label>
                  <input
                    type="text"
                    placeholder="19870215 201201 2 003"
                    value={formData.teacherNip}
                    onChange={(e) => setFormData({ ...formData, teacherNip: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border-2 border-yellow-200 focus:border-pink-500 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Google Sheets Sync Banner Indicator */}
          {sheetsConfig?.webAppUrl ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-emerald-950">Penyimpanan Otomatis Ke Google Sheets Active</p>
                  <p className="text-[10px] text-emerald-700 font-medium truncate">
                    Data sekolah & tanda tangan akan tersimpan otomatis ke Spreadsheet saat Anda menekan tombol Simpan.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-200 p-3 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-amber-950">Integrasi Google Sheets Database</p>
                  <p className="text-[10px] text-amber-700 font-medium truncate">
                    Hubungkan Google Sheets agar data disimpan secara online dan dapat diakses bersama.
                  </p>
                </div>
              </div>
              {onOpenSheetsSync && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSheetsSync();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-full cursor-pointer shrink-0 transition-colors shadow-2xs"
                >
                  Hubungkan
                </button>
              )}
            </div>
          )}

          <div className="border-t-2 border-yellow-100 pt-3 space-y-2">
            {onOpenCategoryManager && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCategoryManager();
                }}
                className="w-full py-2 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 text-pink-700 text-xs font-black rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Tag className="w-4 h-4 text-pink-600" />
                <span>Kelola Kategori Kegiatan Agenda</span>
              </button>
            )}

            {onOpenSheetsSync && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSheetsSync();
                }}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-800 text-xs font-black rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Integrasi Google Sheets & Database Online</span>
              </button>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-amber-950 text-xs font-black rounded-full transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 text-white text-xs font-black rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan & Sync Database"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
