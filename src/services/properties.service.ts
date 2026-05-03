
import { supabase } from "@/integrations/supabase/client";
import { handleResponse, getPaginationRange, ServiceResponse } from "./api";
import { PropertyCategory, PAGE_SIZE } from "@/config/constants";
import { Database } from "@/integrations/supabase/types";

// Type definitions to avoid 'any'
export type Property = Database['public']['Tables']['properties']['Row'];
export type CreatePropertyDTO = Database['public']['Tables']['properties']['Insert'];
export type UpdatePropertyDTO = Database['public']['Tables']['properties']['Update'];

export const propertiesService = {
    /**
     * Fetch properties with pagination and filtering
     */
    async getProperties(
        page: number = 0,
        category: PropertyCategory,
        status: string = "active",
        location?: string
    ): Promise<Property[]> {
        const { from, to } = getPaginationRange(page, PAGE_SIZE);

        let query = supabase
            .from("properties")
            .select(`
                id,
                name,
                description,
                base_price,
                address,
                city,
                images,
                category,
                status,
                is_featured,
                host_id,
                created_at,
                updated_at,
                amenities,
                max_guests,
                bedrooms,
                beds,
                bathrooms
            `)
            .eq("category", category)
            .eq("status", status);

        // Server-side location search
        if (location && location.trim()) {
            // Using ilike for case-insensitive partial match for name, address, and city
            const loc = location.trim();
            query = query.or(`address.ilike.%${loc}%,name.ilike.%${loc}%,city.ilike.%${loc}%`);
        }

        const { data, error } = await query
            .range(from, to)
            .order("created_at", { ascending: false })
            .returns<Property[]>();

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Fetch single property
     */
    async getProperty(id: string): Promise<Property> {
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Fetch properties for a specific host
     */
    async getHostProperties(hostId: string, limit: number = 4): Promise<Property[]> {
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("host_id", hostId)
            .limit(limit)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Create property (Must use RPC or Edge Function in production)
     */
    async createProperty(property: CreatePropertyDTO): Promise<Property> {
        // Use the newly created secure RPC
        const { data, error } = await supabase.rpc('create_property', {
            payload: property
        });

        if (error) throw new Error(error.message);

        // RPC returns { id }. Fetch full object.
        if (data && typeof data === 'object' && 'id' in data) {
            const propertyId = (data as { id: string }).id;
            const { data: newProp, error: fetchError } = await supabase
                .from("properties")
                .select("*")
                .eq("id", propertyId)
                .single();

            if (fetchError || !newProp) throw new Error("Property created but failed to fetch");
            return newProp;
        }

        throw new Error("Failed to create property");
    },


    async updateProperty(id: string, updates: UpdatePropertyDTO): Promise<Property> {
        const { error } = await supabase.rpc('update_property', {
            property_id: id,
            payload: updates
        });

        if (error) throw new Error(error.message);

        // Fetch updated
        const { data, error: fetchError } = await supabase
            .from("properties")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !data) throw new Error("Property updated but failed to fetch");
        return data;
    },

    /**
     * Admin: Update property (bypassing host check)
     */
    async adminUpdateProperty(id: string, updates: Record<string, any>): Promise<void> {
        const { error } = await supabase.rpc('admin_update_property', {
            p_property_id: id,
            p_updates: updates
        });

        if (error) throw error;
    },

    /**
     * Admin: Delete property
     */
    async adminDeleteProperty(id: string): Promise<void> {
        const { error } = await supabase.functions.invoke('admin-action', {
            body: {
                action: 'delete_property',
                payload: {
                    property_id: id
                }
            }
        });

        if (error) throw new Error(error.message);
    },

    /**
     * Helper: Expand shortened Google Maps URL
     */
    async expandGoogleMapsLink(shortUrl: string): Promise<string | null> {
        const { data, error } = await supabase.functions.invoke('expand-maps-url', {
            body: { shortUrl }
        });

        if (error) {
            console.error("Error expanding URL:", error);
            return null;
        }

        return data?.expandedUrl || null;
    }
};
