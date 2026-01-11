import jsPDF from "jspdf";
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

const formatPrice = (price: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);

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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
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

const addHeader = (doc: jsPDF, pageWidth: number, margin: number) => {
  // Header with company info
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 41, 41);
  doc.text("ULTRIX", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Kfz-Handel", margin, 23);

  // Company details on the right
  doc.setFontSize(8);
  const rightAlign = pageWidth - margin;
  doc.text("ULTRIX UG (haftungsbeschränkt)", rightAlign, 12, { align: "right" });
  doc.text("Weihgartenstr. 19, 68519 Viernheim", rightAlign, 16, { align: "right" });
  doc.text("Tel: +49 6204 6129035", rightAlign, 20, { align: "right" });
  doc.text("kontakt@ultrix-kfz.net", rightAlign, 24, { align: "right" });

  // Line separator
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 28, pageWidth - margin, 28);
};

const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) => {
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Seite ${pageNumber} von ${totalPages}`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );
  doc.text(
    "ULTRIX UG • Weihgartenstr. 19 • 68519 Viernheim • +49 6204 6129035 • kontakt@ultrix-kfz.net",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );
  doc.setDrawColor(220, 220, 220);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);
};

export const generateStockPdf = async (cars: Car[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Filter only available cars (not sold)
  const availableCars = cars.filter((car) => !car.is_sold);

  if (availableCars.length === 0) {
    // Empty state
    addHeader(doc, pageWidth, margin);
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Derzeit keine Fahrzeuge im Angebot.", pageWidth / 2, 80, { align: "center" });
    addFooter(doc, pageWidth, pageHeight, 1, 1);
    doc.save(`ULTRIX_Fahrzeugbestand_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    return;
  }

  // Process each car
  for (let i = 0; i < availableCars.length; i++) {
    const car = availableCars[i];

    if (i > 0) {
      doc.addPage();
    }

    addHeader(doc, pageWidth, margin);

    let yPos = 36;

    // Car title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 41, 41);
    doc.text(`${car.brand} ${car.model}`, margin, yPos);

    // Status badge
    if (car.is_reserved) {
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(pageWidth - margin - 28, yPos - 5, 28, 7, 1, 1, "F");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("RESERVIERT", pageWidth - margin - 14, yPos, { align: "center" });
    }

    yPos += 8;

    // Price section
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 41, 41);
    const priceText = formatPrice(car.price);
    doc.text(priceText, margin, yPos);

    // VAT info
    if (car.vat_deductible) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(34, 139, 34);
      doc.text("brutto • MwSt. ausweisbar", margin + doc.getTextWidth(priceText) + 4, yPos);
    }

    yPos += 10;

    // Load main image
    const mainImageUrl = car.images?.[0];
    let mainImageLoaded = false;

    if (mainImageUrl) {
      const imgData = await loadImageAsBase64(mainImageUrl);
      if (imgData) {
        try {
          // Main image - large
          const imgWidth = pageWidth - margin * 2;
          const imgHeight = 70;
          doc.addImage(imgData, "JPEG", margin, yPos, imgWidth, imgHeight, undefined, "MEDIUM");
          mainImageLoaded = true;
          yPos += imgHeight + 4;
        } catch (e) {
          console.error("Failed to add main image:", e);
        }
      }
    }

    if (!mainImageLoaded) {
      // Placeholder for missing image
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, pageWidth - margin * 2, 70, "F");
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text("Kein Bild verfügbar", pageWidth / 2, yPos + 35, { align: "center" });
      yPos += 74;
    }

    // Small thumbnail images (up to 4)
    const thumbnails = car.images?.slice(1, 5) || [];
    if (thumbnails.length > 0) {
      const thumbWidth = (pageWidth - margin * 2 - 6) / 4;
      const thumbHeight = 28;
      let thumbX = margin;

      for (const thumbUrl of thumbnails) {
        const thumbData = await loadImageAsBase64(thumbUrl);
        if (thumbData) {
          try {
            doc.addImage(thumbData, "JPEG", thumbX, yPos, thumbWidth, thumbHeight, undefined, "MEDIUM");
          } catch (e) {
            // Draw placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(thumbX, yPos, thumbWidth, thumbHeight, "F");
          }
        } else {
          doc.setFillColor(240, 240, 240);
          doc.rect(thumbX, yPos, thumbWidth, thumbHeight, "F");
        }
        thumbX += thumbWidth + 2;
      }
      yPos += thumbHeight + 6;
    }

    // Specifications table
    doc.setFillColor(248, 248, 248);
    doc.rect(margin, yPos, pageWidth - margin * 2, 36, "F");

    const specs = [
      { label: "Erstzulassung", value: format(new Date(car.first_registration_date), "MM/yyyy") },
      { label: "Kilometerstand", value: formatMileage(car.mileage) },
      { label: "Kraftstoff", value: car.fuel_type },
      { label: "Getriebe", value: car.transmission },
      { label: "Leistung", value: car.power_hp ? `${car.power_hp} PS` : "-" },
      { label: "Farbe", value: car.color || "-" },
      { label: "Vorbesitzer", value: car.previous_owners !== null && car.previous_owners !== undefined ? car.previous_owners.toString() : "-" },
    ];

    const colWidth = (pageWidth - margin * 2) / 4;
    let specX = margin + 4;
    let specY = yPos + 8;
    let specCol = 0;

    doc.setFontSize(8);
    specs.forEach((spec, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(spec.label, specX, specY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 41, 41);
      doc.text(spec.value, specX, specY + 5);

      specCol++;
      if (specCol === 4) {
        specCol = 0;
        specX = margin + 4;
        specY += 16;
      } else {
        specX += colWidth;
      }
    });

    yPos += 42;

    // Description
    if (car.description) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 41, 41);
      doc.text("Beschreibung", margin, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const descLines = doc.splitTextToSize(car.description, pageWidth - margin * 2);
      doc.text(descLines.slice(0, 4), margin, yPos); // Max 4 lines
      yPos += Math.min(descLines.length, 4) * 4 + 4;
    }

    // Features
    if (car.features && car.features.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 41, 41);
      doc.text("Ausstattung", margin, yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const featuresText = car.features.join(" • ");
      const featureLines = doc.splitTextToSize(featuresText, pageWidth - margin * 2);
      doc.text(featureLines.slice(0, 2), margin, yPos); // Max 2 lines
      yPos += Math.min(featureLines.length, 2) * 4 + 4;
    }

    // Guarantee box
    doc.setFillColor(240, 249, 240);
    doc.setDrawColor(34, 139, 34);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 14, 2, 2, "FD");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 139, 34);
    doc.text("✓ Technischer Zustand vertraglich garantiert", margin + 4, yPos + 5);
    doc.setFont("helvetica", "normal");
    doc.text("✓ Keine zusätzlichen Käuferkosten", margin + 4, yPos + 10);

    if (car.vat_deductible) {
      doc.text("✓ MwSt. ausweisbar (19%)", pageWidth / 2, yPos + 5);
    }
  }

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
