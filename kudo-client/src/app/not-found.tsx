import Link from "next/link";

export default function Component() {
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl animate-bounce">
            404
          </h1>
          <p className="text-stone-500">
            Looks like you&apos;ve ventured into the unknown digital realm.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-stone-900 px-8 text-sm font-medium text-stone-50 shadow transition-colors hover:bg-stone-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-50/90 dark:focus-visible:ring-stone-300"
          prefetch={false}
        >
          Return to website
        </Link>
      </div>
    </div>
  );
}
