import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __NVIDEO_API_URL__: JSON.stringify(process.env.NVIDEO_API_URL),
  },
});
