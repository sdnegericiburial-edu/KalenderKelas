import React, { useState, useEffect } from "react";
import { SchoolInfo, CalendarEvent } from "../types";
import {
  MONTH_NAMES_INDONESIAN,
  DAY_NAMES_INDONESIAN,
  generateMonthGrid,
  getCategoryInfo,
  formatDateISO,
} from "../utils/calendarUtils";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Edit2, Trash2 } from "lucide-react";

interface MonthlyDetailViewProps {
  schoolInfo: SchoolInfo;
  events: CalendarEvent[];
  onAddEvent: (defaultDate?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const MonthlyDetailView: React.FC<MonthlyDetailViewProps> = ({
  schoolInfo,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const startYear = schoolInfo.startYear || 2026;
  const [currentYear, setCurrentYear] = useState<number>(startYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(6); // July (0-indexed = 6)

  // Automatically sync view year when academic year changes
  useEffect(() => {
    if (schoolInfo.startYear) {
      setCurrentYear(schoolInfo.startYear);
      setCurrentMonthIndex(6); // Default July start of SD academic year
    }
  }, [schoolInfo.startYear, schoolInfo.academicYear]);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const dayCells = generateMonthGrid(currentYear, currentMonthIndex, events);
  const monthName = MONTH_NAMES_INDONESIAN[currentMonthIndex];

  return (
    <div className="bg-[#FDFCF0] min-h-screen p-3 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Navigation & Header */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-yellow-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl border-2 border-pink-200 flex items-center justify-center font-black text-xl">
              <span>📅</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {monthName} {currentYear}
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Kalender Bulanan Detail • {schoolInfo.schoolName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2.5 bg-yellow-50 hover:bg-yellow-100 text-amber-900 rounded-full border border-yellow-200 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-black px-4 py-2 bg-[#FFD166] text-amber-950 rounded-full border border-amber-300">
              {monthName} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2.5 bg-yellow-50 hover:bg-yellow-100 text-amber-900 rounded-full border border-yellow-200 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Large Month Calendar Grid */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-yellow-200 overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b-2 border-yellow-200 bg-yellow-50 text-center font-black text-xs uppercase text-amber-950">
            <div className="py-2.5 text-rose-600 bg-rose-50">Minggu</div>
            <div className="py-2.5">Senin</div>
            <div className="py-2.5">Selasa</div>
            <div className="py-2.5">Rabu</div>
            <div className="py-2.5">Kamis</div>
            <div className="py-2.5">Jumat</div>
            <div className="py-2.5">Sabtu</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-yellow-100 bg-yellow-50/20">
            {dayCells.map((cell, idx) => {
              return (
                <div
                  key={idx}
                  className={`min-h-[115px] p-2 flex flex-col justify-between transition-all relative group ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/80 text-slate-300"
                      : cell.isSunday
                      ? "bg-rose-50/40 text-rose-600 font-bold"
                      : "bg-white text-slate-800 hover:bg-yellow-50/60"
                  }`}
                >
                  {/* Top Bar inside day cell */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-full ${
                        cell.isSunday ? "bg-rose-100 text-rose-700" : ""
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.isCurrentMonth && (
                      <button
                        onClick={() => onAddEvent(cell.dateString)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-full transition-opacity cursor-pointer font-bold"
                        title="Tambah Kegiatan di tanggal ini"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    )}
                  </div>

                  {/* Event Pills inside Day Cell */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[75px] scrollbar-thin">
                    {cell.events.map((evt, eIdx) => {
                      const cat = getCategoryInfo(evt.category);
                      const bgHex = evt.color || cat.color;

                      return (
                        <div
                          key={`${evt.id}_md_${eIdx}`}
                          style={{ backgroundColor: bgHex }}
                          className="text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-2xs flex items-center justify-between gap-1 group/item"
                        >
                          <span className="truncate flex-1">{evt.title}</span>
                          <div className="hidden group-hover/item:flex items-center gap-1 shrink-0 bg-black/20 rounded-full px-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEvent(evt);
                              }}
                              className="hover:text-amber-200 cursor-pointer"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(evt.id);
                              }}
                              className="hover:text-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer Summary Banner */}
        <div className="p-4 bg-white rounded-3xl border-2 border-yellow-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-xs font-black text-slate-600 uppercase">Kegiatan Kelas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-black text-slate-600 uppercase">Projek P5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-black text-slate-600 uppercase">Ujian & Evaluasi</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
              TOTAL KEGIATAN BULAN INI: {dayCells.reduce((acc, c) => acc + c.events.length, 0)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
