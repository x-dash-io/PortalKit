import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NEXTAUTH_SECRET = 'test-secret-for-portalkit';
process.env.MONGODB_URI = 'mongodb://localhost:27017/portalkit-test';

const { createPortalSession, verifyPortalSession } = await import('../src/lib/portalAuth');

test('portal sessions round-trip with email and project id', async () => {
  const session = await createPortalSession('client@example.com', 'project_123');
  const payload = await verifyPortalSession(session);

  assert.ok(payload);
  assert.equal(payload?.clientEmail, 'client@example.com');
  assert.equal(payload?.projectId, 'project_123');
});

test('invalid portal sessions fail verification', async () => {
  const payload = await verifyPortalSession('not-a-valid-token');
  assert.equal(payload, null);
});
