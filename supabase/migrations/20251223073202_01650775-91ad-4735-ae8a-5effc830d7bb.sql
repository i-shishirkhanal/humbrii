-- Create property categories enum
CREATE TYPE property_category AS ENUM ('hourly', 'daycation', 'full_stay', 'vibe_chill');

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  category property_category NOT NULL,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NPR',
  
  -- Hourly specific settings
  hourly_minimum_hours INTEGER DEFAULT 3,
  hourly_available_slots TEXT[] DEFAULT ARRAY['3', '6', '9'],
  hourly_start_time TIME DEFAULT '07:00',
  hourly_end_time TIME DEFAULT '18:00',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'inactive')),
  is_published BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_guests INTEGER DEFAULT 2,
  bed_type TEXT,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  price_override DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create host_payout_methods table
CREATE TABLE public.host_payout_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('esewa', 'bank')),
  is_primary BOOLEAN DEFAULT false,
  
  -- eSewa fields
  esewa_id TEXT,
  esewa_phone TEXT,
  
  -- Bank fields
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_holder TEXT,
  bank_branch TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(host_id, method_type)
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_payout_methods ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Hosts can view their own properties"
ON public.properties FOR SELECT
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own properties"
ON public.properties FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own properties"
ON public.properties FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own properties"
ON public.properties FOR DELETE
USING (auth.uid() = host_id);

CREATE POLICY "Public can view published properties"
ON public.properties FOR SELECT
USING (is_published = true AND status = 'active');

-- Rooms policies
CREATE POLICY "Hosts can manage rooms of their properties"
ON public.rooms FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = rooms.property_id
    AND properties.host_id = auth.uid()
  )
);

CREATE POLICY "Public can view rooms of published properties"
ON public.rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = rooms.property_id
    AND properties.is_published = true
    AND properties.status = 'active'
  )
);

-- Payout methods policies
CREATE POLICY "Hosts can view their own payout methods"
ON public.host_payout_methods FOR SELECT
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own payout methods"
ON public.host_payout_methods FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own payout methods"
ON public.host_payout_methods FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own payout methods"
ON public.host_payout_methods FOR DELETE
USING (auth.uid() = host_id);

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_host_payout_methods_updated_at
BEFORE UPDATE ON public.host_payout_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();