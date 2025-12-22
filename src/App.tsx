import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import UserDashboard from "./pages/dashboard/UserDashboard";
import HostDashboard from "./pages/dashboard/HostDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/properties" element={<Properties />} />
          
          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/bookings" element={<UserDashboard />} />
          <Route path="/dashboard/profile" element={<UserDashboard />} />
          <Route path="/dashboard/settings" element={<UserDashboard />} />
          
          {/* Host Dashboard Routes */}
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/host/properties" element={<HostDashboard />} />
          <Route path="/host/rooms" element={<HostDashboard />} />
          <Route path="/host/pricing" element={<HostDashboard />} />
          <Route path="/host/bookings" element={<HostDashboard />} />
          <Route path="/host/profile" element={<HostDashboard />} />
          <Route path="/host/settings" element={<HostDashboard />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/hosts" element={<AdminDashboard />} />
          <Route path="/admin/properties" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminDashboard />} />
          <Route path="/admin/payments" element={<AdminDashboard />} />
          <Route path="/admin/disputes" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminDashboard />} />
          <Route path="/admin/logs" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
