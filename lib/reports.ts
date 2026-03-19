import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function reportPost(params: { reporterUid: string; postId: string; reason: string }) {
  const { reporterUid, postId, reason } = params;
  await addDoc(collection(db, "reports"), {
    reporterUid,
    postId,
    reason: reason.slice(0, 500),
    createdAt: serverTimestamp(),
    status: "open",
  });
}

