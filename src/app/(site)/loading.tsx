// Shown instantly on navigation while a dynamic page (e.g. filtered /sarees)
// is fetched, so a tap never looks like it did nothing.
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 sm:py-10" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-44 rounded-md bg-ivory animate-shimmer" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] rounded-xl bg-ivory animate-shimmer" />
            <div className="mt-2 h-4 w-3/4 rounded bg-ivory animate-shimmer" />
            <div className="mt-1.5 h-4 w-1/3 rounded bg-ivory animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
