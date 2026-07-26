export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * KALENDER PENDIDIKAN SD - GOOGLE APPS SCRIPT (Code.gs)
 * Multi-Tab Agendas Per Kelas + Auto-Create / Delete Sheet Tabs
 * ====================================================================
 * Petunjuk Penggunaan:
 * 1. Buka Google Sheets di https://sheets.new
 * 2. Klik menu "Ekstensi" -> "Apps Script"
 * 3. Hapus semua kode bawaan, lalu Tempel (Paste) seluruh kode ini di editor.
 * 4. Klik tombol "Jalankan" (Run) pada fungsi "setupDatabase" untuk membuat database & sheet kelas otomatis.
 * 5. Klik "Terapkan" (Deploy) -> "Terapkan sebagai Aplikasi Web" (New Deployment).
 * 6. Pilih:
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone)
 * 7. Salin "URL Aplikasi Web" ke dalam modal Integrasi Google Sheets di aplikasi.
 */

// 1. SETUP DATABASE OTOMATIS
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sheet Teachers
  var sheetTeachers = ss.getSheetByName("Teachers") || ss.insertSheet("Teachers");
  sheetTeachers.clear();
  var teacherHeaders = ["ID Guru", "Nama Lengkap Guru", "NIP", "Pegangan Kelas", "Email", "Nama Sekolah", "Tahun Pelajaran", "Kota / Kabupaten", "Warna Avatar"];
  sheetTeachers.getRange(1, 1, 1, teacherHeaders.length).setValues([teacherHeaders]);
  formatSheetHeader(sheetTeachers, teacherHeaders.length, "#7C3AED");

  var sampleTeachers = [
    ["teacher-1", "Budi Santoso, S.Pd.", "198506122010011005", "Kelas 5-A", "budi.santoso@sekolah.id", "SD NEGERI CIBURIAL", "2026/2027", "Kab. Bandung Barat", "#3B82F6"],
    ["teacher-2", "Hj. Ratna Juwita, S.Pd., M.M.", "198702152012012003", "Kelas 3-A", "ratna.juwita@sekolah.id", "SD NEGERI CIBURIAL", "2026/2027", "Kab. Bandung Barat", "#FF5C8D"]
  ];
  sheetTeachers.getRange(2, 1, sampleTeachers.length, teacherHeaders.length).setValues(sampleTeachers);

  // Sheet SchoolSettings
  var sheetSettings = ss.getSheetByName("SchoolSettings") || ss.insertSheet("SchoolSettings");
  sheetSettings.clear();
  var settingHeaders = ["Nama Sekolah", "Target Kelas", "Tahun Pelajaran", "Tahun Awal", "Tahun Akhir", "Nama Kepala Sekolah", "NIP Kepala Sekolah", "Nama Guru Kelas", "NIP Guru Kelas", "Kota / Kabupaten", "URL Logo Sekolah"];
  sheetSettings.getRange(1, 1, 1, settingHeaders.length).setValues([settingHeaders]);
  formatSheetHeader(sheetSettings, settingHeaders.length, "#DB2777");

  var sampleSettings = [
    ["SD NEGERI CIBURIAL", "Kelas 5-A", "2026/2027", 2026, 2027, "Carnia, S.Pd", "197112201997032002", "Budi Santoso, S.Pd.", "198506122010011005", "Kab. Bandung Barat", "https://lh3.googleusercontent.com/d/1RKrQMVX-taqKd6oENe_YUGbpe0XST4C8"]
  ];
  sheetSettings.getRange(2, 1, sampleSettings.length, settingHeaders.length).setValues(sampleSettings);

  // Sheet Categories
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

  // Dynamic Agendas Sheet Per Class
  var activeClasses = ["Kelas 5-A", "Kelas 3-A"];
  syncClassAgendaSheets(ss, activeClasses);

  // Sample Agendas for Kelas 5-A
  var sheet5A = ss.getSheetByName("Agenda - Kelas 5-A");
  if (sheet5A) {
    var sampleAgendas5A = [
      ["evt_1", "Hari Pertama Masuk Sekolah & MPLS", "2025-07-14", "2025-07-16", "mpls", 1, "Masa Pengenalan Lingkungan Sekolah Kelas 5-A", "#10b981", false, "Kelas 5-A"],
      ["evt_2", "HUT Kemerdekaan RI ke-80", "2025-08-17", "2025-08-17", "libur_nasional", 1, "Upacara Bendera & Peringatan Proklamasi", "#ef4444", true, "Kelas 5-A"],
      ["evt_3", "Penilaian Tengah Semester (PTS) 1", "2025-09-22", "2025-09-27", "ujian", 1, "Pelaksanaan Sumatif Tengah Semester Kelas 5-A", "#f59e0b", false, "Kelas 5-A"]
    ];
    sheet5A.getRange(2, 1, sampleAgendas5A.length, 10).setValues(sampleAgendas5A);
  }

  // Sample Agendas for Kelas 3-A
  var sheet3A = ss.getSheetByName("Agenda - Kelas 3-A");
  if (sheet3A) {
    var sampleAgendas3A = [
      ["evt_4", "Pembagian Rapor Semester 1", "2025-12-19", "2025-12-19", "rapor", 1, "Penyerahan Laporan Hasil Belajar Kelas 3-A", "#0284c7", false, "Kelas 3-A"]
    ];
    sheet3A.getRange(2, 1, sampleAgendas3A.length, 10).setValues(sampleAgendas3A);
  }

  // Remove default sheet if present
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Lembar1") || ss.getSheetByName("Agendas");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert("BERHASIL!\\nDatabase Kalender Pendidikan berhasil dibuat.\\n\\nTabel:\\n1. Teachers\\n2. SchoolSettings\\n3. Categories\\n4. Agenda - Kelas 5-A\\n5. Agenda - Kelas 3-A\\n\\nSetiap kelas memiliki Sheet Agendas tersendiri dan akan otomatis bertambah/terhapus saat Anda menambah/menghapus kelas.");
  } catch (e) {
    Logger.log("Database berhasil dibuat dengan multi-sheet Agendas per kelas.");
  }
}

