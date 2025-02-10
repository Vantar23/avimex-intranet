import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "avimexintranet.com" }],
      destination: "https://avimexintranet.com:3000/:path*",
      permanent: true,
    },
  ],
};
  

export default nextConfig;  