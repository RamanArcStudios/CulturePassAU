import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const base = 'http://127.0.0.1:5000';

async function waitForServer() {
  for (let i = 0; i < 20; i += 1) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('server did not start in time');
}

async function run() {
  const proc = spawn('npm', ['run', 'server:dev'], { stdio: 'ignore', shell: true });
  try {
    await waitForServer();

    // Flow 1: saved -> event detail -> ticket create -> tickets list -> community/profile
    const events = await (await fetch(`${base}/api/events`)).json();
    const event = events[0];
    assert.ok(event?.id);

    const eventDetail = await fetch(`${base}/api/events/${event.id}`);
    assert.equal(eventDetail.ok, true);

    const users = await (await fetch(`${base}/api/users`)).json();
    const userId = users[0].id;

    const createTicketRes = await fetch(`${base}/api/tickets`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, eventId: event.id, quantity: 1, totalPriceCents: 2500 }),
    });
    assert.equal(createTicketRes.status, 201);
    const createdTicket = await createTicketRes.json();

    const ticketsRes = await fetch(`${base}/api/tickets/${userId}`);
    assert.equal(ticketsRes.ok, true);

    const communities = await (await fetch(`${base}/api/communities`)).json();
    const community = communities[0];
    assert.ok(community?.id);
    const communityRes = await fetch(`${base}/api/communities/${community.id}`);
    assert.equal(communityRes.ok, true);

    // Flow 2: scanner -> CPID lookup -> user profile
    const cpid = users[0].culturePassId;
    const lookupRes = await fetch(`${base}/api/cpid/lookup/${encodeURIComponent(cpid)}`);
    assert.equal(lookupRes.ok, true);
    const lookup = await lookupRes.json();
    const userRes = await fetch(`${base}/api/users/${lookup.targetId}`);
    assert.equal(userRes.ok, true);

    // Flow 3: scan ticket once and verify duplicate blocked
    const scanOk = await fetch(`${base}/api/tickets/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticketCode: createdTicket.ticketCode, scannedBy: 'qa-gate' }),
    });
    assert.equal(scanOk.ok, true);

    const scanDupe = await fetch(`${base}/api/tickets/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticketCode: createdTicket.ticketCode, scannedBy: 'qa-gate' }),
    });
    assert.equal(scanDupe.ok, false);

    console.log('e2e critical smoke checks passed');
  } finally {
    proc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
