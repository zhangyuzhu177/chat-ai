import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  images: {
    // ✅ 允许加载的外部图片域名
    domains: ['avatars.githubusercontent.com'],
  },
};

export default nextConfig;
