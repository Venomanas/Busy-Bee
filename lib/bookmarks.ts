import { db } from "@/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function toggleBookmark(uid: string, postId: string) {
  const ref = doc(db, "bookmarks", uid, "items", postId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
  return true;
}

