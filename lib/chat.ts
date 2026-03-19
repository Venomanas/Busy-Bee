import { db } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { conversationIdForPair } from "@/lib/chatId";

export async function createOrGetConversation(meUid: string, otherUid: string) {
  const id = conversationIdForPair(meUid, otherUid);
  const ref = doc(db, "conversations", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      memberUids: [meUid, otherUid],
      createdAt: serverTimestamp(),
      lastMessageAt: null,
      lastMessagePreview: "",
    });
  }
  return id;
}

export async function sendMessage(conversationId: string, senderUid: string, text: string) {
  const msgRef = await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderUid,
    text,
    createdAt: serverTimestamp(),
    readBy: { [senderUid]: serverTimestamp() },
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessageAt: serverTimestamp(),
    lastMessagePreview: text.slice(0, 140),
  });
  return msgRef.id;
}

export function subscribeMyConversations(uid: string, cb: (rows: any[]) => void) {
  const qRef = query(
    collection(db, "conversations"),
    where("memberUids", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
    limit(50),
  );
  return onSnapshot(qRef, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

