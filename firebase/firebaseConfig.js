import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAAFfxtQGbKkb480p9H5nrcfnEOL0trgJA",
  authDomain: "guiasense-9de16.firebaseapp.com",
  projectId: "guiasense-9de16",
  storageBucket: "guiasense-9de16.firebasestorage.app",
  messagingSenderId: "106882005904",
  appId: "1:106882005904:web:ad3613ac9fe6ab36ebd115",
  measurementId: "G-L0JB23RNB4"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;