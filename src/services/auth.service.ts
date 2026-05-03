
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/config/constants";

export const authService = {
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        if (error) throw error;
        return data;
    },

    async updateProfile(userId: string, updates: { phone?: string; full_name?: string; avatar_url?: string }) {
        const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId);
        if (error) throw error;
    },

    async getUserRoles(userId: string): Promise<AppRole[]> {
        const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

        if (error) throw error;
        return (data?.map(r => r.role) || []) as AppRole[];
    },

    async signOut() {
        await supabase.auth.signOut();
    }
};
