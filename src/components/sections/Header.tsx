import Link from "next/link";
import { RedriveLogoWhite } from "@/components/icons/RedriveLogoWhite";

export function Header() {
  return (
    <header className="absolute top-0 left-0 z-20 w-full px-6 py-8 lg:px-16">
      <Link href="/">
        <RedriveLogoWhite className="h-8 w-auto" />
      </Link>
    </header>
  );
}
