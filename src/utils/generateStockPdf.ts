import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  first_registration_date: string;
  previous_owners?: number | null;
  power_hp?: number | null;
  color?: string | null;
  is_sold?: boolean;
  is_reserved?: boolean;
  vat_deductible?: boolean;
  images?: string[];
  description?: string | null;
  features?: string[] | null;
}

const LOGO_URL = "/images/ultrix-logo.png";

const formatPrice = (price: number) => {
  const formatted = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted} € brutto`;
};

const formatMileage = (mileage: number) =>
  `${mileage.toLocaleString("de-DE")} km`;

// Convert image URL to base64
const loadImageAsBase64 = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png", 0.9);
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const addHeader = (doc: jsPDF, pageWidth: number, margin: number, logoData: string | null) => {
  // Logo
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin, 8, 32, 14, undefined, "MEDIUM");
    } catch {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 41, 41);
      doc.text("ULTRIX", margin, 16);
    }
  } else {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 41, 41);
    doc.text("ULTRIX", margin, 16);
  }

  // Company details on the right
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const rightAlign = pageWidth - margin;
  doc.text("ULTRIX UG (haftungsbeschränkt)", rightAlign, 10, { align: "right" });
  doc.text("Weihgartenstr. 19 • 68519 Viernheim", rightAlign, 14, { align: "right" });
  doc.text("+49 6204 6129035 • kontakt@ultrix-kfz.net", rightAlign, 18, { align: "right" });
  doc.text("USt-IdNr.: DE303256085", rightAlign, 22, { align: "right" });

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, 26, pageWidth - margin, 26);
};

const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) => {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Seite ${pageNumber} von ${totalPages}`,
    pageWidth / 2,
    pageHeight - 13,
    { align: "center" }
  );
  doc.text(
    "ULTRIX UG (haftungsbeschränkt) • Weihgartenstr. 19 • 68519 Viernheim",
    pageWidth / 2,
    pageHeight - 9,
    { align: "center" }
  );
  doc.text(
    "+49 6204 6129035 • kontakt@ultrix-kfz.net • USt-IdNr.: DE303256085",
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );
};

