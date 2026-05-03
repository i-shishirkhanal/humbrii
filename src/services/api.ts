
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Base types for service responses to ensure consistent error handling
export type ServiceResponse<T> = {
    data: T | null;
    error: Error | null;
};

export type DatabaseTables = Database['public']['Tables'];
export type DatabaseEnums = Database['public']['Enums'];

/**
 * Generic helper to handle Supabase responses and throw consistent errors
 * that can be caught by React Query or UI components.
 */
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Generic helper to handle Supabase responses and throw consistent errors
 * that can be caught by React Query or UI components.
 */
export const handleResponse = async <T>(
    promise: PromiseLike<{ data: T | null; error: PostgrestError | Error | null }>
): Promise<T> => {
    const { data, error } = await promise;

    if (error) {
        console.error("API Error:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }

    // If data is null but no error, we check if T allows null.
    // In most 'select' cases (returning arrays), data will be [] not null.
    // For .single(), it might be null, so we cast to T which should include | null if needed.
    return data as T;
};

/**
 * Utility to calculate pagination range
 */
export const getPaginationRange = (page: number, pageSize: number) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
};
