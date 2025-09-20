"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobFilters } from "@/types/job"

interface HeroSectionProps {
  onFiltersChange: (filters: JobFilters) => void
  jobsCount: number
}

export default function HeroSection({ onFiltersChange, jobsCount }: HeroSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [salaryFilter, setSalaryFilter] = useState("all")

  const handleSearch = () => {
    onFiltersChange({
      searchTerm,
      locationFilter,
      typeFilter,
      salaryFilter
    })
  }

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    const newFilters = {
      searchTerm,
      locationFilter,
      typeFilter,
      salaryFilter
    }
    newFilters[key] = value

    if (key === 'searchTerm') setSearchTerm(value)
    else if (key === 'locationFilter') setLocationFilter(value)
    else if (key === 'typeFilter') setTypeFilter(value)
    else if (key === 'salaryFilter') setSalaryFilter(value)

    onFiltersChange(newFilters)
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">Trouvez l'emploi de vos rêves</h2>
        <p className="text-xl text-gray-600 mb-8 text-pretty">
          Découvrez des milliers d'opportunités dans les meilleures entreprises
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Poste, entreprise, mots-clés..."
                value={searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={locationFilter} onValueChange={(value) => handleFilterChange('locationFilter', value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                <SelectItem value="Paris">Paris</SelectItem>
                <SelectItem value="Lyon">Lyon</SelectItem>
                <SelectItem value="Toulouse">Toulouse</SelectItem>
                <SelectItem value="Marseille">Marseille</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-12 bg-teal-600 hover:bg-teal-700" onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <Select value={typeFilter} onValueChange={(value) => handleFilterChange('typeFilter', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salaryFilter} onValueChange={(value) => handleFilterChange('salaryFilter', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Salaire minimum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les salaires</SelectItem>
                <SelectItem value="30000">30k€+</SelectItem>
                <SelectItem value="40000">40k€+</SelectItem>
                <SelectItem value="50000">50k€+</SelectItem>
                <SelectItem value="60000">60k€+</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {jobsCount} offres trouvées
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
