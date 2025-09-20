"use client"

import { Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Newsletter() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <Mail className="w-16 h-16 text-white mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-4">Restez informé</h3>
          <p className="text-xl text-teal-100 mb-8">
            Recevez les meilleures offres d'emploi directement dans votre boîte mail
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 h-12 text-lg"
            />
            <Button className="bg-teal-600 hover:bg-teal-700 h-12 px-8 text-lg">
              S'abonner
              <Mail className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            En vous abonnant, vous acceptez de recevoir nos offres d'emploi. Vous pouvez vous désabonner à tout moment.
          </p>
        </div>

        <div className="flex justify-center items-center space-x-8 mt-8 text-teal-100">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Offres exclusives</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Conseils carrière</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Pas de spam</span>
          </div>
        </div>
      </div>
    </section>
  )
}
