import type { Listing } from "@/types/listings";

interface ListingVideosProps {
  youtubeLinks: Listing["youtubeLinks"];
}

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;

  // Handle youtu.be short URLs: https://youtu.be/VIDEO_ID
  const youtuBeMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch) return youtuBeMatch[1];

  // Handle standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle embed URLs: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/(?:embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export function ListingVideos({ youtubeLinks }: ListingVideosProps) {
  if (youtubeLinks?.length === 0) return null;

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Video de prezentare</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {youtubeLinks?.slice(0, 4).map(({ id, youtubeLink }, index) => {
          const videoId = extractYouTubeVideoId(youtubeLink);
          console.log(videoId, "videoId");
          if (!videoId) return null;

          return (
            <div
              key={id || index}
              className="relative aspect-video rounded-lg overflow-hidden"
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`Video ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
