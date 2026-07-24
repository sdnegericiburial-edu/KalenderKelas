import React, { useState } from "react";
import { SchoolInfo, CalendarEvent, CategoryType } from "../types";
import { CATEGORIES } from "../data/initialData";
import { formatDateRangeIndonesian, getCategoryInfo } from "../utils/calendarUtils";
import { Search, Filter, Plus, Edit2, Trash2, Calendar, FileText } from "lucide-react";

interface AgendaListViewProps {
  schoolInfo: SchoolInfo;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const AgendaListView: React.FC<AgendaListViewProps> = ({
  schoolInfo,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  const filteredEvents = events.filter((evt) => {
    // Search matching
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Category matching
    const matchesCategory = categoryFilter === "all" || evt.category === categoryFilter;

    // Semester matching
    const matchesSemester =
      semesterFilter === "all" || String(evt.semester) === semesterFilter;

    return matchesSearch && matchesCategory && matchesSemester;
  });

  // Sort by start date
  const sortedEvents = [...filteredEvents].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="bg-[#FDFCF0] min-h-screen p-3 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Top Controls Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-yellow-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl border-2 border-pink-200 flex items-center justify-center font-black text-xl">
              <span>📋</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Daftar Agenda & Kegiatan Kelas
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Total {sortedEvents.length} kegiatan ditemukan • {schoolInfo.schoolName}
              </p>
            </div>
          </div>

          <button
            onClick={onAddEvent}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 text-white text-xs font-black rounded-full shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tambah Kegiatan</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-yellow-200 grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kegiatan/agenda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-amber-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full px-4 py-2 bg-yellow-50/50 border-2 border-yellow-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">Semua Semester (1 & 2)</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

        </div>

        {/* Events Table / Cards */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-yellow-200 overflow-hidden divide-y divide-yellow-100">
          {sortedEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-12 h-12 mx-auto text-amber-300" />
              <p className="text-sm font-black text-slate-600">Tidak ada kegiatan yang sesuai filter.</p>
              <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau tambah kegiatan baru.</p>
            </div>
          ) : (
            sortedEvents.map((evt, idx) => {
              const cat = getCategoryInfo(evt.category);
              const formattedRange = formatDateRangeIndonesian(evt.startDate, evt.endDate);
              const hexColor = evt.color || cat.color;

              return (
                <div
                  key={`${evt.id}_list_${idx}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-yellow-50/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full mt-1 shrink-0 border border-black/10 shadow-2xs"
                      style={{ backgroundColor: hexColor }}
                      title={cat.label}
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {evt.title}
                        </span>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Semester {evt.semester}
                        </span>
                        <span
                          className="text-[10px] font-black text-white px-2.5 py-0.5 rounded-full shadow-2xs"
                          style={{ backgroundColor: hexColor }}
                        >
                          {cat.label}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-pink-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-pink-500" />
                        <span>{formattedRange}</span>
                      </div>

                      {evt.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onEditEvent(evt)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
