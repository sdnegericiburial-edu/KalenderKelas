export type CategoryType = string;

export interface EventCategory {
  id: CategoryType;
  label: string;
  color: string; // HEX color code
  bgTailwind?: string;
  borderTailwind?: string;
  textTailwind?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  category: CategoryType;
  color?: string; // Custom HEX if provided
  description?: string;
  semester: 1 | 2; // Auto-determined or manual
  isNationalHoliday?: boolean;
  className?: string; // Target class name e.g. "Kelas 5-A", "Kelas 3-A" or "Semua Kelas"
}

export interface SchoolInfo {
  schoolName: string;
  className: string;
  academicYear: string; // e.g. "2025/2026"
  startYear: number; // e.g. 2025
  endYear: number; // e.g. 2026
  principalName: string;
  principalNip: string;
  teacherName: string;
  teacherNip: string;
  city: string;
  schoolLogoUrl?: string; // Base64 or image URL for school logo
}

export interface TeacherUser {
  id: string;
  name: string;
  nip: string;
  className: string;
  email: string;
  password?: string;
  schoolName: string;
  academicYear: string;
  city: string;
  avatarColor?: string;
}

export type ViewMode = "sheet" | "monthly" | "agenda" | "ai";

export interface FilterState {
  searchQuery: string;
  categoryFilter: string; // "all" or specific CategoryType
  semesterFilter: "all" | "1" | "2";
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
