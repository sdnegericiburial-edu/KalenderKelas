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
