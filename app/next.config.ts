import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@bayan/ui'],
  images: { unoptimized: true },
};
export default config;
