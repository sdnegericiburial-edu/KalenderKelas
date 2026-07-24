export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * KALENDER PENDIDIKAN SD - GOOGLE APPS SCRIPT (Code.gs)
 * ====================================================================
 * Petunjuk Penggunaan:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Klik menu "Ekstensi" -> "Apps Script"
 * 3. Hapus semua kode bawaan, lalu Tempel (Paste) seluruh kode ini di editor.
 * 4. Klik tombol "Jalankan" (Run) pada fungsi "setupDatabase" untuk membuat lembar kerja otomatis.
 * 5. Klik menu "Terapkan" (Deploy) -> "Terapkan sebagai Aplikasi Web" (New Deployment).
 * 6. Pilih:
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone)
 * 7. Klik "Terapkan", berikan izin akses (Authorize), lalu salin "URL Aplikasi Web" ke dalam aplikasi Kalender.
 */

// 1. SETUP DATABASE OTOMATIS
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Agendas
  var sheetAgenda = ss.getSheetByName("Agendas") || ss.insertSheet("Agendas");
  sheetAgenda.clear();
  var agendaHeaders = ["ID Agenda", "Judul Kegiatan", "Tanggal Mulai", "Tanggal Selesai", "ID Kategori", "Semester", "Keterangan / Detail", "Warna Hex", "Libur Nasional"];
  sheetAgenda.getRange(1, 1, 1, agendaHeaders.length).setValues([agendaHeaders]);
  formatSheetHeader(sheetAgenda, agendaHeaders.length, "#0F172A");

  // Contoh Data Awal Agenda
  var sampleAgendas = [
    ["evt_1", "Hari Pertama Masuk Sekolah & MPLS", "2025-07-14", "2025-07-16", "mpls", 1, "Masa Pengenalan Lingkungan Sekolah", "#10b981", false],
    ["evt_2", "HUT Kemerdekaan RI ke-80", "2025-08-17", "2025-08-17", "libur_nasional", 1, "Upacara Bendera & Peringatan Proklamasi", "#ef4444", true],
    ["evt_3", "Penilaian Tengah Semester (PTS) 1", "2025-09-22", "2025-09-27", "ujian", 1, "Pelaksanaan Sumatif Tengah Semester", "#f59e0b", false],
    ["evt_4", "Pembagian Rapor Semester 1", "2025-12-19", "2025-12-19", "rapor", 1, "Penyerahan Laporan Hasil Belajar", "#0284c7", false]
  ];
  sheetAgenda.getRange(2, 1, sampleAgendas.length, agendaHeaders.length).setValues(sampleAgendas);

  // Sheet 2: SchoolSettings
  var sheetSettings = ss.getSheetByName("SchoolSettings") || ss.insertSheet("SchoolSettings");
  sheetSettings.clear();
  var settingHeaders = ["Nama Sekolah", "Target Kelas", "Tahun Pelajaran", "Tahun Awal", "Tahun Akhir", "Nama Kepala Sekolah", "NIP Kepala Sekolah", "Nama Guru Kelas", "NIP Guru Kelas", "Kota / Kabupaten", "URL Logo Sekolah"];
  sheetSettings.getRange(1, 1, 1, settingHeaders.length).setValues([settingHeaders]);
  formatSheetHeader(sheetSettings, settingHeaders.length, "#DB2777");

  var sampleSettings = [
    ["SD NEGERI CIBURIAL", "Kelas 5-A", "2025/2026", 2025, 2026, "Hj. Siti Rohmah, S.Pd., M.M.", "197203151994032001", "Budi Santoso, S.Pd.", "198506122010011005", "Bandung Barat", ""]
  ];
  sheetSettings.getRange(2, 1, sampleSettings.length, settingHeaders.length).setValues(sampleSettings);

  // Sheet 3: Categories
  var sheetCategories = ss.getSheetByName("Categories") || ss.insertSheet("Categories");
  sheetCategories.clear();
  var categoryHeaders = ["ID Kategori", "Nama Label Kategori", "Kode Warna Hex"];
  sheetCategories.getRange(1, 1, 1, categoryHeaders.length).setValues([categoryHeaders]);
  formatSheetHeader(sheetCategories, categoryHeaders.length, "#0284c7");

  var sampleCategories = [
    ["libur_nasional", "Libur Nasional & Keagamaan", "#ef4444"],
    ["ujian", "Ujian / Penilaian Asesmen", "#f59e0b"],
    ["mpls", "MPLS / Awal Semester", "#10b981"],
    ["rapor", "Rapor & Evaluasi", "#0284c7"],
    ["kegiatan_sekolah", "Kegiatan Sekolah & Upacara", "#f97316"],
    ["projek_p5", "Projek P5 / Kokurikuler", "#8b5cf6"],
    ["kegiatan_kelas", "Kegiatan Kelas & Ekstra", "#14b8a6"],
    ["cuti_bersama", "Cuti Bersama / Libur Semester", "#ec4899"]
  ];
  sheetCategories.getRange(2, 1, sampleCategories.length, categoryHeaders.length).setValues(sampleCategories);

  // Hapus Sheet Default "Sheet1" / "Lembar1" jika ada
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Lembar1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert("BERHASIL!\\nDatabase Kalender Pendidikan berhasil dibuat di Google Sheets.\\n\\n3 Tabel telah siap:\\n1. Agendas\\n2. SchoolSettings\\n3. Categories");
  } catch (e) {
    Logger.log("Database berhasil dibuat: Agendas, SchoolSettings, Categories");
  }
}

