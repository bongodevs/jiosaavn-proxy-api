import { handle } from '@hono/node-server/vercel';
import gateway from '../src/app.js';

export default handle(gateway);
