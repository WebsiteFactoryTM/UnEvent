import type { Service } from "@/payload-types"

interface ServiceVideosProps {
  service: Service
}

export default function ServiceVideos({ service }: ServiceVideosProps) {
  const videos = service.youtubeLinks || []

  if (videos.length === 0) return null

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop()
    return `https://www.youtube.com/embed/${videoId}`
  }

  return (
    <div className="glass-card p-6 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold">Video de prezentare</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.slice(0, 3).map((video, index) => (
          <div key={video.id || index} className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={getYouTubeEmbedUrl(video.youtubeLink || "")}
              title={`Video ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
