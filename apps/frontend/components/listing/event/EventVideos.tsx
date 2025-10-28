interface EventVideosProps {
  youtubeLinks: Array<{ youtubeLink?: string | null; id?: string }>
}

export default function EventVideos({ youtubeLinks }: EventVideosProps) {
  const validLinks = youtubeLinks.filter((link) => link.youtubeLink)

  if (validLinks.length === 0) return null

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-2xl font-bold">Video de prezentare</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {validLinks.map((link, index) => {
          const embedUrl = getYouTubeEmbedUrl(link.youtubeLink!)
          if (!embedUrl) return null

          return (
            <div key={link.id || index} className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
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
