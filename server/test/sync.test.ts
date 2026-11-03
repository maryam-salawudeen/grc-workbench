import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSyncCode, normaliseCode, openBundle, sealBundle, syncId, type SyncBundle } from '../../web/src/local/syncCrypto.ts';

const bundle: SyncBundle = { v: 1, savedAt: 1_793_700_000_000, workspaces: { demo: 'AAEC', clinic: 'AwQF' }, local: { 'grc-lab-access-review': '{"submitted":[0]}' } };

test('sync codes are 24 unambiguous characters and are accepted however they are typed', () => {
  const code = newSyncCode();
  assert.match(code, /^([A-HJ-NP-Z2-9]{4}-){5}[A-HJ-NP-Z2-9]{4}$/);
  assert.equal(normaliseCode(code.toLowerCase().replaceAll('-', ' ')), code);
  assert.equal(normaliseCode('too-short'), null);
  assert.equal(normaliseCode('O0O0-I1I1-O0O0-I1I1-O0O0-I1I1'), null, 'confusable characters are not in the alphabet');
  assert.notEqual(newSyncCode(), code);
});

test('the storage id is a one-way hash: stable, 64 hex characters, different per code', async () => {
  const a = newSyncCode();
  assert.match(await syncId(a), /^[0-9a-f]{64}$/);
  assert.equal(await syncId(a), await syncId(a));
  assert.notEqual(await syncId(a), await syncId(newSyncCode()));
});

test('bundles round-trip with the right code and fail with any other', async () => {
  const code = newSyncCode();
  const sealed = await sealBundle(code, bundle);
  assert.ok(!new TextDecoder().decode(sealed).includes('grc-lab'), 'nothing readable in the stored bytes');
  assert.deepEqual(await openBundle(code, sealed), bundle);
  await assert.rejects(openBundle(newSyncCode(), sealed));
  const tampered = sealed.slice();
  tampered[tampered.length - 1] ^= 1;
  await assert.rejects(openBundle(code, tampered), 'tampering is detected');
});
