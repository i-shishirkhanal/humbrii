import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";

// User pages
import UserActivities from "./pages/user/UserActivities";
import UserBookings from "./pages/user/UserBookings";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";
import UserFavorites from "./pages/user/UserFavorites";

// Host pages
import HostDashboard from "./pages/host/HostDashboard";
import HostProperties from "./pages/host/HostProperties";
import HostBookings from "./pages/host/HostBookings";
import HostProfile from "./pages/host/HostProfile";
import HostSettings from "./pages/host/HostSettings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            
{/* User Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserActivities /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><UserBookings /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/dashboard/favorites" element={<ProtectedRoute><UserFavorites /></ProtectedRoute>} />
            
            {/* Host Dashboard Routes */}
            <Route path="/host" element={<ProtectedRoute requiredRole="host"><HostDashboard /></ProtectedRoute>} />
            <Route path="/host/properties" element={<ProtectedRoute requiredRole="host"><HostProperties /></ProtectedRoute>} />
            <Route path="/host/bookings" element={<ProtectedRoute requiredRole="host"><HostBookings /></ProtectedRoute>} />
            <Route path="/host/profile" element={<ProtectedRoute requiredRole="host"><HostProfile /></ProtectedRoute>} />
            <Route path="/host/settings" element={<ProtectedRoute requiredRole="host"><HostSettings /></ProtectedRoute>} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
