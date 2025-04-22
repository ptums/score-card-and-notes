import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  buildExcludes: [
    // skip Next's dynamic CSS manifest which isn't present in Pages Router
    /_next\/dynamic-css-manifest\.json$/,
  ],
})({
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
      });
    }

    return config;
  },
}) as NextConfig;

export default nextConfig;
