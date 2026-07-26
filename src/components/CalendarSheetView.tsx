import React from "react";
import { SchoolInfo, CalendarEvent } from "../types";
import { CATEGORIES } from "../data/initialData";
import {
  MONTH_NAMES_INDONESIAN,
  DAY_NAMES_INDONESIAN,
  generateMonthGrid,
  formatDateRangeIndonesian,
  getCategoryInfo,
  ACADEMIC_YEAR_OPTIONS,
  DayCell,
} from "../utils/calendarUtils";
import { Edit2, Trash2, Plus, Info, ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";

interface CalendarSheetViewProps {
  schoolInfo: SchoolInfo;
  events: CalendarEvent[];
  onDateClick: (dateStr: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (defaultDate?: string) => void;
  onAcademicYearChange?: (academicYear: string) => void;
  onGenerateTemplateForYear?: (startYear: number) => void;
}

export const CalendarSheetView: React.FC<CalendarSheetViewProps> = ({
  schoolInfo,
  events,
  onDateClick,
  onEditEvent,
  onDeleteEvent,
  onAddEvent,
  onAcademicYearChange,
  onGenerateTemplateForYear,
}) => {
  const startYear = schoolInfo.startYear || 2026;
  const endYear = schoolInfo.endYear || 2027;

  // Previous & Next Academic Years
  const prevAcademicYear = `${startYear - 1}/${startYear}`;
  const nextAcademicYear = `${endYear}/${endYear + 1}`;

  // Semester 1 Months (July startYear - December startYear) -> Months 6 to 11
  const semester1Months = [
    { name: "JULI " + startYear, monthIndex: 6, year: startYear },
    { name: "AGUSTUS " + startYear, monthIndex: 7, year: startYear },
    { name: "SEPTEMBER " + startYear, monthIndex: 8, year: startYear },
    { name: "OKTOBER " + startYear, monthIndex: 9, year: startYear },
    { name: "NOVEMBER " + startYear, monthIndex: 10, year: startYear },
    { name: "DESEMBER " + startYear, monthIndex: 11, year: startYear },
  ];

  // Semester 2 Months (January endYear - June endYear) -> Months 0 to 5
  const semester2Months = [
    { name: "JANUARI " + endYear, monthIndex: 0, year: endYear },
    { name: "FEBRUARI " + endYear, monthIndex: 1, year: endYear },
    { name: "MARET " + endYear, monthIndex: 2, year: endYear },
    { name: "APRIL " + endYear, monthIndex: 3, year: endYear },
    { name: "MEI " + endYear, monthIndex: 4, year: endYear },
    { name: "JUNI " + endYear, monthIndex: 5, year: endYear },
  ];

  // Filter events belonging to Semester 1 of this academic year
  const semester1Events = events
    .filter((e) => {
      const isS1Date = e.startDate >= `${startYear}-07-01` && e.startDate <= `${startYear}-12-31`;
      return isS1Date || (e.semester === 1 && e.startDate.startsWith(String(startYear)));
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Filter events belonging to Semester 2 of this academic year
  const semester2Events = events
    .filter((e) => {
      const isS2Date = e.startDate >= `${endYear}-01-01` && e.startDate <= `${endYear}-06-30`;
      return isS2Date || (e.semester === 2 && e.startDate.startsWith(String(endYear)));
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const totalYearEvents = semester1Events.length + semester2Events.length;

  return (
    <div className="bg-[#FDFCF0] min-h-screen p-3 sm:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto bg-white rounded-3xl shadow-sm border-2 border-yellow-100 overflow-hidden space-y-0">
        
        {/* Main Sheet Header Banner with Year Navigation Controls */}
        <div className="bg-white border-b-2 border-yellow-100 p-5 sm:p-7 text-center relative">
          
          {/* Quick Academic Year Navigation Switcher */}
          <div className="flex items-center justify-between max-w-xl mx-auto mb-3 bg-yellow-50 p-1.5 rounded-full border border-yellow-200">
            <button
              onClick={() => onAcademicYearChange && onAcademicYearChange(prevAcademicYear)}
              className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-white hover:bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-300 shadow-2xs transition-colors cursor-pointer"
              title={`Ke Tahun Pelajaran ${prevAcademicYear}`}
            >
              <ChevronLeft className="w-4 h-4 text-pink-600 stroke-[3]" />
              <span>TP {prevAcademicYear}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Tahun Pelajaran:
              </span>
              <select
                value={schoolInfo.academicYear}
                onChange={(e) => onAcademicYearChange && onAcademicYearChange(e.target.value)}
                className="bg-amber-400 text-slate-900 font-black text-xs px-3 py-1 rounded-full border border-amber-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-2xs"
              >
                {Array.from(new Set([schoolInfo.academicYear, ...ACADEMIC_YEAR_OPTIONS]))
                  .filter(Boolean)
                  .map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => onAcademicYearChange && onAcademicYearChange(nextAcademicYear)}
              className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-white hover:bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-300 shadow-2xs transition-colors cursor-pointer"
              title={`Ke Tahun Pelajaran ${nextAcademicYear}`}
            >
              <span>TP {nextAcademicYear}</span>
              <ChevronRight className="w-4 h-4 text-pink-600 stroke-[3]" />
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Kalender Pendidikan {schoolInfo.schoolName}
          </h1>
          <h2 className="text-base sm:text-lg font-extrabold text-amber-900/80 mt-1">
            Tahun Pelajaran {schoolInfo.academicYear} (Juli {startYear} - Juni {endYear})
          </h2>
          {schoolInfo.className && (
            <p className="text-xs sm:text-sm font-black text-pink-600 mt-1 uppercase tracking-wide">
              Target Kelas: {schoolInfo.className}
            </p>
          )}
        </div>

        {/* Empty Events Banner Notice with Auto Template Generator */}
        {totalYearEvents === 0 && (
          <div className="bg-amber-50 border-b-2 border-amber-200 p-4 text-center flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-black text-amber-950">
                  Belum ada agenda di Kalender TP {schoolInfo.academicYear}.
                </p>
                <p className="text-[11px] text-amber-800 font-medium">
                  Anda bisa mengisi kegiatan manual atau langsung buat template agenda SD standar untuk tahun ini.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onGenerateTemplateForYear && (
                <button
                  onClick={() => onGenerateTemplateForYear(startYear)}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black rounded-full shadow-2xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Buat Template Agenda TP {schoolInfo.academicYear}</span>
                </button>
              )}
              <button
                onClick={() => onAddEvent(`${startYear}-07-15`)}
                className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black rounded-full cursor-pointer transition-all"
              >
                + Tambah Manual
              </button>
            </div>
          </div>
        )}

        {/* Legend / Category Color Keys Bar */}
        <div className="bg-yellow-50/60 border-b border-yellow-100 px-4 py-3 flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <span className="font-black text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mr-2">
            <Info className="w-4 h-4 text-pink-500" />
            Keterangan Warna:
          </span>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-yellow-200 shadow-2xs">
              <span
                className="w-3 h-3 rounded-full inline-block border border-black/10"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-bold text-slate-800 text-[11px]">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar & Agenda Grid Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-yellow-100">
          
          {/* LEFT 8/12 COLUMNS: The 12 Mini Calendar Month Grids */}
          <div className="lg:col-span-8 p-4 sm:p-6 space-y-6 overflow-x-auto">
            
            {/* SEMESTER 1 (SATU) SECTION */}
            <div className="space-y-3">
              <div className="bg-[#FFD166] text-amber-950 font-black text-center py-2 px-4 rounded-2xl border-2 border-amber-300 text-sm sm:text-base tracking-widest uppercase shadow-2xs">
                SEMESTER 1 ( SATU )
              </div>

              {/* 2x3 Grid for Semester 1 Months */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                {semester1Months.map((m) => (
                  <MiniMonthGrid
                    key={m.name}
                    monthName={m.name}
                    year={m.year}
                    monthIndex={m.monthIndex}
                    events={events}
                    onDateClick={onDateClick}
                  />
                ))}
              </div>
            </div>

            {/* SEMESTER 2 (DUA) SECTION */}
            <div className="space-y-3 pt-5 border-t-2 border-yellow-100">
              <div className="bg-[#FFD166] text-amber-950 font-black text-center py-2 px-4 rounded-2xl border-2 border-amber-300 text-sm sm:text-base tracking-widest uppercase shadow-2xs">
                SEMESTER 2 ( DUA )
              </div>

              {/* 2x3 Grid for Semester 2 Months */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                {semester2Months.map((m) => (
                  <MiniMonthGrid
                    key={m.name}
                    monthName={m.name}
                    year={m.year}
                    monthIndex={m.monthIndex}
                    events={events}
                    onDateClick={onDateClick}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4/12 COLUMNS: KETERANGAN / AGENDA TABLE */}
          <div className="lg:col-span-4 p-4 sm:p-6 bg-yellow-50/30 space-y-6">
            
            <div className="flex items-center justify-between border-b-2 border-amber-300 pb-2.5">
              <h3 className="font-black text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
                <span className="bg-pink-500 text-white text-xs px-2.5 py-0.5 rounded-full font-black">LEMBAR AGENDA</span>
                KETERANGAN
              </h3>
              <button
                onClick={() => onAddEvent()}
                className="inline-flex items-center gap-1 text-xs font-black text-pink-700 bg-pink-100 hover:bg-pink-200 border border-pink-200 px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Tambah</span>
              </button>
            </div>

            {/* SEMESTER 1 KETERANGAN TABLE */}
            <div className="space-y-2">
              <div className="bg-pink-500 text-white font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wide flex justify-between items-center shadow-2xs">
                <span>SEMESTER 1 - TP {schoolInfo.academicYear}</span>
                <span className="text-[10px] bg-pink-700 px-2 py-0.5 rounded-full font-bold text-pink-100">
                  {semester1Events.length} Agenda
                </span>
              </div>

              <div className="border border-yellow-200 rounded-2xl overflow-hidden bg-white text-xs divide-y divide-yellow-100 shadow-2xs">
                {semester1Events.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 font-semibold italic">
                    Belum ada agenda kegiatan di Semester 1.
                  </div>
                ) : (
                  semester1Events.map((evt, idx) => (
                    <EventTableRow
                      key={`${evt.id}_s1_${idx}`}
                      event={evt}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                    />
                  ))
                )}
              </div>
            </div>

            {/* SEMESTER 2 KETERANGAN TABLE */}
            <div className="space-y-2 pt-2">
              <div className="bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wide flex justify-between items-center shadow-2xs">
                <span>SEMESTER 2 - TP {schoolInfo.academicYear}</span>
                <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded-full font-bold text-blue-100">
                  {semester2Events.length} Agenda
                </span>
              </div>

              <div className="border border-yellow-200 rounded-2xl overflow-hidden bg-white text-xs divide-y divide-yellow-100 shadow-2xs">
                {semester2Events.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 font-semibold italic">
                    Belum ada agenda kegiatan di Semester 2.
                  </div>
                ) : (
                  semester2Events.map((evt, idx) => (
                    <EventTableRow
                      key={`${evt.id}_s2_${idx}`}
                      event={evt}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                    />
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

// --- MINI MONTH GRID COMPONENT ---
interface MiniMonthGridProps {
  monthName: string;
  year: number;
  monthIndex: number;
  events: CalendarEvent[];
  onDateClick: (dateStr: string) => void;
}

const MiniMonthGrid: React.FC<MiniMonthGridProps> = ({
  monthName,
  year,
  monthIndex,
  events,
  onDateClick,
}) => {
  const days: DayCell[] = generateMonthGrid(year, monthIndex, events);

  return (
    <div className="border-2 border-yellow-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
      {/* Month Header Banner */}
      <div className="bg-pink-500 text-white font-black text-xs text-center py-2 uppercase tracking-wide border-b border-pink-600">
        {monthName}
      </div>

      {/* Days Table Header */}
      <div className="grid grid-cols-7 text-center font-extrabold text-[10px] border-b border-yellow-200 bg-yellow-50 text-amber-950 uppercase">
        <div className="bg-rose-500 text-white py-1">Mg</div>
        <div className="py-1">Sn</div>
        <div className="py-1">Sl</div>
        <div className="py-1">Rb</div>
        <div className="py-1">Km</div>
        <div className="py-1">Jm</div>
        <div className="py-1">Sb</div>
      </div>

      {/* Date Cells Grid */}
      <div className="grid grid-cols-7 border-b border-yellow-100 divide-x divide-y divide-yellow-100 text-xs font-bold">
        {days.map((cell, idx) => {
          const hasEvent = cell.events.length > 0;
          const mainEvent = cell.events[0];
          const cat = mainEvent ? getCategoryInfo(mainEvent.category) : null;

          // Background color strategy
          let cellBgClass = "bg-white text-slate-800 hover:bg-yellow-100/70";
          let styleCustom: React.CSSProperties = {};

          if (!cell.isCurrentMonth) {
            cellBgClass = "bg-slate-50 text-slate-300 font-normal";
          } else if (hasEvent && mainEvent) {
            const hexColor = mainEvent.color || cat?.color;
            styleCustom = {
              backgroundColor: hexColor,
              color: "#ffffff",
              fontWeight: "900",
            };
            cellBgClass = "hover:opacity-90 shadow-2xs";
          } else if (cell.isSunday) {
            cellBgClass = "bg-rose-50 text-rose-600 font-black hover:bg-rose-100";
          }

          return (
            <div
              key={idx}
              onClick={() => cell.isCurrentMonth && onDateClick(cell.dateString)}
              style={styleCustom}
              className={`h-7 sm:h-8 flex items-center justify-center text-center select-none cursor-pointer relative group transition-all ${cellBgClass}`}
              title={
                hasEvent
                  ? `${cell.dateString}: ${cell.events.map((e) => e.title).join(", ")}`
                  : cell.dateString
              }
            >
              <span>{cell.dayNumber}</span>

              {/* Tooltip on hover for active events */}
              {hasEvent && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl shadow-2xl pointer-events-none text-left border border-slate-700">
                  <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-pink-400">
                    {cell.dateString}
                  </div>
                  {cell.events.map((e, eIdx) => (
                    <div key={`${e.id}_tt_${eIdx}`} className="truncate text-yellow-300 font-bold">
                      • {e.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- EVENT TABLE ROW FOR KETERANGAN PANEL ---
interface EventTableRowProps {
  event: CalendarEvent;
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

const EventTableRow: React.FC<EventTableRowProps> = ({ event, onEdit, onDelete }) => {
  const cat = getCategoryInfo(event.category);
  const formattedDate = formatDateRangeIndonesian(event.startDate, event.endDate);
  const hexColor = event.color || cat.color;

  return (
    <div className="p-2 sm:p-2.5 flex items-start justify-between gap-2 hover:bg-slate-100/80 transition-colors group">
      <div className="flex items-start gap-2 min-w-0">
        <span
          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 border border-black/20"
          style={{ backgroundColor: hexColor }}
          title={cat.label}
        />
        <div className="min-w-0">
          <div className="font-semibold text-slate-800 text-[11px] sm:text-xs">
            {formattedDate}
          </div>
          <div className="text-slate-900 font-medium text-xs leading-tight mt-0.5">
            {event.title}
          </div>
          {event.description && (
            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
              {event.description}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
        <button
          onClick={() => onEdit(event)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
          title="Edit Agenda"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
          title="Hapus Agenda"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
