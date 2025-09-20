"use client"

import { useState } from "react"
import { Share2, Copy, Facebook, Twitter, Linkedin, Mail, MessageCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { Job } from "@/lib/database"

interface ShareJobProps {
  job: Job
  url?: string
}

export function ShareJob({ job, url }: ShareJobProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const shareTitle = `${job.title} - ${job.company}`
  const shareText = `Découvrez cette offre d'emploi : ${job.title} chez ${job.company} à ${job.location}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copy
      copyToClipboard()
    }
  }

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager cette offre d'emploi</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Quick Share */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Partage rapide</Label>
            <Button onClick={shareViaWebAPI} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Partager via le système
            </Button>
          </div>

          <Separator />

          {/* Social Media */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Réseaux sociaux</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                  LinkedIn
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Email */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Email</Label>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a href={shareLinks.email}>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer par email
              </a>
            </Button>
          </div>

          <Separator />

          {/* Copy Link */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Copier le lien</Label>
            <div className="flex space-x-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && <p className="text-sm text-green-600 mt-2">Lien copié !</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
