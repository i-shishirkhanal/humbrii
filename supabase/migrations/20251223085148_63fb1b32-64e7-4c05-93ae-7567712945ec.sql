-- Add is_featured column to properties for admin to mark featured properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create admin policies for properties (allow admins to view, update, delete all properties)
CREATE POLICY "Admins can view all properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all properties" 
ON public.properties 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all properties" 
ON public.properties 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin policies for profiles (allow admins to view all profiles)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));