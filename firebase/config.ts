import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWi2h0F7cY3KnoocvemDlm2OU4WG0jrZo",
  authDomain: "artfestmanager.firebaseapp.com",
  projectId: "artfestmanager",
  storageBucket: "artfestmanager.firebasestorage.app",
  messagingSenderId: "798281589566",
  appId: "1:798281589566:web:a4e9195c9a5c767c81426f",
  measurementId: "G-Z8HHZNFPGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize storage
const storage = getStorage(app);

export { app, db, auth, storage };