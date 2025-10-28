"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { FaMagnifyingGlass, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa6"

type ListingType = "locatii" | "servicii" | "evenimente"

interface ArchiveFilterProps {
  listingType: ListingType
}

export function ArchiveFilter({ listingType }: ArchiveFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [capacityRange, setCapacityRange] = useState([0, 500])
  const [priceRange, setPriceRange] = useState([0, 10000])

  // Locații filters
  const [eventType, setEventType] = useState("")
  const [city, setCity] = useState("")
  const [locationType, setLocationType] = useState("")

  // Servicii filters
  const [serviceType, setServiceType] = useState("")
  const [serviceCity, setServiceCity] = useState("")
  const [serviceEvent, setServiceEvent] = useState("")

  // Evenimente filters
  const [eventCategory, setEventCategory] = useState("")
  const [eventCity, setEventCity] = useState("")
  const [eventWhen, setEventWhen] = useState("")

  const eventTypeOptions = [
    { value: "nunta", label: "Nuntă" },
    { value: "botez", label: "Botez" },
    { value: "corporate", label: "Corporate" },
    { value: "petrecere", label: "Petrecere privată" },
  ]

  const cityOptions = [
    { value: "bucuresti", label: "București" },
    { value: "cluj", label: "Cluj-Napoca" },
    { value: "timisoara", label: "Timișoara" },
    { value: "brasov", label: "Brașov" },
    { value: "iasi", label: "Iași" },
  ]

  const locationTypeOptions = [
    { value: "sala", label: "Sală de evenimente" },
    { value: "restaurant", label: "Restaurant" },
    { value: "gradina", label: "Grădină" },
    { value: "castel", label: "Castel" },
    { value: "loft", label: "Loft" },
  ]

  const serviceTypeOptions = [
    { value: "dj", label: "DJ" },
    { value: "formatie", label: "Formație muzicală" },
    { value: "catering", label: "Catering" },
    { value: "foto-video", label: "Foto-Video" },
    { value: "organizator", label: "Organizator evenimente" },
  ]

  const eventCategoryOptions = [
    { value: "concert", label: "Concert" },
    { value: "festival", label: "Festival" },
    { value: "workshop", label: "Workshop" },
    { value: "conferinta", label: "Conferință" },
    { value: "petrecere", label: "Petrecere" },
  ]

  const eventWhenOptions = [
    { value: "orice", label: "Orice dată" },
    { value: "astazi", label: "Astăzi" },
    { value: "maine", label: "Mâine" },
    { value: "saptamana", label: "Săptămâna aceasta" },
    { value: "saptamana-viitoare", label: "Săptămâna viitoare" },
    { value: "luna", label: "Luna aceasta" },
    { value: "specific", label: "Dată specifică" },
  ]

  const filterButtonText = {
    locatii: "Filtrează locații",
    servicii: "Filtrează servicii",
    evenimente: "Filtrează evenimente",
  }[listingType]

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full md:w-auto glass-card border-border/50 hover:bg-muted/50 transition-all"
      >
        <FaFilter className="mr-2 h-4 w-4" />
        {filterButtonText}
        {isOpen ? <FaChevronUp className="ml-2 h-4 w-4" /> : <FaChevronDown className="ml-2 h-4 w-4" />}
      </Button>

      {/* Collapsible Filter Section */}
      {isOpen && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {listingType === "locatii" && (
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Ce eveniment organizezi?</Label>
                  <SearchableSelect
                    id="event-type"
                    options={eventTypeOptions}
                    value={eventType}
                    onValueChange={setEventType}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Unde (Oraș)</Label>
                  <SearchableSelect
                    id="city"
                    options={cityOptions}
                    value={city}
                    onValueChange={setCity}
                    placeholder="Selectează orașul"
                    searchPlaceholder="Caută oraș..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-type">Tip locație</Label>
                  <SearchableSelect
                    id="location-type"
                    options={locationTypeOptions}
                    value={locationType}
                    onValueChange={setLocationType}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip locație..."
                    className="w-full"
                  />
                </div>
              </div>

              <Button variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full justify-between">
                <span>Avansate</span>
                {showAdvanced ? <FaChevronUp className="h-4 w-4" /> : <FaChevronDown className="h-4 w-4" />}
              </Button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="space-y-4">
                    <Label>Capacitate (persoane)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={capacityRange}
                        onValueChange={setCapacityRange}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Input type="number" value={capacityRange[0]} readOnly className="w-24" />
                        <span className="flex items-center">-</span>
                        <Input type="number" value={capacityRange[1]} readOnly className="w-24" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Preț locație (RON)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Input type="number" value={priceRange[0]} readOnly className="w-24" />
                        <span className="flex items-center">-</span>
                        <Input type="number" value={priceRange[1]} readOnly className="w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full glow-on-hover">
                <FaMagnifyingGlass className="mr-2 h-4 w-4" />
                Caută locații
              </Button>
            </div>
          )}

          {listingType === "servicii" && (
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Ce serviciu cauți?</Label>
                  <SearchableSelect
                    id="service-type"
                    options={serviceTypeOptions}
                    value={serviceType}
                    onValueChange={setServiceType}
                    placeholder="Selectează serviciul"
                    searchPlaceholder="Caută serviciu..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-city">Unde?</Label>
                  <SearchableSelect
                    id="service-city"
                    options={cityOptions}
                    value={serviceCity}
                    onValueChange={setServiceCity}
                    placeholder="Selectează orașul"
                    searchPlaceholder="Caută oraș..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-event">Pentru ce tip de eveniment?</Label>
                  <SearchableSelect
                    id="service-event"
                    options={eventTypeOptions}
                    value={serviceEvent}
                    onValueChange={setServiceEvent}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    className="w-full"
                  />
                </div>
              </div>

              <Button className="w-full glow-on-hover">
                <FaMagnifyingGlass className="mr-2 h-4 w-4" />
                Caută servicii
              </Button>
            </div>
          )}

          {listingType === "evenimente" && (
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-category">Ce tip de eveniment?</Label>
                  <SearchableSelect
                    id="event-category"
                    options={eventCategoryOptions}
                    value={eventCategory}
                    onValueChange={setEventCategory}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-city">Unde?</Label>
                  <SearchableSelect
                    id="event-city"
                    options={cityOptions}
                    value={eventCity}
                    onValueChange={setEventCity}
                    placeholder="Selectează orașul"
                    searchPlaceholder="Caută oraș..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-when">Când?</Label>
                  <Select value={eventWhen} onValueChange={setEventWhen}>
                    <SelectTrigger id="event-when" className="w-full">
                      <SelectValue placeholder="Selectează data" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventWhenOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full glow-on-hover">
                <FaMagnifyingGlass className="mr-2 h-4 w-4" />
                Caută evenimente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
