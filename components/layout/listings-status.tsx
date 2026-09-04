import { Skeleton } from "@/components/ui/skeleton";

export function FilmGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl bg-card ring-1 ring-white/8">
          <Skeleton className="aspect-2/3 w-full rounded-none" />
          <div className="space-y-2 p-3 sm:p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListingsStatus({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading live cinema listings…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-destructive">
        Live listings could not be loaded. Check your connection and try again.
      </p>
    );
  }
  return null;
}
