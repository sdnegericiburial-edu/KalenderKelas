import React, { useState, useRef } from "react";
import { SchoolInfo, CalendarEvent, EventCategory } from "../types";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/initialData";
import {
  generateMonthGrid,
  formatDateRangeIndonesian,
  getCategoryInfo,
  DayCell,
} from "../utils/calendarUtils";
import { X, Printer, Download, Settings2, Sliders, Check, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface PrintPreviewModalProps {
  isOpen: boolean;
  schoolInfo: SchoolInfo;
  events: CalendarEvent[];
  categories?: EventCategory[];
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  schoolInfo,
  events,
  categories = DEFAULT_CATEGORIES,
  onClose,
}) => {
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  
  // Page & Margin Settings State - Default to A4 Portrait & Standard Margin
  const [paperSize, setPaperSize] = useState<"a4" | "f4">("a4");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("portrait");
  const [marginPreset, setMarginPreset] = useState<"minimal" | "standard" | "wide" | "custom">("standard");
  
  // Custom margin in mm (Standard = 10mm)
  const [marginTop, setMarginTop] = useState<number>(10);
  const [marginBottom, setMarginBottom] = useState<number>(10);
  const [marginLeft, setMarginLeft] = useState<number>(10);
  const [marginRight, setMarginRight] = useState<number>(10);

  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [includeLegend, setIncludeLegend] = useState<boolean>(true);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  const startYear = schoolInfo.startYear || 2026;
  const endYear = schoolInfo.endYear || 2027;

  const semester1Months = [
    { name: "JULI " + startYear, monthIndex: 6, year: startYear },
    { name: "AGUSTUS " + startYear, monthIndex: 7, year: startYear },
    { name: "SEPTEMBER " + startYear, monthIndex: 8, year: startYear },
    { name: "OKTOBER " + startYear, monthIndex: 9, year: startYear },
    { name: "NOVEMBER " + startYear, monthIndex: 10, year: startYear },
    { name: "DESEMBER " + startYear, monthIndex: 11, year: startYear },
  ];

  const semester2Months = [
    { name: "JANUARI " + endYear, monthIndex: 0, year: endYear },
    { name: "FEBRUARI " + endYear, monthIndex: 1, year: endYear },
    { name: "MARET " + endYear, monthIndex: 2, year: endYear },
    { name: "APRIL " + endYear, monthIndex: 3, year: endYear },
    { name: "MEI " + endYear, monthIndex: 4, year: endYear },
    { name: "JUNI " + endYear, monthIndex: 5, year: endYear },
  ];

  const semester1Events = events
    .filter((e) => e.semester === 1)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const semester2Events = events
    .filter((e) => e.semester === 2)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Apply Margin Preset Changes
  const handlePresetChange = (preset: "minimal" | "standard" | "wide") => {
    setMarginPreset(preset);
    if (preset === "minimal") {
      setMarginTop(5);
      setMarginBottom(5);
      setMarginLeft(5);
      setMarginRight(5);
    } else if (preset === "standard") {
      setMarginTop(10);
      setMarginBottom(10);
      setMarginLeft(10);
      setMarginRight(10);
    } else if (preset === "wide") {
      setMarginTop(15);
      setMarginBottom(15);
      setMarginLeft(15);
      setMarginRight(15);
    }
  };

  // Direct PDF Export Function using html-to-image & jsPDF for 2 Pages
  const handleDownloadPDF = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: paperSize === "a4" ? "a4" : [215.9, 330.2], // F4 size in mm
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const printableWidth = pdfWidth - marginLeft - marginRight;
      const printableHeight = pdfHeight - marginTop - marginBottom;

      // --- PAGE 1: SEMESTER 1 ---
      const imgData1 = await toPng(page1Ref.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const img1 = new Image();
      img1.src = imgData1;
      await new Promise((resolve) => {
        img1.onload = resolve;
      });

      let img1Width = printableWidth;
      let img1Height = (img1.height * img1Width) / img1.width;
      if (img1Height > printableHeight) {
        img1Height = printableHeight;
      }

      pdf.addImage(imgData1, "PNG", marginLeft, marginTop, img1Width, img1Height);

      // --- PAGE 2: SEMESTER 2 ---
      pdf.addPage();

      const imgData2 = await toPng(page2Ref.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const img2 = new Image();
      img2.src = imgData2;
      await new Promise((resolve) => {
        img2.onload = resolve;
      });

      let img2Width = printableWidth;
      let img2Height = (img2.height * img2Width) / img2.width;
      if (img2Height > printableHeight) {
        img2Height = printableHeight;
      }

      pdf.addImage(imgData2, "PNG", marginLeft, marginTop, img2Width, img2Height);

      const fileName = `Kalender_Pendidikan_${schoolInfo.schoolName.replace(/\s+/g, "_")}_${schoolInfo.academicYear.replace("/", "-")}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Gagal menerbitkan PDF:", err);
      alert("Terjadi kesalahan saat memproses PDF. Mencoba menggunakan cetak sistem browser...");
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct Browser Print Function with dynamic @page style injection
  const handleSystemPrint = () => {
    const styleId = "dynamic-print-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${paperSize} ${orientation};
          margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
        }

        body * {
          visibility: hidden !important;
        }

        #pdf-page-1, #pdf-page-1 *,
        #pdf-page-2, #pdf-page-2 * {
          visibility: visible !important;
        }

        html, body {
          background: #ffffff !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* Flatten outer fixed modal containers */
        div[class*="fixed"], div[class*="overflow-y-auto"] {
          position: static !important;
          inset: auto !important;
          overflow: visible !important;
          max-height: none !important;
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          width: 100% !important;
        }

        #pdf-page-1, #pdf-page-2 {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: white !important;
        }

        #pdf-page-1 {
          page-break-after: always !important;
          break-after: page !important;
        }

        .no-print, nav, header, button, .print\\:hidden {
          display: none !important;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-amber-950/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 max-w-6xl w-full my-auto overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Modal Header Toolbar */}
        <div className="bg-[#FFD166] text-amber-950 px-6 py-3.5 flex flex-wrap items-center justify-between shrink-0 print:hidden border-b-2 border-amber-300 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black">
              <span>🖨️</span>
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Cetak & Export PDF Kalender</h3>
              <p className="text-[11px] font-bold text-amber-900/80">
                Atur Margin, Ukuran Kertas A4 Landscape, lalu Unduh PDF atau Cetak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 border-b-4 border-pink-700 hover:bg-pink-400 disabled:bg-slate-300 text-white text-xs font-black rounded-full shadow-xs transition-colors cursor-pointer"
            >
              {isGeneratingPdf ? (
                <span>Memproses PDF...</span>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Unduh PDF (A4)</span>
                </>
              )}
            </button>

            <button
              onClick={handleSystemPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-black rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Cetak Langsung</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-amber-950 hover:text-pink-600 rounded-full hover:bg-amber-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Page & Margin Control Panel (Print Settings Toolbar) */}
        <div className="bg-yellow-50/70 p-4 border-b-2 border-yellow-200 print:hidden grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold text-amber-950">
          
          {/* Paper Size & Orientation */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-amber-900 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-pink-500" /> Ukuran Kertas & Orientasi:
            </label>
            <div className="flex gap-2">
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as "a4" | "f4")}
                className="bg-white border-2 border-yellow-200 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="a4">Kertas A4</option>
                <option value="f4">Kertas F4 / Folio</option>
              </select>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as "landscape" | "portrait")}
                className="bg-white border-2 border-yellow-200 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="landscape">Landscape (Mendatar)</option>
                <option value="portrait">Portrait (Tegak)</option>
              </select>
            </div>
          </div>

          {/* Margin Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-amber-900 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-pink-500" /> Preset Margin Kertas:
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handlePresetChange("minimal")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                  marginPreset === "minimal"
                    ? "bg-pink-500 text-white border-pink-600"
                    : "bg-white text-slate-700 border-yellow-200 hover:bg-yellow-100"
                }`}
              >
                Minimal (5mm)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("standard")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                  marginPreset === "standard"
                    ? "bg-pink-500 text-white border-pink-600"
                    : "bg-white text-slate-700 border-yellow-200 hover:bg-yellow-100"
                }`}
              >
                Standar (10mm)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("wide")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                  marginPreset === "wide"
                    ? "bg-pink-500 text-white border-pink-600"
                    : "bg-white text-slate-700 border-yellow-200 hover:bg-yellow-100"
                }`}
              >
                Lebar (15mm)
              </button>
            </div>
          </div>

          {/* Custom Margin Numeric Inputs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-amber-900 flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5 text-pink-500" /> Atur Margin Spesifik (mm):
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div>
                <span className="text-[9px] block text-slate-500">Atas</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={marginTop}
                  onChange={(e) => {
                    setMarginTop(Number(e.target.value));
                    setMarginPreset("custom");
                  }}
                  className="w-full bg-white border border-yellow-300 rounded text-center text-xs py-0.5 font-bold"
                />
              </div>
              <div>
                <span className="text-[9px] block text-slate-500">Bawah</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={marginBottom}
                  onChange={(e) => {
                    setMarginBottom(Number(e.target.value));
                    setMarginPreset("custom");
                  }}
                  className="w-full bg-white border border-yellow-300 rounded text-center text-xs py-0.5 font-bold"
                />
              </div>
              <div>
                <span className="text-[9px] block text-slate-500">Kiri</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={marginLeft}
                  onChange={(e) => {
                    setMarginLeft(Number(e.target.value));
                    setMarginPreset("custom");
                  }}
                  className="w-full bg-white border border-yellow-300 rounded text-center text-xs py-0.5 font-bold"
                />
              </div>
              <div>
                <span className="text-[9px] block text-slate-500">Kanan</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={marginRight}
                  onChange={(e) => {
                    setMarginRight(Number(e.target.value));
                    setMarginPreset("custom");
                  }}
                  className="w-full bg-white border border-yellow-300 rounded text-center text-xs py-0.5 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-amber-900">
              Elemen Cetak Tambahan:
            </label>
            <div className="space-y-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-400"
                />
                <span>Sertakan Kolom Tanda Tangan</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLegend}
                  onChange={(e) => setIncludeLegend(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-400"
                />
                <span>Sertakan Keterangan Warna Legend</span>
              </label>
            </div>
          </div>

        </div>

        {/* Printable Paper Canvas Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/80 flex flex-col items-center gap-6">
          
          {/* ==================== PAGE 1: SEMESTER 1 ==================== */}
          <div className="w-full max-w-[820px]">
            <div className="text-center text-xs font-black text-slate-500 mb-1 flex items-center justify-between px-1 print:hidden">
              <span>📄 HALAMAN 1 DARI 2</span>
              <span className="text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">SEMESTER 1 ( JULI - DESEMBER {startYear} )</span>
            </div>

            <div
              ref={page1Ref}
              id="pdf-page-1"
              style={{
                paddingTop: `${marginTop}mm`,
                paddingBottom: `${marginBottom}mm`,
                paddingLeft: `${marginLeft}mm`,
                paddingRight: `${marginRight}mm`,
              }}
              className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full font-sans rounded-xs space-y-3.5 print:shadow-none print:border-none print:w-full print:p-0 print-page-break"
            >
              {/* Header Banner Page 1 */}
              <div className="flex items-center justify-center gap-3 border-b-2 border-slate-900 pb-2 text-center">
                {schoolInfo.schoolLogoUrl && (
                  <img
                    src={schoolInfo.schoolLogoUrl}
                    alt="Logo Sekolah"
                    className="w-12 h-12 object-contain shrink-0"
                  />
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    KALENDER PENDIDIKAN {schoolInfo.schoolName}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
                    TAHUN PELAJARAN {schoolInfo.academicYear} - SEMESTER 1 ( SATU )
                  </h2>
                  {schoolInfo.className && (
                    <p className="text-[11px] font-bold text-pink-600 mt-0.5 uppercase tracking-wide">
                      KELAS: {schoolInfo.className}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Color Legend Bar */}
              {includeLegend && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700 uppercase">Keterangan Warna:</span>
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-200">
                      <span
                        className="w-2 h-2 rounded-full inline-block border border-black/10"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar & Agenda Grid Split Layout Page 1 */}
              <div className="grid grid-cols-12 gap-3 divide-x divide-slate-300 items-start">
                
                {/* LEFT 7/12 COLUMNS: Semester 1 (6 Mini Month Grids) */}
                <div className="col-span-7 space-y-2">
                  <div className="bg-slate-900 text-white font-black text-center py-1 text-xs uppercase tracking-widest rounded-xs">
                    SEMESTER 1 ( JULI - DESEMBER {startYear} )
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {semester1Months.map((m) => (
                      <PrintMiniMonth
                        key={m.name}
                        monthName={m.name}
                        year={m.year}
                        monthIndex={m.monthIndex}
                        events={events}
                      />
                    ))}
                  </div>
                </div>

                {/* RIGHT 5/12 COLUMNS: KETERANGAN AGENDA SEMESTER 1 */}
                <div className="col-span-5 pl-3 space-y-2 text-xs">
                  <div className="bg-pink-600 text-white font-black text-[11px] px-2 py-1 uppercase tracking-wide rounded-xs text-center">
                    AGENDA & KETERANGAN SEMESTER 1
                  </div>
                  <div className="border border-slate-300 divide-y divide-slate-200 text-[10px] min-h-[360px]">
                    {semester1Events.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 italic">Belum ada agenda semester 1.</div>
                    ) : (
                      semester1Events.map((evt) => (
                        <div key={evt.id} className="p-1.5 flex items-start gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 border border-black/20"
                            style={{ backgroundColor: evt.color || getCategoryInfo(evt.category).color }}
                          />
                          <div>
                            <div className="font-black text-slate-900">
                              {formatDateRangeIndonesian(evt.startDate, evt.endDate)}
                            </div>
                            <div className="text-slate-800 font-bold leading-tight">{evt.title}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ==================== PAGE 2: SEMESTER 2 ==================== */}
          <div className="w-full max-w-[820px]">
            <div className="text-center text-xs font-black text-slate-500 mb-1 flex items-center justify-between px-1 print:hidden">
              <span>📄 HALAMAN 2 DARI 2</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">SEMESTER 2 ( JANUARI - JUNI {endYear} )</span>
            </div>

            <div
              ref={page2Ref}
              id="pdf-page-2"
              style={{
                paddingTop: `${marginTop}mm`,
                paddingBottom: `${marginBottom}mm`,
                paddingLeft: `${marginLeft}mm`,
                paddingRight: `${marginRight}mm`,
              }}
              className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full font-sans rounded-xs space-y-3.5 print:shadow-none print:border-none print:w-full print:p-0"
            >
              {/* Header Banner Page 2 */}
              <div className="flex items-center justify-center gap-3 border-b-2 border-slate-900 pb-2 text-center">
                {schoolInfo.schoolLogoUrl && (
                  <img
                    src={schoolInfo.schoolLogoUrl}
                    alt="Logo Sekolah"
                    className="w-12 h-12 object-contain shrink-0"
                  />
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    KALENDER PENDIDIKAN {schoolInfo.schoolName}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
                    TAHUN PELAJARAN {schoolInfo.academicYear} - SEMESTER 2 ( DUA )
                  </h2>
                  {schoolInfo.className && (
                    <p className="text-[11px] font-bold text-pink-600 mt-0.5 uppercase tracking-wide">
                      KELAS: {schoolInfo.className}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Color Legend Bar */}
              {includeLegend && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700 uppercase">Keterangan Warna:</span>
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-200">
                      <span
                        className="w-2 h-2 rounded-full inline-block border border-black/10"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar & Agenda Grid Split Layout Page 2 */}
              <div className="grid grid-cols-12 gap-3 divide-x divide-slate-300 items-start">
                
                {/* LEFT 7/12 COLUMNS: Semester 2 (6 Mini Month Grids) */}
                <div className="col-span-7 space-y-2">
                  <div className="bg-slate-900 text-white font-black text-center py-1 text-xs uppercase tracking-widest rounded-xs">
                    SEMESTER 2 ( JANUARI - JUNI {endYear} )
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {semester2Months.map((m) => (
                      <PrintMiniMonth
                        key={m.name}
                        monthName={m.name}
                        year={m.year}
                        monthIndex={m.monthIndex}
                        events={events}
                      />
                    ))}
                  </div>
                </div>

                {/* RIGHT 5/12 COLUMNS: KETERANGAN AGENDA SEMESTER 2 */}
                <div className="col-span-5 pl-3 space-y-2 text-xs">
                  <div className="bg-blue-600 text-white font-black text-[11px] px-2 py-1 uppercase tracking-wide rounded-xs text-center">
                    AGENDA & KETERANGAN SEMESTER 2
                  </div>
                  <div className="border border-slate-300 divide-y divide-slate-200 text-[10px] min-h-[300px]">
                    {semester2Events.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 italic">Belum ada agenda semester 2.</div>
                    ) : (
                      semester2Events.map((evt) => (
                        <div key={evt.id} className="p-1.5 flex items-start gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 border border-black/20"
                            style={{ backgroundColor: evt.color || getCategoryInfo(evt.category).color }}
                          />
                          <div>
                            <div className="font-black text-slate-900">
                              {formatDateRangeIndonesian(evt.startDate, evt.endDate)}
                            </div>
                            <div className="text-slate-800 font-bold leading-tight">{evt.title}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Signatures Block on Page 2 */}
              {includeSignatures && (
                <div className="pt-4 border-t-2 border-slate-900 flex justify-between text-xs text-slate-900 font-bold print:break-inside-avoid">
                  <div className="text-center space-y-8 min-w-[180px]">
                    <div>
                      <p className="font-semibold text-slate-600">Mengetahui,</p>
                      <p className="font-black">Kepala {schoolInfo.schoolName}</p>
                    </div>
                    <div>
                      <p className="font-black underline uppercase text-slate-900">
                        {schoolInfo.principalName || "..........................................."}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">
                        NIP. {schoolInfo.principalNip || "..........................................."}
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-8 min-w-[180px]">
                    <div>
                      <p className="font-semibold text-slate-600">{schoolInfo.city || "Bandung Barat"}, Juli {schoolInfo.startYear || 2026}</p>
                      <p className="font-black">Guru {schoolInfo.className || "Kelas"}</p>
                    </div>
                    <div>
                      <p className="font-black underline uppercase text-slate-900">
                        {schoolInfo.teacherName || "..........................................."}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">
                        NIP. {schoolInfo.teacherNip || "..........................................."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const PrintMiniMonth: React.FC<{
  monthName: string;
  year: number;
  monthIndex: number;
  events: CalendarEvent[];
}> = ({ monthName, year, monthIndex, events }) => {
  const days: DayCell[] = generateMonthGrid(year, monthIndex, events);

  return (
    <div className="border-2 border-slate-300 overflow-hidden text-[10px] rounded-xs">
      <div className="bg-pink-600 text-white font-black text-center py-0.5 uppercase tracking-wide">
        {monthName}
      </div>
      <div className="grid grid-cols-7 text-center font-black border-b border-slate-300 bg-yellow-50 text-amber-950">
        <div className="bg-rose-500 text-white">Mg</div>
        <div>Sn</div>
        <div>Sl</div>
        <div>Rb</div>
        <div>Km</div>
        <div>Jm</div>
        <div>Sb</div>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-300 divide-x divide-y divide-slate-200">
        {days.map((cell, idx) => {
          const hasEvent = cell.events.length > 0;
          const mainEvent = cell.events[0];

          let styleCustom: React.CSSProperties = {};
          if (hasEvent && mainEvent && cell.isCurrentMonth) {
            styleCustom = {
              backgroundColor: mainEvent.color || getCategoryInfo(mainEvent.category).color,
              color: "#ffffff",
              fontWeight: "900",
            };
          }

          return (
            <div
              key={idx}
              style={styleCustom}
              className={`h-4.5 flex items-center justify-center text-center text-[10px] ${
                !cell.isCurrentMonth
                  ? "text-slate-300 font-normal"
                  : cell.isSunday && !hasEvent
                  ? "text-rose-600 font-black bg-rose-50"
                  : "font-bold text-slate-800"
              }`}
            >
              {cell.dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};
