import type { NextConfig } from "next";
import withPWA from "next-pwa";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import runtimeCaching from "next-pwa/cache";

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
  buildExcludes: [
    // skip Next's dynamic CSS manifest which isn't present in Pages Router
    /_next\/dynamic-css-manifest\.json$/,
    /_next\/static\/chunks\/.*$/,
    /_next\/static\/css\/.*$/,
    /_next\/static\/media\/.*$/,
    /_next\/static\/.*$/,
    /dynamic-css-manifest.json/,
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
