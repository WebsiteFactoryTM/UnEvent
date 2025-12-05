"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Slider } from "@/components/ui/slider";
import { FaMagnifyingGlass, FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { ArchiveFilter } from "../archives/ArchiveFilter";

export function FilterTabs() {
  const [activeTab, setActiveTab] = useState("locatii");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="locatii">Locații</TabsTrigger>
          <TabsTrigger value="servicii">Servicii</TabsTrigger>
          <TabsTrigger value="evenimente">Evenimente</TabsTrigger>
        </TabsList>

        <TabsContent value="locatii" className="space-y-4">
          <ArchiveFilter
            listingType="locatii"
            defaultIsOpen={true}
            showCategoriesOnly
          />
        </TabsContent>

        <TabsContent value="servicii" className="space-y-4">
          <ArchiveFilter
            listingType="servicii"
            defaultIsOpen={true}
            showCategoriesOnly
          />
        </TabsContent>

        <TabsContent value="evenimente" className="space-y-4">
          <ArchiveFilter
            listingType="evenimente"
            defaultIsOpen={true}
            showCategoriesOnly
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
