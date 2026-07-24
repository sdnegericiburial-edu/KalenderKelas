import React, { useState } from "react";
import { EventCategory } from "../types";
import { X, Plus, Trash2, Edit2, Check, Palette, Tag, AlertCircle } from "lucide-react";

interface CategoryManagerModalProps {
  isOpen: boolean;
  categories: EventCategory[];
  onClose: () => void;
  onAddCategory: (category: Omit<EventCategory, "id">) => void;
  onEditCategory: (id: string, updated: Omit<EventCategory, "id">) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  { name: "Merah / Libur", hex: "#ef4444" },
  { name: "Kuning / Ujian", hex: "#f59e0b" },
  { name: "Hijau / Masuk", hex: "#10b981" },
  { name: "Biru Sky / Rapor", hex: "#0284c7" },
  { name: "Orange / Sekolah", hex: "#f97316" },
  { name: "Ungu / P5", hex: "#8b5cf6" },
  { name: "Pink / Cuti", hex: "#ec4899" },
  { name: "Teal / Ekskul", hex: "#14b8a6" },
  { name: "Indigo / Rapat", hex: "#6366f1" },
  { name: "Lime / Lomba", hex: "#84cc16" },
  { name: "Rose / Spesial", hex: "#f43f5e" },
  { name: "Abu-abu / Dinas", hex: "#64748b" },
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  categories,
  onClose,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  // Add / Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId(null);
    setLabel("");
    setColor("#3b82f6");
    setErrorMsg("");
  };

  const handleStartEdit = (cat: EventCategory) => {
    setEditingId(cat.id);
    setLabel(cat.label);
    setColor(cat.color || "#3b82f6");
    setErrorMsg("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setErrorMsg("Nama kategori tidak boleh kosong!");
      return;
    }

    if (editingId) {
      // Edit mode
      onEditCategory(editingId, {
        label: label.trim(),
        color: color,
      });
      setEditingId(null);
    } else {
      // Add mode
      onAddCategory({
        label: label.trim(),
        color: color,
      });
    }

    // Reset form
    setLabel("");
    setColor("#3b82f6");
    setErrorMsg("");
  };

  const handleDelete = (cat: EventCategory) => {
    if (categories.length <= 1) {
      alert("Minimal harus ada 1 kategori tersimpan!");
      return;
    }
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus kategori "${cat.label}"?\nAgenda dengan kategori ini tetap tersimpan tetapi menggunakan warna bawaan.`
      )
    ) {
      onDeleteCategory(cat.id);
      if (editingId === cat.id) {
        setEditingId(null);
        setLabel("");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-amber-950/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 max-w-lg w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#FFD166] text-amber-950 px-6 py-4 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Kelola Kategori Kegiatan</h3>
              <p className="text-[11px] font-bold text-amber-900/80">
                Tambah, Edit, & Sesuaikan Warna Label Agenda Kalender
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Add / Edit Form Card */}
          <div className="bg-amber-50/60 border-2 border-amber-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-600" />
                {editingId ? "Edit Kategori Kegiatan" : "Tambah Kategori Baru"}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="contoh: Kegiatan Ekstrakurikuler / Pramuka"
                  className="w-full px-3.5 py-2 bg-white border-2 border-yellow-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Warna Label Kategori
                </label>
                
                {/* Palette Grid */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {PRESET_COLORS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setColor(p.hex)}
                      className={`h-8 rounded-xl border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        color.toLowerCase() === p.hex.toLowerCase()
                          ? "border-slate-900 scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: p.hex }}
                      title={p.name}
                    >
                      {color.toLowerCase() === p.hex.toLowerCase() && (
                        <Check className="w-4 h-4 text-white drop-shadow-xs stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Hex Picker Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                    placeholder="#3B82F6"
                  />
                  <span className="text-[11px] font-semibold text-slate-500">Warna Kustom</span>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 active:translate-y-0.5 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingId ? "Perbarui Kategori" : "Tambah Kategori"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center justify-between">
              <span>Daftar Kategori Tersimpan ({categories.length})</span>
            </h4>

            <div className="border border-yellow-200 divide-y divide-yellow-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                    editingId === cat.id ? "bg-amber-100/50" : "hover:bg-amber-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full inline-block border-2 border-black/10 shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <div className="text-xs font-black text-slate-900">{cat.label}</div>
                      <div className="text-[10px] font-mono text-slate-400">{cat.color}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-amber-50 px-6 py-3 border-t border-amber-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-yellow-200 hover:bg-yellow-300 text-amber-950 text-xs font-black rounded-full transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