// Format Header Tabel
function formatSheetHeader(sheet, numCols, bgColorHex) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground(bgColorHex)
             .setFontColor("#FFFFFF")
             .setFontWeight("bold")
             .setFontSize(10)
             .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  for (var c = 1; c <= numCols; c++) {
    sheet.autoResizeColumn(c);
  }
}

// 2. ENDPOINT GET (Membaca Data dari Google Sheets)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Read Agendas
    var sheetAgenda = ss.getSheetByName("Agendas");
    var events = [];
    if (sheetAgenda && sheetAgenda.getLastRow() > 1) {
      var agendaData = sheetAgenda.getRange(2, 1, sheetAgenda.getLastRow() - 1, 9).getValues();
      for (var i = 0; i < agendaData.length; i++) {
        var row = agendaData[i];
        if (row[0]) {
          events.push({
            id: String(row[0]),
            title: String(row[1] || ""),
            startDate: formatDateString(row[2]),
            endDate: formatDateString(row[3]),
            category: String(row[4] || "kegiatan_sekolah"),
            semester: Number(row[5]) || 1,
            description: String(row[6] || ""),
            color: String(row[7] || "#3b82f6"),
            isNationalHoliday: Boolean(row[8])
          });
        }
      }
    }

    // Read School Settings
    var sheetSettings = ss.getSheetByName("SchoolSettings");
    var schoolInfo = null;
    if (sheetSettings && sheetSettings.getLastRow() > 1) {
      var sRow = sheetSettings.getRange(2, 1, 1, 11).getValues()[0];
      schoolInfo = {
        schoolName: String(sRow[0] || ""),
        className: String(sRow[1] || ""),
        academicYear: String(sRow[2] || ""),
        startYear: Number(sRow[3]) || 2025,
        endYear: Number(sRow[4]) || 2026,
        principalName: String(sRow[5] || ""),
        principalNip: String(sRow[6] || ""),
        teacherName: String(sRow[7] || ""),
        teacherNip: String(sRow[8] || ""),
        city: String(sRow[9] || ""),
        schoolLogoUrl: String(sRow[10] || "")
      };
    }

    // Read Categories
    var sheetCategories = ss.getSheetByName("Categories");
    var categories = [];
    if (sheetCategories && sheetCategories.getLastRow() > 1) {
      var catData = sheetCategories.getRange(2, 1, sheetCategories.getLastRow() - 1, 3).getValues();
      for (var k = 0; k < catData.length; k++) {
        var cRow = catData[k];
        if (cRow[0]) {
          categories.push({
            id: String(cRow[0]),
            label: String(cRow[1] || cRow[0]),
            color: String(cRow[2] || "#3b82f6")
          });
        }
      }
    }

    return respondJSON({
      status: "success",
      schoolInfo: schoolInfo,
      events: events,
      categories: categories,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

// 3. ENDPOINT POST (Menyimpan / Menimpa Data ke Google Sheets)
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Update School Settings
    if (postData.schoolInfo) {
      var s = postData.schoolInfo;
      var sheetSettings = ss.getSheetByName("SchoolSettings") || ss.insertSheet("SchoolSettings");
      if (sheetSettings.getLastRow() > 1) {
        sheetSettings.deleteRows(2, sheetSettings.getLastRow() - 1);
      }
      sheetSettings.appendRow([
        s.schoolName || "",
        s.className || "",
        s.academicYear || "",
        s.startYear || 2025,
        s.endYear || 2026,
        s.principalName || "",
        s.principalNip || "",
        s.teacherName || "",
        s.teacherNip || "",
        s.city || "",
        s.schoolLogoUrl || ""
      ]);
    }

    // Update Agendas
    if (postData.events && Array.isArray(postData.events)) {
      var sheetAgenda = ss.getSheetByName("Agendas") || ss.insertSheet("Agendas");
      if (sheetAgenda.getLastRow() > 1) {
        sheetAgenda.deleteRows(2, sheetAgenda.getLastRow() - 1);
      }
      var rowsToAppend = postData.events.map(function(e) {
        return [
          e.id,
          e.title,
          e.startDate,
          e.endDate,
          e.category,
          e.semester || 1,
          e.description || "",
          e.color || "#3b82f6",
          e.isNationalHoliday ? true : false
        ];
      });
      if (rowsToAppend.length > 0) {
        sheetAgenda.getRange(2, 1, rowsToAppend.length, 9).setValues(rowsToAppend);
      }
    }

    // Update Categories
    if (postData.categories && Array.isArray(postData.categories)) {
      var sheetCategories = ss.getSheetByName("Categories") || ss.insertSheet("Categories");
      if (sheetCategories.getLastRow() > 1) {
        sheetCategories.deleteRows(2, sheetCategories.getLastRow() - 1);
      }
      var catRowsToAppend = postData.categories.map(function(c) {
        return [c.id, c.label, c.color || "#3b82f6"];
      });
      if (catRowsToAppend.length > 0) {
        sheetCategories.getRange(2, 1, catRowsToAppend.length, 3).setValues(catRowsToAppend);
      }
    }

    return respondJSON({
      status: "success",
      message: "Data berhasil disinkronkan ke Google Sheets!",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

// Helper Format Tanggal YYYY-MM-DD
function formatDateString(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(val).substring(0, 10);
}

// Helper Response JSON CORS
function respondJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
