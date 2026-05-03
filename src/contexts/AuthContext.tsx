
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/auth.service";
import { AppRole } from "@/config/constants";
import { toast } from "sonner";

import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  requestHostRole: () => Promise<{ error: Error | null }>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Parallel fetch for speed
      const [profileData, rolesData] = await Promise.all([
        authService.getProfile(userId),
        authService.getUserRoles(userId)
      ]);

      if (profileData) {
        setProfile(profileData as Profile);
      }
      if (rolesData) {
        setRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setRoles([]);
          setLoading(false);
        }
      }
    );

    // Initial Check
    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time role updates (Optional, but good for UX)
  // We keep this but ensure it's strictly listening, not writing.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const refreshRoles = async () => {
    if (!user) return;
    try {
      const rolesData = await authService.getUserRoles(user.id);
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to refresh roles", error);
    }
  };

  const requestHostRole = async () => {
    if (!user) return { error: new Error("Not authenticated") };

    if (roles.includes("host")) { // Check strictly against string or enum constant?
      // "host" literal matches AppRole "host"
      return { error: null };
    }

    try {
      // SECURITY FIX: Replaced direct INSERT with RPC
      // Cast function name to 'any' to bypass missing type definition in generated types
      const { error } = await supabase.rpc('request_host_role' as any);
      if (error) throw error;

      // Optimistic update or wait for realtime?
      // Let's wait for realtime or refresh.
      await refreshRoles();
      return { error: null };
    } catch (e: unknown) {
      console.error("Error requesting host role:", e);
      return { error: e as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        signOut,
        hasRole,
        requestHostRole,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
