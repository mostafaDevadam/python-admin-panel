import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '2000',  // Adjust if using a different port (e.g., 3001)
        pathname: '/static/**',  // Allows images from any path on localhost
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        //port: '6000',  // Adjust if using a different port (e.g., 3001) https://via.placeholder.com/40?text=J
       pathname: '/avatar/**',  // Allows images from any path on localhost
      },
    ],
  },
  /*i18n: {
    locales: ["en", "ar"],
    defaultLocale: "en",
  },*/

};

//const withNextIntl = createNextIntlPlugin('./app/i18n.ts'); // Adjust path if file is in root
//export default nextConfig;
//export default withNextIntl(nextConfig);

export default createNextIntlPlugin('./app/i18n/request.ts')(nextConfig);