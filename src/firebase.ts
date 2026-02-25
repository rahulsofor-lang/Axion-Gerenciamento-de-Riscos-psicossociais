import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRKIOBLNlqevgagShEIjFGah06s6-bixg",
  authDomain: "app-1-educa-mente.firebaseapp.com",
  projectId: "app-1-educa-mente",
  storageBucket: "app-1-educa-mente.firebasestorage.app",
  messagingSenderId: "907723628010",
  appId: "1:907723628010:web:805637dfd2218de831e693"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