// 2. HELPER LIST KELAS AKTIF
function getActiveClassesList(ss, postData) {
  var classMap = {};

  // Read from postData teachers
  if (postData && postData.teachers && Array.isArray(postData.teachers)) {
    for (var i = 0; i < postData.teachers.length; i++) {
      var cls = String(postData.teachers[i].className || "").trim();
      if (cls) classMap[cls] = true;
    }
  } else {
    // Read from Teachers sheet
    var sheetTeachers = ss.getSheetByName("Teachers");
    if (sheetTeachers && sheetTeachers.getLastRow() > 1) {
      var tData = sheetTeachers.getRange(2, 1, sheetTeachers.getLastRow() - 1, 9).getValues();
      for (var j = 0; j < tData.length; j++) {
        var cName = String(tData[j][3] || "").trim();
        if (cName) classMap[cName] = true;
      }
    }
  }

  // Include SchoolSettings className
  if (postData && postData.schoolInfo && postData.schoolInfo.className) {
    var sc = String(postData.schoolInfo.className || "").trim();
    if (sc) classMap[sc] = true;
  } else {
    var sheetSettings = ss.getSheetByName("SchoolSettings");
    if (sheetSettings && sheetSettings.getLastRow() > 1) {
      var sVal = String(sheetSettings.getRange(2, 2, 1, 1).getValue() || "").trim();
      if (sVal) classMap[sVal] = true;
    }
  }

  var list = Object.keys(classMap);
  if (list.length === 0) list = ["Kelas 5-A"];
  return list;
}

