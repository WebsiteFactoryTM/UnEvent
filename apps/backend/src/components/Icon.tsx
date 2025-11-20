import Image from 'next/image'

export const Icon = (): React.ReactNode => {
  return (
    <Image
      src="/logo-unevent-favicon-white-on-black.png"
      alt="UN:EVENT"
      width={200}
      height={200}
      unoptimized
      className="h-20 w-auto dark:invert-0 invert"
    />
  )
}
