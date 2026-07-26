import { CalendarEvent, CategoryType, EventCategory } from "../types";
import { CATEGORIES } from "../data/initialData";

export const MONTH_NAMES_INDONESIAN = [
  "JANUARI",
  "FEBRUARI",
  "MARET",
  "APRIL",
  "MEI",
  "JUNI",
  "JULI",
  "AGUSTUS",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER",
];

export const DAY_NAMES_INDONESIAN = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export interface DayCell {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isSunday: boolean;
  events: CalendarEvent[];
}

/**
 * Format YYYY-MM-DD from Date object using local timezone
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Check if targetDate (YYYY-MM-DD) is between startDate and endDate
 */
export function isDateInRange(targetDateStr: string, startDateStr: string, endDateStr: string): boolean {
  return targetDateStr >= startDateStr && targetDateStr <= endDateStr;
}

/**
 * Generate 35 or 42 grid cells for a given month (0-indexed) & year
 */
export function generateMonthGrid(year: number, monthIndex: number, events: CalendarEvent[]): DayCell[] {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  // Day of week for 1st of the month (0 = Sunday)
  const startDayOfWeek = firstDay.getDay();

  const cells: DayCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateObj = new Date(year, monthIndex - 1, dayNum);
    const dateStr = formatDateISO(dateObj);
    cells.push({
      date: dateObj,
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isSunday: dateObj.getDay() === 0,
      events: getEventsForDate(dateStr, events),
    });
  }

  // Current month days
  const totalDays = lastDay.getDate();
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dateStr = formatDateISO(dateObj);
    cells.push({
      date: dateObj,
      dateString: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isSunday: dateObj.getDay() === 0,
      events: getEventsForDate(dateStr, events),
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(year, monthIndex + 1, i);
      const dateStr = formatDateISO(dateObj);
      cells.push({
        date: dateObj,
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isSunday: dateObj.getDay() === 0,
        events: getEventsForDate(dateStr, events),
      });
    }
  }

  return cells;
}

/**
 * Find all events that include this date
 */
export function getEventsForDate(dateStr: string, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => isDateInRange(dateStr, e.startDate, e.endDate));
}

/**
 * Format human-readable date range in Indonesian (e.g., "14 - 16 Juli 2025" or "17 Agustus 2025")
 */
export function formatDateRangeIndonesian(startDateStr: string, endDateStr: string): string {
  if (!startDateStr) return "";
  const [sYear, sMonth, sDay] = startDateStr.split("-").map(Number);
  const startMonthName = MONTH_NAMES_INDONESIAN[sMonth - 1] || "";

  if (!endDateStr || startDateStr === endDateStr) {
    return `${sDay} ${capitalizeFirst(startMonthName)} ${sYear}`;
  }

  const [eYear, eMonth, eDay] = endDateStr.split("-").map(Number);
  const endMonthName = MONTH_NAMES_INDONESIAN[eMonth - 1] || "";

  if (sMonth === eMonth && sYear === eYear) {
    return `${sDay} - ${eDay} ${capitalizeFirst(startMonthName)} ${sYear}`;
  }

  if (sYear === eYear) {
    return `${sDay} ${capitalizeFirst(startMonthName)} - ${eDay} ${capitalizeFirst(endMonthName)} ${sYear}`;
  }

  return `${sDay} ${capitalizeFirst(startMonthName)} ${sYear} - ${eDay} ${capitalizeFirst(endMonthName)} ${eYear}`;
}

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get category metadata by ID
 */
export function getCategoryInfo(categoryId: CategoryType, categoriesList?: EventCategory[]) {
  const source = categoriesList && categoriesList.length > 0 ? categoriesList : CATEGORIES;
  return (
    source.find((c) => c.id === categoryId) || {
      id: categoryId,
      label: categoryId,
      color: "#6b7280",
      bgTailwind: "bg-gray-500",
      borderTailwind: "border-gray-600",
      textTailwind: "text-gray-800",
    }
  );
}

/**
 * Get background styling / inline style for calendar cells with events
 */
export function getEventDayStyle(events: CalendarEvent[]): {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  borderColor?: string;
} {
  if (!events || events.length === 0) return {};

  const primaryEvent = events[0];
  const cat = getCategoryInfo(primaryEvent.category);
  const hexColor = primaryEvent.color || cat.color;

  return {
    backgroundColor: hexColor,
    color: "#ffffff",
    fontWeight: "600",
  };
}

/**
 * Preset Academic Years List
 */
export const ACADEMIC_YEAR_OPTIONS = [
  "2023/2024",
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
  "2030/2031",
  "2031/2032",
];

/**
 * Parse startYear and endYear from "YYYY/YYYY" string
 */
export function parseAcademicYear(academicYearStr: string): { startYear: number; endYear: number } {
  if (!academicYearStr) return { startYear: 2026, endYear: 2027 };
  const parts = academicYearStr.split("/").map((p) => parseInt(p.trim(), 10));
  const startYear = !isNaN(parts[0]) && parts[0] > 1900 ? parts[0] : 2026;
  const endYear = !isNaN(parts[1]) && parts[1] > 1900 ? parts[1] : startYear + 1;
  return { startYear, endYear };
}

/**
 * Shift an event to a new target academic start year
 */
export function shiftEventToAcademicYear(
  event: CalendarEvent,
  targetStartYear: number
): CalendarEvent {
  if (!event.startDate) return event;
  const partsS = event.startDate.split("-").map(Number);
  const partsE = (event.endDate || event.startDate).split("-").map(Number);

  const sY = partsS[0] || 2026;
  const sM = partsS[1] || 7;
  const sD = partsS[2] || 1;

  const eY = partsE[0] || sY;
  const eM = partsE[1] || sM;
  const eD = partsE[2] || sD;

  // An event in July-Dec belongs to startYear. Jan-June belongs to endYear (= startYear + 1).
  const eventOrigStartYear = sM >= 7 ? sY : sY - 1;
  const yearDiff = targetStartYear - eventOrigStartYear;

  const newStartYear = sY + yearDiff;
  const newEndYear = eY + yearDiff;

  const newStartDate = `${newStartYear}-${String(sM).padStart(2, "0")}-${String(sD).padStart(2, "0")}`;
  const newEndDate = `${newEndYear}-${String(eM).padStart(2, "0")}-${String(eD).padStart(2, "0")}`;

  return {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    startDate: newStartDate,
    endDate: newEndDate,
  };
}

/**
 * Generate default events for a target academic year from templates
 */
export function generateDefaultEventsForAcademicYear(
  targetStartYear: number,
  templateEvents: CalendarEvent[]
): CalendarEvent[] {
  return templateEvents.map((evt) => shiftEventToAcademicYear(evt, targetStartYear));
}

/**
 * Filter events that belong to a specific academic year (July 1 startYear -> June 30 endYear)
 */
export function filterEventsByAcademicYear(
  events: CalendarEvent[],
  startYear: number,
  endYear: number
): CalendarEvent[] {
  const minDate = `${startYear}-07-01`;
  const maxDate = `${endYear}-06-30`;
  return events.filter((e) => e.startDate >= minDate && e.startDate <= maxDate);
}

/**
 * Download text data as a file in browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Export events to CSV format
 */
export function exportEventsToCSV(events: CalendarEvent[]): string {
  const headers = ["ID", "Semester", "Mulai", "Selesai", "Kategori", "Kegiatan / Description"];
  const rows = events.map((e) => [
    e.id,
    e.semester,
    e.startDate,
    e.endDate,
    e.category,
    `"${(e.title || "").replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
