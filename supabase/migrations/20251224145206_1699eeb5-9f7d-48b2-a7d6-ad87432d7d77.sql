-- Add is_reserved column to cars_for_sale table
ALTER TABLE public.cars_for_sale
ADD COLUMN IF NOT EXISTS is_reserved boolean DEFAULT false;