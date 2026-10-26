import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-400">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">This route is not published in the current content registry.</p>
      <Link href="/" className="mt-8 inline-block rounded border border-line bg-panel px-4 py-2 text-sm text-slate-200 transition-colors hover:border-amber-400/40 hover:text-amber-300">Back to home</Link>
    </div>
  );
}
