"use client"

import { useRouter } from "next/navigation"
import { Star, ArrowRight, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Company } from "@/types/company"

const companies: Company[] = [
  { name: "TechCorp", jobs: 45, rating: 4.8, logo: "🏢" },
  { name: "DataSys", jobs: 32, rating: 4.9, logo: "💻" },
  { name: "GreenTech", jobs: 28, rating: 4.7, logo: "🌱" },
  { name: "FinancePlus", jobs: 38, rating: 4.6, logo: "📊" }
]

export default function FeaturedCompanies() {
  const router = useRouter()

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Entreprises partenaires</h3>
          <p className="text-xl text-gray-600">Découvrez les entreprises qui recrutent sur notre plateforme</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.map((company, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{company.logo}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{company.name}</h4>
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{company.rating}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{company.jobs} offres d'emploi</p>
                <Button variant="outline" size="sm" className="w-full">
                  Voir les offres
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="bg-teal-600 text-white hover:bg-teal-700">
            Voir toutes les entreprises
            <Building className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
