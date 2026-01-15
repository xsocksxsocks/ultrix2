import { supabase } from "@/integrations/supabase/client";

export interface ExportedCar {
  brand: string;
  model: string;
  first_registration_date: string;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string | null;
  power_hp: number | null;
  previous_owners: number | null;
  price: number;
  description: string | null;
  description_en: string | null;
  features: string[] | null;
  features_en: string[] | null;
  images: string[];
  vehicle_type: string | null;
  vat_deductible: boolean | null;
  is_featured: boolean;
}

export const exportCarsToJson = async (): Promise<void> => {
  const { data: cars, error } = await supabase
    .from("cars_for_sale")
    .select("*")
    .is("deleted_at", null)
    .eq("is_sold", false);

  if (error) {
    throw new Error(`Fehler beim Laden der Fahrzeuge: ${error.message}`);
  }

  // Map to export format (remove internal fields)
  const exportData: ExportedCar[] = (cars || []).map((car) => ({
    brand: car.brand,
    model: car.model,
    first_registration_date: car.first_registration_date,
    mileage: car.mileage,
    fuel_type: car.fuel_type,
    transmission: car.transmission,
    color: car.color,
    power_hp: car.power_hp,
    previous_owners: car.previous_owners,
    price: car.price,
    description: car.description,
    description_en: car.description_en,
    features: car.features,
    features_en: car.features_en,
    images: car.images,
    vehicle_type: car.vehicle_type,
    vat_deductible: car.vat_deductible,
    is_featured: car.is_featured ?? false,
  }));

  // Create and download JSON file
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ultrix-fahrzeuge-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate import code snippet for other projects
export const getImportInstructions = (): string => {
  return `
// ============================================
// IMPORT-ANLEITUNG FÜR ANDERES LOVABLE-PROJEKT
// ============================================

// 1. Erstelle diese Tabelle in deiner Datenbank (via Migration):
/*
CREATE TABLE public.cars_for_sale (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  first_registration_date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  color TEXT,
  power_hp INTEGER,
  previous_owners INTEGER DEFAULT 1,
  price NUMERIC NOT NULL,
  description TEXT,
  description_en TEXT,
  features TEXT[],
  features_en TEXT[],
  images TEXT[] NOT NULL,
  vehicle_type TEXT DEFAULT 'Fahrzeug',
  vat_deductible BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_sold BOOLEAN DEFAULT false,
  is_reserved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
*/

// 2. Erstelle eine Import-Funktion in deinem Projekt:
import { supabase } from "@/integrations/supabase/client";

interface ImportedCar {
  brand: string;
  model: string;
  first_registration_date: string;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string | null;
  power_hp: number | null;
  previous_owners: number | null;
  price: number;
  description: string | null;
  description_en: string | null;
  features: string[] | null;
  features_en: string[] | null;
  images: string[];
  vehicle_type: string | null;
  vat_deductible: boolean | null;
  is_featured: boolean;
}

export const importCarsFromJson = async (jsonFile: File): Promise<void> => {
  const text = await jsonFile.text();
  const cars: ImportedCar[] = JSON.parse(text);
  
  const { error } = await supabase
    .from("cars_for_sale")
    .insert(cars);
    
  if (error) {
    throw new Error(\`Import fehlgeschlagen: \${error.message}\`);
  }
  
  console.log(\`\${cars.length} Fahrzeuge erfolgreich importiert!\`);
};

// 3. Nutze die Funktion mit einem File-Input:
// <input type="file" accept=".json" onChange={(e) => {
//   if (e.target.files?.[0]) {
//     importCarsFromJson(e.target.files[0]);
//   }
// }} />
`;
};
