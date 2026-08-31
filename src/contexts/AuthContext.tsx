import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, logOut as firebaseLogOut } from '../lib/firebase';
import {
  signUpWithUsername,
  loginWithUsername,
  signInWithGooglePopup,
  completeGoogleUsernameSetup,
  sendPasswordReset,
  deleteUserAccount,
  getUserProfile,
  checkGoogleRedirectResult,
} from '../lib/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  pendingGoogleUser: User | null;
  isGoogleUsernameModalOpen: boolean;
  setPendingGoogleUser: (user: User | null) => void;
  setIsGoogleUsernameModalOpen: (open: boolean) => void;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ needsUsername: boolean }>;
  completeGoogleUsername: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (usernameOrEmail: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // For first-time Google sign-in modal
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [isGoogleUsernameModalOpen, setIsGoogleUsernameModalOpen] = useState(false);

  const fetchProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Failed to load user profile in AuthProvider:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check if coming back from a full-page Google redirect
    checkGoogleRedirectResult().then((res) => {
      if (res) {
        if (res.needsUsername) {
          setPendingGoogleUser(res.user);
          setIsGoogleUsernameModalOpen(true);
        } else if (res.profile) {
          setUser(res.user);
          setUserProfile(res.profile);
        }
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await fetchProfile(currentUser.uid);
        if (!profile || !profile.username) {
          // If logged in via Google but missing a username record, trigger username modal
          if (currentUser.providerData.some((p) => p.providerId === 'google.com')) {
            setPendingGoogleUser(currentUser);
            setIsGoogleUsernameModalOpen(true);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (username: string, email: string, password: string) => {
    const newUser = await signUpWithUsername(username, email, password);
    setUser(newUser);
    await fetchProfile(newUser.uid);
  };

  const login = async (username: string, password: string) => {
    const loggedInUser = await loginWithUsername(username, password);
    setUser(loggedInUser);
    await fetchProfile(loggedInUser.uid);
  };

  const loginWithGoogle = async (): Promise<{ needsUsername: boolean }> => {
    const result = await signInWithGooglePopup();
    if (result.needsUsername) {
      setPendingGoogleUser(result.user);
      setIsGoogleUsernameModalOpen(true);
      return { needsUsername: true };
    } else {
      setUser(result.user);
      setUserProfile(result.profile);
      return { needsUsername: false };
    }
  };

  const completeGoogleUsername = async (username: string) => {
    const targetUser = pendingGoogleUser || user;
    if (!targetUser) throw new Error('No Google account waiting for setup.');

    const profile = await completeGoogleUsernameSetup(targetUser, username);
    setUser(targetUser);
    setUserProfile(profile);
    setPendingGoogleUser(null);
    setIsGoogleUsernameModalOpen(false);
  };

  const logout = async () => {
    await firebaseLogOut();
    setUser(null);
    setUserProfile(null);
    setPendingGoogleUser(null);
    setIsGoogleUsernameModalOpen(false);
  };

  const resetPassword = async (usernameOrEmail: string) => {
    await sendPasswordReset(usernameOrEmail);
  };

  const deleteAccount = async () => {
    await deleteUserAccount();
    setUser(null);
    setUserProfile(null);
    setPendingGoogleUser(null);
    setIsGoogleUsernameModalOpen(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        pendingGoogleUser,
        isGoogleUsernameModalOpen,
        setPendingGoogleUser,
        setIsGoogleUsernameModalOpen,
        signup,
        login,
        loginWithGoogle,
        completeGoogleUsername,
        logout,
        resetPassword,
        deleteAccount,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
