import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWA({
  // ✅ 1. Silencia o erro do Turbopack permitindo que ele rode sem configs extras
  turbopack: {}, 

  // 2. Configurações de Origem Permitida (VS Code Tunnel)
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'w0820tnw-3000.brs.devtunnels.ms', 
        '*.devtunnels.ms'
      ],
    },
  },

  // 3. Configurações de Imagens (Supabase)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
});