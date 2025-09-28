"use client"

import { useRouter } from "next/navigation"
import { Building, Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const router = useRouter()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-teal-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Wooracareer
              </h3>
            </div>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              La plateforme de référence pour trouver votre prochain emploi. Connectez talents et opportunités professionnelles.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300 hover:text-teal-400 transition-colors group">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-sm sm:text-base break-all">contact@wooracareer.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300 hover:text-teal-400 transition-colors group">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-sm sm:text-base">+229 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300 hover:text-teal-400 transition-colors group">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-sm sm:text-base">Benin</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            <h4 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-white">Liens rapides</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <button
                  onClick={() => router.push("/")}
                  className="text-gray-300 hover:text-teal-400 transition-all duration-300 hover:translate-x-1 sm:hover:translate-x-2 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-0 group-hover:w-1 sm:group-hover:w-2 h-0.5 bg-teal-400 transition-all duration-300 mr-0 group-hover:mr-1 sm:group-hover:mr-2"></span>
                  Rechercher un emploi
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin")}
                  className="text-gray-300 hover:text-teal-400 transition-all duration-300 hover:translate-x-1 sm:hover:translate-x-2 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-0 group-hover:w-1 sm:group-hover:w-2 h-0.5 bg-teal-400 transition-all duration-300 mr-0 group-hover:mr-1 sm:group-hover:mr-2"></span>
                  Publier une offre
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/sign-in")}
                  className="text-gray-300 hover:text-teal-400 transition-all duration-300 hover:translate-x-1 sm:hover:translate-x-2 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-0 group-hover:w-1 sm:group-hover:w-2 h-0.5 bg-teal-400 transition-all duration-300 mr-0 group-hover:mr-1 sm:group-hover:mr-2"></span>
                  Se connecter
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            <h4 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-white">Restez informé</h4>
            <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">Recevez les dernières offres d'emploi directement dans votre boîte mail.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors text-sm sm:text-base"
              />
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap">
                S'abonner
              </Button>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-600">
          <h4 className="font-bold text-lg sm:text-xl mb-6 sm:mb-8 text-white">Suivez-nous sur les réseaux</h4>
          <div className="flex justify-center space-x-4 sm:space-x-6">
            <a
              href="https://facebook.com/wooracareer"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Suivez-nous sur Facebook"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Facebook className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
            </a>

            <a
              href="https://instagram.com/wooracareer"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Suivez-nous sur Instagram"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse delay-100"></div>
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Instagram className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
            </a>

            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Contactez-nous sur WhatsApp"
            >
              <div className="absolute inset-0 bg-green-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse delay-200"></div>
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6 sm:pt-8 animate-in fade-in slide-in-from-bottom duration-700 delay-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center sm:text-left text-sm sm:text-base">
              &copy; 2025 Wooracareer. Tous droits réservés. Made with ❤️ in Benin.
            </p>

            {/* Back to Top Button */}
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-teal-400 hover:bg-gray-800 transition-all duration-300 group text-sm sm:text-base px-3 sm:px-4 py-2"
              aria-label="Retour en haut de page"
            >
              <ArrowUp className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
              Haut de page
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
