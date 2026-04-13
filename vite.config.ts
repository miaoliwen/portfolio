import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    // 开启 CSS 压缩与代码混淆，优化移动端网络加载体积
    cssMinify: true,
    minify: 'esbuild',
    // 移动端兼容性目标
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    rollupOptions: {
      output: {
        // 拆分厂商代码，提高移动端缓存命中率
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['motion/react'],
          ui: ['lucide-react']
        },
      },
    },
  },
});
