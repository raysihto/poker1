const NONCE = 'poker1-room.';
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const RE_CROCKFORD = new RegExp(`^[${CROCKFORD}]{16}$`);

function * b32encodeCrockford(bytes) {
  let x = 0, n = 0;
  for (let i = 0; i < bytes.length; i++) {
    x = (x << 8) | bytes[i]; n += 8;
    while (n >= 5) yield CROCKFORD[(x >>> (n -= 5)) & 31];
  }
  if (n > 0) yield CROCKFORD[(x << (5 - n)) & 31];
}

async function generateRoomId() {
  const bytes = new TextEncoder().encode(NONCE + Date.now());
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...b32encodeCrockford(digest.slice(0, 10))].join('');
}

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  set,
  get,
  remove,
  query,
  orderByChild,
  limitToFirst,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCHtuRXDVOkUD7rrEmZcAUHyZFYkgyB1tI',
  authDomain: 'poker1-86356.firebaseapp.com',
  databaseURL: 'https://poker1-86356-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'poker1-86356',
  storageBucket: 'poker1-86356.firebasestorage.app',
  messagingSenderId: '761576027268',
  appId: '1:761576027268:web:fc4af1219d45e0c63c3ed1'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const STALE_THRESHOLD = 3 * 60 * 60 * 1000;

function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

async function generateUnusedRoomId(maxAttempts = 5, baseDelay = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    if (i !== 0) {
      await sleep(baseDelay << (i - 1));
    }
    const id = await generateRoomId();
    const accessRef = ref(db, `rooms/${id}/lastAccessed`);
    const snap = await get(accessRef);
    if (!snap.exists()) {
      return id;
    }
  }
  return null;
}

async function isValidRoom(roomId) {
  if (!RE_CROCKFORD.test(roomId)) return false;
  const accessRef = ref(db, `rooms/${roomId}/lastAccessed`);
  const snapshot = await get(accessRef);
  const lastAccessed = snapshot.val();
  return (typeof lastAccessed === 'number') && (Date.now() <= lastAccessed + STALE_THRESHOLD);
}

const params = new URLSearchParams(window.location.search);
const roomId = params.get('room');

if (!(await isValidRoom(roomId))) {
  const newRoomId = await generateUnusedRoomId();
  if (newRoomId === null) {
    alert("Failed to create a new room. The page will reload and try again.");
    location.reload();
    throw new Error("Unreachable code executed.");
  }
  await set(ref(db, `rooms/${newRoomId}/lastAccessed`), serverTimestamp());
  location.replace(`${location.pathname}?room=${newRoomId}`);
  throw new Error("Unreachable code executed.");
}

const counterRef = ref(db, `rooms/${roomId}/count`);
const accessRef = ref(db, `rooms/${roomId}/lastAccessed`);

function updateLastAccessed() {
  set(accessRef, serverTimestamp());
}

updateLastAccessed();

const countDisplay = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

incrementBtn.addEventListener('click', () => {
  runTransaction(counterRef, (currentValue) => (currentValue || 0) + 1);
  updateLastAccessed();
});

decrementBtn.addEventListener('click', () => {
  runTransaction(counterRef, (currentValue) => (currentValue || 0) - 1);
  updateLastAccessed();
});

let lastCleanup = 0;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Lightweight room cleanup scans only the 10 oldest rooms by lastAccessed,
// minimizing client overhead and database reads. This is generally sufficient:
//   - assuming evenly distributed access, room creation and expiration occur at similar rates.
//   - Even if many rooms accumulate, the 3-minute cleanup interval ensures expired rooms are
//     gradually purged—especially during sustained activity—without needing full traversal.
function cleanupStaleRooms() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const roomsQuery = query(ref(db, 'rooms'), orderByChild('lastAccessed'), limitToFirst(10));
  get(roomsQuery).then((snapshot) => {
    snapshot.forEach((child) => {
      const room = child.val();
      const last = room?.lastAccessed;
      if (typeof last === 'number' && now - last > STALE_THRESHOLD) {
        remove(ref(db, `rooms/${child.key}`));
      }
    });
  });
}

onValue(counterRef, (snapshot) => {
  const value = snapshot.val();
  countDisplay.innerText = String(value ?? 0);
  setTimeout(() => cleanupStaleRooms(), 0);
});
