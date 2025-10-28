import { FaPhone, FaEnvelope, FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import type { Event } from "@/payload-types"

interface EventContactCardProps {
  event: Event
}

export default function EventContactCard({ event }: EventContactCardProps) {
  const contact = event.contact
  const socialLinks = event.socialLinks

  if (!contact && !socialLinks) return null

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-xl font-bold">Contact</h3>

      <div className="space-y-3">
        {contact?.phone && (
          <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" asChild>
            <a href={`tel:${contact.phone}`}>
              <FaPhone className="h-4 w-4" />
              {contact.phone}
            </a>
          </Button>
        )}

        {contact?.email && (
          <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" asChild>
            <a href={`mailto:${contact.email}`}>
              <FaEnvelope className="h-4 w-4" />
              {contact.email}
            </a>
          </Button>
        )}

        {contact?.website && (
          <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" asChild>
            <a href={contact.website} target="_blank" rel="noopener noreferrer">
              <FaGlobe className="h-4 w-4" />
              Website
            </a>
          </Button>
        )}

        {socialLinks && Object.values(socialLinks).some((link) => link) && (
          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="text-sm font-semibold">Social Media</h4>
            <div className="flex gap-2">
              {socialLinks.facebook && (
                <Button variant="outline" size="icon" asChild>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebook className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socialLinks.instagram && (
                <Button variant="outline" size="icon" asChild>
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
