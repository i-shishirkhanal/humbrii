import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import HostLayout from "@/components/layout/HostLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type DateRange = "7d" | "30d" | "90d" | "12m";

const HostEarnings = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const getDaysFromRange = (range: DateRange) => {
    switch (range) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      case "12m": return 365;
      default: return 30;
    }
  };

  // Fetch host's properties
  const { data: properties = [] } = useQuery({
    queryKey: ["hostProperties", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, base_price")
        .eq("host_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch bookings for the host's properties
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["hostBookings", user?.id, dateRange],
    queryFn: async () => {
      if (!user?.id || properties.length === 0) return [];
      
      const propertyIds = properties.map(p => p.id);
      const startDate = format(subDays(new Date(), getDaysFromRange(dateRange)), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .in("property_id", propertyIds)
        .gte("created_at", startDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && properties.length > 0,
  });

  // Fetch payout methods
  const { data: payoutMethods = [] } = useQuery({
    queryKey: ["hostPayoutMethods", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("host_payout_methods")
        .select("*")
        .eq("host_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const stats = {
    totalRevenue: bookings
      .filter(b => b.payment_status === "paid" || b.payment_status === "partial")
      .reduce((sum, b) => sum + (b.paid_amount || 0), 0),
    pendingPayouts: bookings
      .filter(b => b.booking_status === "confirmed" && b.payment_status !== "paid")
      .reduce((sum, b) => sum + ((b.total_amount || 0) - (b.paid_amount || 0)), 0),
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.booking_status === "confirmed").length,
    pendingBookings: bookings.filter(b => b.booking_status === "pending").length,
    cancelledBookings: bookings.filter(b => b.booking_status === "cancelled").length,
    completedBookings: bookings.filter(b => b.booking_status === "completed").length,
    averageBookingValue: bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.length 
      : 0,
  };

  // Calculate platform fee (10%)
  const platformFee = stats.totalRevenue * 0.1;
  const netEarnings = stats.totalRevenue - platformFee;

  // Generate chart data
  const generateRevenueChartData = () => {
    const days = getDaysFromRange(dateRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayBookings = bookings.filter(b => 
        format(new Date(b.created_at), "yyyy-MM-dd") === dateStr
      );
      
      data.push({
        date: format(date, dateRange === "12m" ? "MMM" : "MMM d"),
        revenue: dayBookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0),
        bookings: dayBookings.length,
      });
    }
    
    // For 12m view, group by month
    if (dateRange === "12m") {
      const monthlyData: Record<string, { revenue: number; bookings: number }> = {};
      data.forEach(d => {
        if (!monthlyData[d.date]) {
          monthlyData[d.date] = { revenue: 0, bookings: 0 };
        }
        monthlyData[d.date].revenue += d.revenue;
        monthlyData[d.date].bookings += d.bookings;
      });
      return Object.entries(monthlyData).map(([date, values]) => ({
        date,
        ...values,
      }));
    }
    
    return data;
  };

  const revenueChartData = generateRevenueChartData();

  // Booking status distribution
  const statusData = [
    { name: "Confirmed", value: stats.confirmedBookings, color: "#22c55e" },
    { name: "Pending", value: stats.pendingBookings, color: "#f59e0b" },
    { name: "Completed", value: stats.completedBookings, color: "#3b82f6" },
    { name: "Cancelled", value: stats.cancelledBookings, color: "#ef4444" },
  ].filter(d => d.value > 0);

  // Property performance
  const propertyPerformance = properties.map(property => {
    const propertyBookings = bookings.filter(b => b.property_id === property.id);
    return {
      name: property.name,
      bookings: propertyBookings.length,
      revenue: propertyBookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0),
    };
  }).sort((a, b) => b.revenue - a.revenue);

  if (bookingsLoading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Earnings Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your revenue, payouts, and performance</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">NPR {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
                  <p className="text-2xl font-bold">NPR {netEarnings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                After 10% platform fee
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {stats.confirmedBookings} confirmed
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.pendingBookings} pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Booking Value</p>
                  <p className="text-2xl font-bold">NPR {Math.round(stats.averageBookingValue).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Per booking average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Daily revenue for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-sm text-primary">
                                Revenue: NPR {payload[0].value?.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
              <CardDescription>Distribution of booking statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                <p className="text-sm font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.value} bookings
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No booking data
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusData.map((status) => (
                  <div key={status.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {status.name} ({status.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Performance & Payout Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Property Performance
              </CardTitle>
              <CardDescription>Revenue by property</CardDescription>
            </CardHeader>
            <CardContent>
              {propertyPerformance.length > 0 ? (
                <div className="space-y-4">
                  {propertyPerformance.map((property, index) => (
                    <div key={property.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {property.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            NPR {property.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {property.bookings} booking{property.bookings !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${stats.totalRevenue > 0 
                              ? (property.revenue / stats.totalRevenue) * 100 
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No property data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payout Methods
              </CardTitle>
              <CardDescription>Your configured payout methods</CardDescription>
            </CardHeader>
            <CardContent>
              {payoutMethods.length > 0 ? (
                <div className="space-y-3">
                  {payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        method.is_primary 
                          ? "border-primary bg-primary/5" 
                          : "border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {method.method_type === "esewa" ? (
                            <div className="w-10 h-10 rounded-lg bg-[#60BB46]/10 flex items-center justify-center">
                              <span className="text-[#60BB46] font-bold text-sm">eS</span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium capitalize">{method.method_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.method_type === "esewa" 
                                ? method.esewa_phone 
                                : `****${method.bank_account_number?.slice(-4)}`}
                            </p>
                          </div>
                        </div>
                        {method.is_primary && (
                          <Badge variant="secondary">Primary</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">No payout methods configured</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = "/host/settings"}>
                    Add Payout Method
                  </Button>
                </div>
              )}

              {/* Pending Payout Summary */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pending Payout</span>
                  <span className="text-lg font-bold">
                    NPR {stats.pendingPayouts.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Funds will be transferred after guest check-out
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest booking transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => {
                  const property = properties.find(p => p.id === booking.property_id);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          booking.booking_status === "confirmed" && "bg-green-100 dark:bg-green-900/30",
                          booking.booking_status === "pending" && "bg-yellow-100 dark:bg-yellow-900/30",
                          booking.booking_status === "completed" && "bg-blue-100 dark:bg-blue-900/30",
                          booking.booking_status === "cancelled" && "bg-red-100 dark:bg-red-900/30"
                        )}>
                          {booking.booking_status === "confirmed" && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {booking.booking_status === "pending" && <Clock className="w-5 h-5 text-yellow-600" />}
                          {booking.booking_status === "completed" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          {booking.booking_status === "cancelled" && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {property?.name || "Unknown Property"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.check_in_date), "MMM d")} - {format(new Date(booking.check_out_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          NPR {booking.total_amount?.toLocaleString()}
                        </p>
                        <Badge 
                          variant={booking.payment_status === "paid" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HostLayout>
  );
};

export default HostEarnings;
