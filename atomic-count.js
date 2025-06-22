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
  limitToFirst
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyCHtuRXDVOkUD7rrEmZcAUHyZFYkgyB1tI",
  authDomain: "poker1-86356.firebaseapp.com",
  databaseURL: "https://poker1-86356-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poker1-86356",
  storageBucket: "poker1-86356.firebasestorage.app",
  messagingSenderId: "761576027268",
  appId: "1:761576027268:web:fc4af1219d45e0c63c3ed1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function getSessionName() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  return /^[a-z]{8}$/.test(name) ? name : '__DEFAULT_SESSION__';
}

const sessionName = getSessionName();
const counterRef = ref(db, `sessions/${sessionName}/count`);
const accessRef = ref(db, `sessions/${sessionName}/lastAccessed`);

function updateLastAccessed() {
  set(accessRef, Date.now());
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
const STALE_THRESHOLD = 3 * 60 * 60 * 1000;

function cleanupStaleSessions() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const sessionsQuery = query(ref(db, 'sessions'), orderByChild('lastAccessed'), limitToFirst(10));
  get(sessionsQuery).then((snapshot) => {
    snapshot.forEach((child) => {
      const session = child.val();
      const last = session?.lastAccessed;
      if (typeof last === 'number' && now - last > STALE_THRESHOLD) {
        remove(ref(db, `sessions/${child.key}`));
      }
    });
  });
}

onValue(counterRef, (snapshot) => {
  const value = snapshot.val();
  countDisplay.innerText = String(value ?? 0);
  setTimeout(() => cleanupStaleSessions(), 0);
});
