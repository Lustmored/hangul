import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts'
  }
});
