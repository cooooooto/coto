/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización de imágenes
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Optimizaciones de build
  swcMinify: true,

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Variables de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: false, // Temporalmente deshabilitado para evitar errores de critters
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
