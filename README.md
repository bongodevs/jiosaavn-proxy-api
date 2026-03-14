# JioSaavn API Proxy

A high-performance TypeScript proxy server for JioSaavn API requests, powered by [Bun](https://bun.sh) and [Hono](https://hono.dev).

This forwards all queries, handles CORS naturally, masks headers (like `User-Agent` and `Referer`), and pipes native `fetch` responses safely with minimal overhead to the official JioSaavn API. You can use this proxy server to bypass geo-restrictions or use a custom domain.

## Setup

Make sure you have [Bun](https://bun.sh/) installed.

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the proxy server for development (with hot-reload):
   ```bash
   bun run dev
   ```

3. Run in production mode:
   ```bash
   bun run start
   ```

## Configuration

By default, the server runs on port `3000`. You can change this by setting the `PORT` environment variable:
```bash
PORT=8080 bun run start
```

## Vercel Deployment

This project natively supports Vercel and is strictly configured to deploy to the **Mumbai (`bom1`)** region in the `vercel.json` file. 

To deploy:
1. Ensure the Vercel CLI is installed (`npm i -g vercel`).
2. Run `vercel` inside this directory to link the project.
3. Run `vercel --prod` to deploy it.

All API routes are cleanly managed and rewritten through the `api/index.ts` serverless function. Usage remains identical to local deployment.

## Usage

Once running, the proxy seamlessly exposes the API at its root. You can point your application to:
```
http://localhost:3000
```

All query parameters are directly forwarded. For example:
```
http://localhost:3000/?__call=search.getResults&api_version=4&_format=json&q=test
```
or 
```
https://your-vercel-domain-name.vercel.app/?__call=search.getResults&api_version=4&_format=json&q=test
```
This routes standard queries directly to official domains maintaining parameters:
```
https://www.jiosaavn.com/api.php?__call=search.getResults&api_version=4&_format=json&q=test
```
