import { Badge } from "@/components/ui/badge"
import { FaClock, FaCheck, FaXmark, FaFlag } from "react-icons/fa6"

interface EventStatusBadgeProps {
  status: "pending" | "approved" | "rejected"
  eventStatus?: "upcoming" | "in-progress" | "finished"
}

export default function EventStatusBadge({ status, eventStatus }: EventStatusBadgeProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "pending":
        return {
          icon: FaClock,
          label: "În așteptare",
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        }
      case "approved":
        return {
          icon: FaCheck,
          label: "Aprobat",
          color: "bg-green-500/20 text-green-400 border-green-500/30",
        }
      case "rejected":
        return {
          icon: FaXmark,
          label: "Respins",
          color: "bg-red-500/20 text-red-400 border-red-500/30",
        }
    }
  }

  const getEventStatusInfo = () => {
    if (!eventStatus) return null

    switch (eventStatus) {
      case "upcoming":
        return { label: "Viitor", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
      case "in-progress":
        return { label: "În desfășurare", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
      case "finished":
        return { label: "Finalizat", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
    }
  }

  const statusInfo = getStatusInfo()
  const eventStatusInfo = getEventStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <FaFlag className="h-6 w-6 text-muted-foreground" />
        <h3 className="text-xl font-bold">Status eveniment</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge className={`${statusInfo.color} px-4 py-2 text-sm`}>
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusInfo.label}
        </Badge>

        {eventStatusInfo && (
          <Badge className={`${eventStatusInfo.color} px-4 py-2 text-sm`}>{eventStatusInfo.label}</Badge>
        )}
      </div>
    </div>
  )
}
