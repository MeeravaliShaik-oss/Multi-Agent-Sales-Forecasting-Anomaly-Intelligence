import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '../services/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isFirebaseUser?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogleAccount: () => Promise<boolean>;
  signInWithCredentials: (email: string, name?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  signInWithGoogleAccount: async () => false,
  signInWithCredentials: () => {},
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Store Manager',
          photoURL: currentUser.photoURL,
          isFirebaseUser: true
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogleAccount = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Store Manager',
          photoURL: fbUser.photoURL,
          isFirebaseUser: true
        });
        return true;
      } else {
        setAuthError('Google sign-in popup was closed or blocked by the browser. You can try again or sign in below with your email.');
        return false;
      }
    } catch {
      setAuthError('Unable to complete Google popup sign-in in this window. Please use email sign-in below.');
      return false;
    }
  };

  const signInWithCredentials = (email: string, name?: string) => {
    setAuthError(null);
    const cleanEmail = email.trim() || 'manager@superstore.com';
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0] || 'Store Manager';
    setUser({
      uid: `mgr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: null,
      isFirebaseUser: false
    });
  };

  const handleSignOut = async () => {
    setAuthError(null);
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        signInWithGoogleAccount,
        signInWithCredentials,
        signOut: handleSignOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
