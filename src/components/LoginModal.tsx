import React, { useState } from "react";
import { X, UserCheck, UserPlus, Check, Edit2, Trash2, ShieldAlert, Palette, ArrowLeft } from "lucide-react";
import { TeacherUser } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherUser[];
  activeTeacher: TeacherUser;
  onSelectTeacher: (teacher: TeacherUser) => void;
  onAddTeacher: (teacher: TeacherUser) => void;
  onUpdateTeacher: (teacher: TeacherUser) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

const AVATAR_COLORS = [
  "#FF5C8D", // Pink
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Rose
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  teachers,
  activeTeacher,
  onSelectTeacher,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<"switch" | "register" | "edit">("switch");
  
  // Register / Add Teacher form state
  const [newName, setNewName] = useState("");
  const [newNip, setNewNip] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("SD Negeri Ciburial");
  const [newEmail, setNewEmail] = useState("");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  // Edit Teacher form state
  const [editingTeacher, setEditingTeacher] = useState<TeacherUser | null>(null);

  // Delete Teacher confirmation state
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherUser | null>(null);

  if (!isOpen) return null;

  const resetRegisterForm = () => {
    setNewName("");
    setNewNip("");
    setNewClassName("");
    setNewSchoolName("SD Negeri Ciburial");
    setNewEmail("");
    setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  };

  const handleStartAdd = () => {
    resetRegisterForm();
    setActiveTab("register");
  };

  const handleStartEdit = (e: React.MouseEvent, teacher: TeacherUser) => {
    e.stopPropagation();
    setEditingTeacher(teacher);
    setSelectedColor(teacher.avatarColor || AVATAR_COLORS[0]);
    setActiveTab("edit");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClassName.trim()) return;

    const createdTeacher: TeacherUser = {
      id: "teacher-" + Date.now(),
      name: newName.trim(),
      nip: newNip.trim() || "-",
      className: newClassName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, ".")}@sekolah.id`,
      schoolName: newSchoolName.trim() || "SD Negeri Ciburial",
      academicYear: "2026/2027",
      city: "Bandung Barat",
      avatarColor: selectedColor,
    };

    onAddTeacher(createdTeacher);
    onSelectTeacher(createdTeacher);
    resetRegisterForm();
    setActiveTab("switch");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editingTeacher.name.trim() || !editingTeacher.className.trim()) return;

    const updated: TeacherUser = {
      ...editingTeacher,
      name: editingTeacher.name.trim(),
      nip: editingTeacher.nip.trim() || "-",
      className: editingTeacher.className.trim(),
      schoolName: editingTeacher.schoolName.trim() || "SD Negeri Ciburial",
      avatarColor: selectedColor,
    };

    onUpdateTeacher(updated);
    setEditingTeacher(null);
    setActiveTab("switch");
  };

  const confirmDeleteTeacher = () => {
    if (!teacherToDelete) return;
    onDeleteTeacher(teacherToDelete.id);
    setTeacherToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-amber-950/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 max-w-lg w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#FFD166] text-amber-950 px-6 py-4 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black shadow-xs">
              <span>🔐</span>
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Portal Akses Guru Kelas</h3>
              <p className="text-[11px] font-bold text-amber-900/80">
                Pilih, tambah, edit, atau kelola profil guru kelas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-950 hover:text-pink-600 p-1.5 rounded-full hover:bg-amber-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b-2 border-yellow-100 bg-yellow-50/50 p-1.5 gap-2">
          <button
            onClick={() => {
              setActiveTab("switch");
              setEditingTeacher(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "switch"
                ? "bg-pink-500 text-white shadow-2xs"
                : "text-amber-950 hover:bg-yellow-100/80"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pilih Guru ({teachers.length})</span>
          </button>

          <button
            onClick={handleStartAdd}
            className={`flex-1 py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-pink-500 text-white shadow-2xs"
                : "text-amber-950 hover:bg-yellow-100/80"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Guru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          
          {/* TAB 1: LIST / SELECT GURU */}
          {activeTab === "switch" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-600">
                  Daftar Akun Guru Kelas Terdaftar:
                </p>
                <button
                  onClick={handleStartAdd}
                  className="text-pink-600 hover:text-pink-700 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Baru</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {teachers.map((t) => {
                  const isActive = t.id === activeTeacher.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSelectTeacher(t);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-pink-50 border-pink-400 shadow-xs"
                          : "bg-yellow-50/40 border-yellow-200 hover:bg-yellow-100/70 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full text-white font-black flex items-center justify-center text-sm shadow-2xs border-2 border-white shrink-0"
                          style={{ backgroundColor: t.avatarColor || "#FF5C8D" }}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-xs text-slate-900 truncate">{t.name}</h4>
                            {isActive && (
                              <span className="bg-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-pink-600 truncate">
                            {t.className} • {t.schoolName}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 truncate">NIP: {t.nip}</p>
                        </div>
                      </div>

                      {/* Controls on Teacher item */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(e, t)}
                          title="Edit Akun Guru"
                          className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={teachers.length <= 1}
                          onClick={() => setTeacherToDelete(t)}
                          title={teachers.length <= 1 ? "Minimal 1 guru harus tersisa" : "Hapus Akun Guru"}
                          className={`p-2 rounded-full transition-colors ${
                            teachers.length <= 1
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                              : "bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {isActive ? (
                          <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center ml-1">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTeacher(t);
                              onClose();
                            }}
                            className="text-xs font-bold text-amber-950 bg-yellow-200 hover:bg-amber-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer ml-1"
                          >
                            Masuk
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TAMBAH GURU BARU */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-tight">Form Tambah Guru Baru</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("switch")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                  Nama Lengkap Guru (dengan Gelar) *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="contoh: Hj. Ratna Juwita, S.Pd., M.M."
                  className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                    Pegangan Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="contoh: Kelas 3-A"
                    className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                    NIP Guru
                  </label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="19870215 201201 2 003"
                    className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Warna Profile Avatar */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-pink-500" />
                  <span>Warna Profile Avatar</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                        selectedColor === col ? "border-slate-900 scale-110 shadow-xs" : "border-white"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("switch")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black rounded-full cursor-pointer shadow-xs transition-colors"
                >
                  Simpan & Masuk Akun
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EDIT PROFIL GURU */}
          {activeTab === "edit" && editingTeacher && (
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-tight flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Edit Profil Guru ({editingTeacher.name})</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("switch");
                    setEditingTeacher(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                  Nama Lengkap Guru (dengan Gelar) *
                </label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                    Pegangan Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.className}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, className: e.target.value })}
                    className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                    NIP Guru
                  </label>
                  <input
                    type="text"
                    value={editingTeacher.nip}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, nip: e.target.value })}
                    className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={editingTeacher.schoolName}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, schoolName: e.target.value })}
                  className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Warna Profile Avatar */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-pink-500" />
                  <span>Warna Profile Avatar</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                        selectedColor === col ? "border-slate-900 scale-110 shadow-xs" : "border-white"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("switch");
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-full cursor-pointer shadow-xs transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

        </div>

        {/* DELETE CONFIRMATION OVERLAY */}
        {teacherToDelete && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-10 animate-in fade-in duration-100">
            <div className="bg-white rounded-3xl p-5 border-2 border-red-300 shadow-2xl max-w-sm w-full space-y-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h4 className="font-black text-sm uppercase">Konfirmasi Hapus Guru</h4>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Apakah Anda yakin ingin menghapus akun guru <strong>"{teacherToDelete.name}"</strong> ({teacherToDelete.className})?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTeacherToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTeacher}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-full cursor-pointer shadow-xs"
                >
                  Ya, Hapus Akun
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
