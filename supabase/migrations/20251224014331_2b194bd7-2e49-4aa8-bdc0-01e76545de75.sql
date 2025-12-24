-- Create enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create user_roles table for admin authentication
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles - admins can read their own roles
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create contact_requests table
CREATE TABLE public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact requests
CREATE POLICY "Anyone can create contact requests"
ON public.contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view contact requests
CREATE POLICY "Admins can view contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update contact requests
CREATE POLICY "Admins can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete contact requests
CREATE POLICY "Admins can delete contact requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create car_sell_requests table (customers wanting to sell their car)
CREATE TABLE public.car_sell_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    color TEXT,
    description TEXT,
    asking_price DECIMAL(10,2),
    images TEXT[] NOT NULL,
    status TEXT DEFAULT 'pending',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on car_sell_requests
ALTER TABLE public.car_sell_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert car sell requests
CREATE POLICY "Anyone can create car sell requests"
ON public.car_sell_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view car sell requests
CREATE POLICY "Admins can view car sell requests"
ON public.car_sell_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update car sell requests
CREATE POLICY "Admins can update car sell requests"
ON public.car_sell_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete car sell requests
CREATE POLICY "Admins can delete car sell requests"
ON public.car_sell_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create cars_for_sale table (cars admin lists for sale)
CREATE TABLE public.cars_for_sale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    color TEXT,
    power_hp INTEGER,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    features TEXT[],
    images TEXT[] NOT NULL,
    is_sold BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cars_for_sale
ALTER TABLE public.cars_for_sale ENABLE ROW LEVEL SECURITY;

-- Everyone can view cars for sale
CREATE POLICY "Everyone can view cars for sale"
ON public.cars_for_sale
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert cars for sale
CREATE POLICY "Admins can insert cars for sale"
ON public.cars_for_sale
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update cars for sale
CREATE POLICY "Admins can update cars for sale"
ON public.cars_for_sale
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete cars for sale
CREATE POLICY "Admins can delete cars for sale"
ON public.cars_for_sale
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true);

-- Storage policies for car images
CREATE POLICY "Anyone can view car images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Anyone can upload car images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Admins can update car images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete car images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));