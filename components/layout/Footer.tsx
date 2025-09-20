"use client"

import { useRouter } from "next/navigation"
import { Building } from "lucide-react"

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">JobBoard Pro</h3>
            </div>
            <p className="text-gray-400">La plateforme de référence pour trouver votre prochain emploi.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Candidats</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => router.push("/")} className="hover:text-white">
                  Rechercher un emploi
                </button>
              </li>
              <li>
                <button onClick={() => router.push("/dashboard")} className="hover:text-white">
                  Mon espace candidat
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Entreprises</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => router.push("/admin")} className="hover:text-white">
                  Publier une offre
                </button>
              </li>
              <li>
                <button onClick={() => router.push("/admin")} className="hover:text-white">
                  Tableau de bord admin
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => router.push("/sign-in")} className="hover:text-white">
                  Connexion
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 JobBoard Pro. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
