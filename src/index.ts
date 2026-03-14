import gateway from './app';

const serverPort = parseInt(process.env.PORT || '3000', 10);

console.log(`\n🚀 JioSaavn Proxy - Local Development`);
console.log(`📡 URL: http://localhost:${serverPort}`);
console.log(`📝 Engine: Hono + Bun\n`);

export default {
  port: serverPort,
  fetch: gateway.fetch,
};
