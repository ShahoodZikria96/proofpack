import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Every page here reads live local case data, so there's nothing worth
   * statically caching — the classic dynamic-rendering model is a better
   * fit than Cache Components' Suspense-everywhere requirement. */
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
