/**
 * @fileoverview Configuración e inicialización de Firebase.
 * Exporta las instancias de la base de datos Firestore y la autenticación.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Inicializar el SDK de Firebase
const app = initializeApp({
  ...firebaseConfig,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey
});

/** 
 * Instancia de la base de datos Firestore.
 * @type {import('firebase/firestore').Firestore} 
 */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/** 
 * Instancia del servicio de autenticación de Firebase.
 * @type {import('firebase/auth').Auth} 
 */
export const auth = getAuth(app);
