-- Add listing number column to cars_for_sale
ALTER TABLE public.cars_for_sale 
ADD COLUMN listing_number text UNIQUE;

-- Create function to generate random alphanumeric listing number
CREATE OR REPLACE FUNCTION public.generate_listing_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create trigger to auto-generate listing number on insert
CREATE OR REPLACE FUNCTION public.set_listing_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number text;
  exists_count integer;
BEGIN
  IF NEW.listing_number IS NULL THEN
    LOOP
      new_number := generate_listing_number();
      SELECT COUNT(*) INTO exists_count FROM cars_for_sale WHERE listing_number = new_number;
      EXIT WHEN exists_count = 0;
    END LOOP;
    NEW.listing_number := new_number;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_listing_number
BEFORE INSERT ON public.cars_for_sale
FOR EACH ROW
EXECUTE FUNCTION public.set_listing_number();

-- Generate listing numbers for existing cars
UPDATE public.cars_for_sale 
SET listing_number = generate_listing_number() 
WHERE listing_number IS NULL;