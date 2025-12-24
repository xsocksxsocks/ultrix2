-- Termin-Spalten zur car_sell_requests Tabelle hinzufügen
ALTER TABLE public.car_sell_requests
ADD COLUMN IF NOT EXISTS appointment_date date,
ADD COLUMN IF NOT EXISTS appointment_time text,
ADD COLUMN IF NOT EXISTS appointment_confirmed boolean DEFAULT false;