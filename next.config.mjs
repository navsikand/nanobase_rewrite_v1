/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nanobase.org",
        // port: '',
        // pathname: '',
      },
    ],
  },
};

export default nextConfig;
