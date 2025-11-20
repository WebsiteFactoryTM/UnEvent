import Image from 'next/image'

export const Logo = (): React.ReactNode => {
  return (
    <Image
      src="/logo-unevent-white.png"
      alt="UN:EVENT"
      width={200}
      height={200}
      unoptimized
      className="h-16 w-auto dark:invert-0 invert"
    />
  )
}
