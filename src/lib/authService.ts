import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, UsernameRecord } from '../types';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Normalizes username to lowercase and trimmed for case-insensitive uniqueness.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/**
 * Check if a username is valid in format and not already taken.
 */
export async function checkUsernameAvailable(username: string): Promise<{
  available: boolean;
  error?: string;
}> {
  const clean = normalizeUsername(username);

  if (!clean) {
    return { available: false, error: 'Username is required.' };
  }

  if (!USERNAME_REGEX.test(clean)) {
    return {
      available: false,
      error: 'Username must be 3-20 characters (letters, numbers, and underscores only).',
    };
  }

  try {
    const usernameDocRef = doc(db, 'usernames', clean);
    const snap = await getDoc(usernameDocRef);
    if (snap.exists()) {
      return { available: false, error: 'Username is already taken.' };
    }
    return { available: true };
  } catch (err: any) {
    console.error('Error checking username availability:', err);
    return { available: false, error: 'Could not verify username at this moment.' };
  }
}

/**
 * Looks up registered email from the username index document.
 */
export async function lookupEmailByUsername(username: string): Promise<string | null> {
  const clean = normalizeUsername(username);
  if (!clean) return null;

  try {
    const docRef = doc(db, 'usernames', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UsernameRecord;
      return data.email || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to lookup username email:', error);
    return null;
  }
}

/**
 * Fetch the UserProfile for a given UID.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Register a new user with Unique Username + Email + Password.
 */
export async function signUpWithUsername(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const clean = normalizeUsername(username);
  const cleanEmail = email.trim().toLowerCase();

  // 1. Verify username format
  if (!USERNAME_REGEX.test(clean)) {
    throw new Error('Username must be 3-20 characters containing letters, numbers, or underscores.');
  }

  // 2. Pre-check username availability
  const isAvailable = await checkUsernameAvailable(clean);
  if (!isAvailable.available) {
    throw new Error(isAvailable.error || 'Username is already taken.');
  }

  // 3. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  try {
    // 4. Update display name
    await updateProfile(user, { displayName: username.trim() });

    // 5. Reserve username in 'usernames' collection
    const usernameDocRef = doc(db, 'usernames', clean);
    await setDoc(usernameDocRef, {
      uid: user.uid,
      email: cleanEmail,
      createdAt: Date.now(),
    });

    // 6. Create user profile in 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    const profile: UserProfile = {
      uid: user.uid,
      username: clean,
      email: cleanEmail,
      displayName: username.trim(),
      photoURL: user.photoURL || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(userDocRef, profile);

    return user;
  } catch (err: any) {
    console.error('Failed to complete profile creation after auth:', err);
    throw new Error('Failed to set up account profile. Please contact support.');
  }
}

/**
 * Login using Username + Password.
 * Resolves username to email via Firestore, then signs in.
 */
export async function loginWithUsername(username: string, password: string): Promise<User> {
  const clean = normalizeUsername(username);
  if (!clean || !password) {
    throw new Error('Please enter both username and password.');
  }

  // 1. Resolve email
  const resolvedEmail = await lookupEmailByUsername(clean);
  if (!resolvedEmail) {
    // Return generic error message for security
    throw new Error('Invalid username or password.');
  }

  try {
    // 2. Sign in with resolved email
    const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Invalid username or password.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.');
    }
    throw new Error(error.message || 'Failed to log in. Please check your credentials.');
  }
}

/**
 * Check if the current app is running inside an iframe.
 */
export function isAppInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

/**
 * Google Sign In flow.
 * Checks if user has a configured username profile.
 * Falls back to redirect if popup is blocked by browser/iframe.
 */
export async function signInWithGooglePopup(): Promise<{
  user: User;
  needsUsername: boolean;
  profile: UserProfile | null;
}> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Check if profile exists with username
    const existingProfile = await getUserProfile(user.uid);
    if (existingProfile && existingProfile.username) {
      return {
        user,
        needsUsername: false,
        profile: existingProfile,
      };
    }

    return {
      user,
      needsUsername: true,
      profile: null,
    };
  } catch (error: any) {
    console.error('Google Sign-In Popup error:', error);
    
    // If popup was blocked by browser or iframe sandbox
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      // If we are in top window, we can trigger signInWithRedirect automatically
      if (!isAppInIframe()) {
        console.log('Popup blocked in top window, attempting signInWithRedirect...');
        await signInWithRedirect(auth, googleProvider);
        // Will redirect away, execution halts
        return new Promise(() => {});
      } else {
        throw new Error('Popups are blocked by the preview window or browser. Please open the app in a new browser tab to sign in with Google.');
      }
    }
    
    throw error;
  }
}

/**
 * Explicit Google Sign In via full page redirect.
 */
export async function signInWithGoogleRedirectFlow(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Process any pending redirect auth result upon page load.
 */
export async function checkGoogleRedirectResult(): Promise<{
  user: User;
  needsUsername: boolean;
  profile: UserProfile | null;
} | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) return null;

    const user = result.user;
    const existingProfile = await getUserProfile(user.uid);
    if (existingProfile && existingProfile.username) {
      return {
        user,
        needsUsername: false,
        profile: existingProfile,
      };
    }

    return {
      user,
      needsUsername: true,
      profile: null,
    };
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
}

/**
 * Complete Google Sign-In with a chosen username.
 */
export async function completeGoogleUsernameSetup(
  user: User,
  chosenUsername: string
): Promise<UserProfile> {
  const clean = normalizeUsername(chosenUsername);

  if (!USERNAME_REGEX.test(clean)) {
    throw new Error('Username must be 3-20 alphanumeric characters or underscores.');
  }

  // Verify availability
  const check = await checkUsernameAvailable(clean);
  if (!check.available) {
    throw new Error(check.error || 'This username is already taken.');
  }

  const cleanEmail = (user.email || '').toLowerCase();

  // Create username reservation
  const usernameDocRef = doc(db, 'usernames', clean);
  await setDoc(usernameDocRef, {
    uid: user.uid,
    email: cleanEmail,
    createdAt: Date.now(),
  });

  // Create user profile
  const userDocRef = doc(db, 'users', user.uid);
  const profile: UserProfile = {
    uid: user.uid,
    username: clean,
    email: cleanEmail,
    displayName: user.displayName || chosenUsername,
    photoURL: user.photoURL || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await setDoc(userDocRef, profile);

  return profile;
}

/**
 * Send password reset email either by username or email.
 */
export async function sendPasswordReset(identifier: string): Promise<void> {
  const clean = identifier.trim();
  if (!clean) {
    throw new Error('Please provide your username or registered email.');
  }

  let targetEmail = clean;
  if (!clean.includes('@')) {
    // It is a username, look it up
    const resolved = await lookupEmailByUsername(clean);
    if (!resolved) {
      // Don't leak whether username exists or not, but return clean message
      throw new Error('If an account is associated with this username, a reset link will be sent.');
    }
    targetEmail = resolved;
  }

  await sendPasswordResetEmail(auth, targetEmail);
}

/**
 * Delete user account and cleanup associated Firestore data.
 */
export async function deleteUserAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in.');

  const profile = await getUserProfile(user.uid);

  // 1. Delete username mapping
  if (profile?.username) {
    try {
      await deleteDoc(doc(db, 'usernames', profile.username));
    } catch (e) {
      console.warn('Failed to delete username record:', e);
    }
  }

  // 2. Delete user document
  try {
    await deleteDoc(doc(db, 'users', user.uid));
  } catch (e) {
    console.warn('Failed to delete user profile doc:', e);
  }

  // 3. Delete Firebase Auth user
  await deleteUser(user);
}
