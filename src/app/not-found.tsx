import Link from "next/link";
import { Logo, LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-accent-50 px-4 py-16">
      <div className="max-w-md text-center">
        <Link href="/" aria-label="MindsNova Hub home" className="inline-block"><Logo /></Link>
        <LogoMark className="mx-auto mt-12 size-20 opacity-90" />
        <p className="mt-6 font-display text-6xl font-extrabold text-brand">404</p>
        <h1 className="mt-2 text-2xl font-extrabold">We could not find that page.</h1>
        <p className="mt-3 text-muted">It may have moved, or the link may be incorrect.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Go to the homepage</Link>
          <Link href="/programs" className="btn-outline">Explore programs</Link>
        </div>
      </div>
    </main>
  );
}
