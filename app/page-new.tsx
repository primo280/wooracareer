"use client"

import { useState } from "react"
import { JobFilters } from "@/types/job"
import Header from "@/components/layout/Header"
import HeroSection from "@/components/sections/HeroSection"
import FeaturedCompanies from "@/components/sections/FeaturedCompanies"
import JobCategories from "@/components/sections/JobCategories"
import HowItWorks from "@/components/sections/HowItWorks"
import Testimonials from "@/components/sections/Testimonials"
import Newsletter from "@/components/sections/Newsletter"
import StatsSection from "@/components/sections/StatsSection"
import JobListing from "@/components/sections/JobListing"
import Footer from "@/components/layout/Footer"

export default function HomePage() {
  const [filters, setFilters] = useState<JobFilters>({
    searchTerm: "",
    locationFilter: "all",
    typeFilter: "all",
    salaryFilter: "all"
  })

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      <Header />
      <HeroSection onFiltersChange={handleFiltersChange} jobsCount={0} />
      <FeaturedCompanies />
      <JobCategories />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <StatsSection />
      <JobListing filters={filters} />
      <Footer />
    </div>
  )
}
