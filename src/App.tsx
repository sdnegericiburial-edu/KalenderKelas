import React, { useState, useEffect, useMemo } from "react";
import { SchoolInfo, CalendarEvent, ViewMode, TeacherUser, EventCategory } from "./types";
import { DEFAULT_SCHOOL_INFO, INITIAL_EVENTS, CATEGORIES } from "./data/initialData";
import { downloadFile, exportEventsToCSV } from "./utils/calendarUtils";

import { HeaderBar } from "./components/HeaderBar";
import { CalendarSheetView } from "./components/CalendarSheetView";
import { MonthlyDetailView } from "./components/MonthlyDetailView";
import { AgendaListView } from "./components/AgendaListView";
import { AiAssistantModal } from "./components/AiAssistantModal";

import { SchoolSettingsModal } from "./components/SchoolSettingsModal";
import { EventFormModal } from "./components/EventFormModal";
import { PrintPreviewModal } from "./components/PrintPreviewModal";
import { LoginModal } from "./components/LoginModal";
import { CategoryManagerModal } from "./components/CategoryManagerModal";
import { GoogleSheetsSyncModal } from "./components/GoogleSheetsSyncModal";
import { GoogleSheetsConfig } from "./types";

const STORAGE_TEACHERS_KEY = "kalender_sd_teachers_list_v2";
const STORAGE_ACTIVE_TEACHER_ID = "kalender_sd_active_teacher_id_v2";
const STORAGE_CATEGORIES_KEY = "kalender_sd_categories_v2";
const STORAGE_SHEETS_CONFIG_KEY = "kalender_sd_sheets_config_v2";

const INITIAL_TEACHERS: TeacherUser[] = [
  {
    id: "teacher-siti-4",
    name: "Siti Aminah, S.Pd.",
    nip: "19850812 201001 2 015",
    className: "Kelas 4",
    email: "siti.aminah@sdnegericiburial.sch.id",
    schoolName: "SD Negeri Ciburial",
    academicYear: "2026/2027",
    city: "Bandung Barat",
    avatarColor: "#FF5C8D",
  },
  {
    id: "teacher-budi-5a",
    name: "Budi Santoso, S.Pd.",
    nip: "19830410 200801 1 008",
    className: "Kelas 5A",
    email: "budi.santoso@sdnegericiburial.sch.id",
    schoolName: "SD Negeri Ciburial",
    academicYear: "2026/2027",
    city: "Bandung Barat",
    avatarColor: "#3B82F6",
  },
  {
    id: "teacher-sri-1",
    name: "Sri Rahayu, S.Pd.SD",
    nip: "19901103 201502 2 004",
    className: "Kelas 1",
    email: "sri.rahayu@sdnegericiburial.sch.id",
    schoolName: "SD Negeri Ciburial",
    academicYear: "2026/2027",
    city: "Bandung Barat",
    avatarColor: "#10B981",
  }
];

