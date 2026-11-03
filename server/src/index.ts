import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { dirname, join } from 'node:path';
import { createApp } from './app.ts';
import { workspaceRoutes } from './practice.ts';
import { nodeWorkspaces } from './workspaces-node.ts';
import { checkSite } from './sitecheck.ts';

// The demo lives in DB_PATH; each practice scenario gets its own file next to it.
const dbFile = process.env.DB_PATH ?? fileURLToPath(new URL('../../data/grc.db', import.meta.url));
const workspaces = nodeWorkspaces(dbFile, join(dirname(dbFile), 'practice'));

const app = createApp(workspaces.db, { extend: workspaceRoutes(workspaces), runSiteCheck: checkSite });

// In production the API also serves the built React app.
const webDist = fileURLToPath(new URL('../../web/dist', import.meta.url));
if (existsSync(webDist)) {
  app.use('/*', serveStatic({ root: webDist }));
  app.get('*', serveStatic({ root: webDist, path: 'index.html' }));
}

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, () => console.log(`GRC API listening on http://localhost:${port}`));
