import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["three"],
  // Packages with Cloudflare Workers (workerd) specific code
  serverExternalPackages: ["jose", "pg-cloudflare", "sharp", "drizzle-kit"],
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