function ensureUniqueEventIds(eventsList: CalendarEvent[]): CalendarEvent[] {
  if (!Array.isArray(eventsList)) return [];
  const seenIds = new Set<string>();
  return eventsList.map((evt, idx) => {
    let uniqueId = evt.id;
    if (!uniqueId || seenIds.has(uniqueId)) {
      uniqueId = `${evt.id || "ev"}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    }
    seenIds.add(uniqueId);
    return { ...evt, id: uniqueId };
  });
}

export default function App() {
  // 1. Teachers state
  const [teachers, setTeachers] = useState<TeacherUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_TEACHERS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [activeTeacher, setActiveTeacher] = useState<TeacherUser>(() => {
    const savedActiveId = localStorage.getItem(STORAGE_ACTIVE_TEACHER_ID);
    const found = teachers.find((t) => t.id === savedActiveId);
    return found || teachers[0] || INITIAL_TEACHERS[0];
  });

  // Save teachers & active ID
  useEffect(() => {
    localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_TEACHER_ID, activeTeacher.id);
  }, [activeTeacher]);

  // 2. School Info State (Dynamic per active teacher)
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem(`kalender_sd_info_${activeTeacher.id}`);
    if (saved) return JSON.parse(saved);

    return {
      ...DEFAULT_SCHOOL_INFO,
      teacherName: activeTeacher.name,
      teacherNip: activeTeacher.nip,
      className: activeTeacher.className,
      schoolName: activeTeacher.schoolName,
      academicYear: activeTeacher.academicYear,
    };
  });

  // 3. Events State (Global events repository across classes)
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedAll = localStorage.getItem("kalender_sd_events_all");
    if (savedAll) {
      return ensureUniqueEventIds(JSON.parse(savedAll));
    }
    const saved = localStorage.getItem(`kalender_sd_events_${activeTeacher.id}`);
    const rawEvents = saved ? JSON.parse(saved) : INITIAL_EVENTS;
    return ensureUniqueEventIds(rawEvents);
  });

  // 4. Event Categories State (Dynamic & Persistent)
  const [categories, setCategories] = useState<EventCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  // Active teacher class & event filter
  const activeClassName = activeTeacher?.className || schoolInfo?.className || "";

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    if (activeClassName) classSet.add(activeClassName);
    teachers.forEach((t) => {
      if (t.className) classSet.add(t.className);
    });
    return Array.from(classSet);
  }, [teachers, activeClassName]);

  const currentClassEvents = useMemo(() => {
    if (!activeClassName) return events;
    return events.filter((e) => {
      if (!e.className) return true; // show unassigned/legacy events
      if (e.className === "Semua Kelas") return true; // show school-wide events
      return e.className === activeClassName;
    });
  }, [events, activeClassName]);

  // Update localStorage when schoolInfo, events, or categories change
  useEffect(() => {
    localStorage.setItem(`kalender_sd_info_${activeTeacher.id}`, JSON.stringify(schoolInfo));
  }, [schoolInfo, activeTeacher.id]);

  useEffect(() => {
    localStorage.setItem("kalender_sd_events_all", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  // Category Management Handlers
  const handleAddCategory = (newCat: Omit<EventCategory, "id">) => {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const updated = [...categories, { id, ...newCat }];
    setCategories(updated);
    syncAllDataToSheets(undefined, undefined, updated);
  };

  const handleEditCategory = (id: string, updated: Omit<EventCategory, "id">) => {
    const updatedCategories = categories.map((c) => (c.id === id ? { ...c, ...updated } : c));
    setCategories(updatedCategories);
    syncAllDataToSheets(undefined, undefined, updatedCategories);
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);
    syncAllDataToSheets(undefined, undefined, updatedCategories);
  };

  // Switch Teacher Handler
  const handleSelectTeacher = (teacher: TeacherUser) => {
    setActiveTeacher(teacher);

    // Load or initialize info for selected teacher
    const savedInfo = localStorage.getItem(`kalender_sd_info_${teacher.id}`);
    if (savedInfo) {
      setSchoolInfo(JSON.parse(savedInfo));
    } else {
      setSchoolInfo({
        ...DEFAULT_SCHOOL_INFO,
        teacherName: teacher.name,
        teacherNip: teacher.nip,
        className: teacher.className,
        schoolName: teacher.schoolName,
        academicYear: teacher.academicYear,
      });
    }
  };

  // Helper function to sync all 4 datasets (schoolInfo, events, categories, teachers) to Google Sheets
  const syncAllDataToSheets = async (
    overrideSchoolInfo?: SchoolInfo,
    overrideEvents?: CalendarEvent[],
    overrideCategories?: EventCategory[],
    overrideTeachers?: TeacherUser[]
  ) => {
    if (!sheetsConfig.webAppUrl) return;
    try {
      const payload = {
        action: "save",
        schoolInfo: overrideSchoolInfo || schoolInfo,
        events: overrideEvents || events,
        categories: overrideCategories || categories,
        teachers: overrideTeachers || teachers,
      };
      await fetch(sheetsConfig.webAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const now = new Date().toLocaleString("id-ID");
      setSheetsConfig((prev) => ({ ...prev, lastSyncedAt: now }));
    } catch (err) {
      console.error("Gagal sinkronisasi otomatis ke Google Sheets:", err);
    }
  };

  const handleAddTeacher = (newTeacher: TeacherUser) => {
    const updatedTeachers = [...teachers, newTeacher];
    setTeachers(updatedTeachers);
    syncAllDataToSheets(undefined, undefined, undefined, updatedTeachers);
  };

  const handleUpdateTeacher = (updatedTeacher: TeacherUser) => {
    const updatedTeachers = teachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t));
    setTeachers(updatedTeachers);

    let updatedSchool = schoolInfo;
    if (updatedTeacher.id === activeTeacher.id) {
      setActiveTeacher(updatedTeacher);
      updatedSchool = {
        ...schoolInfo,
        teacherName: updatedTeacher.name,
        teacherNip: updatedTeacher.nip,
        className: updatedTeacher.className,
        schoolName: updatedTeacher.schoolName,
      };
      setSchoolInfo(updatedSchool);
    }

    syncAllDataToSheets(updatedSchool, undefined, undefined, updatedTeachers);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    if (teachers.length <= 1) return;

    const remaining = teachers.filter((t) => t.id !== teacherId);
    setTeachers(remaining);

    localStorage.removeItem(`kalender_sd_info_${teacherId}`);
    localStorage.removeItem(`kalender_sd_events_${teacherId}`);

    if (activeTeacher.id === teacherId) {
      const newActive = remaining[0];
      handleSelectTeacher(newActive);
    }

    syncAllDataToSheets(undefined, undefined, undefined, remaining);
  };

  // Active View Tab State
  const [activeView, setActiveView] = useState<ViewMode>("sheet");

  // 5. Google Sheets Sync Config State
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    // Check URL search params for ?db= URL
    const params = new URLSearchParams(window.location.search);
    const dbUrlParam = params.get("db");

    const saved = localStorage.getItem(STORAGE_SHEETS_CONFIG_KEY);
    const parsed = saved ? JSON.parse(saved) : { webAppUrl: "", autoSync: false };

    if (dbUrlParam) {
      return { ...parsed, webAppUrl: dbUrlParam };
    }
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_SHEETS_CONFIG_KEY, JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  // Auto-fetch data from Google Sheets on initial load if webAppUrl is configured
  useEffect(() => {
    if (!sheetsConfig.webAppUrl) return;

    const fetchLatestFromSheets = async () => {
      try {
        const res = await fetch(sheetsConfig.webAppUrl);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "success") {
          if (data.schoolInfo && data.schoolInfo.schoolName) setSchoolInfo(data.schoolInfo);
          if (Array.isArray(data.events) && data.events.length > 0) setEvents(ensureUniqueEventIds(data.events));
          if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
          if (Array.isArray(data.teachers) && data.teachers.length > 0) {
            setTeachers(data.teachers);
          }
          
          const now = new Date().toLocaleString("id-ID");
          setSheetsConfig((prev) => ({ ...prev, lastSyncedAt: now }));
        }
      } catch (e) {
        console.warn("Auto-sync load on startup failed:", e);
      }
    };

    fetchLatestFromSheets();
  }, [sheetsConfig.webAppUrl]);

  const handleImportFromSheets = (data: { schoolInfo?: SchoolInfo; events?: CalendarEvent[]; categories?: EventCategory[]; teachers?: TeacherUser[] }) => {
    if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
    if (data.events) setEvents(ensureUniqueEventIds(data.events));
    if (data.categories) setCategories(data.categories);
    if (data.teachers && data.teachers.length > 0) {
      setTeachers(data.teachers);
    }
  };

  const handleSaveSchoolInfo = async (newInfo: SchoolInfo) => {
    setSchoolInfo(newInfo);

    // Sync back to active teacher profile if changed
    const updatedTeacher: TeacherUser = {
      ...activeTeacher,
      name: newInfo.teacherName || activeTeacher.name,
      nip: newInfo.teacherNip || activeTeacher.nip,
      className: newInfo.className || activeTeacher.className,
      schoolName: newInfo.schoolName || activeTeacher.schoolName,
      city: newInfo.city || activeTeacher.city,
    };

    setActiveTeacher(updatedTeacher);
    const updatedTeachers = teachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t));
    setTeachers(updatedTeachers);

    await syncAllDataToSheets(newInfo, undefined, undefined, updatedTeachers);
  };

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSheetsSyncOpen, setIsSheetsSyncOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [defaultDateForNewEvent, setDefaultDateForNewEvent] = useState<string | undefined>();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // --- HANDLERS ---
  const handleOpenAddEvent = (defaultDate?: string) => {
    setEventToEdit(null);
    setDefaultDateForNewEvent(defaultDate);
    setIsEventFormOpen(true);
  };

  const handleOpenEditEvent = (evt: CalendarEvent) => {
    setEventToEdit(evt);
    setIsEventFormOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, "id"> & { id?: string }) => {
    let updatedEvents: CalendarEvent[];
    if (eventData.id) {
      // Update existing
      updatedEvents = events.map((e) => (e.id === eventData.id ? ({ ...e, ...eventData } as CalendarEvent) : e));
    } else {
      // Add new
      const newEvt: CalendarEvent = {
        ...eventData,
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      updatedEvents = [...events, newEvt];
    }
    const cleanEvents = ensureUniqueEventIds(updatedEvents);
    setEvents(cleanEvents);
    syncAllDataToSheets(undefined, cleanEvents);
  };

  const handleBatchAddEvents = (newEvents: Omit<CalendarEvent, "id">[]) => {
    const created: CalendarEvent[] = newEvents.map((ne, idx) => ({
      ...ne,
      id: `ev-ai-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    }));
    const updatedEvents = ensureUniqueEventIds([...events, ...created]);
    setEvents(updatedEvents);
    syncAllDataToSheets(undefined, updatedEvents);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus agenda kegiatan ini?")) {
      const updatedEvents = events.filter((e) => e.id !== id);
      setEvents(updatedEvents);
      syncAllDataToSheets(undefined, updatedEvents);
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin mengembalikan kalender ${activeTeacher.className} (${activeTeacher.name}) ke contoh default 2026/2027?`
      )
    ) {
      const resetInfo = {
        ...DEFAULT_SCHOOL_INFO,
        teacherName: activeTeacher.name,
        teacherNip: activeTeacher.nip,
        className: activeTeacher.className,
        schoolName: activeTeacher.schoolName,
      };
      setSchoolInfo(resetInfo);
      setEvents(INITIAL_EVENTS);
      syncAllDataToSheets(resetInfo, INITIAL_EVENTS);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportEventsToCSV(events);
    downloadFile(
      csvContent,
      `Kalender_${activeTeacher.className.replace(/\s+/g, "_")}_${schoolInfo.schoolName.replace(/\s+/g, "_")}.csv`,
      "text/csv;charset=utf-8;"
    );
  };

  const handleExportJSON = () => {
    const payload = {
      teacher: activeTeacher,
      schoolInfo,
      events,
      exportedAt: new Date().toISOString(),
    };
    downloadFile(
      JSON.stringify(payload, null, 2),
      `Backup_Kalender_${activeTeacher.className.replace(/\s+/g, "_")}.json`,
      "application/json"
    );
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.events && Array.isArray(parsed.events)) {
          const clean = ensureUniqueEventIds(parsed.events);
          setEvents(clean);
          if (parsed.schoolInfo) setSchoolInfo(parsed.schoolInfo);
          syncAllDataToSheets(parsed.schoolInfo || schoolInfo, clean);
          alert("Data kalender kelas berhasil diimpor dan disinkronkan ke Google Sheets!");
        } else {
          alert("Format file JSON tidak sesuai.");
        }
      } catch (err) {
        alert("Gagal membaca file JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-800 flex flex-col font-sans">
      
      {/* Top Header */}
      <HeaderBar
        schoolInfo={schoolInfo}
        activeTeacher={activeTeacher}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenSheetsSync={() => setIsSheetsSyncOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onAddEvent={() => handleOpenAddEvent()}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === "sheet" && (
          <CalendarSheetView
            schoolInfo={schoolInfo}
            events={currentClassEvents}
            onDateClick={(dateStr) => handleOpenAddEvent(dateStr)}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddEvent={() => handleOpenAddEvent()}
          />
        )}

        {activeView === "monthly" && (
          <MonthlyDetailView
            schoolInfo={schoolInfo}
            events={currentClassEvents}
            onAddEvent={(dateStr) => handleOpenAddEvent(dateStr)}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeView === "agenda" && (
          <AgendaListView
            schoolInfo={schoolInfo}
            events={currentClassEvents}
            onAddEvent={() => handleOpenAddEvent()}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeView === "ai" && (
          <AiAssistantModal
            schoolInfo={schoolInfo}
            onAddEventsBatch={handleBatchAddEvents}
          />
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        teachers={teachers}
        activeTeacher={activeTeacher}
        onSelectTeacher={handleSelectTeacher}
        onAddTeacher={handleAddTeacher}
        onUpdateTeacher={handleUpdateTeacher}
        onDeleteTeacher={handleDeleteTeacher}
      />

      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        schoolInfo={schoolInfo}
        activeTeacher={activeTeacher}
        sheetsConfig={sheetsConfig}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSchoolInfo}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenSheetsSync={() => setIsSheetsSyncOpen(true)}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        categories={categories}
        onClose={() => setIsCategoryManagerOpen(false)}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <GoogleSheetsSyncModal
        isOpen={isSheetsSyncOpen}
        config={sheetsConfig}
        schoolInfo={schoolInfo}
        events={events}
        categories={categories}
        teachers={teachers}
        onClose={() => setIsSheetsSyncOpen(false)}
        onSaveConfig={setSheetsConfig}
        onImportData={handleImportFromSheets}
      />

      <EventFormModal
        isOpen={isEventFormOpen}
        eventToEdit={eventToEdit}
        defaultDate={defaultDateForNewEvent}
        categories={categories}
        activeClassName={activeClassName}
        availableClasses={availableClasses}
        onClose={() => setIsEventFormOpen(false)}
        onSave={handleSaveEvent}
      />

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        schoolInfo={schoolInfo}
        events={currentClassEvents}
        categories={categories}
        onClose={() => setIsPrintModalOpen(false)}
      />

    </div>
  );
}