// 3. SINKRONISASI SHEET AGENDAS PER KELAS (Tambah / Hapus Sheet Otomatis)
function syncClassAgendaSheets(ss, activeClassList) {
  var prefix = "Agenda - ";
  var desiredSheets = {};

  var agendaHeaders = ["ID Agenda", "Judul Kegiatan", "Tanggal Mulai", "Tanggal Selesai", "ID Kategori", "Semester", "Keterangan / Detail", "Warna Hex", "Libur Nasional", "Nama Kelas"];

  for (var i = 0; i < activeClassList.length; i++) {
    var targetSheetName = prefix + activeClassList[i];
    desiredSheets[targetSheetName] = activeClassList[i];

    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) {
      sheet = ss.insertSheet(targetSheetName);
      sheet.getRange(1, 1, 1, agendaHeaders.length).setValues([agendaHeaders]);
      formatSheetHeader(sheet, agendaHeaders.length, "#0F172A");
    }
  }

  // Hapus sheet Agenda - <Kelas> yang kelasnya sudah dihapus
  var allSheets = ss.getSheets();
  for (var k = 0; k < allSheets.length; k++) {
    var s = allSheets[k];
    var sName = s.getName();
    if (sName.indexOf(prefix) === 0) {
      if (!desiredSheets[sName]) {
        // Jangan hapus jika hanya ada 1 sheet tersisa di spreadsheet
        if (ss.getSheets().length > 1) {
          ss.deleteSheet(s);
        }
      }
    }
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

// 4. ENDPOINT GET (Membaca Data Semua Kelas)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var activeClassList = getActiveClassesList(ss, null);
    syncClassAgendaSheets(ss, activeClassList);

    // Read Agendas from all "Agenda - <Kelas>" sheets
    var allSheets = ss.getSheets();
    var events = [];
    var seenKeys = {};

    for (var sIdx = 0; sIdx < allSheets.length; sIdx++) {
      var sheet = allSheets[sIdx];
      var sName = sheet.getName();

      if (sName.indexOf("Agenda - ") === 0 || sName === "Agendas") {
        var defaultClassForSheet = sName.replace("Agenda - ", "");
        if (sName === "Agendas") defaultClassForSheet = "";

        if (sheet.getLastRow() > 1) {
          var aData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
          for (var i = 0; i < aData.length; i++) {
            var row = aData[i];
            if (row[0]) {
              var evtId = String(row[0]);
              var evtClass = String(row[9] || defaultClassForSheet);
              var key = evtId + "_" + evtClass;

              if (!seenKeys[key]) {
                seenKeys[key] = true;
                events.push({
                  id: evtId,
                  title: String(row[1] || ""),
                  startDate: formatDateString(row[2]),
                  endDate: formatDateString(row[3]),
                  category: String(row[4] || "kegiatan_sekolah"),
                  semester: Number(row[5]) || 1,
                  description: String(row[6] || ""),
                  color: String(row[7] || "#3b82f6"),
                  isNationalHoliday: Boolean(row[8]),
                  className: evtClass
                });
              }
            }
          }
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
        schoolLogoUrl: String(sRow[10] || "https://lh3.googleusercontent.com/d/1RKrQMVX-taqKd6oENe_YUGbpe0XST4C8")
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

    // Read Teachers
    var sheetTeachers = ss.getSheetByName("Teachers");
    var teachers = [];
    if (sheetTeachers && sheetTeachers.getLastRow() > 1) {
      var tData = sheetTeachers.getRange(2, 1, sheetTeachers.getLastRow() - 1, 9).getValues();
      for (var j = 0; j < tData.length; j++) {
        var tRow = tData[j];
        if (tRow[0]) {
          teachers.push({
            id: String(tRow[0]),
            name: String(tRow[1] || ""),
            nip: String(tRow[2] || "-"),
            className: String(tRow[3] || ""),
            email: String(tRow[4] || ""),
            schoolName: String(tRow[5] || ""),
            academicYear: String(tRow[6] || "2026/2027"),
            city: String(tRow[7] || "Kab. Bandung Barat"),
            avatarColor: String(tRow[8] || "#FF5C8D")
          });
        }
      }
    }

    return respondJSON({
      status: "success",
      schoolInfo: schoolInfo,
      events: events,
      categories: categories,
      teachers: teachers,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

// Helper membersihkan isi baris data tanpa menghapus struktur baris/header (mencegah error deleteRows pada frozen header)
function clearDataRows(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
  }
}

// Helper memastikan nilai teks sel tidak melebihi batas 50.000 karakter sel Google Sheets
function safeCellVal(val, maxLen) {
  if (val === null || val === undefined) return "";
  var str = String(val);
  var limit = maxLen || 48000;
  if (str.length > limit) {
    return str.substring(0, limit);
  }
  return str;
}

// 5. ENDPOINT POST (Simpan Data + Auto Tambah / Hapus Sheet Kelas)
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Update School Settings
    if (postData.schoolInfo) {
      var s = postData.schoolInfo;
      var sheetSettings = ss.getSheetByName("SchoolSettings") || ss.insertSheet("SchoolSettings");
      clearDataRows(sheetSettings);
      sheetSettings.getRange(2, 1, 1, 11).setValues([[
        safeCellVal(s.schoolName),
        safeCellVal(s.className),
        safeCellVal(s.academicYear),
        s.startYear || 2026,
        s.endYear || 2027,
        safeCellVal(s.principalName),
        safeCellVal(s.principalNip),
        safeCellVal(s.teacherName),
        safeCellVal(s.teacherNip),
        safeCellVal(s.city),
        safeCellVal(s.schoolLogoUrl, 45000)
      ]]);
    }

    // Update Categories
    if (postData.categories && Array.isArray(postData.categories)) {
      var sheetCategories = ss.getSheetByName("Categories") || ss.insertSheet("Categories");
      clearDataRows(sheetCategories);
      var catRowsToAppend = postData.categories.map(function(c) {
        return [c.id, c.label, c.color || "#3b82f6"];
      });
      if (catRowsToAppend.length > 0) {
        sheetCategories.getRange(2, 1, catRowsToAppend.length, 3).setValues(catRowsToAppend);
      }
    }

    // Update Teachers
    if (postData.teachers && Array.isArray(postData.teachers)) {
      var sheetTeachers = ss.getSheetByName("Teachers") || ss.insertSheet("Teachers");
      clearDataRows(sheetTeachers);
      var teacherRowsToAppend = postData.teachers.map(function(t) {
        return [
          t.id,
          t.name,
          t.nip || "-",
          t.className,
          t.email || "",
          t.schoolName || "",
          t.academicYear || "2026/2027",
          t.city || "Kab. Bandung Barat",
          t.avatarColor || "#FF5C8D"
        ];
      });
      if (teacherRowsToAppend.length > 0) {
        sheetTeachers.getRange(2, 1, teacherRowsToAppend.length, 9).setValues(teacherRowsToAppend);
      }
    }

    // Dapatkan daftar semua kelas aktif saat ini
    var activeClassList = getActiveClassesList(ss, postData);

    // Otomatis Tambah / Hapus Sheet Agenda per Kelas!
    syncClassAgendaSheets(ss, activeClassList);

    // Update Agendas per Kelas
    if (postData.events && Array.isArray(postData.events)) {
      for (var cIdx = 0; cIdx < activeClassList.length; cIdx++) {
        var currentClass = activeClassList[cIdx];
        var sheetName = "Agenda - " + currentClass;
        var sheetAgenda = ss.getSheetByName(sheetName);

        if (sheetAgenda) {
          clearDataRows(sheetAgenda);

          // Filter events untuk kelas ini
          var classEvents = postData.events.filter(function(ev) {
            if (!ev.className || ev.className === "Semua Kelas" || ev.className === currentClass) {
              return true;
            }
            return false;
          });

          var rowsToAppend = classEvents.map(function(e) {
            return [
              e.id,
              e.title,
              e.startDate,
              e.endDate,
              e.category,
              e.semester || 1,
              e.description || "",
              e.color || "#3b82f6",
              e.isNationalHoliday ? true : false,
              e.className || currentClass
            ];
          });

          if (rowsToAppend.length > 0) {
            sheetAgenda.getRange(2, 1, rowsToAppend.length, 10).setValues(rowsToAppend);
          }
        }
      }
    }

    return respondJSON({
      status: "success",
      message: "Data berhasil disinkronkan ke Google Sheets! Sheet Agendas per kelas telah diperbarui.",
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
