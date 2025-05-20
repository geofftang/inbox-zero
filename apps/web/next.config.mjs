import { fileURLToPath } from "node:url";
// Sentry import removed
import { withAxiom } from "next-axiom";
import nextMdx from "@next/mdx";
import { createJiti } from "jiti";
import withSerwistInit from "@serwist/next";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files :)
const { env } = await jiti.import("./env");

const withMDX = nextMdx();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    craCompression: false,
  },
  telemetry: { 
    disable: true 
  },
  // Remove Sentry from external packages
  serverExternalPackages: [],
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "ph-avatars.imgix.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.getinboxzero.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/automation",
        has: [
          {
            type: "cookie",
            key: "__Secure-authjs.session-token",
          },
        ],
        permanent: false,
      },
      {
        source: "/",
        destination: "/setup",
        has: [
          {
            type: "cookie",
            key: "__Secure-authjs.session-token.0",
          },
        ],
        permanent: false,
      },
      {
        source: "/",
        destination: "/setup",
        has: [
          {
            type: "cookie",
            key: "__Secure-authjs.session-token.1",
          },
        ],
        permanent: false,
      },
      {
        source: "/",
        destination: "/setup",
        has: [
          {
            type: "cookie",
            key: "__Secure-authjs.session-token.2",
          },
        ],
        permanent: false,
      },
      {
        source: "/feature-requests",
        destination: "https://inboxzero.featurebase.app",
        permanent: true,
      },
      {
        source: "/feedback",
        destination: "https://inboxzero.featurebase.app",
        permanent: true,
      },
      {
        source: "/roadmap",
        destination: "https://inboxzero.featurebase.app/roadmap",
        permanent: true,
      },
      {
        source: "/changelog",
        destination: "https://inboxzero.featurebase.app/changelog",
        permanent: true,
      },
      {
        source: "/twitter",
        destination: "https://twitter.com/inboxzero_ai",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/elie222/inbox-zero",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/UnBwsydrug",
        permanent: true,
      },
      {
        source: "/linkedin",
        destination: "https://www.linkedin.com/company/inbox-zero-ai/",
        permanent: true,
      },
      {
        source: "/waitlist",
        destination: "https://airtable.com/shr7HNx6FXaIxR5q6",
        permanent: true,
      },
      {
        source: "/waitlist-other",
        destination: "https://airtable.com/applHl6PVBOa0Q8gD/pagRqrxRK1TChsAMp/form",
        permanent: false,
      },
      {
        source: "/affiliates",
        destination: "https://inboxzero.lemonsqueezy.com/affiliates",
        permanent: true,
      },
      {
        source: "/newsletters",
        destination: "/bulk-unsubscribe",
        permanent: false,
      },
      {
        source: "/request-access",
        destination: "/early-access",
        permanent: true,
      },
      {
        source: "/reply-tracker",
        destination: "/reply-zero",
        permanent: false,
      },
      {
        source: "/game",
        destination: "https://email-blaster.vercel.app/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/:path*",
        destination: "https://app.posthog.com/:path*",
      },
      {
        source: "/vendor/lemon/affiliate.js",
        destination: "https://lmsqueezy.com/affiliate.js",
      },
    ];
  },
  // Security headers: https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps#8-securing-your-application
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js needs these
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              // Needed for Tailwind/Shadcn
              "style-src 'self' 'unsafe-inline' https:",
              // Add this line to allow data: fonts
              "font-src 'self' data: https:",
              // For images including avatars
              "img-src 'self' data: https: blob:",
              // If you use web workers or service workers
              "worker-src 'self' blob:",
              // For API calls, SWR, external services
              "connect-src 'self' https: wss:",
              // iframes
              "frame-src 'self' https:",
              // Prevent embedding in iframes
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: env.NEXT_PUBLIC_BASE_URL,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'",
          },
        ],
      },
    ];
  },
};

const mdxConfig = withMDX(nextConfig);

// Sentry configuration removed
const exportConfig = mdxConfig;

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: env.NODE_ENV !== "production",
});

export default withAxiom(withSerwist(exportConfig));
