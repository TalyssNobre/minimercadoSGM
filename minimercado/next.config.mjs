/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'x7js9kvl-3000.brs.devtunnels.ms', // 🟢 O seu link exato que o VS Code gerou
        '*.devtunnels.ms'                  // 🟢 O curinga (caso o link mude amanhã)
      ],
    },
  },
};

export default nextConfig;
