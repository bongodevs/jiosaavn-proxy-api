import { handle } from '@hono/node-server/vercel';
import gateway from '../src/app';

export default handle(gateway);
