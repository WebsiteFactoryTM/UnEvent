import type { Location } from "@/payload-types"

interface LocationVideosProps {
  location: Location
}

export function LocationVideos({ location }: LocationVideosProps) {
  const youtubeLinks = location.youtubeLinks || []

  if (youtubeLinks.length === 0) return null

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Video de prezentare</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {youtubeLinks.slice(0, 4).map((link, index) => {
          const videoId = link.youtubeLink?.split("v=")[1]?.split("&")[0]
          if (!videoId) return null

          return (
            <div key={link.id || index} className="relative aspect-video rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`Video ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
