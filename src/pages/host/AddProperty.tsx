import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Loader2, 
  Clock, 
  Sun, 
  Moon, 
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  X,
  Upload
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type PropertyCategory = "hourly" | "daycation" | "full_stay" | "vibe_chill";

const categoryInfo = {
  hourly: {
    icon: Clock,
    title: "Hourly",
    description: "Available 7 AM - 6 PM, minimum 3 hours booking",
    color: "text-orange-500 bg-orange-500/10",
  },
  daycation: {
    icon: Sun,
    title: "Daycation",
    description: "Day-use properties for relaxation and leisure",
    color: "text-yellow-500 bg-yellow-500/10",
  },
  full_stay: {
    icon: Moon,
    title: "Full Stay",
    description: "Traditional overnight accommodations",
    color: "text-blue-500 bg-blue-500/10",
  },
  vibe_chill: {
    icon: Sparkles,
    title: "Vibe & Chill",
    description: "Unique spaces for hangouts and experiences",
    color: "text-purple-500 bg-purple-500/10",
  },
};

const hourlySlots = [
  { value: "3", label: "3 Hours" },
  { value: "6", label: "6 Hours" },
  { value: "9", label: "9 Hours" },
];

const AddProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    category: "" as PropertyCategory | "",
    base_price: "",
    images: [] as string[],
    amenities: [] as string[],
    // Hourly specific
    hourly_available_slots: ["3", "6", "9"],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remainingSlots = 5 - formData.images.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleCategorySelect = (category: PropertyCategory) => {
    setFormData({ ...formData, category });
    setStep(2);
  };

  const handleSlotToggle = (slot: string) => {
    const slots = formData.hourly_available_slots.includes(slot)
      ? formData.hourly_available_slots.filter(s => s !== slot)
      : [...formData.hourly_available_slots, slot];
    setFormData({ ...formData, hourly_available_slots: slots });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category) return;

    if (!formData.name || !formData.location || !formData.base_price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("properties")
        .insert({
          host_id: user.id,
          name: formData.name,
          description: formData.description,
          location: formData.location,
          address: formData.address,
          category: formData.category,
          base_price: parseFloat(formData.base_price),
          images: formData.images,
          amenities: formData.amenities,
          hourly_available_slots: formData.category === "hourly" ? formData.hourly_available_slots : ["3", "6", "9"],
          hourly_minimum_hours: 3,
          hourly_start_time: "07:00",
          hourly_end_time: "18:00",
          status: "draft",
        });

      if (error) throw error;
      
      toast.success("Property created successfully!");
      navigate("/host/properties");
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(error.message || "Failed to create property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HostLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/host/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add Property</h1>
            <p className="text-muted-foreground mt-1">
              {step === 1 ? "Select a category for your property" : "Fill in property details"}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(categoryInfo) as [PropertyCategory, typeof categoryInfo.hourly][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => handleCategorySelect(key)}
                className="bg-card rounded-xl border border-border p-6 text-left hover:border-primary hover:shadow-medium transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{info.title}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Category */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {formData.category && (
                    <>
                      <div className={`w-10 h-10 rounded-lg ${categoryInfo[formData.category].color} flex items-center justify-center`}>
                        {(() => {
                          const Icon = categoryInfo[formData.category].icon;
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{categoryInfo[formData.category].title}</p>
                        <p className="text-xs text-muted-foreground">{categoryInfo[formData.category].description}</p>
                      </div>
                    </>
                  )}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Change
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Basic Information</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Himalayan View Resort"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Location</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">City / Area *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Pokhara, Nepal"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Property Images</h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData.images.length}/5 images
                </span>
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {formData.images.length < 5 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Click to upload images (max 5)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Pricing</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_price">
                  Base Price (NPR) * 
                  {formData.category === "hourly" && <span className="text-muted-foreground ml-1">per hour</span>}
                  {formData.category === "full_stay" && <span className="text-muted-foreground ml-1">per night</span>}
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                />
              </div>

              {/* Hourly specific settings */}
              {formData.category === "hourly" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <Label className="mb-3 block">Available Time Slots</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hourly properties are available from 7 AM to 6 PM
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {hourlySlots.map((slot) => (
                        <label
                          key={slot.value}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                            formData.hourly_available_slots.includes(slot.value)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <Checkbox
                            checked={formData.hourly_available_slots.includes(slot.value)}
                            onCheckedChange={() => handleSlotToggle(slot.value)}
                          />
                          <span className="text-sm font-medium">{slot.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/host/properties")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Property"
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
