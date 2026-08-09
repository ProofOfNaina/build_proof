// End-to-end check of the BuildProof wallet-signature auth.
// Simulates what Petra does: signs "APTOS\nmessage: ...\nnonce: ..." with Ed25519.
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

const BASE = 'http://127.0.0.1:3000';
let pass = 0;
let fail = 0;

function check(name, ok, detail = '') {
  if (ok) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function fullMessageFor(message, nonce) {
  return `APTOS\nmessage: ${message}\nnonce: ${nonce}`;
}

function signSession(account, { walletOverride, timestamp } = {}) {
  const wallet = walletOverride ?? account.accountAddress.toStringLong();
  const message = JSON.stringify({
    domain: 'buildproof.session',
    wallet,
    timestamp: timestamp ?? Date.now(),
  });
  const nonce = Math.random().toString(16).slice(2) + Date.now().toString(16);
  const fullMessage = fullMessageFor(message, nonce);
  const signature = account.sign(new TextEncoder().encode(fullMessage));

  return {
    wallet,
    publicKey: account.publicKey.toString(),
    signature: signature.toString(),
    message,
    fullMessage,
    nonce,
  };
}

async function post(path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function get(path, headers = {}) {
  const res = await fetch(BASE + path, { headers });
  return { status: res.status, body: await res.json().catch(() => null) };
}

const alice = Account.generate();
const bob = Account.generate();
const aliceAddr = alice.accountAddress.toStringLong();
const bobAddr = bob.accountAddress.toStringLong();

console.log('\n--- session issuance ---');

const good = await post('/api/session', signSession(alice));
check('valid signature issues a token', good.status === 200 && !!good.body?.token, JSON.stringify(good.body));
const aliceAuth = { Authorization: `Bearer ${good.body?.token}` };

const bobSession = await post('/api/session', signSession(bob));
const bobAuth = { Authorization: `Bearer ${bobSession.body?.token}` };
check('second wallet issues a token', bobSession.status === 200 && !!bobSession.body?.token);

const tampered = signSession(alice);
tampered.signature = tampered.signature.slice(0, -2) + (tampered.signature.endsWith('00') ? '11' : '00');
const bad = await post('/api/session', tampered);
check('tampered signature rejected', bad.status === 401, `status ${bad.status}`);

const wrongWallet = signSession(alice, { walletOverride: bobAddr });
const impersonation = await post('/api/session', wrongWallet);
check('signing for another wallet rejected', impersonation.status === 401 || impersonation.status === 403, `status ${impersonation.status}`);

const stale = await post('/api/session', signSession(alice, { timestamp: Date.now() - 10 * 60 * 1000 }));
check('expired signature rejected', stale.status === 401, `status ${stale.status}`);

const replayEnvelope = signSession(alice);
const firstUse = await post('/api/session', replayEnvelope);
const replay = await post('/api/session', replayEnvelope);
check('replayed signature rejected', firstUse.status === 200 && replay.status === 401, `first ${firstUse.status}, replay ${replay.status}`);

console.log('\n--- posts ---');

const anonPost = await post('/api/posts', { author: aliceAddr, content: 'anonymous' });
check('unauthenticated post rejected', anonPost.status === 401, `status ${anonPost.status}`);

const forged = await post('/api/posts', { author: bobAddr, content: 'forged' }, aliceAuth);
check('posting as another wallet rejected', forged.status === 403, `status ${forged.status}`);

const realPost = await post('/api/posts', { author: aliceAddr, content: 'hello from alice' }, aliceAuth);
check('authenticated post accepted', realPost.status === 200 && realPost.body?.author === aliceAddr, JSON.stringify(realPost.body));

const emptyPost = await post('/api/posts', { author: aliceAddr, content: '   ' }, aliceAuth);
check('empty post rejected', emptyPost.status === 400, `status ${emptyPost.status}`);

const badUrl = await post('/api/posts', { author: aliceAddr, content: 'x', mediaUrl: 'javascript:alert(1)' }, aliceAuth);
check('javascript: media URL rejected', badUrl.status === 400, `status ${badUrl.status}`);

console.log('\n--- profiles ---');

const anonProfile = await post('/api/users', { wallet: aliceAddr, name: 'Mallory' });
check('unauthenticated profile write rejected', anonProfile.status === 401, `status ${anonProfile.status}`);

const hijack = await post('/api/users', { wallet: bobAddr, name: 'Owned by Alice' }, aliceAuth);
check("overwriting another wallet's profile rejected", hijack.status === 403, `status ${hijack.status}`);

const ownProfile = await post('/api/users', { wallet: aliceAddr, name: 'Alice', bio: 'builder' }, aliceAuth);
check('own profile write accepted', ownProfile.status === 200 && ownProfile.body?.name === 'Alice', JSON.stringify(ownProfile.body));

const readProfile = await get(`/api/users/${aliceAddr}`);
check('profile readable by address', readProfile.status === 200 && readProfile.body?.name === 'Alice');

const longName = await post('/api/users', { wallet: aliceAddr, name: 'x'.repeat(500) }, aliceAuth);
check('over-long name rejected', longName.status === 400, `status ${longName.status}`);

console.log('\n--- messages ---');

const sent = await post('/api/messages', { sender: aliceAddr, receiver: bobAddr, text: 'private note' }, aliceAuth);
check('authenticated message accepted', sent.status === 200, JSON.stringify(sent.body));

const anonRead = await get(`/api/messages?user1=${aliceAddr}&user2=${bobAddr}`);
check('unauthenticated conversation read rejected', anonRead.status === 401, `status ${anonRead.status}`);

const participantRead = await get(`/api/messages?user1=${aliceAddr}&user2=${bobAddr}`, bobAuth);
check('participant can read conversation', participantRead.status === 200 && participantRead.body?.length === 1, JSON.stringify(participantRead.body));

const eve = Account.generate();
const eveSession = await post('/api/session', signSession(eve));
const eveAuth = { Authorization: `Bearer ${eveSession.body?.token}` };
const snoop = await get(`/api/messages?user1=${aliceAddr}&user2=${bobAddr}`, eveAuth);
check('outsider cannot read conversation', snoop.status === 403, `status ${snoop.status}`);

const spoofSender = await post('/api/messages', { sender: aliceAddr, receiver: bobAddr, text: 'spoofed' }, eveAuth);
check('sending as another wallet rejected', spoofSender.status === 403, `status ${spoofSender.status}`);

console.log('\n--- jobs ---');

const anonJob = await post('/api/jobs', { title: 'x', company: 'y', description: 'z', location: 'Remote' });
check('unauthenticated job post rejected', anonJob.status === 401, `status ${anonJob.status}`);

const job = await post('/api/jobs', { title: 'Engineer', company: 'BuildProof', description: 'Build', location: 'Remote' }, aliceAuth);
check('authenticated job post accepted', job.status === 200 && job.body?.postedBy === aliceAddr, JSON.stringify(job.body));

const missingField = await post('/api/jobs', { title: 'Engineer' }, aliceAuth);
check('job missing required fields rejected', missingField.status === 400, `status ${missingField.status}`);

console.log('\n--- bad tokens ---');
const badToken = await post('/api/posts', { author: aliceAddr, content: 'x' }, { Authorization: 'Bearer deadbeef' });
check('unknown bearer token rejected', badToken.status === 401, `status ${badToken.status}`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
