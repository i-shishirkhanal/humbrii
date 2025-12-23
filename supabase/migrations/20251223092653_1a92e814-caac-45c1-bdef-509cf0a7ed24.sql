-- Create property ratings table
CREATE TABLE public.property_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booking_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id, booking_id)
);

-- Enable RLS
ALTER TABLE public.property_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view visible ratings
CREATE POLICY "Anyone can view visible ratings"
ON public.property_ratings
FOR SELECT
USING (is_visible = true);

-- Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
ON public.property_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.property_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
ON public.property_ratings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all ratings
CREATE POLICY "Admins can update all ratings"
ON public.property_ratings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete ratings
CREATE POLICY "Admins can delete ratings"
ON public.property_ratings
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_property_ratings_updated_at
BEFORE UPDATE ON public.property_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_property_ratings_property_id ON public.property_ratings(property_id);
CREATE INDEX idx_property_ratings_user_id ON public.property_ratings(user_id);