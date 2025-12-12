import Link from "next/link";
import { MdCardGiftcard } from "react-icons/md"; // example

export function XmasPromoLink() {
  return (
    <Link
      href="/promotie-de-craciun"
      className="
        group relative inline-flex items-center gap-5
        rounded-[16px] border border-[#ff3b30]
        px-6 py-4
        text-[#ff3b30] text-lg font-semibold
        transition-all duration-300
        hover:bg-[#ff3b30] hover:text-white hover:border-transparent
        hover:shadow-[0_0_60px_rgba(255,59,48,0.6)]
      "
    >
      {/* Your icon goes here */}
      <span
        className="
          text-4xl
          transition-colors duration-300
          group-hover:text-white
        "
      >
        <MdCardGiftcard />
      </span>

      {/* Text */}
      <span className="flex flex-col leading-tight">
        <span className="text-2xl font-semibold">Promoție de Crăciun</span>
        <span className="text-base opacity-90 group-hover:opacity-100">
          Vezi detalii
        </span>
      </span>
    </Link>
  );
}
