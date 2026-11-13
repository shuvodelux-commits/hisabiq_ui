/**
 * MOD-005 disposable cash lifecycle UI (test-only server).
 *
 * Must never be used with a retained demo, production, or another worker's DB.
 * Serves a mounted React test harness and proxies only the explicit QA endpoints.
 * The account is an actual isolated Nest tenant; nothing is mocked.
 *
 * MOD005_LIFECYCLE_CONFIRM=hisabiq_mod005_lifecycle_425 \
 * node scripts/mod005-lifecycle-manual-server.cjs
 */
const { createServer } = require('vite');
if (process.env.MOD005_LIFECYCLE_CONFIRM !== 'hisabiq_mod005_lifecycle_425') {
  throw new Error('Explicit disposable MOD-005 lifecycle confirmation is required');
}
if (process.env.MOD005_LIFECYCLE_API_URL !== 'http://127.0.0.1:3071') {
  throw new Error('Only isolated Nest API at 127.0.0.1:3071 is accepted');
}
const apiBase = process.env.MOD005_LIFECYCLE_API_URL;
const allowedAuth = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/login/pin',
]);
const cashPostPattern = /^\/api\/v1\/money\/day\/(?:start|[0-7][0-9A-HJKMNP-TV-Z]{25}\/(?:close|reopen))$/;
const html = `<!doctype html><html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HisabIQ — Disposable Cash Lifecycle QA</title>
<style>
body{font:14px system-ui;background:#f8fafc;color:#0f172a;margin:0}
section{margin:18px 0;padding:16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}
label{display:block;margin:10px 0}
input{margin:5px;max-width:290px;padding:7px;border:1px solid #94a3b8;border-radius:5px}
button{margin:5px;padding:9px 13px;border:1px solid #94a3b8;border-radius:6px;background:#ecfeff;cursor:pointer}
button:disabled{opacity:.4;cursor:not-allowed}
h1{font-size:22px}h2{font-size:17px}
</style></head><body><div id="root"></div>
<script type="module">
import RefreshRuntime from "/@react-refresh";
RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};
window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;
</script>
<script type="module" src="/tests/mod005LifecycleManualHarness.tsx"></script>
</body></html>`;
const guard = {
  name: 'mod005-lifecycle-disposable-restricted-api',
  enforce: 'pre',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = new URL(req.url || '/', 'http://127.0.0.1').pathname;
      if (path === '/' || path === '/__mod005_lifecycle') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(html);
        return;
      }
      if (path.startsWith('/api/v1/')) {
        const method = (req.method || 'GET').toUpperCase();
        if (['GET', 'HEAD', 'OPTIONS'].includes(method) ||
            (method === 'POST' && (allowedAuth.has(path) || cashPostPattern.test(path)))) {
          next(); return;
        }
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: {
          code: 'QA_ENDPOINT_NOT_IN_SCOPE',
          message: 'Only authentication and cash-day lifecycle actions are allowed here',
        } }));
        return;
      }
      next();
    });
  },
};
(async () => {
  const live = await createServer({
    server: {
      host: '127.0.0.1', port: 5189, strictPort: true, hmr: false,
      proxy: { '/api/v1': { target: apiBase, changeOrigin: true } },
    },
    logLevel: 'warn', plugins: [guard],
  });
  await live.listen();
  console.log('MOD005_DISPOSABLE_LIFECYCLE_URL=http://127.0.0.1:5189/__mod005_lifecycle');
})().catch(error => { console.error(error); process.exitCode = 1; });
