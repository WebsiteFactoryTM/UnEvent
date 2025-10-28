"use client"

export function AnimatedBubbles() {
  const bubbles = [
    // Romanian blue bubbles
    { color: "var(--bubble-blue)", size: 150, top: "10%", left: "5%", duration: 25 },
    { color: "var(--bubble-blue)", size: 120, top: "60%", left: "80%", duration: 28 },
    { color: "var(--bubble-blue)", size: 180, top: "75%", left: "15%", duration: 32 },

    // Romanian yellow bubbles
    { color: "var(--bubble-yellow)", size: 110, top: "20%", left: "70%", duration: 22 },
    { color: "var(--bubble-yellow)", size: 140, top: "50%", left: "40%", duration: 26 },
    { color: "var(--bubble-yellow)", size: 200, top: "85%", left: "60%", duration: 30 },

    // Romanian red bubbles
    { color: "var(--bubble-red)", size: 130, top: "35%", left: "25%", duration: 24 },
    { color: "var(--bubble-red)", size: 160, top: "65%", left: "90%", duration: 27 },
    { color: "var(--bubble-red)", size: 115, top: "90%", left: "35%", duration: 20 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {bubbles.map((bubble, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            backgroundColor: bubble.color,
            top: bubble.top,
            left: bubble.left,
            filter: "blur(30px)",
            opacity: 0.6,
            animation: `float ${bubble.duration}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}
