"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { locationFormSchema, defaultLocationFormValues, type LocationFormData } from "@/forms/location/schema"
import { InfoTab } from "./tabs/InfoTab"
import { AddressTab } from "./tabs/AddressTab"
import { FacilitiesTab } from "./tabs/FacilitiesTab"
import { ImagesTab } from "./tabs/ImagesTab"
import { ContactTab } from "./tabs/ContactTab"
import { SubmitDone } from "./SubmitDone"
import { useToast } from "@/hooks/use-toast"

interface AddLocationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tabs = [
  { value: "info", label: "Informații" },
  { value: "address", label: "Adresă" },
  { value: "facilities", label: "Facilități" },
  { value: "images", label: "Imagini" },
  { value: "contact", label: "Contact" },
]

export function AddLocationModal({ open, onOpenChange }: AddLocationModalProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const methods = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: defaultLocationFormValues,
    mode: "onChange",
  })

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = methods

  const currentTabIndex = tabs.findIndex((tab) => tab.value === activeTab)
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1

  const handleNext = () => {
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1].value)
    }
  }

  const handlePrevious = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1].value)
    }
  }

  const onSubmit = async (data: LocationFormData) => {
    console.log("Form submitted:", data)

    // TODO: Replace with actual API call to backend
    // await createLocation(data)

    // Show success state
    setIsSubmitted(true)

    // Reset after a delay when modal closes
    setTimeout(() => {
      reset()
      setIsSubmitted(false)
      setActiveTab("info")
    }, 500)
  }

  const handleSaveDraft = () => {
    const currentData = methods.getValues()
    console.log("Saving as draft:", currentData)

    // TODO: Replace with actual API call to save draft
    // await saveLocationDraft(currentData)

    toast({
      title: "Ciornă salvată",
      description: "Modificările au fost salvate ca ciornă. Poți continua mai târziu.",
    })

    // Optionally close the modal
    // onOpenChange(false)
  }

  const handleClose = () => {
    if (isDirty && !isSubmitted) {
      const confirmClose = window.confirm(
        "Ai modificări nesalvate. Ești sigur că vrei să închizi formularul?"
      )
      if (!confirmClose) return
    }

    onOpenChange(false)
    setTimeout(() => {
      reset()
      setIsSubmitted(false)
      setActiveTab("info")
    }, 300)
  }

  const handleError = () => {
    toast({
      title: "Validare incompletă",
      description: "Te rugăm să completezi toate câmpurile obligatorii și să corectezi erorile.",
      variant: "destructive",
    })

    // Find first tab with errors and navigate to it
    const errorFields = Object.keys(errors)
    if (errorFields.length > 0) {
      // Map error fields to tabs
      const fieldToTab: Record<string, string> = {
        title: "info",
        type: "info",
        suitableFor: "info",
        description: "info",
        capacity: "info",
        surface: "info",
        pricing: "info",
        city: "address",
        address: "address",
        geo: "address",
        facilities: "facilities",
        featuredImage: "images",
        gallery: "images",
        youtubeLinks: "images",
        contact: "contact",
        socialLinks: "contact",
      }

      const firstErrorField = errorFields[0]
      const targetTab = fieldToTab[firstErrorField] || "info"
      setActiveTab(targetTab)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] md:w-[92vw] lg:w-[90vw] max-w-[calc(100%-2rem)] sm:max-w-[95vw] md:max-w-[92vw] lg:max-w-[90vw] xl:max-w-[1600px] h-[90vh] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl">Adaugă locație</DialogTitle>
          <DialogDescription className="text-sm">
            Completează câmpurile de mai jos. Datele vor fi verificate înainte de publicare.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex-1 overflow-y-auto">
            <SubmitDone onClose={handleClose} />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, handleError)} className="flex flex-col flex-1 min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-4 sm:px-6 lg:px-8 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-5 h-auto">
                    {tabs.map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value} 
                        className="text-xs sm:text-sm px-2 py-2"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                      <TabsContent value="info" className="mt-0 space-y-6">
                        <InfoTab />
                      </TabsContent>

                      <TabsContent value="address" className="mt-0 space-y-6">
                        <AddressTab />
                      </TabsContent>

                      <TabsContent value="facilities" className="mt-0 space-y-6">
                        <FacilitiesTab />
                      </TabsContent>

                      <TabsContent value="images" className="mt-0 space-y-6">
                        <ImagesTab />
                      </TabsContent>

                      <TabsContent value="contact" className="mt-0 space-y-6">
                        <ContactTab />
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t bg-muted/30 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstTab}
                    className="gap-1 sm:gap-2 text-sm h-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Înapoi</span>
                  </Button>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSaveDraft}
                      className="gap-1 sm:gap-2 text-sm h-9"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden md:inline">Salvează ca ciornă</span>
                      <span className="md:hidden">Ciornă</span>
                    </Button>

                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      <span className="hidden sm:inline">Pas </span>
                      {currentTabIndex + 1}/{tabs.length}
                    </div>
                  </div>

                  {isLastTab ? (
                    <Button type="submit" disabled={!isValid} className="gap-1 sm:gap-2 text-sm h-9">
                      <span className="hidden sm:inline">Trimite spre aprobare</span>
                      <span className="sm:hidden">Trimite</span>
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleNext} className="gap-1 sm:gap-2 text-sm h-9">
                      <span className="hidden sm:inline">Următorul</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Tabs>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}

