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
import AddProperty from "./pages/host/AddProperty";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHosts from "./pages/admin/AdminHosts";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminRatings from "./pages/admin/AdminRatings";

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
            <Route path="/host/properties/new" element={<ProtectedRoute requiredRole="host"><AddProperty /></ProtectedRoute>} />
            <Route path="/host/bookings" element={<ProtectedRoute requiredRole="host"><HostBookings /></ProtectedRoute>} />
            <Route path="/host/profile" element={<ProtectedRoute requiredRole="host"><HostProfile /></ProtectedRoute>} />
            <Route path="/host/settings" element={<ProtectedRoute requiredRole="host"><HostSettings /></ProtectedRoute>} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/hosts" element={<ProtectedRoute requiredRole="admin"><AdminHosts /></ProtectedRoute>} />
            <Route path="/admin/properties" element={<ProtectedRoute requiredRole="admin"><AdminProperties /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="admin"><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/ratings" element={<ProtectedRoute requiredRole="admin"><AdminRatings /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute requiredRole="admin"><AdminDisputes /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogs /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
