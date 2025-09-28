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
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[600px] flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')"
        }}
      ></div>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-teal-800/70 to-emerald-900/80"></div>
      <div className="absolute inset-0 bg-teal-600/20"></div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-6 text-balance leading-tight">
          Trouvez l'emploi de vos <span className="text-teal-300">rêves</span>
        </h2>
        <p className="text-xl text-teal-100 mb-10 text-pretty max-w-2xl mx-auto">
          Découvrez des milliers d'opportunités dans les meilleures entreprises et faites le prochain pas dans votre carrière
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
                <SelectItem value="30000">30kFCFA+</SelectItem>
                <SelectItem value="40000">40kFCFA+</SelectItem>
                <SelectItem value="50000">50kFCFA+</SelectItem>
                <SelectItem value="60000">60kFCFA+</SelectItem>
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
