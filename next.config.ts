import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    // Category slugs became canonical per docs/DATA_MODEL.md. These keep any
    // link published against the pre-contract spellings working.
    return [
      {
        source: "/businesses/e-commerce",
        destination: "/businesses/ecommerce",
        permanent: true,
      },
      {
        source: "/businesses/local-business",
        destination: "/businesses/local",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
