
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, X, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { propertiesService } from "@/services/properties.service";
import { uploadsService } from "@/services/uploads.service";
import { PROPERTY_CATEGORIES, PropertyCategory, CATEGORY_INFO } from "@/config/constants";
import LocationPicker from "@/components/map/LocationPicker";

// Temporary constant for slots, ideally from constants
const hourlySlots = [
  { value: "3", label: "3 Hours" },
  { value: "6", label: "6 Hours" },
  { value: "9", label: "9 Hours" },
];

const AddProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New State: Store actual File objects for pending upload
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  // Store existing image URLs (for edit mode)
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    // Coordinates
    latitude: null as number | null,
    longitude: null as number | null,

    category: "" as PropertyCategory | "",
    base_price: "",
    amenities: [] as string[],
    hourly_available_slots: ["3", "6", "9"],
    // New Fields
    max_guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    check_in_time: "14:00",
    check_out_time: "11:00",
    house_rules: [] as string[],
    host_name: "",
  });

  const [newRule, setNewRule] = useState("");

  const addCustomRule = () => {
    const ruleToAdd = newRule.trim();
    if (!ruleToAdd) return;

    if (formData.house_rules.includes(ruleToAdd)) {
      toast.error("Rule already exists");
      return;
    }
    setFormData(prev => ({
      ...prev,
      house_rules: [...prev.house_rules, ruleToAdd]
    }));
    setNewRule("");
    toast.success("Rule added");
  };

  // Fetch logic
  useEffect(() => {
    if (id && user) {
      loadProperty(id);
    }
  }, [id, user]);

  const loadProperty = async (propertyId: string) => {
    try {
      setIsLoading(true);
      const data = await propertiesService.getProperty(propertyId);
      if (data) {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          host_name: data.host_name || "",
          location: data.location || "",
          address: data.address || "",
          latitude: data.latitude,
          longitude: data.longitude,
          category: data.category as PropertyCategory,
          base_price: data.base_price?.toString() || "",
          amenities: data.amenities || [],
          hourly_available_slots: ["3", "6", "9"],
          max_guests: data.max_guests || 1,
          bedrooms: data.bedrooms || 1,
          beds: data.beds || 1,
          bathrooms: data.bathrooms || 1,
          check_in_time: data.check_in_time || "14:00",
          check_out_time: data.check_out_time || "11:00",
          house_rules: data.house_rules || [],
        });
        setExistingImages(data.images || []);
        setStep(2);
      }
    } catch (err) {
      toast.error("Failed to load property");
      navigate("/host/properties");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - (existingImages.length + pendingImages.length);
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newFiles = Array.from(files).slice(0, remainingSlots);
    setPendingImages(prev => [...prev, ...newFiles]);
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category) return;

    if (!formData.name || !formData.location || !formData.base_price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.max_guests < 1) {
      toast.error("Max guests must be at least 1");
      return;
    }

    if (formData.beds < 0) { // Should ideally be positive, but 0 is technically possible for some listings? Keeping strict logic.
      toast.error("Beds cannot be negative");
      return;
    }

    if (formData.bedrooms < 0 || formData.bathrooms < 0) {
      toast.error("Bedrooms and bathrooms cannot be negative");
      return;
    }

    // Validation: Guests vs Beds
    // Ideally, max guests should be at least equal to beds (assuming 1 person/bed min)
    // Exception: Single bed might sleep 2, so guests > beds is common.
    // BUT beds > guests is invalid (e.g. 5 beds for 2 guests is wasteful/wrongly configured usually, though rarely possible)
    // The user constraint was explicit: "guests >= beds" implied or "beds > 0".

    // Constraint 1: Beds must be > 0 (unless it's empty land? but for Humbri it's stays)
    // Let's assume beds >= 0 is already checked above.
    // Let's warn if beds = 0 and category is full stay/hourly
    if (formData.beds === 0 && ["full_stay", "hourly", "daycation"].includes(formData.category)) {
      toast.error("Property must have at least 1 bed");
      return;
    }

    // Constraint 2: Max Guests cannot be less than Beds (Strict logic requested)
    // e.g. 5 beds but Max Guests 3 -> Valid? Yes. 3 people can sleep in 5 beds.
    // e.g. 1 bed but Max Guests 0 -> Invalid (checked above).
    // e.g. 1 bed but Max Guests 5 -> Valid? Yes (mattresses etc).

    // User specifically asked: "guests >= beds" constraint.
    // Wait, usually it's "capacity >= beds".
    // If I have 3 beds, can I set max guests = 2? Yes.
    // If I have 2 beds, can I set max guests = 1? Yes.
    // It seems the user meant "Ensure reasonable ratio" or "Prevent illogical low capacity for high bed count"?
    // "guests >= beds": If 5 beds, guests must be >= 5? 
    // That implies every bed sleeps at least 1 person.
    // If I have a bunk bed (2 beds) and a queen (1 bed) = 3 beds.
    // Can I say max guests = 2? Maybe I only want 2 people.
    // But usually listing capacity = bed capacity.

    // Let's implement the user request: "guests >= beds"
    if (formData.max_guests < formData.beds) {
      toast.error("Max guests should be greater than or equal to number of beds");
      return;
    }

    if (formData.max_guests < formData.beds) {
      // Just a warning or strict? Let's be strict as per user request "Validation or Constraints"
      // Actually guests often > beds (couples). Guests < beds is weird.
      // User said "Preventing beds > guests". So if beds = 5 and guests = 2, that's weird.
      if (formData.beds > formData.max_guests) {
        toast.error("Number of beds cannot exceed max guests (assuming 1 guest per bed min)");
        return;
      }
    }

    if (!formData.check_in_time || !formData.check_out_time) {
      toast.error("Check-in and Check-out times are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare Base Payload
      const payload: any = {
        host_id: user.id,
        name: formData.name,
        description: formData.description,
        host_name: formData.host_name || null,
        location: formData.location,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        category: formData.category,
        base_price: parseFloat(formData.base_price),
        amenities: formData.amenities,
        images: existingImages, // Start with existing
        // New Fields
        max_guests: formData.max_guests,
        bedrooms: formData.bedrooms,
        beds: formData.beds,
        bathrooms: formData.bathrooms,
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time,
        house_rules: formData.house_rules,
      };

      let propertyId = id;
      let finalImages = [...existingImages];

      // 2. Create or Update Property (Entity First)
      if (id) {
        await propertiesService.updateProperty(id, payload);
      } else {
        // New Property
        payload.status = 'draft'; // Start as draft until images uploaded
        const newProp = await propertiesService.createProperty(payload);
        propertyId = newProp.id;
      }

      if (!propertyId) throw new Error("Failed to get property ID");

      // 3. Upload Pending Images
      if (pendingImages.length > 0) {
        const uploadedUrls = await Promise.all(
          pendingImages.map(file => uploadsService.uploadPropertyImage(propertyId!, file))
        );
        finalImages = [...finalImages, ...uploadedUrls];

        // 4. Update Property with Final Image List and set Active
        await propertiesService.updateProperty(propertyId, {
          images: finalImages,
          status: 'active' // Now we can activate
        });
      }

      toast.success(id ? "Property updated!" : "Property created!");
      navigate("/host/properties");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save property");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header and Back Button */}
        <div className="flex items-center gap-4">
          <Link to="/host/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {id ? "Edit Property" : "Add Property"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {step === 1 && !id ? "Select a category" : "Fill details"}
            </p>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && !id ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(CATEGORY_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setFormData({ ...formData, category: key as PropertyCategory });
                    setStep(2);
                  }}
                  className="bg-card rounded-xl border border-border p-6 text-left hover:border-primary hover:shadow-medium transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">{info.label}</h3>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Category Header */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {formData.category && CATEGORY_INFO[formData.category] && (
                    <>
                      <div className={`w-10 h-10 rounded-lg ${CATEGORY_INFO[formData.category].color} flex items-center justify-center`}>
                        <span className="font-bold">{formData.category[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{CATEGORY_INFO[formData.category].label}</p>
                      </div>
                    </>
                  )}
                </div>
                {!id && <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Change</Button>}
              </div>
            </div>

            {/* Basic Fields */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Basic Info</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Host Display Name (Optional)</Label>
                  <Input
                    value={formData.host_name}
                    onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                    placeholder="e.g. The Humbri Team (Leave empty to use your profile name)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This name will be displayed to guests instead of your profile name.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Input
                    id="type"
                    placeholder="e.g. Apartment, House, Villa"
                    // Note: We might want a select here later, for now text is flexible
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Layout */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Capacity & Layout</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Guests</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, max_guests: Math.max(1, p.max_guests - 1) }))}>-</Button>
                    <span className="w-8 text-center">{formData.max_guests}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, max_guests: p.max_guests + 1 }))}>+</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, bedrooms: Math.max(0, p.bedrooms - 1) }))}>-</Button>
                    <span className="w-8 text-center">{formData.bedrooms}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, bedrooms: p.bedrooms + 1 }))}>+</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Beds</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, beds: Math.max(0, p.beds - 1) }))}>-</Button>
                    <span className="w-8 text-center">{formData.beds}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, beds: p.beds + 1 }))}>+</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, bathrooms: Math.max(0, p.bathrooms - 1) }))}>-</Button>
                    <span className="w-8 text-center">{formData.bathrooms}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, bathrooms: p.bathrooms + 1 }))}>+</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">House Rules</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Time</Label>
                  <Input
                    type="time"
                    value={formData.check_in_time}
                    onChange={e => setFormData({ ...formData, check_in_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Time</Label>
                  <Input
                    type="time"
                    value={formData.check_out_time}
                    onChange={e => setFormData({ ...formData, check_out_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Allowed / Not Allowed</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["No smoking", "No parties", "Pets allowed", "Events allowed"].map(rule => (
                    <div key={rule} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rule-${rule}`}
                        checked={formData.house_rules.includes(rule)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(p => ({ ...p, house_rules: [...p.house_rules, rule] }));
                          } else {
                            setFormData(p => ({ ...p, house_rules: p.house_rules.filter(r => r !== rule) }));
                          }
                        }}
                      />
                      <label htmlFor={`rule-${rule}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {rule}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mt-4">
                  <Label>Additional Rules</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomRule();
                        }
                      }}
                      placeholder="Type rule and press Enter"
                    />
                    <Button type="button" onClick={addCustomRule} variant="secondary">Add</Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {formData.house_rules
                      .filter(r => !["No smoking", "No parties", "Pets allowed", "Events allowed"].includes(r))
                      .map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                          <span className="text-sm">{rule}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setFormData(p => ({ ...p, house_rules: p.house_rules.filter(r => r !== rule) }))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Location */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Location</h2>

              {/* Interactive Map Picker */}
              <div className="mb-4">
                <LocationPicker
                  initialLatitude={formData.latitude}
                  initialLongitude={formData.longitude}
                  onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loc">City / Area</Label>
                <Input
                  id="loc"
                  value={formData.location}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, location: value }));

                    // Helper to parse coordinates from a string
                    const parseCoords = (str: string) => {
                      const latLngRegex1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
                      const latLngRegex2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
                      const latLngRegex3 = /search\/(-?\d+\.\d+),(-?\d+\.\d+)/;
                      const latLngRegex4 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;

                      return str.match(latLngRegex1) ||
                        str.match(latLngRegex2) ||
                        str.match(latLngRegex3) ||
                        str.match(latLngRegex4);
                    };

                    // 1. Check for Standard Google Maps Links
                    const match = parseCoords(value);

                    if (match) {
                      const lat = parseFloat(match[1]);
                      const lng = parseFloat(match[2]);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        setFormData(prev => ({
                          ...prev,
                          location: value,
                          latitude: lat,
                          longitude: lng
                        }));
                        toast.success(`Coordinates found: ${lat}, ${lng}`);
                        return;
                      }
                    }

                    // 2. Check for Shortened Links (maps.app.goo.gl)
                    if (value.includes("maps.app.goo.gl")) {
                      toast.info("Resolving short link...", { duration: 2000 });

                      try {
                        const expandedUrl = await propertiesService.expandGoogleMapsLink(value);
                        if (expandedUrl) {
                          const expandedMatch = parseCoords(expandedUrl);
                          if (expandedMatch) {
                            const lat = parseFloat(expandedMatch[1]);
                            const lng = parseFloat(expandedMatch[2]);

                            if (!isNaN(lat) && !isNaN(lng)) {
                              setFormData(prev => ({
                                ...prev,
                                location: value, // Keep original link
                                latitude: lat,
                                longitude: lng
                              }));
                              toast.success(`Link resolved: ${lat}, ${lng}`);
                            } else {
                              toast.error("Could not find coordinates in resolved link");
                            }
                          } else {
                            toast.error("Could not parse coordinates from resolved link");
                          }
                        } else {
                          toast.error("Failed to resolve short link");
                        }
                      } catch (err) {
                        console.error(err);
                        // Silent fail or toast error
                      }
                    }
                  }}
                  placeholder="City name or paste Google Maps Link"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr">Address</Label>
                <Input
                  id="addr"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Images - New entity-first flow */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Images</h2>

              {/* Existing Images */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt="Existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {pendingImages.map((file, i) => (
                  <div key={`pending-${i}`} className="relative aspect-video rounded-lg overflow-hidden bg-muted border-2 border-primary/50">
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center bg-background/50">
                      {file.name}
                    </div>
                    <button type="button" onClick={() => removePendingImage(i)} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Select Images
                </Button>
              </div>
            </div>

            {/* Host Preview */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Host Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Host" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
                      {(user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{user?.user_metadata?.full_name || "You"}</p>
                  <p className="text-sm text-muted-foreground">This property will be hosted by you.</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Pricing</h2>
              <div className="space-y-2">
                <Label htmlFor="price">Base Price ({
                  formData.category === 'hourly' || formData.category === 'vibe_chill' ? 'per hour'
                    : formData.category === 'daycation' ? 'per day'
                      : 'per night'
                })</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.base_price}
                  onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => navigate("/host/properties")}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </>
                ) : (
                  id ? "Update Property" : "Create Property"
                )}
              </Button>
            </div>

          </form>
        )}
      </div>
    </HostLayout>
  );
};

export default AddProperty;
