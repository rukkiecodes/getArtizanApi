import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId } = process.env

const app = initializeApp({
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId
})

const auth = getAuth()
const db = getFirestore()

export { auth, db }