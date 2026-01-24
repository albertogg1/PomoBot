// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  limit as fsLimit,
  Timestamp,
  where,
} from 'firebase/firestore'

/* ------------------------------------------------------------------ */
/* Firebase initialization                                            */
/* ------------------------------------------------------------------ */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

/* ------------------------------------------------------------------ */
/* Providers                                                          */
/* ------------------------------------------------------------------ */

const googleProvider = new GoogleAuthProvider()
const appleProvider = new OAuthProvider('apple.com')

/* ------------------------------------------------------------------ */
/* Auth helpers                                                       */
/* ------------------------------------------------------------------ */

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (err) {
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
      return signInWithRedirect(auth, googleProvider)
    }
    throw err
  }
}

export async function signInWithApple() {
  try {
    return await signInWithPopup(auth, appleProvider)
  } catch (err) {
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
      return signInWithRedirect(auth, appleProvider)
    }
    throw err
  }
}

/**
 * Call ONCE on app startup.
 * If login was via redirect, the user will be returned here.
 */
export async function handleRedirectResult() {
  try {
    return await getRedirectResult(auth)
  } catch (err) {
    throw err
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user)
  })
}

export async function signOutUser() {
  return signOut(auth)
}

/* ------------------------------------------------------------------ */
/* Email / password                                                   */
/* ------------------------------------------------------------------ */

export async function createUserWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

/* ------------------------------------------------------------------ */
/* User preferences                                                   */
/* ------------------------------------------------------------------ */

export async function saveUserPreferences(uid, prefs) {
  const ref = doc(db, 'users', uid)
  await setDoc(
    ref,
    {
      preferences: prefs,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function loadUserPreferences(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data().preferences ?? null
}

/* ------------------------------------------------------------------ */
/* Study sessions                                                     */
/* ------------------------------------------------------------------ */

export async function saveStudySession(uid, session) {
  const col = collection(db, 'users', uid, 'sessions')

  const payload = {
    type: session.type ?? 'work',
    duration: session.duration ?? 0,
    note: session.note ?? null,
    rating: session.rating ?? null,
    completedAt: session.completedAt
      ? Timestamp.fromDate(new Date(session.completedAt))
      : null,
    createdAt: session.createdAt
      ? Timestamp.fromDate(new Date(session.createdAt))
      : serverTimestamp(),
    meta: session.meta ?? null,
  }

  const docRef = await addDoc(col, payload)
  return docRef.id
}

export async function fetchUserSessions(uid, limit = 50) {
  const col = collection(db, 'users', uid, 'sessions')
  const q = query(
    col,
    orderBy('createdAt', 'desc'),
    fsLimit(limit)
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function fetchUserSessionsByMonth(uid, year, month) {
  const col = collection(db, 'users', uid, 'sessions')
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)
  
  const q = query(
    col,
    where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
    where('createdAt', '<=', Timestamp.fromDate(endOfMonth)),
    orderBy('createdAt', 'desc')
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/* ------------------------------------------------------------------ */

export { auth }
