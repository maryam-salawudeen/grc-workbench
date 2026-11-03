// Vercel function for the hosted build: the browser cannot read other sites'
// headers or certificates, so this one step runs on the server. It stores nothing.
import { checkSite, SiteCheckError } from '../server/src/sitecheck.ts';

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export async function POST(request: Request) {
  let url: unknown;
  try {
    url = (await request.json())?.url;
  } catch {
    return json({ error: 'Send JSON with a "url" field.' }, 400);
  }
  if (typeof url !== 'string' || !url.trim() || url.length > 500) return json({ error: 'Enter a website address.' }, 400);
  try {
    return json(await checkSite(url));
  } catch (e) {
    if (e instanceof SiteCheckError) return json({ error: e.message }, 400);
    console.error(e);
    return json({ error: 'The website could not be checked. Try again in a minute.' }, 502);
  }
}
