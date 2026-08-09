import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Lets a build write somewhere other than `.next`. Running `next build` against
  // the default directory while `next dev` is serving corrupts the dev server's
  // output — chunks 404 and the browser reports an opaque "[object Event]".
  // `npm run build:check` sets this so a verification build is safe to run.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // A stray lockfile in the parent directory makes Next infer the wrong workspace
  // root, which matters because `standalone` traces its output from that root.
  outputFileTracingRoot: process.cwd(),
  transpilePackages: [
    '@shelby-protocol/sdk',
    '@shelby-protocol/react',
    '@aptos-labs/wallet-adapter-react',
    '@aptos-labs/ts-sdk',
    'petra-plugin-wallet-adapter'
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shelby-protocol/sdk/browser': path.resolve(process.cwd(), 'node_modules/@shelby-protocol/sdk/dist/browser/index.mjs'),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
