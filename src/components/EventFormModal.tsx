import React, { useState, useEffect } from "react";
import { CalendarEvent, CategoryType, EventCategory } from "../types";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/initialData";
import { X, Save, Calendar, Palette } from "lucide-react";

interface EventFormModalProps {
  isOpen: boolean;
  eventToEdit: CalendarEvent | null;
  defaultDate?: string;
  categories?: EventCategory[];
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  eventToEdit,
  defaultDate,
  categories = DEFAULT_CATEGORIES,
  onClose,
  onSave,
}) => {
  const todayISO = defaultDate || new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [category, setCategory] = useState<CategoryType>("kegiatan_sekolah");
  const [color, setColor] = useState("#f97316");
  const [semester, setSemester] = useState<1 | 2>(1);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setStartDate(eventToEdit.startDate);
      setEndDate(eventToEdit.endDate);
      setCategory(eventToEdit.category);
      setColor(eventToEdit.color || "#f97316");
      setSemester(eventToEdit.semester);
      setDescription(eventToEdit.description || "");
    } else {
      const activeDate = defaultDate || todayISO;
      setTitle("");
      setStartDate(activeDate);
      setEndDate(activeDate);
      setCategory("kegiatan_sekolah");
      setColor("#f97316");

      // Auto calculate semester based on month (July-Dec = Semester 1, Jan-June = Semester 2)
      const month = new Date(activeDate).getMonth() + 1;
      setSemester(month >= 7 ? 1 : 2);
      setDescription("");
    }
  }, [eventToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (catId: CategoryType) => {
    setCategory(catId);
    const catObj = categories.find((c) => c.id === catId);
    if (catObj) {
      setColor(catObj.color);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: eventToEdit?.id,
      title,
      startDate,
      endDate: endDate || startDate,
      category,
      color,
      semester,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#FFD166] text-amber-950 px-6 py-4 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black">
              <span>📅</span>
            </div>
            <h3 className="font-black text-base uppercase tracking-tight">
              {eventToEdit ? "Edit Kegiatan Kelas" : "Tambah Kegiatan / Agenda Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-950 hover:text-pink-600 p-1.5 rounded-full hover:bg-amber-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-black uppercase text-amber-950 mb-1">
              Nama Kegiatan / Agenda *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Pengenalan Lingkungan Sekolah (MPLS) / Penilaian Sumatif"
              className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-amber-950 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  const sDate = e.target.value;
                  setStartDate(sDate);
                  if (endDate < sDate) setEndDate(sDate);
                  const month = new Date(sDate).getMonth() + 1;
                  setSemester(month >= 7 ? 1 : 2);
                }}
                className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-amber-950 mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-amber-950 mb-1">
                Kategori Kegiatan *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-amber-950 mb-1">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value={1}>Semester 1 (Satu)</option>
                <option value={2}>Semester 2 (Dua)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-amber-950 mb-1 flex items-center justify-between">
              <span>Warna Penanda di Kalender</span>
              <span className="text-[10px] text-slate-400">Custom HEX</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-yellow-300 p-0.5"
              />
              <div className="flex-1 text-xs font-mono font-bold text-slate-700 bg-yellow-50 px-3 py-2 rounded-full border border-yellow-200">
                {color}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-amber-950 mb-1">
              Catatan / Deskripsi Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail kegiatan, lokasi, perlengkapan yang perlu dibawa siswa..."
              className="w-full px-4 py-2.5 bg-yellow-50/50 border-2 border-yellow-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-amber-950 text-xs font-black rounded-full transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 text-white text-xs font-black rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{eventToEdit ? "Simpan Perubahan" : "Tambahkan ke Kalender"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
