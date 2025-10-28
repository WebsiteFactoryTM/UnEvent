"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Slider } from "@/components/ui/slider"
import { FaMagnifyingGlass, FaChevronDown, FaChevronUp } from "react-icons/fa6"

export function FilterTabs() {
  const [activeTab, setActiveTab] = useState("locatii")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [capacityRange, setCapacityRange] = useState([0, 500])
  const [priceRange, setPriceRange] = useState([0, 10000])

  const [eventType, setEventType] = useState("")
  const [city, setCity] = useState("")
  const [locationType, setLocationType] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [serviceCity, setServiceCity] = useState("")
  const [serviceEvent, setServiceEvent] = useState("")
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="locatii">Locații</TabsTrigger>
          <TabsTrigger value="servicii">Servicii</TabsTrigger>
          <TabsTrigger value="evenimente">Evenimente</TabsTrigger>
        </TabsList>

        <TabsContent value="locatii" className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
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
                  <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="w-full" />
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
        </TabsContent>

        <TabsContent value="servicii" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="evenimente" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
