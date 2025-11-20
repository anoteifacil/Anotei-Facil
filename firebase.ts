import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeUf_cMfm_4-LfyLy9Bwfo2ipvNZMf-jI",
  authDomain: "anoteifacil-8c889.firebaseapp.com",
  projectId: "anoteifacil-8c889",
  storageBucket: "anoteifacil-8c889.firebasestorage.app",
  messagingSenderId: "145417523698",
  appId: "1:145417523698:web:1c26c6f6bf5b0786addb6b",
  measurementId: "G-BSQHMTDJVT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log("Persistence failed: Multiple tabs open");
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log("Persistence failed: Browser not supported");
    }
});

export const googleProvider = new GoogleAuthProvider();