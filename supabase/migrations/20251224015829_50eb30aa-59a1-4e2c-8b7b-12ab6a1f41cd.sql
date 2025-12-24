-- Create table for car inquiries
CREATE TABLE public.car_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.cars_for_sale(id) ON DELETE CASCADE,
  car_brand TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_year INTEGER NOT NULL,
  car_price NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.car_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create car inquiries" 
ON public.car_inquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view car inquiries" 
ON public.car_inquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update car inquiries" 
ON public.car_inquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete car inquiries" 
ON public.car_inquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));