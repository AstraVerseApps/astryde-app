// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// We are not using auth for now
// import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCThrk3C5Kd4zhIVTGyIMUk1UvrpC4QUwg",
  authDomain: "astryde-app-b9181.firebaseapp.com",
  projectId: "astryde-app-b9181",
  storageBucket: "astryde-app-b9181.firebasestorage.app",
  messagingSenderId: "359769473756",
  appId: "1:359769473756:web:aa0f578417ad3a91b8aa19",
  measurementId: "G-P20S6FJ1F0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const auth = getAuth(app);
const db = getFirestore(app);

export { app, db };
