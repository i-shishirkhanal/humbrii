
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load feature pages
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const MapView = lazy(() => import("./pages/MapView"));
const HostInfo = lazy(() => import("./pages/host/HostInfo"));
const BecomeHost = lazy(() => import("./pages/host/BecomeHost"));
const PaymentSuccess = lazy(() => import("./pages/payment/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/payment/PaymentFailure"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));

// User Dashboard - Lazy
const UserActivities = lazy(() => import("./pages/user/UserActivities"));
const UserBookings = lazy(() => import("./pages/user/UserBookings"));
const UserProfile = lazy(() => import("./pages/user/UserProfile"));
const UserSettings = lazy(() => import("./pages/user/UserSettings"));
const UserFavorites = lazy(() => import("./pages/user/UserFavorites"));

// Host Dashboard - Lazy
const HostDashboard = lazy(() => import("./pages/host/HostDashboard"));
const HostProperties = lazy(() => import("./pages/host/HostProperties"));
const AddProperty = lazy(() => import("./pages/host/AddProperty"));
const HostBookings = lazy(() => import("./pages/host/HostBookings"));
const HostCalendar = lazy(() => import("./pages/host/HostCalendar"));
const HostEarnings = lazy(() => import("./pages/host/HostEarnings"));
const HostProfile = lazy(() => import("./pages/host/HostProfile"));
const HostSettings = lazy(() => import("./pages/host/HostSettings"));

// Admin Dashboard - Lazy
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminHosts = lazy(() => import("./pages/admin/AdminHosts"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminRatings = lazy(() => import("./pages/admin/AdminRatings"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/host-info" element={<HostInfo />} />
                <Route path="/become-host" element={<ProtectedRoute><BecomeHost /></ProtectedRoute>} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />

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
                <Route path="/host/properties/edit/:id" element={<ProtectedRoute requiredRole="host"><AddProperty /></ProtectedRoute>} />
                <Route path="/host/bookings" element={<ProtectedRoute requiredRole="host"><HostBookings /></ProtectedRoute>} />
                <Route path="/host/calendar" element={<ProtectedRoute requiredRole="host"><HostCalendar /></ProtectedRoute>} />
                <Route path="/host/earnings" element={<ProtectedRoute requiredRole="host"><HostEarnings /></ProtectedRoute>} />
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
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
