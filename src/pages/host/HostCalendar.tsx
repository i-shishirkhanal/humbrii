import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Calendar, Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityDay {
  date: string;
  is_available: boolean;
  price_override: number | null;
}

const HostCalendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bulkAvailable, setBulkAvailable] = useState(true);
  const [bulkPrice, setBulkPrice] = useState<string>("");

  // Fetch host properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
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

  // Set first property as default
  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Fetch availability for selected property and month
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ["propertyAvailability", selectedProperty, format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      if (!selectedProperty) return [];
      
      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("property_availability")
        .select("date, is_available, price_override")
        .eq("property_id", selectedProperty)
        .gte("date", monthStart)
        .lte("date", monthEnd);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProperty,
  });

  // Update availability mutation
  const updateAvailability = useMutation({
    mutationFn: async (updates: { dates: Date[]; is_available: boolean; price_override: number | null }) => {
      if (!selectedProperty) throw new Error("No property selected");

      const records = updates.dates.map(date => ({
        property_id: selectedProperty,
        date: format(date, "yyyy-MM-dd"),
        is_available: updates.is_available,
        price_override: updates.price_override,
      }));

      // Upsert each record
      for (const record of records) {
        const { error } = await supabase
          .from("property_availability")
          .upsert(record, { onConflict: "property_id,date" });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyAvailability"] });
      toast.success("Availability updated successfully");
      setSelectedDates([]);
      setBulkPrice("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update availability");
    },
  });

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getAvailabilityForDate = (date: Date): AvailabilityDay | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availability.find(a => a.date === dateStr);
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  const toggleDateSelection = (date: Date) => {
    if (isDateSelected(date)) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleApplyChanges = () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    const priceOverride = bulkPrice ? parseFloat(bulkPrice) : null;
    
    updateAvailability.mutate({
      dates: selectedDates,
      is_available: bulkAvailable,
      price_override: priceOverride,
    });
  };

  const selectedPropertyData = properties.find(p => p.id === selectedProperty);
  const days = getDaysInMonth();
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();

  return (
    <HostLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendar Management</h1>
            <p className="text-muted-foreground mt-1">Manage property availability and pricing</p>
          </div>

          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {propertiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                Add a property first to manage its availability.
              </p>
              <Button onClick={() => window.location.href = "/host/properties/new"}>
                Add Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {format(currentMonth, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click on dates to select them, then apply availability changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for days before the first of the month */}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {/* Day cells */}
                      {days.map((day) => {
                        const dayAvailability = getAvailabilityForDate(day);
                        const isAvailable = dayAvailability?.is_available !== false;
                        const hasCustomPrice = dayAvailability?.price_override !== null;
                        const isSelected = isDateSelected(day);
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => !isPast && toggleDateSelection(day)}
                            disabled={isPast}
                            className={cn(
                              "aspect-square p-1 rounded-lg border text-sm transition-all relative",
                              isPast && "opacity-40 cursor-not-allowed",
                              !isPast && "hover:border-primary cursor-pointer",
                              isSelected && "ring-2 ring-primary ring-offset-2",
                              isAvailable
                                ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                                : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                            )}
                          >
                            <div className="font-medium">{format(day, "d")}</div>
                            {hasCustomPrice && (
                              <div className="text-[10px] text-muted-foreground truncate">
                                NPR {dayAvailability.price_override?.toLocaleString()}
                              </div>
                            )}
                            {!isAvailable && (
                              <X className="w-3 h-3 absolute top-1 right-1 text-red-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800" />
                        <span className="text-muted-foreground">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800" />
                        <span className="text-muted-foreground">Blocked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded ring-2 ring-primary ring-offset-1" />
                        <span className="text-muted-foreground">Selected</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>
                  Apply changes to {selectedDates.length} selected date{selectedDates.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedDates.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="available">Available for booking</Label>
                        <Switch
                          id="available"
                          checked={bulkAvailable}
                          onCheckedChange={setBulkAvailable}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bulkAvailable 
                          ? "Guests can book these dates" 
                          : "These dates will be blocked"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price Override (NPR)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder={selectedPropertyData?.base_price?.toString() || "Base price"}
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use base price: NPR {selectedPropertyData?.base_price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleApplyChanges}
                        disabled={updateAvailability.isPending}
                      >
                        {updateAvailability.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Apply Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDates([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select dates on the calendar to modify availability</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Quick Actions</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedDates(days.filter(d => d >= new Date(new Date().setHours(0, 0, 0, 0))))}
                  >
                    Select All Future Dates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const weekends = days.filter(d => {
                        const dayOfWeek = d.getDay();
                        return (dayOfWeek === 0 || dayOfWeek === 6) && d >= new Date(new Date().setHours(0, 0, 0, 0));
                      });
                      setSelectedDates(weekends);
                    }}
                  >
                    Select Weekends Only
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostCalendar;
