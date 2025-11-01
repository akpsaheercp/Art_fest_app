
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAz-YbUdo-WXWyYiw9Ugpc8f0OdPIawzLw",
  authDomain: "artfestapp-73579784-1cee7.firebaseapp.com",
  projectId: "artfestapp-73579784-1cee7",
  storageBucket: "artfestapp-73579784-1cee7.firebasestorage.app",
  messagingSenderId: "363032200328",
  appId: "1:363032200328:web:2ff32d8456a2efe5a9cb3d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
