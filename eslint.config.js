// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Pages serves this repo at /harmonica-tools/. For local-only use set to '/'.
  base: '/harmonica-tools/',
});