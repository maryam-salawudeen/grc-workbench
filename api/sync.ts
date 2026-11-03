// Stores one encrypted sync bundle per sync code. The browser encrypts the bundle
// with a key derived from the code before upload, so this function only ever sees
// ciphertext and a hash of the code. No accounts, no readable data.
import { BlobPreconditionFailedError, del, get, put } from '@vercel/blob';

const MAX_BYTES = 3_000_000;
/** Intermediaries can mark ETags as weak (W/"…"); the blob store only matches the strong form. */
const strong = (etag: string | null) => etag?.replace(/^W\//, '') ?? null;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

function pathFor(request: Request) {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  return /^[0-9a-f]{64}$/.test(id) ? `sync/${id}.bin` : null;
}

export async function GET(request: Request) {
  const path = pathFor(request);
  if (!path) return json({ error: 'Invalid sync id' }, 400);
  const blob = await get(path, { access: 'private', useCache: false });
  if (!blob || blob.statusCode !== 200) return json({ error: 'Nothing synced yet' }, 404);
  return new Response(blob.stream, { headers: { 'content-type': 'application/octet-stream', etag: strong(blob.blob.etag)!, 'cache-control': 'no-store' } });
}

export async function PUT(request: Request) {
  const path = pathFor(request);
  if (!path) return json({ error: 'Invalid sync id' }, 400);
  const body = Buffer.from(await request.arrayBuffer());
  if (!body.length || body.length > MAX_BYTES) return json({ error: 'Sync data is empty or too large' }, 413);
  // If-Match carries the version this device last saw, so two devices cannot silently overwrite each other.
  const ifMatch = strong(request.headers.get('if-match'));
  try {
    const result = await put(path, body, {
      access: 'private',
      contentType: 'application/octet-stream',
      addRandomSuffix: false,
      ...(ifMatch ? { ifMatch } : { allowOverwrite: false }),
    });
    return json({ etag: strong(result.etag) });
  } catch (e) {
    if (e instanceof BlobPreconditionFailedError || (e instanceof Error && /already exists/i.test(e.message))) {
      return json({ error: 'Changed on another device' }, 409);
    }
    console.error(e);
    return json({ error: 'Could not save sync data' }, 502);
  }
}

export async function DELETE(request: Request) {
  const path = pathFor(request);
  if (!path) return json({ error: 'Invalid sync id' }, 400);
  await del(path);
  return json({ ok: true });
}
