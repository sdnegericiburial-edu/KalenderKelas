import React, { useState } from "react";
import { X, UserCheck, KeyRound, UserPlus, LogIn, School, Sparkles, Check } from "lucide-react";
import { TeacherUser } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherUser[];
  activeTeacher: TeacherUser;
  onSelectTeacher: (teacher: TeacherUser) => void;
  onAddTeacher: (teacher: TeacherUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  teachers,
  activeTeacher,
  onSelectTeacher,
  onAddTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<"switch" | "register">("switch");
  
  // Register form state
  const [newName, setNewName] = useState("");
  const [newNip, setNewNip] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("SD Negeri Ciburial");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123456");

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClassName.trim()) return;

    const colors = ["#FF5C8D", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const createdTeacher: TeacherUser = {
      id: "teacher-" + Date.now(),
      name: newName.trim(),
      nip: newNip.trim() || "-",
      className: newClassName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, ".")}@sekolah.id`,
      password: newPassword,
      schoolName: newSchoolName.trim() || "SD Negeri Ciburial",
      academicYear: "2026/2027",
      city: "Bandung Barat",
      avatarColor: randomColor,
    };

    onAddTeacher(createdTeacher);
    onSelectTeacher(createdTeacher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#FFD166] text-amber-950 px-6 py-4 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black">
              <span>🔐</span>
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Portal Akses Guru Kelas</h3>
              <p className="text-[11px] font-bold text-amber-900/80">
                Pilih akun guru untuk membuka kalender kelas masing-masing
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
            onClick={() => setActiveTab("switch")}
            className={`flex-1 py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "switch"
                ? "bg-pink-500 text-white shadow-2xs"
                : "text-amber-950 hover:bg-yellow-100/80"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pilih Akun Guru ({teachers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "register"
                ? "bg-pink-500 text-white shadow-2xs"
                : "text-amber-950 hover:bg-yellow-100/80"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Guru Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "switch" ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-600">
                Klik profil guru di bawah ini untuk beralih ke Kalender Kelas yang bersangkutan:
              </p>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
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
                          ? "bg-pink-50 border-pink-400 shadow-sm"
                          : "bg-yellow-50/40 border-yellow-200 hover:bg-yellow-100/70 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full text-white font-black flex items-center justify-center text-sm shadow-2xs border-2 border-white"
                          style={{ backgroundColor: t.avatarColor || "#FF5C8D" }}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-xs text-slate-900">{t.name}</h4>
                            {isActive && (
                              <span className="bg-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                Aktif Saat Ini
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-pink-600">
                            {t.className} • {t.schoolName}
                          </p>
                          <p className="text-[10px] text-slate-400">NIP: {t.nip}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-amber-950 bg-yellow-200 hover:bg-amber-300 px-3 py-1.5 rounded-full transition-colors">
                            Masuk
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                  Nama Lengkap Guru (Gelar) *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="contoh: Ibu Ratna Juwita, S.Pd."
                  className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                    placeholder="contoh: Kelas 3A"
                    className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                    className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("switch")}
                  className="px-4 py-2 bg-yellow-100 text-amber-950 text-xs font-black rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 text-white text-xs font-black rounded-full cursor-pointer shadow-xs"
                >
                  Simpan & Masuk Akun
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
