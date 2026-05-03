
import { supabase } from "@/integrations/supabase/client";

export const uploadsService = {
    /**
     * Upload property image
     * Requires propertyId to ensure images are scoped to a valid entity key
     */
    async uploadPropertyImage(propertyId: string, file: File): Promise<string> {
        const fileExt = file.name.split(".").pop();
        const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(fileName, file);

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
            .from("property-images")
            .getPublicUrl(fileName);

        return data.publicUrl;
    }
};
