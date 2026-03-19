import type { User as FirebaseUser } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  runTransaction,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";

export type UserProfile = {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt?: Timestamp;
  lastActiveAt?: Timestamp;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
};

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export async function reserveUsername(usernameRaw: string, uid: string) {
  const username = normalizeUsername(usernameRaw);
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error("Username must be 3-20 chars: letters, numbers, underscore.");
  }

  const usernameRef = doc(db, "usernames", username);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(usernameRef);
    if (snap.exists() && snap.data()?.uid !== uid) {
      throw new Error("Username already taken.");
    }
    tx.set(usernameRef, { uid, username, updatedAt: serverTimestamp() }, { merge: true });
  });

  return username;
}

export async function ensureUserProfile(fbUser: FirebaseUser) {
  const uid = fbUser.uid;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  const email = fbUser.email ?? "";
  const fallbackUsername = email ? normalizeUsername(email.split("@")[0]!) : uid.slice(0, 10);

  if (!snap.exists()) {
    const username = await reserveUsername(fallbackUsername, uid);
    const profile: UserProfile = {
      uid,
      displayName: fbUser.displayName ?? "",
      username,
      email,
      photoURL: fbUser.photoURL ?? "",
      bio: "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    };

    await setDoc(
      userRef,
      {
        ...profile,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  await updateDoc(userRef, { lastActiveAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), { ...patch, updatedAt: serverTimestamp() });
}

