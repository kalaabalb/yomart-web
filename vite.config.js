import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolveStorefrontTarget } from './tooling/build_target.mjs';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode === 'local' ? 'development' : mode, process.cwd(), ''), ...process.env };
  const target = resolveStorefrontTarget(env);
  return {
    plugins: [react()],
    // Denylist inputs are build-time checks only; expose only the public API,
    // site, and build-mode values required by the client runtime.
    define: { __YOMART_DEPLOYMENT__: JSON.stringify({
      buildEnv: target.buildEnv,
      apiOrigin: target.apiOrigin,
      siteOrigin: target.siteOrigin,
    }) },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/react-router/') || id.includes('/node_modules/react-router-dom/')) {
              return 'router-vendor';
            }
          },
        },
      },
    },
    server: { port: 5173, strictPort: true },
  };
});
