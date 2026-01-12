-- Add vehicle_type column to cars_for_sale table
ALTER TABLE cars_for_sale 
  ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT 'Pkw';

-- Add vehicle_type column to car_sell_requests table
ALTER TABLE car_sell_requests 
  ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT 'Pkw';

-- Update existing records based on brand
UPDATE cars_for_sale 
SET vehicle_type = 'Baumaschine' 
WHERE brand IN ('JCB', 'Takeuchi') AND vehicle_type = 'Pkw';

UPDATE cars_for_sale 
SET vehicle_type = 'Motorrad' 
WHERE brand IN ('Ducati', 'Yamaha') AND vehicle_type = 'Pkw';

UPDATE car_sell_requests 
SET vehicle_type = 'Baumaschine' 
WHERE brand IN ('JCB', 'Takeuchi') AND vehicle_type = 'Pkw';

UPDATE car_sell_requests 
SET vehicle_type = 'Motorrad' 
WHERE brand IN ('Ducati', 'Yamaha') AND vehicle_type = 'Pkw';