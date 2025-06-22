import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  runTransaction
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

const params = new URLSearchParams(window.location.search);
const sessionName = params.get('name');
const validSession = /^[a-z]{8}$/.test(sessionName);
const counterPath = validSession ? `sessions/${sessionName}/count` : 'default/count';
const counterRef = ref(db, counterPath);

const countDisplay = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

incrementBtn.addEventListener('click', () => {
  runTransaction(counterRef, (currentValue) => (currentValue || 0) + 1);
});

decrementBtn.addEventListener('click', () => {
  runTransaction(counterRef, (currentValue) => (currentValue || 0) - 1);
});

onValue(counterRef, (snapshot) => {
  const value = snapshot.val();
  countDisplay.innerText = String(value ?? 0);
});
