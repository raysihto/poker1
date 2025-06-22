// ✅ Firebase モジュール読み込み
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ✅ Firebase プロジェクト構成（あなたの値）
const firebaseConfig = {
  apiKey: "AIzaSyCHtuRXDVOkUD7rrEmZcAUHyZFYkgyB1tI",
  authDomain: "poker1-86356.firebaseapp.com",
  databaseURL: "https://poker1-86356-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poker1-86356",
  storageBucket: "poker1-86356.firebasestorage.app",
  messagingSenderId: "761576027268",
  appId: "1:761576027268:web:fc4af1219d45e0c63c3ed1"
};

// ✅ Firebase 初期化
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const countRef = ref(db, 'count/value');

// ✅ DOM操作
const countDisplay = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

// Increment
incrementBtn.addEventListener('click', () => {
  runTransaction(countRef, (currentValue) => {
    return (currentValue || 0) + 1;
  });
});

// Decrement
decrementBtn.addEventListener('click', () => {
  runTransaction(countRef, (currentValue) => {
    return (currentValue || 0) - 1;
  });
});

// DB → UI 更新
onValue(countRef, (snapshot) => {
  const value = snapshot.val();
  countDisplay.innerText = String(value ?? 0);
});
