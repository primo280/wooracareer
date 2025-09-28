"use client"

import { useRouter } from "next/navigation"
import { Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8    ">
        <div className="flex justify-center items-center h-16 ">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Wooracareer</h1>
          </div>
          
        {/*
        <nav className="hidden md:flex space-x-8">
            <button onClick={() => router.push("/")} className="text-gray-700 hover:text-teal-600 font-medium">
              Emplois
            </button>
            <button onClick={() => router.push("/admin")} className="text-gray-700 hover:text-teal-600 font-medium">
              Admin
            </button>
          </nav>


          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Mon espace
                </Button>
                <Button onClick={() => signOut()} variant="outline" className="text-red-600">
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/sign-in")}>
                  Connexion
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/admin")}>
                  Publier une offre
                </Button>
              </>
            )}
          </div>
        
        */}

          
        </div>
      </div>
    </header>
  )
}
