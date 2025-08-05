
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only on the client side
const analytics = (async () => {
    if (typeof window !== 'undefined') {
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
})();


export { app, analytics, auth, db, storage };