const addCoverPage = (doc: jsPDF, pageWidth: number, pageHeight: number, margin: number, logoData: string | null, carCount: number) => {
  // Logo centered at top
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", pageWidth / 2 - 30, 25, 60, 26, undefined, "MEDIUM");
    } catch {
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 41, 41);
      doc.text("ULTRIX", pageWidth / 2, 40, { align: "center" });
    }
  }

  // Main title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(35, 35, 35);
  doc.text("Fahrzeugvermittlung mit Garantie", pageWidth / 2, 70, { align: "center" });

  // Date and count
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Stand: ${format(new Date(), "dd.MM.yyyy")} • ${carCount} Fahrzeuge verfügbar`, pageWidth / 2, 80, { align: "center" });

  // Decorative line
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, 88, pageWidth / 2 + 40, 88);

  // Main description text
  let yPos = 100;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  
  const descText = "Wir vermitteln Fahrzeuge im Kundenauftrag. Jedes Fahrzeug durchläuft vor dem Verkauf unsere umfassende technische Prüfung. Den Fahrzeugzustand garantieren wir Ihnen vertraglich – ohne versteckte Kosten oder zusätzliche Gebühren für Sie als Käufer.";
  const descLines = doc.splitTextToSize(descText, pageWidth - margin * 4);
  doc.text(descLines, pageWidth / 2, yPos, { align: "center" });
  
  yPos += descLines.length * 5 + 15;

  // Feature boxes - 2 columns, 4 rows
  const features = [
    { title: "Technisch geprüft", desc: "Umfassende Inspektion" },
    { title: "Zustandsgarantie", desc: "Vertraglich gesichert" },
    { title: "Keine Zusatzkosten", desc: "Faire Preise" },
    { title: "Geprüfte Historie", desc: "Transparente Herkunft" },
  ];

  const boxWidth = (pageWidth - margin * 2 - 10) / 2;
  const boxHeight = 20;
  const boxGap = 8;

  features.forEach((feature, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = margin + col * (boxWidth + 10);
    const boxY = yPos + row * (boxHeight + boxGap);

    // Box background
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "F");

    // Left accent
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(boxX, boxY, 3, boxHeight, 1, 1, "F");

    // Checkmark
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text("✓", boxX + 8, boxY + 9);

    // Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text(feature.title, boxX + 16, boxY + 9);

    // Description
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(feature.desc, boxX + 16, boxY + 15);
  });

  yPos += 2 * (boxHeight + boxGap) + 20;

  // Contact info box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Kontakt", pageWidth / 2, yPos + 10, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("ULTRIX UG (haftungsbeschränkt)", pageWidth / 2, yPos + 18, { align: "center" });
  doc.text("Weihgartenstr. 19 • 68519 Viernheim", pageWidth / 2, yPos + 24, { align: "center" });
  doc.text("+49 6204 6129035 • kontakt@ultrix-kfz.net", pageWidth / 2, yPos + 30, { align: "center" });
};

export const generateStockPdf = async (cars: Car[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Load logo
  const logoData = await loadImageAsBase64(LOGO_URL);

  // Filter only available cars (not sold)
  const availableCars = cars.filter((car) => !car.is_sold);

  // Add cover page
  addCoverPage(doc, pageWidth, pageHeight, margin, logoData, availableCars.length);

  if (availableCars.length === 0) {
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(doc, pageWidth, pageHeight, p, totalPages);
    }
    doc.save(`ULTRIX_Fahrzeugbestand_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    return;
  }

  // Add new page for table
  doc.addPage();
  addHeader(doc, pageWidth, margin, logoData);

  // Build table data
  const tableData = availableCars.map((car) => [
    `${car.brand} ${car.model}`,
    format(new Date(car.first_registration_date), "MM/yyyy"),
    formatMileage(car.mileage),
    car.power_hp ? `${car.power_hp} PS` : "—",
    car.fuel_type,
    car.transmission,
    car.previous_owners !== null && car.previous_owners !== undefined ? car.previous_owners.toString() : "—",
    car.vat_deductible ? "Ja" : "Nein",
    formatPrice(car.price),
    car.is_reserved ? "Reserviert" : "Verfügbar",
  ]);

  // Create table
  autoTable(doc, {
    startY: 32,
    head: [[
      "Fahrzeug",
      "EZ",
      "Kilometer",
      "Leistung",
      "Kraftstoff",
      "Getriebe",
      "VB",
      "MwSt.",
      "Preis",
      "Status",
    ]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
      cellPadding: 2.5,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "right", cellWidth: 22 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "center", cellWidth: 18 },
      5: { halign: "center", cellWidth: 18 },
      6: { halign: "center", cellWidth: 10 },
      7: { halign: "center", cellWidth: 12 },
      8: { halign: "right", fontStyle: "bold", cellWidth: 28 },
      9: { halign: "center", cellWidth: 18 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Add header on each page (except the page where autoTable already drew)
      if (data.pageNumber > 1) {
        addHeader(doc, pageWidth, margin, logoData);
      }
    },
    didParseCell: (data) => {
      // Style status column
      if (data.section === "body" && data.column.index === 9) {
        if (data.cell.raw === "Reserviert") {
          data.cell.styles.textColor = [245, 158, 11];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [34, 197, 94];
        }
      }
      // Style MwSt column
      if (data.section === "body" && data.column.index === 7) {
        if (data.cell.raw === "Ja") {
          data.cell.styles.textColor = [34, 197, 94];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Add guarantee info below table
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  let yPos = finalY + 10;

  // Check if we need a new page for guarantees
  if (yPos > pageHeight - 50) {
    doc.addPage();
    addHeader(doc, pageWidth, margin, logoData);
    yPos = 35;
  }

  // Guarantee badges - vertically stacked
  const badges = [
    { text: "Technischer Zustand garantiert", icon: "✓" },
    { text: "Keine zusätzlichen Käuferkosten", icon: "✓" },
  ];

  const badgeHeight = 8;
  const badgeGap = 3;
  const badgeWidth = pageWidth - margin * 2;

  badges.forEach((badge, idx) => {
    const badgeY = yPos + idx * (badgeHeight + badgeGap);

    // Badge background
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, badgeY, badgeWidth, badgeHeight, 2, 2, "F");

    // Left accent bar
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(margin, badgeY, 3, badgeHeight, 1, 1, "F");

    // Text
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text(`${badge.icon} ${badge.text}`, margin + 7, badgeY + 5.5);
  });

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, pageWidth, pageHeight, p, totalPages);
  }

  // Save the PDF
  const fileName = `ULTRIX_Fahrzeugbestand_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
