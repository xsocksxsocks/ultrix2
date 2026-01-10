-- Rename year to first_registration_date and change type for cars_for_sale
ALTER TABLE public.cars_for_sale 
ADD COLUMN first_registration_date date;

-- Copy existing year data as January 1st of that year
UPDATE public.cars_for_sale 
SET first_registration_date = make_date(year, 1, 1);

-- Make it required
ALTER TABLE public.cars_for_sale 
ALTER COLUMN first_registration_date SET NOT NULL;

-- Add previous_owners column
ALTER TABLE public.cars_for_sale 
ADD COLUMN previous_owners integer DEFAULT 1;

-- Drop old year column
ALTER TABLE public.cars_for_sale 
DROP COLUMN year;

-- Same for car_sell_requests
ALTER TABLE public.car_sell_requests 
ADD COLUMN first_registration_date date;

-- Copy existing year data
UPDATE public.car_sell_requests 
SET first_registration_date = make_date(year, 1, 1);

-- Make it required
ALTER TABLE public.car_sell_requests 
ALTER COLUMN first_registration_date SET NOT NULL;

-- Add previous_owners column
ALTER TABLE public.car_sell_requests 
ADD COLUMN previous_owners integer DEFAULT 1;

-- Drop old year column
ALTER TABLE public.car_sell_requests 
DROP COLUMN year;

-- Also update car_inquiries to store first_registration_date instead of car_year
ALTER TABLE public.car_inquiries 
ADD COLUMN car_first_registration_date date;

UPDATE public.car_inquiries 
SET car_first_registration_date = make_date(car_year, 1, 1);

ALTER TABLE public.car_inquiries 
ALTER COLUMN car_first_registration_date SET NOT NULL;

ALTER TABLE public.car_inquiries 
DROP COLUMN car_year;