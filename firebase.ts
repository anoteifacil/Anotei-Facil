import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const googleProvider = new GoogleAuthProvider();