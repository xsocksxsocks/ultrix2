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
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);

const formatMileage = (mileage: number) =>
  `${mileage.toLocaleString("de-DE")} km`;

export const generateStockPdf = (cars: Car[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header with company info
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ULTRIX", margin, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Kfz-Handel", margin, 26);

  // Company details on the right
  doc.setFontSize(9);
  const rightAlign = pageWidth - margin;
  doc.text("ULTRIX UG (haftungsbeschränkt)", rightAlign, 15, { align: "right" });
  doc.text("Weihgartenstr. 19", rightAlign, 20, { align: "right" });
  doc.text("68519 Viernheim", rightAlign, 25, { align: "right" });
  doc.text("Tel: +49 6204 6129035", rightAlign, 32, { align: "right" });
  doc.text("E-Mail: kontakt@ultrix-kfz.net", rightAlign, 37, { align: "right" });

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 45, pageWidth - margin, 45);

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Aktuelle Fahrzeuge im Angebot", margin, 55);

  // Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Stand: ${format(new Date(), "dd.MM.yyyy")}`, margin, 62);

  // Filter only available cars (not sold)
  const availableCars = cars.filter((car) => !car.is_sold);

  // Table data
  const tableData = availableCars.map((car) => [
    `${car.brand} ${car.model}`,
    format(new Date(car.first_registration_date), "MM/yyyy"),
    formatMileage(car.mileage),
    car.power_hp ? `${car.power_hp} PS` : "-",
    car.fuel_type,
    car.transmission,
    car.color || "-",
    `${formatPrice(car.price)}${car.vat_deductible ? " (brutto)" : ""}`,
    car.is_reserved ? "Reserviert" : "Verfügbar",
  ]);

  // Generate table
  autoTable(doc, {
    startY: 68,
    head: [
      [
        "Fahrzeug",
        "EZ",
        "Kilometerstand",
        "Leistung",
        "Kraftstoff",
        "Getriebe",
        "Farbe",
        "Preis",
        "Status",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [41, 41, 41],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 15 },
      2: { cellWidth: 22 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18 },
      7: { cellWidth: 25 },
      8: { cellWidth: 18 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Seite ${data.pageNumber} von ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "ULTRIX UG • Weihgartenstr. 19 • 68519 Viernheim • kontakt@ultrix-kfz.net",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: "center" }
      );
    },
  });

  // Add summary after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Gesamt: ${availableCars.length} Fahrzeuge verfügbar`, margin, finalY);

  // Legal notice
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const legalText = [
    "Alle Angaben ohne Gewähr. Irrtümer und Zwischenverkauf vorbehalten.",
    "Technischer Zustand vertraglich garantiert. Keine zusätzlichen Käuferkosten.",
    "USt-IdNr.: DE303256085",
  ];
  legalText.forEach((text, idx) => {
    doc.text(text, margin, finalY + 8 + idx * 4);
  });

  // Save the PDF
  const fileName = `ULTRIX_Fahrzeugbestand_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
