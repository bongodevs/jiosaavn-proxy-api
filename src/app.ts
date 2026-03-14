import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const TARGET_BASE = 'https://www.jiosaavn.com/api.php';
const FALLBACK_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';

const BANNED_INBOUND_HEADERS = ['host', 'origin', 'referer'];
const STRIPPED_OUTBOUND_HEADERS = ['content-encoding', 'transfer-encoding', 'content-length'];

function buildNetworkQuery(reqUrl: string): string {
  const parsed = new URL(reqUrl);
  const parameters = parsed.searchParams.toString();
  return parameters ? `${TARGET_BASE}?${parameters}` : TARGET_BASE;
}

function normalizeUpstreamHeaders(incoming: Headers): Headers {
  const proxyHeaders = new Headers();
  
  proxyHeaders.set('User-Agent', incoming.get('user-agent') || FALLBACK_AGENT);
  proxyHeaders.set('Accept', 'application/json');
  proxyHeaders.set('Accept-Language', 'en-US,en;q=0.9');
  proxyHeaders.set('Referer', 'https://www.jiosaavn.com/');
  proxyHeaders.set('Origin', 'https://www.jiosaavn.com');

  incoming.forEach((value, key) => {
    if (!BANNED_INBOUND_HEADERS.includes(key.toLowerCase()) && !proxyHeaders.has(key)) {
      proxyHeaders.set(key, value);
    }
  });

  return proxyHeaders;
}

function processRemotePayload(remoteResponse: Response): Response {
  const secureHeaders = new Headers(remoteResponse.headers);
  
  for (const h of STRIPPED_OUTBOUND_HEADERS) {
    secureHeaders.delete(h);
  }

  return new Response(remoteResponse.body, {
    status: remoteResponse.status,
    statusText: remoteResponse.statusText,
    headers: secureHeaders,
  });
}

const traceLogger = logger((text: string, ...rest: string[]) => {
  console.log(`[PROXY-TRACE] ${text}`, ...rest);
});

const gateway = new Hono();

gateway.use('*', cors());
gateway.use('*', traceLogger);

gateway.onError((error, ctx) => {
  console.error(`[PROXY-FAULT] Request crashed:`, error);
  return ctx.json({ 
    fault: 'network_failure', 
    reason: error.message 
  }, 500);
});

gateway.get('/', async (ctx) => {
  const remoteEndpoint = buildNetworkQuery(ctx.req.url);
  const forgedHeaders = normalizeUpstreamHeaders(new Headers(ctx.req.raw.headers));

  const rawNetworkCall = await fetch(remoteEndpoint, {
    method: 'GET',
    headers: forgedHeaders,
  });

  return processRemotePayload(rawNetworkCall);
});

export default gateway;
