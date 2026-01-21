import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore'

// IMPORTANT: provide your Firebase config values via Vite env variables.
// Create a Firebase project, enable Auth providers (Google, Apple) and Firestore.
// Add these to a .env file at project root (Vite uses VITE_ prefix):
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app
try {
  app = initializeApp(firebaseConfig)
} catch (e) {
  // initialization errors will surface if config is missing; keep app undefined
  app = null
}

const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null

const googleProvider = new GoogleAuthProvider()
const appleProvider = new OAuthProvider('apple.com')

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not initialized')
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithApple() {
  if (!auth) throw new Error('Firebase not initialized')
  // Make sure you have enabled Apple in Firebase console and configured
  // the Service ID and redirect URL in Apple Developer console.
  return signInWithPopup(auth, appleProvider)
}

export async function createUserWithEmail(email, password) {
  if (!auth) throw new Error('Firebase not initialized')
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase not initialized')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  if (!auth) return
  return signOut(auth)
}

export function onAuthChange(callback) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export async function saveUserPreferences(uid, prefs) {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { preferences: prefs, updatedAt: new Date().toISOString() }, { merge: true })
}

export async function loadUserPreferences(uid) {
  if (!db) return null
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return data.preferences ?? null
}

// Sessions: save a study session under users/{uid}/sessions
export async function saveStudySession(uid, session) {
  if (!db) throw new Error('Firestore not initialized')
  const col = collection(db, 'users', uid, 'sessions')
  const payload = {
    type: session.type || 'work',
    duration: session.duration || 0,
    note: session.note || null,
    rating: session.rating || null,
    completedAt: session.completedAt || null,
    // allow passing a createdAt (Date or ISO string) for test data; otherwise use serverTimestamp()
    createdAt: session.createdAt ? (session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt)) : serverTimestamp(),
    meta: session.meta || null,
  }
  const docRef = await addDoc(col, payload)
  return docRef.id
}

export async function fetchUserSessions(uid, limit = 50) {
  if (!db) throw new Error('Firestore not initialized')
  const col = collection(db, 'users', uid, 'sessions')
  const q = query(col, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items = []
  snap.forEach((d) => {
    items.push({ id: d.id, ...d.data() })
  })
  return items.slice(0, limit)
}

export { auth }
