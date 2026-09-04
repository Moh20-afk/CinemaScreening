"use client";

import { useState } from "react";
import Image from "next/image";

import { getPosterUrl } from "@/lib/tmdb";
import type { Film } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FilmPoster({
  film,
  className,
  size = "md",
}: {
  film: Film;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const imageSize = size === "sm" ? "w185" : size === "lg" ? "w780" : "w342";
  const src = film.posterUrl || getPosterUrl(film.id, imageSize);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]",
        size === "sm" && "aspect-2/3 w-16",
        size === "md" && "aspect-2/3 w-full",
        size === "lg" && "aspect-2/3 w-full max-w-[13rem] sm:max-w-xs",
        className,
      )}
      style={
        showImage
          ? undefined
          : {
              background: `linear-gradient(160deg, ${film.posterPalette.from} 0%, ${film.posterPalette.to} 100%)`,
            }
      }
    >
      {showImage ? (
        <Image
          src={src!}
          alt={`${film.title} (${film.releaseYear}) poster`}
          fill
          sizes={
            size === "sm"
              ? "80px"
              : size === "lg"
                ? "(max-width: 640px) 208px, 320px"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-3 bottom-3">
            <p
              className="font-heading text-[0.7rem] leading-tight font-medium tracking-wide sm:text-sm"
              style={{ color: film.posterPalette.accent }}
            >
              {film.title}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.18em] text-white/70 uppercase">
              {film.releaseYear}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
