import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "media.themoviedb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "regalcdn.azureedge.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.cineworld.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.myvue.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "system.spektrix.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tickets.homemcr.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms-assets.webediamovies.pro",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "all.web.img.acsta.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stockportplaza.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "central.lightcinemas.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stockport.thelight.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "indy-systems.imgix.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
