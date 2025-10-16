import {
  X,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Users,
  Car,
  Wifi,
  ParkingCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { AddressInput } from "@/components/AddressInput";
import { CitySelect } from "@/components/CitySelect";
import { CountySelect } from "@/components/CountySelect";
import { FacilitySelect } from "@/components/FacilitySelect";
import { LocationTypeSelect } from "@/components/features/locations/LocationTypeSelect";
import { ImageUpload } from "@/components/ImageUpload";
import { SingleImageUpload } from "@/components/SingleImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "@/contexts/FormStateContext";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "@/lib/geocoding";

interface Facility {
  id: string;
  name: string;
  slug: string;
}

interface LocationFormData {
  title: string;
  description: string;
  cover_url: string | null;
  gallery: string[];
  type_id: string;
  city_id: string;
  county_id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  capacity: number;
  size_square_meters: number;
  contact_email: string;
  contact_phones: string[];
  website: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  pricing: {
    enabled: boolean;
    billing: "HOUR" | "DAY";
    price_ron: number;
  };
}

interface LocationFormProps {
  editingLocation?: any;
  onClose?: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({ editingLocation, onClose }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const { formStates, updateFormState, clearFormState } = useFormState();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data with persisted state or default values
  const getInitialFormData = (): LocationFormData => {
    if (formStates.locationForm && !editingLocation) {
      return formStates.locationForm;
    }

    return {
      title: "",
      description: "",
      cover_url: null,
      gallery: [],
      type_id: "",
      city_id: "",
      county_id: "",
      address: "",
      lat: null,
      lng: null,
      capacity: 0,
      size_square_meters: 0,
      contact_email: "",
      contact_phones: [""],
      website: "",
      social_links: {},
      pricing: {
        enabled: false,
        billing: "HOUR",
        price_ron: 0,
      },
    };
  };

  const [formData, setFormData] = useState<LocationFormData>(getInitialFormData());

  const [availableFacilities, setAvailableFacilities] = useState<Facility[]>([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);

  // Load facilities and location types from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load facilities
        const { data: facilitiesData, error: facilitiesError } = await supabase
          .from("facilities")
          .select(
            `
            id, 
            name, 
            slug
          `
          )
          .order("sort_order");

        if (facilitiesError) {
          console.error("Error loading facilities:", facilitiesError);
        } else {
          setAvailableFacilities(facilitiesData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Handle address and city changes without auto-geocoding
  const handleAddressChange = (field: "address" | "city_id", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (editingLocation) {
      setIsEditing(true);
      setFormData({
        title: editingLocation.title || "",
        description: editingLocation.description || "",
        cover_url: editingLocation.cover_url,
        gallery: editingLocation.gallery || [],
        type_id: editingLocation.type_id || "",
        city_id: editingLocation.city_id || "",
        county_id: editingLocation.county_id || "",
        address: editingLocation.address || "",
        lat: editingLocation.lat,
        lng: editingLocation.lng,
        capacity: editingLocation.capacity || 0,
        size_square_meters: editingLocation.size_square_meters || 0,
        contact_email: editingLocation.contact_email || "",
        contact_phones: editingLocation.contact_phones || [""],
        website: editingLocation.website || "",
        social_links: editingLocation.social_links || {},
        pricing: editingLocation.pricing || {
          enabled: false,
          billing: "HOUR",
          price_ron: 0,
        },
      });

      // Set selected facility IDs for editing
      if (editingLocation.facilities && editingLocation.facilities.length > 0) {
        setSelectedFacilityIds(editingLocation.facilities.map((f: { id: string }) => f.id));
      }
    }
  }, [editingLocation]);

  // Persist form data changes (but not when editing existing items)
  useEffect(() => {
    if (!editingLocation) {
      updateFormState("locationForm", formData);
    }
  }, [formData, editingLocation, updateFormState]);

  const handleInputChange = (field: keyof LocationFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.contact_phones];
    newPhones[index] = value;
    setFormData((prev) => ({
      ...prev,
      contact_phones: newPhones,
    }));
  };

  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      contact_phones: [...prev.contact_phones, ""],
    }));
  };

  const removePhone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contact_phones: prev.contact_phones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a crea o locație.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.type_id || !formData.city_id) {
      toast({
        title: "Eroare",
        description: "Titlul, tipul și orașul sunt obligatorii.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate slug from title
      const slug =
        formData.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-") +
        "-" +
        Date.now();

      const locationData = {
        title: formData.title.trim(),
        slug: slug,
        description: formData.description.trim(),
        cover_url: formData.cover_url || null,
        gallery: formData.gallery as any, // Cast to Json type for database
        type_id: formData.type_id.trim(),
        city_id: formData.city_id.trim(),
        address: formData.address.trim() || null,
        lat: formData.lat || null,
        lng: formData.lng || null,
        capacity: formData.capacity > 0 ? formData.capacity : null,
        size_square_meters: formData.size_square_meters || null,
        contact_email: formData.contact_email.trim() || null,
        contact_phones:
          formData.contact_phones.filter((phone) => phone.trim()).length > 0
            ? (formData.contact_phones.filter((phone) => phone.trim()) as any)
            : ([] as any), // Cast to Json type for database
        website: formData.website.trim() || null,
        social_links:
          Object.keys(formData.social_links).length > 0
            ? (formData.social_links as any)
            : ({} as any), // Cast to Json type for database
        host_id: user.id,
        status: "PENDING", // Needs admin approval
        // Note: county_id is not saved as it's not in the database schema
      };

      console.log("Saving location data:", locationData);
      console.log("User ID from auth:", user?.id);
      console.log("User object:", user);

      if (isEditing && editingLocation) {
        // Update existing location
        const { error } = await supabase
          .from("locations")
          .update(locationData)
          .eq("id", editingLocation.id)
          .eq("host_id", user.id);

        if (error) throw error;

        // Handle facilities update
        if (selectedFacilityIds.length > 0) {
          // Delete existing facilities
          await supabase.from("location_facilities").delete().eq("location_id", editingLocation.id);

          // Insert new facilities
          const facilityInserts = selectedFacilityIds.map((facilityId) => ({
            location_id: editingLocation.id,
            facility_id: facilityId,
          }));

          const { error: facilitiesError } = await supabase
            .from("location_facilities")
            .insert(facilityInserts);

          if (facilitiesError) {
            console.error("Error updating facilities:", facilitiesError);
          }
        }

        // Handle pricing update
        // Delete existing pricing
        await supabase.from("location_pricing").delete().eq("location_id", editingLocation.id);

        // Insert new pricing if enabled
        if (formData.pricing.enabled && formData.pricing.price_ron > 0) {
          const { error: pricingError } = await supabase.from("location_pricing").insert([
            {
              location_id: editingLocation.id,
              billing: formData.pricing.billing,
              price_ron: formData.pricing.price_ron,
            },
          ]);

          if (pricingError) {
            console.error("Error updating pricing:", pricingError);
          }
        }

        toast({
          title: "Succes",
          description: "Locația a fost actualizată cu succes și trimisă pentru aprobare.",
        });
      } else {
        // Create new location
        const { data: newLocation, error } = await supabase
          .from("locations")
          .insert([locationData])
          .select()
          .single();

        if (error) {
          console.error("Database error creating location:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          console.error("Location data being saved:", JSON.stringify(locationData, null, 2));
          console.error("User ID:", user?.id);
          throw error;
        }

        // Handle facilities creation
        if (selectedFacilityIds.length > 0 && newLocation) {
          const facilityInserts = selectedFacilityIds.map((facilityId) => ({
            location_id: newLocation.id,
            facility_id: facilityId,
          }));

          const { error: facilitiesError } = await supabase
            .from("location_facilities")
            .insert(facilityInserts);

          if (facilitiesError) {
            console.error("Error creating facilities:", facilitiesError);
          }
        }

        // Handle pricing creation
        if (formData.pricing.enabled && newLocation && formData.pricing.price_ron > 0) {
          const { error: pricingError } = await supabase.from("location_pricing").insert([
            {
              location_id: newLocation.id,
              billing: formData.pricing.billing,
              price_ron: formData.pricing.price_ron,
            },
          ]);

          if (pricingError) {
            console.error("Error creating pricing:", pricingError);
          }
        }

        toast({
          title: "Succes",
          description: "Locația a fost creată cu succes și trimisă pentru aprobare.",
        });
      }

      // Clear persisted form state after successful submission
      clearFormState("locationForm");

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving location:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva locația. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Informații</TabsTrigger>
            <TabsTrigger value="images">Imagini</TabsTrigger>
            <TabsTrigger value="details">Adresă</TabsTrigger>
            <TabsTrigger value="facilities">Facilități</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titlu Locație *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Sala de evenimente Central"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type_id">Tip Locație *</Label>
                <LocationTypeSelect
                  value={formData.type_id}
                  onValueChange={(value) => handleInputChange("type_id", value)}
                  placeholder="Selectează tipul locației"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descrie locația, facilitățile și ce o face specială..."
                rows={4}
                maxLength={500}
              />
            </div>

            {/* Capacity and Area Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacitate (persoane)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                    handleInputChange("capacity", isNaN(value) ? 0 : value);
                  }}
                  placeholder="100"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size_square_meters">Suprafață (m²)</Label>
                <Input
                  id="size_square_meters"
                  type="number"
                  value={formData.size_square_meters || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                    handleInputChange("size_square_meters", isNaN(value) ? 0 : value);
                  }}
                  placeholder="200"
                  min="0"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Preț (opțional)</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pricing_enabled"
                    checked={formData.pricing.enabled}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          enabled: !!checked,
                        },
                      }));
                    }}
                  />
                  <Label
                    htmlFor="pricing_enabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Adaugă preț pentru închiriere
                  </Label>
                </div>

                {formData.pricing.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricing_billing">Facturare</Label>
                      <Select
                        value={formData.pricing.billing}
                        onValueChange={(value: "HOUR" | "DAY") => {
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              billing: value,
                            },
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează tipul de facturare" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOUR">Pe oră</SelectItem>
                          <SelectItem value="DAY">Pe zi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricing_price">Preț (RON)</Label>
                      <Input
                        id="pricing_price"
                        type="number"
                        value={formData.pricing.price_ron || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              price_ron: isNaN(value) ? 0 : value,
                            },
                          }));
                        }}
                        placeholder="200"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {formData.pricing.enabled && formData.pricing.price_ron > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>
                        Preț începând de la {formData.pricing.price_ron} RON /{" "}
                        {formData.pricing.billing === "HOUR" ? "oră" : "zi"}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Imagine Principală</Label>
                <SingleImageUpload
                  value={formData.cover_url || ""}
                  onImageChange={(url) => handleInputChange("cover_url", url)}
                  altTextContext={{
                    listingName: formData.title || "Locație",
                    city: "Locație",
                    type: "Locație",
                  }}
                  folder="locations/covers"
                  placeholder="Încarcă imagine principală pentru locație"
                  aspectRatio="video"
                  processingOptions={{
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.85,
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Galerie Foto</Label>
                <ImageUpload
                  onImagesChange={(urls) => handleInputChange("gallery", urls)}
                  maxImages={10}
                  altTextContext={{
                    listingName: formData.title || "Locație",
                    city: "Locație",
                    type: "Locație",
                  }}
                  folder="locations/gallery"
                  showPreview={true}
                  allowAltEdit={true}
                  processingOptions={{
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.8,
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Oraș *</Label>
                <CitySelect
                  value={formData.city_id}
                  onValueChange={(value) => handleInputChange("city_id", value)}
                  selectedCountyId={formData.county_id}
                  onCountyChange={(countyId) => handleInputChange("county_id", countyId)}
                  placeholder="Selectează orașul"
                />
              </div>

              <div className="space-y-2">
                <Label>Județ</Label>
                <CountySelect
                  value={formData.county_id}
                  onValueChange={(value) => handleInputChange("county_id", value)}
                  placeholder="Selectează județul (opțional)"
                />
                <p className="text-xs text-muted-foreground">
                  Județul este folosit pentru a filtra orașele, dar nu este salvat separat în baza
                  de date.
                </p>
              </div>

              <AddressInput
                value={formData.address}
                onChange={(address) => handleAddressChange("address", address)}
                onCoordinatesChange={(lat, lng) => {
                  setFormData((prev) => ({
                    ...prev,
                    lat,
                    lng,
                  }));
                }}
                onLocationInfoChange={(city, county) => {
                  // Note: County information from geocoding is not automatically
                  // applied to county_id as it requires a database lookup
                  // Users should still select the county manually
                }}
                placeholder="Adresa completă, inclusiv orașul"
                label="Adresă"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitudine</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat || ""}
                    onChange={(e) =>
                      handleInputChange("lat", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    placeholder="44.4378"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitudine</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng || ""}
                    onChange={(e) =>
                      handleInputChange("lng", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    placeholder="26.0875"
                  />
                </div>
              </div>

              {formData.lat && formData.lng && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Coordonate detectate automat</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Facilități Disponibile</h3>
              <div className="space-y-2">
                <Label htmlFor="facilities">Selectează facilitățile disponibile</Label>
                <FacilitySelect
                  value={selectedFacilityIds}
                  onValueChange={setSelectedFacilityIds}
                  placeholder="Căutați și selectați facilități..."
                />
              </div>
              {selectedFacilityIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{selectedFacilityIds.length}</strong> facilități selectate
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informații de Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange("contact_email", e.target.value)}
                    placeholder="contact@locatie.ro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.locatie.ro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Telefoane de Contact</Label>
                {formData.contact_phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      placeholder="+40 123 456 789"
                    />
                    {formData.contact_phones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePhone(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addPhone} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Telefon
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Rețele Sociale</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">
                    <Instagram className="h-4 w-4 inline mr-2" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.social_links.instagram || ""}
                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">
                    <Facebook className="h-4 w-4 inline mr-2" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={formData.social_links.facebook || ""}
                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                    placeholder="facebook.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">
                    <Twitter className="h-4 w-4 inline mr-2" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={formData.social_links.twitter || ""}
                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">
                    <Linkedin className="h-4 w-4 inline mr-2" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.social_links.linkedin || ""}
                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearFormState("locationForm");
              if (onClose) onClose();
            }}
            className="flex-1"
          >
            Anulează
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Se salvează..." : isEditing ? "Actualizează" : "Creează"} Locație
          </Button>
        </div>
      </form>
    </div>
  );
};
