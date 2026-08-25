import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZ1B9TcUFCZsrgROafo8vPZir7N-bpqws",
  authDomain: "real-estate-76537.firebaseapp.com",
  projectId: "real-estate-76537",
  storageBucket: "real-estate-76537.firebasestorage.app",
  messagingSenderId: "943671421296",
  appId: "1:943671421296:web:af753f3f5811217850c7b5",
  measurementId: "G-WPZCLDFB2Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "properties"), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log("No properties found!");
    return;
  }
  const firstDoc = snapshot.docs[0];
  await updateDoc(doc(db, "properties", firstDoc.id), {
    floorPlan: "/images/kk.jpg"
  });
  console.log(`Updated property ${firstDoc.id} with floorPlan: /images/kk.jpg`);
  process.exit(0);
}

run().catch(console.error);
