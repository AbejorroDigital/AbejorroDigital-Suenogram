/**
 * @fileoverview Componente de botón para la autenticación de usuarios.
 * Maneja el inicio y cierre de sesión utilizando Firebase Auth con Google como proveedor.
 */

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

/**
 * Renderiza el botón de autenticación.
 * Cambia su estado visual dependiendo de si el usuario ha iniciado sesión o no.
 * 
 * @returns {JSX.Element} El botón de iniciar o cerrar sesión.
 */
export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Inicia el proceso de autenticación mostrando un popup de Google.
   */
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in", error);
      alert(`Error de autenticación: ${error.message || 'El popup se cerró antes de completar el inicio de sesión'}`);
    }
  };

  /**
   * Cierra la sesión activa del usuario.
   */
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (user) {
    return (
      <button 
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-sm transition-colors border border-white/10"
        title="Cerrar sesión"
      >
        <img src={user.photoURL || ''} alt="Avatar" className="w-5 h-5 rounded-full" />
        <span className="hidden sm:inline-block max-w-[100px] truncate">{user.displayName}</span>
        <LogOut className="w-4 h-4 ml-1" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleSignIn}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-sm transition-colors border border-purple-400/30"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline-block">Iniciar sesión</span>
    </button>
  );
}
