// Firebase config — replace with your project's firebaseConfig
// Get from: Firebase Console → Project Settings → Your apps → SDK setup

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Replace with actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCJj6jdvk9Do0uuZLKO3IM7MdirzD6cdIQ",
  authDomain: "dianaxv-ddc70.firebaseapp.com",
  projectId: "dianaxv-ddc70",
  storageBucket: "dianaxv-ddc70.firebasestorage.app",
  messagingSenderId: "987822167250",
  appId: "1:987822167250:web:e49c3567ac8273ec80890b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
