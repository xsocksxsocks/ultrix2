-- Add VAT deductible field to cars_for_sale
ALTER TABLE public.cars_for_sale 
ADD COLUMN IF NOT EXISTS vat_deductible boolean DEFAULT false;