
import { supabase } from "@/integrations/supabase/client";
import { handleResponse, getPaginationRange } from "./api";
import { PAGE_SIZE } from "@/config/constants";
import { Database } from "@/integrations/supabase/types";

export type Booking = Database['public']['Tables']['bookings']['Row'];

export interface BookingWithDetails extends Booking {
    properties: {
        name: string;
        images: string[] | null;
        location: string;
        category: Database['public']['Enums']['property_category'];
    } | null;
    profiles?: {
        full_name: string | null;
        email: string | null;
    } | null;
}

export interface CreateBookingDTO {
    property_id: string;
    check_in_date: Date | string; // Handle both
    check_out_date: Date | string;
    guests: number;
    payment_type: "full" | "partial"; // Add payment type
}

export const bookingsService = {
    /**
     * Get user bookings (Paginated)
     */
    async getUserBookings(page: number = 0, userId: string, activeTab: "upcoming" | "past" = "upcoming"): Promise<BookingWithDetails[]> {
        const { from, to } = getPaginationRange(page, PAGE_SIZE);
        const now = new Date().toISOString();

        let query = supabase
            .from("bookings")
            .select("id, created_at, updated_at, check_in_date, check_out_date, guests, total_amount, booking_status, payment_status, user_id, property_id, currency, properties(name, images, location, category)")
            .eq("user_id", userId);

        if (activeTab === "upcoming") {
            // Pending OR Confirmed AND future dates
            // Simplification: Just show pending/confirmed regardless of date, or strict date?
            // "Upcoming" usually implies valid bookings to come.
            // Let's filter by status first as that is primary.
            query = query.in("booking_status", ["pending", "confirmed"])
                .gte("check_in_date", now);
            // Note: If a 'confirmed' booking started yesterday but ends tomorrow, is it upcoming? 
            // Usually 'current' or 'upcoming'. check_out_date > now is safer for 'active'.
            // Let's use check_out_date > now to include currently active trips.
            // BUT for strict 'upcoming start', check_in_date > now.
            // Let's match the previous logic: "status confirmed/pending"
            // The previous logic was: status=confirmed OR pending.
            // Let's add date filter to ensure 'past confirmed' don't show up here if we separate them.
            // Actually, let's just use status for now to avoid timezone complexities in SQL if easy.
            // But 'past' definitely implies they represent completed trips.
            // Let's stick to status filter primarily + basic date check.

            // To be safe and simple: 
            // Upcoming = Confirmed/Pending
            // Past = Completed/Cancelled
            // The tricky part is 'Conceptually Past' (date passed) but status still 'confirmed'.
            // A cron job should update them to 'completed'. 
            // Without cron, we must rely on date.

            // Re-reading implementation plan: 
            // upcoming: booking_status IN ('pending', 'confirmed') AND check_in_date >= NOW
            // This excludes 'Active' trips (started yesterday). 
            // Better: check_out_date >= NOW.

            // But wait, .gte/lte in query builder with modifiers is tricky if we want (A AND B) OR (C).
            // here we want: (status=pending OR status=confirmed) AND checkout > now.
            // Supabase .in() is AND with other filters.
            // so: .in('booking_status', ['pending', 'confirmed']).gte('check_out_date', now)

            // query = query.in("booking_status", ["pending", "confirmed"])
            //            .gte("check_out_date", now);

            // However, complicating it: If I have a pending request from last year, is it upcoming? No, it's expired.
            // So date filter is GOOD.

            query = query.in("booking_status", ["pending", "confirmed"])
                //.gte("check_out_date", now) -- Commented out to avoid timezone issues for now, relying on Status. 
                //Ideally, a cron updates status to 'expired' or 'completed'.
                // If we don't have cron, 'upcoming' tab might show old pending requests.
                // Let's assume standard flow:
                .order("check_in_date", { ascending: true });
        } else {
            // Past
            query = query.in("booking_status", ["completed", "cancelled"])
                .order("check_in_date", { ascending: false });
        }

        const { data, error } = await query
            .range(from, to)
            .returns<BookingWithDetails[]>();

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Get bookings for a host's properties
     */
    async getHostBookings(hostId: string): Promise<Booking[]> {
        const { data, error } = await supabase
            .from("bookings")
            .select("id, created_at, updated_at, check_in_date, check_out_date, guests, total_amount, booking_status, payment_status, user_id, property_id, currency, properties!inner(id, host_id)")
            .eq("properties.host_id", hostId)
            .order("created_at", { ascending: false })
            .returns<Booking[]>();

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * ADMIN: Get all bookings with filters (Paginated)
     */
    async getAdminBookings(
        page: number = 0,
        status: string = "all",
        search: string = ""
    ): Promise<BookingWithDetails[]> {
        const { from, to } = getPaginationRange(page, PAGE_SIZE);

        let query = supabase
            .from("bookings")
            .select("id, created_at, updated_at, check_in_date, check_out_date, guests, total_amount, booking_status, payment_status, user_id, property_id, currency, properties(name, location), profiles:user_id(full_name, email)")
            .range(from, to)
            .order("created_at", { ascending: false });

        if (status !== "all") {
            // Use proper enum casting or allow string if safely handled
            query = query.eq("booking_status", status as Database['public']['Enums']['booking_status']);
        }

        if (search) {
            query = query.eq('id', search);
        }

        const { data, error } = await query.returns<BookingWithDetails[]>();

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Create a booking via RPC
     */
    async createBooking(bookingData: CreateBookingDTO): Promise<Booking> {
        const { data, error } = await supabase.rpc("create_booking", {
            property_id: bookingData.property_id,
            check_in_date: new Date(bookingData.check_in_date).toISOString(),
            check_out_date: new Date(bookingData.check_out_date).toISOString(),
            guests: bookingData.guests,
            payment_type: bookingData.payment_type
        });

        if (error) throw new Error(error.message);
        // The RPC returns a partial object { id, total_amount, status } but our app expects a Booking
        // In a real app we might refetch or casting result.
        // For strict correctness, we'll cast partial result to Booking OR refetch.
        // The RPC returns Json, so we must be careful.
        // Let's assume for now we return what we have, but the return type Promise<Booking> requires full object.
        // It's safer to just return ANY for now until we fix the RPC return type to be full row, 
        // OR changing the return type of this function.
        // Given 'weakness' is 'any', let's use type assertion with caution.
        // Ideally we fetch the created booking to get full details.

        // Let's refetch to be safe and clean.
        if (data && typeof data === 'object' && 'id' in data) {
            const bookingId = (data as { id: string }).id;
            const { data: fetchedBooking, error: fetchError } = await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .single();

            if (fetchError || !fetchedBooking) throw new Error("Booking created but failed to fetch details");
            return fetchedBooking;
        }

        throw new Error("Invalid response from create_booking RPC");
    }
};
