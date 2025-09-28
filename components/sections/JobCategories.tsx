"use client"

import { Card, CardContent } from "@/components/ui/card"
import { JobCategory } from "@/types/company"

const categories: JobCategory[] = [
  { name: "Développement", icon: "💻", jobs: 245, color: "bg-teal-500" },
  { name: "Design", icon: "🎨", jobs: 89, color: "bg-teal-600" },
  { name: "Marketing", icon: "📈", jobs: 156, color: "bg-emerald-500" },
  { name: "Data", icon: "📊", jobs: 78, color: "bg-cyan-500" },
  { name: "Finance", icon: "💰", jobs: 134, color: "bg-teal-700" },
  { name: "RH", icon: "👥", jobs: 67, color: "bg-emerald-600" }
]

export default function JobCategories() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Catégories populaires</h3>
          <p className="text-xl text-gray-600">Explorez les domaines qui recrutent le plus</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white text-xl mx-auto mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {category.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{category.name}</h4>
                <p className="text-sm text-gray-500">{category.jobs} offres</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
