import { db } from "@/firebase";
import {
  doc,
  serverTimestamp,
  writeBatch,
  increment,
  getDoc,
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

export async function followUser(sourceUid: string, targetUid: string) {
  if (!sourceUid || !targetUid || sourceUid === targetUid) return;

  const followingRef = doc(db, "follows", sourceUid, "following", targetUid);
  const followerRef = doc(db, "follows", targetUid, "followers", sourceUid);
  const sourceUserRef = doc(db, "users", sourceUid);
  const targetUserRef = doc(db, "users", targetUid);

  const batch = writeBatch(db);
  batch.set(followingRef, { createdAt: serverTimestamp() }, { merge: true });
  batch.set(followerRef, { createdAt: serverTimestamp() }, { merge: true });
  batch.update(sourceUserRef, { followingCount: increment(1) });
  batch.update(targetUserRef, { followersCount: increment(1) });
  await batch.commit();
}

export async function unfollowUser(sourceUid: string, targetUid: string) {
  if (!sourceUid || !targetUid || sourceUid === targetUid) return;

  const followingRef = doc(db, "follows", sourceUid, "following", targetUid);
  const followerRef = doc(db, "follows", targetUid, "followers", sourceUid);
  const sourceUserRef = doc(db, "users", sourceUid);
  const targetUserRef = doc(db, "users", targetUid);

  const batch = writeBatch(db);
  batch.delete(followingRef);
  batch.delete(followerRef);
  batch.update(sourceUserRef, { followingCount: increment(-1) });
  batch.update(targetUserRef, { followersCount: increment(-1) });
  await batch.commit();
}

export async function isFollowing(sourceUid: string, targetUid: string) {
  const snap = await getDoc(doc(db, "follows", sourceUid, "following", targetUid));
  return snap.exists();
}

export async function getFollowingUids(uid: string, max = 50) {
  const q = query(collection(db, "follows", uid, "following"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.id);
}

