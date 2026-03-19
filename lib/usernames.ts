import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function uidForUsername(usernameRaw: string): Promise<string | null> {
  const username = usernameRaw.trim().toLowerCase();
  if (!username) return null;
  const snap = await getDoc(doc(db, "usernames", username));
  return snap.exists() ? (snap.data() as any).uid ?? null : null;
}

