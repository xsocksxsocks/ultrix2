import jsPDF from "jspdf";
import { format } from "date-fns";
import logoImg from "@/assets/ultrix-logo.png";

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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
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

const addHeader = async (doc: jsPDF, pageWidth: number, margin: number, logoData: string | null) => {
  // Logo
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin, 8, 32, 14, undefined, "MEDIUM");
    } catch {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 41, 41);
      doc.text("ULTRIX", margin, 18);
    }
  } else {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 41, 41);
    doc.text("ULTRIX", margin, 18);
  }

  // Decorative accent line under logo
  doc.setDrawColor(200, 160, 60);
  doc.setLineWidth(0.8);
  doc.line(margin, 24, margin + 32, 24);

  // Company details on the right - styled
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const rightAlign = pageWidth - margin;
  doc.text("ULTRIX UG (haftungsbeschränkt)", rightAlign, 10, { align: "right" });
  doc.text("Weihgartenstr. 19 • 68519 Viernheim", rightAlign, 14, { align: "right" });
  doc.setTextColor(100, 100, 100);
  doc.text("+49 6204 6129035", rightAlign, 19, { align: "right" });
  doc.text("kontakt@ultrix-kfz.net", rightAlign, 23, { align: "right" });

  // Elegant separator line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, 28, pageWidth - margin, 28);
};

