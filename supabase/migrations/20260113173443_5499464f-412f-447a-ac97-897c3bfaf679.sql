-- Add English translation columns to cars_for_sale table
ALTER TABLE public.cars_for_sale
ADD COLUMN description_en text,
ADD COLUMN features_en text[];

-- Add English translation columns to car_sell_requests table  
ALTER TABLE public.car_sell_requests
ADD COLUMN description_en text;