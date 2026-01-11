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

// Brand colors
const COLORS = {
  primary: [30, 41, 59] as [number, number, number],      // Slate 800
  secondary: [71, 85, 105] as [number, number, number],   // Slate 500
  accent: [22, 163, 74] as [number, number, number],      // Green 600
  accentLight: [220, 252, 231] as [number, number, number], // Green 100
  gold: [180, 140, 70] as [number, number, number],       // Elegant gold
  light: [248, 250, 252] as [number, number, number],     // Slate 50
  border: [226, 232, 240] as [number, number, number],    // Slate 200
  text: [30, 41, 59] as [number, number, number],         // Slate 800
  textMuted: [100, 116, 139] as [number, number, number], // Slate 500
  white: [255, 255, 255] as [number, number, number],
};

const formatPrice = (price: number) => {
  const formatted = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted} €`;
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
  // Top accent line
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 3, "F");
  
  // Gold accent
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 3, pageWidth, 0.5, "F");

  // Logo
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin, 8, 30, 13, undefined, "MEDIUM");
    } catch {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("ULTRIX", margin, 16);
    }
  } else {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("ULTRIX", margin, 16);
  }

  // Company details on the right - elegant style
  const rightAlign = pageWidth - margin;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("ULTRIX UG", rightAlign, 10, { align: "right" });
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Weihgartenstr. 19 • 68519 Viernheim", rightAlign, 14, { align: "right" });
  doc.text("+49 6204 6129035 • kontakt@ultrix-kfz.net", rightAlign, 18, { align: "right" });

  // Elegant separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, 24, pageWidth - margin, 24);
  
  // Gold accent on separator
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, 24, margin + 30, 24);
};

const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) => {
  // Footer background
  doc.setFillColor(...COLORS.light);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  
  // Top border with gold accent
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(0, pageHeight - 20, pageWidth, pageHeight - 20);
  
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 20, pageHeight - 20, pageWidth / 2 + 20, pageHeight - 20);

  // Page number
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text(`${pageNumber} / ${totalPages}`, pageWidth / 2, pageHeight - 14, { align: "center" });
  
  // Contact info
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(
    "ULTRIX UG (haftungsbeschränkt) • Weihgartenstr. 19 • 68519 Viernheim • USt-IdNr.: DE303256085",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );
  doc.text(
    "+49 6204 6129035 • kontakt@ultrix-kfz.net • ultrix-kfz.net",
    pageWidth / 2,
    pageHeight - 4,
    { align: "center" }
  );
};

const addCoverPage = (doc: jsPDF, pageWidth: number, pageHeight: number, margin: number, logoData: string | null, carCount: number) => {
  // Full page elegant background
  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Top decorative bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Gold accent line
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 40, pageWidth, 2, "F");

  // Logo centered in top bar
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", pageWidth / 2 - 25, 12, 50, 22, undefined, "MEDIUM");
    } catch {
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.white);
      doc.text("ULTRIX", pageWidth / 2, 28, { align: "center" });
    }
  }

  // Main title section
  let yPos = 60;
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Fahrzeugvermittlung", pageWidth / 2, yPos, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gold);
  doc.text("mit Garantie", pageWidth / 2, yPos + 10, { align: "center" });

  // Decorative element
  yPos += 20;
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 25, yPos, pageWidth / 2 + 25, yPos);
  
  // Small diamond shape
  const diamondY = yPos;
  doc.setFillColor(...COLORS.gold);
  doc.triangle(
    pageWidth / 2, diamondY - 3,
    pageWidth / 2 - 3, diamondY,
    pageWidth / 2, diamondY + 3,
    "F"
  );
  doc.triangle(
    pageWidth / 2, diamondY - 3,
    pageWidth / 2 + 3, diamondY,
    pageWidth / 2, diamondY + 3,
    "F"
  );

  // Date and count badge
  yPos += 15;
  const badgeWidth = 80;
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(pageWidth / 2 - badgeWidth / 2, yPos - 5, badgeWidth, 14, 7, 7, "F");
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - badgeWidth / 2, yPos - 5, badgeWidth, 14, 7, 7, "S");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text(`${carCount} Fahrzeuge • ${format(new Date(), "dd.MM.yyyy")}`, pageWidth / 2, yPos + 3, { align: "center" });

  // Main description card
  yPos += 25;
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 45, 3, 3, "F");
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 45, 3, 3, "S");
  
  // Left accent bar on card
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, yPos, 4, 45, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  
  const descText = "Wir vermitteln Fahrzeuge im Kundenauftrag. Jedes Fahrzeug durchläuft vor dem Verkauf unsere umfassende technische Prüfung. Den Fahrzeugzustand garantieren wir Ihnen vertraglich – ohne versteckte Kosten oder zusätzliche Gebühren für Sie als Käufer.";
  const descLines = doc.splitTextToSize(descText, pageWidth - margin * 2 - 20);
  doc.text(descLines, margin + 12, yPos + 12);

  // Feature grid - 2x2
  yPos += 55;
  const features = [
    { title: "Technisch geprüft", desc: "Umfassende Inspektion vor Verkauf" },
    { title: "Zustandsgarantie", desc: "Vertraglich abgesichert" },
    { title: "Keine Zusatzkosten", desc: "Faire & transparente Preise" },
    { title: "Geprüfte Historie", desc: "Dokumentierte Fahrzeugherkunft" },
  ];

  const boxWidth = (pageWidth - margin * 2 - 8) / 2;
  const boxHeight = 28;

  features.forEach((feature, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = margin + col * (boxWidth + 8);
    const boxY = yPos + row * (boxHeight + 6);

    // Box with subtle gradient effect (using layered rects)
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "S");

    // Accent bar
    doc.setFillColor(...COLORS.accent);
    doc.roundedRect(boxX, boxY, 3, boxHeight, 1, 1, "F");

    // Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(feature.title, boxX + 10, boxY + 11);

    // Description
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(feature.desc, boxX + 10, boxY + 20);
  });

  // Website section
  yPos += 2 * (boxHeight + 6) + 15;
  
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 210);
  const websiteText = "Alle Fahrzeuge mit Bildern und Details finden Sie online. Bei einigen Fahrzeugen ist die MwSt. ausweisbar. Gutachten auf Anfrage.";
  const websiteLines = doc.splitTextToSize(websiteText, pageWidth - margin * 2 - 20);
  doc.text(websiteLines, pageWidth / 2, yPos + 10, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gold);
  const linkText = "ultrix-kfz.net/fahrzeuge";
  const linkX = pageWidth / 2 - doc.getTextWidth(linkText) / 2;
  doc.textWithLink(linkText, linkX, yPos + 26, { url: "https://ultrix-kfz.net/fahrzeuge" });

  // Contact section
  yPos += 45;
  
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 32, 3, 3, "F");
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 32, 3, 3, "S");

  // Gold top accent
  doc.setFillColor(...COLORS.gold);
  doc.rect(margin + 10, yPos, pageWidth - margin * 2 - 20, 1.5, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Kontakt", pageWidth / 2, yPos + 10, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("ULTRIX UG (haftungsbeschränkt)", pageWidth / 2, yPos + 18, { align: "center" });
  doc.text("Weihgartenstr. 19 • 68519 Viernheim • +49 6204 6129035 • kontakt@ultrix-kfz.net", pageWidth / 2, yPos + 25, { align: "center" });
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
    formatPrice(car.price),
    car.is_reserved ? "Reserviert" : "Verfügbar",
  ]);

  // Create elegant table
  autoTable(doc, {
    startY: 30,
    head: [[
      "Fahrzeug",
      "EZ",
      "Kilometer",
      "PS",
      "Kraftstoff",
      "Getriebe",
      "VB",
      "Preis",
      "Status",
    ]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLORS.text,
      cellPadding: 3,
      valign: "middle",
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
    columnStyles: {
      0: { fontStyle: "bold", halign: "left" },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "right", fontStyle: "bold" },
      8: { halign: "center" },
    },
    tableWidth: pageWidth - margin * 2,
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        addHeader(doc, pageWidth, margin, logoData);
      }
    },
    didParseCell: (data) => {
      // Style status column
      if (data.section === "body" && data.column.index === 8) {
        if (data.cell.raw === "Reserviert") {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = COLORS.accent;
          data.cell.styles.fontStyle = "bold";
        }
      }
      // Style price column
      if (data.section === "body" && data.column.index === 7) {
        data.cell.styles.textColor = COLORS.primary;
      }
    },
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
