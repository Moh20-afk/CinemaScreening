import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-heading text-4xl">Page not found</h1>
      <p className="mt-3 text-muted-foreground">That film, cinema or page is not in Encore yet.</p>
      <Button asChild className="mt-6 rounded-full">
        <Link href="/">Back to Discover</Link>
      </Button>
    </div>
  );
}
