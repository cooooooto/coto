import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack
  turbopack: {
    root: __dirname,
  },
  // Optimización de imágenes
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
