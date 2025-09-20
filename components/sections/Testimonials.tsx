"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Testimonial } from "@/types/testimonial"

const testimonials: Testimonial[] = [
  {
    name: "Marie Dubois",
    role: "Développeuse Full Stack",
    company: "TechCorp",
    testimonial: "J'ai trouvé mon poste idéal en moins de 2 semaines. La plateforme est intuitive et les offres sont de qualité.",
    rating: 5,
    avatar: "👩‍💻"
  },
  {
    name: "Pierre Martin",
    role: "Chef de Projet",
    company: "DataSys",
    testimonial: "Les filtres de recherche m'ont permis de trouver exactement le poste que je cherchais. Service excellent !",
    rating: 5,
    avatar: "👨‍💼"
  },
  {
    name: "Sophie Bernard",
    role: "Designer UX",
    company: "GreenTech",
    testimonial: "L'accompagnement et la qualité des offres dépassent mes attentes. Je recommande vivement !",
    rating: 5,
    avatar: "👩‍🎨"
  }
]

export default function Testimonials() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Témoignages</h3>
          <p className="text-xl text-gray-600">Découvrez les success stories de nos utilisateurs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-teal-600">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.testimonial}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