const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) => {
  // Top line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

  // Accent
  doc.setDrawColor(200, 160, 60);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 15, pageHeight - 18, pageWidth / 2 + 15, pageHeight - 18);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Seite ${pageNumber} von ${totalPages}`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );
  doc.text(
    "ULTRIX UG • Weihgartenstr. 19 • 68519 Viernheim • +49 6204 6129035",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );
};

export const generateStockPdf = async (cars: Car[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Load logo
  const logoData = await loadImageAsBase64(logoImg);

  // Filter only available cars (not sold)
  const availableCars = cars.filter((car) => !car.is_sold);

  if (availableCars.length === 0) {
    await addHeader(doc, pageWidth, margin, logoData);
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

    await addHeader(doc, pageWidth, margin, logoData);

    let yPos = 34;

    // Car title with subtle background
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(margin, yPos - 4, pageWidth - margin * 2, 12, 1, 1, "F");
    
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(35, 35, 35);
    doc.text(`${car.brand} ${car.model}`, margin + 3, yPos + 3);

    // Status badge
    if (car.is_reserved) {
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(pageWidth - margin - 26, yPos - 2, 24, 6, 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text("RESERVIERT", pageWidth - margin - 14, yPos + 2, { align: "center" });
    }

    yPos += 14;

    // Price section with accent
    doc.setFillColor(250, 248, 245);
    doc.roundedRect(margin, yPos - 3, pageWidth - margin * 2, 11, 1, 1, "F");
    
    // Gold accent bar
    doc.setFillColor(200, 160, 60);
    doc.rect(margin, yPos - 3, 3, 11, "F");

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(35, 35, 35);
    const priceText = formatPrice(car.price);
    doc.text(priceText, margin + 8, yPos + 4);

    // VAT info
    if (car.vat_deductible) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(46, 125, 50);
      doc.text("brutto • MwSt. ausweisbar", margin + 8 + doc.getTextWidth(priceText) + 5, yPos + 4);
    }

    yPos += 14;

    // Load main image
    const mainImageUrl = car.images?.[0];
    let mainImageLoaded = false;

    if (mainImageUrl) {
      const imgData = await loadImageAsBase64(mainImageUrl);
      if (imgData) {
        try {
          const imgWidth = pageWidth - margin * 2;
          const imgHeight = 65;
          
          // Subtle shadow effect
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(margin + 1, yPos + 1, imgWidth, imgHeight, 2, 2, "F");
          
          doc.addImage(imgData, "JPEG", margin, yPos, imgWidth, imgHeight, undefined, "MEDIUM");
          
          // Border
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, yPos, imgWidth, imgHeight, 2, 2, "S");
          
          mainImageLoaded = true;
          yPos += imgHeight + 3;
        } catch (e) {
          console.error("Failed to add main image:", e);
        }
      }
    }

    if (!mainImageLoaded) {
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 65, 2, 2, "F");
      doc.setFontSize(11);
      doc.setTextColor(170, 170, 170);
      doc.text("Kein Bild verfügbar", pageWidth / 2, yPos + 32, { align: "center" });
      yPos += 68;
    }

    // Thumbnail images (up to 4)
    const thumbnails = car.images?.slice(1, 5) || [];
    if (thumbnails.length > 0) {
      const thumbWidth = (pageWidth - margin * 2 - 6) / 4;
      const thumbHeight = 26;
      let thumbX = margin;

      for (const thumbUrl of thumbnails) {
        const thumbData = await loadImageAsBase64(thumbUrl);
        if (thumbData) {
          try {
            doc.addImage(thumbData, "JPEG", thumbX, yPos, thumbWidth, thumbHeight, undefined, "MEDIUM");
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.roundedRect(thumbX, yPos, thumbWidth, thumbHeight, 1, 1, "S");
          } catch {
            doc.setFillColor(248, 248, 248);
            doc.roundedRect(thumbX, yPos, thumbWidth, thumbHeight, 1, 1, "F");
          }
        } else {
          doc.setFillColor(248, 248, 248);
          doc.roundedRect(thumbX, yPos, thumbWidth, thumbHeight, 1, 1, "F");
        }
        thumbX += thumbWidth + 2;
      }
      yPos += thumbHeight + 5;
    }

    // Specifications - refined grid
    doc.setFillColor(250, 250, 252);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 32, 2, 2, "F");
    doc.setDrawColor(235, 235, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 32, 2, 2, "S");

    const specs = [
      { label: "Erstzulassung", value: format(new Date(car.first_registration_date), "MM/yyyy") },
      { label: "Kilometerstand", value: formatMileage(car.mileage) },
      { label: "Kraftstoff", value: car.fuel_type },
      { label: "Getriebe", value: car.transmission },
      { label: "Leistung", value: car.power_hp ? `${car.power_hp} PS` : "—" },
      { label: "Farbe", value: car.color || "—" },
      { label: "Vorbesitzer", value: car.previous_owners !== null && car.previous_owners !== undefined ? car.previous_owners.toString() : "—" },
    ];

    const colWidth = (pageWidth - margin * 2) / 4;
    let specX = margin + 5;
    let specY = yPos + 7;
    let specCol = 0;

    specs.forEach((spec) => {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(130, 130, 130);
      doc.text(spec.label.toUpperCase(), specX, specY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(spec.value, specX, specY + 5);

      specCol++;
      if (specCol === 4) {
        specCol = 0;
        specX = margin + 5;
        specY += 14;
      } else {
        specX += colWidth;
      }
    });

    yPos += 38;

    // Description
    if (car.description) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("Beschreibung", margin, yPos);
      yPos += 4;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      const descLines = doc.splitTextToSize(car.description, pageWidth - margin * 2);
      doc.text(descLines.slice(0, 3), margin, yPos);
      yPos += Math.min(descLines.length, 3) * 3.5 + 4;
    }

    // Features
    if (car.features && car.features.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("Ausstattung", margin, yPos);
      yPos += 4;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      const featuresText = car.features.join("  •  ");
      const featureLines = doc.splitTextToSize(featuresText, pageWidth - margin * 2);
      doc.text(featureLines.slice(0, 2), margin, yPos);
      yPos += Math.min(featureLines.length, 2) * 3.5 + 3;
    }

    // Guarantee box - compact and elegant
    const boxWidth = pageWidth - margin * 2;
    doc.setFillColor(245, 252, 245);
    doc.setDrawColor(180, 210, 180);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, boxWidth, 10, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 125, 50);
    
    let guaranteeText = "✓ Technischer Zustand garantiert   •   ✓ Keine Käuferkosten";
    if (car.vat_deductible) {
      guaranteeText += "   •   ✓ MwSt. ausweisbar (19%)";
    }
    doc.text(guaranteeText, pageWidth / 2, yPos + 6, { align: "center" });
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
