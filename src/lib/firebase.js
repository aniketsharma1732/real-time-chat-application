import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-c36fb.firebaseapp.com",
  projectId: "reactchat-c36fb",
  storageBucket: "reactchat-c36fb.firebasestorage.app",
  messagingSenderId: "797681833049",
  appId: "1:797681833049:web:699d7e675cf8ac2149cd48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()