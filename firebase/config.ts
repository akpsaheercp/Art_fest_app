import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
/* Added missing import for getStorage */
import { getStorage } from 'firebase/storage';

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6nKNvbM7bJ0Nnuedn7uWsk7eoYvnBReM",
  authDomain: "art-fest-manager-webapp.firebaseapp.com",
  projectId: "art-fest-manager-webapp",
  storageBucket: "art-fest-manager-webapp.appspot.com",
  messagingSenderId: "738302627377",
  appId: "1:738302627377:web:3cbc1cf11e58e39caecf10",
  measurementId: "G-P6MB15FMBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

/* Added storage initialization */
const storage = getStorage(app);

/* Added storage to exports */
export { app, db, auth, storage };