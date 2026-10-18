import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disabled: Cache Components hangs Workers requests, since its internal
  // setTimeout() usage is incompatible with the Workers runtime's
  // implementation. Both pages are client components with no caching need.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
