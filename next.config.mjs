/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.nanobase.org",
        // port: '',
        // pathname: '',
      },
      {
        protocol: "http",
        hostname: "localhost",
        // port: '',
        // pathname: '',
      },
    ],
  },
};

export default nextConfig;
