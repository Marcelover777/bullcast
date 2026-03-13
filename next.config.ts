import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config vazia — silencia o warning "webpack config sem turbopack config".
  // postcss.config.mjs declara @tailwindcss/postcss e Turbopack o lê automaticamente.
  turbopack: {},

  // Webpack config — ativo apenas quando --webpack flag é usada (dev:webpack).
  // Filesystem cache e lazyCompilation são gerenciados pelo Next.js internamente.
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      // Vendor chunk splitting — isola libs pesadas para cache independente.
      // Cada grupo gera um chunk separado que o webpack cacheia individualmente,
      // evitando recompilar Three.js/GSAP inteiros a cada mudança de código.
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: "vendor-three",
              chunks: "all",
              priority: 30,
            },
            gsap: {
              test: /[\\/]node_modules[\\/](gsap|@gsap)[\\/]/,
              name: "vendor-gsap",
              chunks: "all",
              priority: 25,
            },
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-|victory-)[\\/]/,
              name: "vendor-charts",
              chunks: "all",
              priority: 20,
            },
            framer: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: "vendor-framer",
              chunks: "all",
              priority: 15,
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
