// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; //  Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyBmTN1xYEu3eebJ-1dsSkTZvT7Ud2RkudA",
  authDomain: "pruebacrudiker.firebaseapp.com",
  databaseURL: "https://pruebacrudiker-default-rtdb.firebaseio.com",
  projectId: "pruebacrudiker",
  storageBucket: "pruebacrudiker.firebasestorage.app",
  messagingSenderId: "445387690464",
  appId: "1:445387690464:web:4bcf5b25b041b61ac69b85"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
// Exporta la base de datos
export const db = getDatabase(app);
