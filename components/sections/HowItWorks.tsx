"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HowItWorksStep } from "@/types/testimonial"

const steps: HowItWorksStep[] = [
  { step: 1, title: "Créez votre profil", description: "Mettez en valeur vos compétences et expériences", icon: "👤" },
  { step: 2, title: "Recherchez des offres", description: "Utilisez nos filtres avancés pour trouver les meilleures opportunités", icon: "🔍" },
  { step: 3, title: "Postulez facilement", description: "Envoyez votre candidature en quelques clics", icon: "📝" },
  { step: 4, title: "Suivez vos candidatures", description: "Gérez et suivez l'état de vos candidatures", icon: "📋" }
]

export default function HowItWorks() {
  const router = useRouter()

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche</h3>
          <p className="text-xl text-gray-600">Trouvez votre prochain emploi en 4 étapes simples</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                {item.icon}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {item.step}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-3" onClick={() => router.push("/sign-in")}>
            Commencer maintenant
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
