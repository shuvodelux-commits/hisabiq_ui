/**
 * TEST-ONLY proxy: forward one real POST to the actual upstream, wait for a
 * successful upstream response, then destroy the HTTP connection to the client.
 * No financial API mock or reply is returned. Loopback-only, one-shot.
 */
const { createServer } = require('node:http');

async function createLostAckProxy({ target, matchPath }) {
  const upstream = new URL(target);
  if (!['127.0.0.1', 'localhost'].includes(upstream.hostname) ||
      upstream.protocol !== 'http:' || upstream.pathname !== '/' ||
      !/^\/api\/v1\/money\/day\/(?:start|[0-7][0-9A-HJKMNP-TV-Z]{25}\/(?:close|reopen))$/.test(matchPath)) {
    throw new Error('Lost ACK proxy is restricted to localhost cash-session actions');
  }
  let resolveCommit, rejectCommit, received = false;
  const waitCommitted = new Promise((resolve, reject) => {
    resolveCommit = resolve; rejectCommit = reject;
  });
  // Prevent a premature failed upstream from turning into an unhandled reject.
  waitCommitted.catch(() => {});
  const server = createServer(async (req, res) => {
    if (received || req.method !== 'POST' || req.url !== matchPath) {
      res.writeHead(404); res.end(); return;
    }
    received = true;
    try {
      const pieces = [];
      for await (const part of req) pieces.push(part);
      const result = await fetch(upstream.origin + matchPath, {
        method: 'POST', redirect: 'error',
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
          ...(req.headers['idempotency-key']
            ? { 'Idempotency-Key': req.headers['idempotency-key'] } : {}),
        },
        body: Buffer.concat(pieces),
      });
      const data = await result.text();
      if (!result.ok) throw new Error('Real Nest returned HTTP ' + result.status);
      resolveCommit({ status: result.status, data });
      // The server has committed; intentionally lose the acknowledgement.
      req.socket.destroy();
    } catch (error) {
      rejectCommit(error);
      if (!res.headersSent && !res.destroyed) {
        res.writeHead(502); res.end();
      }
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {
    endpoint: 'http://127.0.0.1:' + server.address().port,
    waitCommitted,
    close: () => new Promise((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())),
  };
}
module.exports = { createLostAckProxy };
