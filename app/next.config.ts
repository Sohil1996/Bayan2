import path from 'node:path';
import type { NextConfig } from 'next';

// @bayan/ui is linked from ../ui, so the build root is the repository root.
const root = path.join(import.meta.dirname, '..');

const config: NextConfig = {
  transpilePackages: ['@bayan/ui'],
  images: { unoptimized: true },
  turbopack: { root },
  outputFileTracingRoot: root,
};
export default config;
