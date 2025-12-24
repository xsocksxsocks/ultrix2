-- Add notes column to car_inquiries
ALTER TABLE public.car_inquiries ADD COLUMN notes TEXT;

-- Add notes column to contact_requests
ALTER TABLE public.contact_requests ADD COLUMN notes TEXT;

-- Add notes column to car_sell_requests
ALTER TABLE public.car_sell_requests ADD COLUMN notes TEXT;