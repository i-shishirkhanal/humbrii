
import { Clock, Sun, Moon, Sparkles } from "lucide-react";

export const APP_NAME = "Humbri";

// Database Enums (Must match Supabase types)
export const PROPERTY_CATEGORIES = {
    HOURLY: "hourly",
    DAYCATION: "daycation",
    FULL_STAY: "full_stay",
    VIBE_CHILL: "vibe_chill",
} as const;

export type PropertyCategory = typeof PROPERTY_CATEGORIES[keyof typeof PROPERTY_CATEGORIES];

export const BOOKING_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
    PENDING: "pending",
    PARTIAL: "partial",
    PAID: "paid",
    REFUNDED: "refunded",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const USER_ROLES = {
    ADMIN: "admin",
    HOST: "host",
    USER: "user",
} as const;

export type AppRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// UI Helpers
export const CATEGORY_INFO = {
    [PROPERTY_CATEGORIES.HOURLY]: {
        label: "Hourly",
        description: "Available 7 AM - 6 PM, minimum 3 hours booking",
        color: "text-orange-500 bg-orange-500/10",
        icon: Clock,
    },
    [PROPERTY_CATEGORIES.DAYCATION]: {
        label: "Daycation",
        description: "Day-use properties for relaxation and leisure",
        color: "text-yellow-500 bg-yellow-500/10",
        icon: Sun,
    },
    [PROPERTY_CATEGORIES.FULL_STAY]: {
        label: "Full Stay",
        description: "Traditional overnight accommodations",
        color: "text-blue-500 bg-blue-500/10",
        icon: Moon,
    },
    [PROPERTY_CATEGORIES.VIBE_CHILL]: {
        label: "Vibe & Chill",
        description: "Unique spaces for hangouts and experiences",
        color: "text-purple-500 bg-purple-500/10",
        icon: Sparkles,
    },
};

export const PAGE_SIZE = 10;
