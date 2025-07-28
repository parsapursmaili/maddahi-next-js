// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // بخش remotePatterns برای امنیت همچنان لازم است
    remotePatterns: [
      {
        protocol: "https",
        hostname: "besooyeto.ir",
        port: "",
        pathname: "/maddahi/wp-content/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
  },

  // بخش redirects شما بدون تغییر باقی می‌ماند
  async redirects() {
    return [
      {
        source:
          "/maddahi/%D9%85%D8%AD%D9%85%D8%AF-%D8%A7%D8%B3%D8%AF%D8%A7%D9%84%D9%84%D9%87%DB%8C",
        destination: "/maddahi/category/محمد-اسداللهی",
        permanent: true,
      },
      {
        source:
          "/maddahi/%D8%AD%D8%B3%DB%8C%D9%86-%D8%B3%D8%AA%D9%88%D8%AF%D9%87",
        destination: "/maddahi/category/حسین-ستوده",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
