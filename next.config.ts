import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// "Website only" hosting: on Vercel without a permanent database, forms are
// switched off (submissions could not be kept). Adding DATABASE_URL and
// redeploying switches them back on automatically.
const formsOffline = process.env.VERCEL && !process.env.DATABASE_URL?.trim() ? "1" : "";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_FORMS_OFFLINE: formsOffline },
  // PGlite ships WASM and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite", "pg", "bcryptjs"],
  poweredByHeader: false,
  // The server applies ./drizzle migrations on start, so ship them with every function (needed on Vercel).
  outputFileTracingIncludes: {
    "/": ["./drizzle/**/*", "./node_modules/@electric-sql/pglite/dist/**/*"],
    "/**/*": ["./drizzle/**/*", "./node_modules/@electric-sql/pglite/dist/**/*"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Retired pages: Innovation Hub became Career Talks; Academy, Resources and Services were
  // removed from the site (page files kept so they can be restored later).
  async redirects() {
    return [
      { source: "/innovation", destination: "/career-talks", permanent: false },
      { source: "/academy", destination: "/programs", permanent: false },
      { source: "/services", destination: "/", permanent: false },
      { source: "/resources", destination: "/", permanent: false },
      { source: "/resources/:slug", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
