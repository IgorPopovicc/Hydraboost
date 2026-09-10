import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const data = { fullName: 'Ana Anić', phone: '+381 65 3698376', email: 'ana@example.com', location: 'Vračar', message: 'Želim da proverim termin.', website: '' };

test('real PHP HTTP endpoint: acceptance, email envelope, failure, validation and limits', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hydraboost-contact-http-'));
  const child = spawn('php', ['-S', '127.0.0.1:8082', 'tests/contact/router.php'], {
    env: { ...process.env, CONTACT_TEST_STATE_DIR: directory }, stdio: 'ignore',
  });
  let spawnError;
  child.on('error', error => spawnError = error);
  try {
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (spawnError) throw spawnError;
      try { await fetch('http://127.0.0.1:8082/'); ready = true; break; } catch { await delay(100); }
    }
    assert.ok(ready, 'PHP server ready');
    const headers = { Origin: 'http://127.0.0.1:4000', 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() };
    const send = (body, extra = {}) => fetch('http://127.0.0.1:8082/api/contact', { method: 'POST', headers: { ...headers, ...extra }, body: typeof body === 'string' ? body : JSON.stringify(body) });
    const accepted = await send(data);
    assert.equal(accepted.status, 200);
    assert.deepEqual(await accepted.json(), { ok: true, status: 'accepted' });
    assert.equal(accepted.headers.get('cache-control'), 'no-store');
    assert.equal(accepted.headers.get('x-robots-tag'), 'noindex, nofollow');
    const captured = JSON.parse(await readFile(join(directory, 'captured.json')));
    assert.deepEqual(captured.email.to, ['info@hydraboost-infuzije.rs']);
    assert.equal(captured.email.reply_to, data.email);
    assert.equal(captured.idempotency, headers['Idempotency-Key']);
    const failure = await send({ ...data, message: 'SIMULATE_PROVIDER_FAILURE' });
    assert.equal(failure.status, 502);
    assert.deepEqual(await failure.json(), { ok: false });
    assert.equal((await send({ ...data, website: 'spam' })).status, 422);
    assert.equal((await send('{broken')).status, 422);
    assert.equal((await send(data, { Origin: 'https://evil.invalid' })).status, 403);
    assert.equal((await send('x'.repeat(16385))).status, 413);
    assert.equal((await fetch('http://127.0.0.1:8082/api/contact')).status, 405);
    await send(data); await send(data); await send(data);
    assert.equal((await send(data)).status, 429);
  } finally {
    child.kill('SIGTERM');
    await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
