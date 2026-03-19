import { db, getMessagingIfSupported } from "@/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";

export async function enableWebPush(uid: string) {
  const messaging = await getMessagingIfSupported();
  if (!messaging) throw new Error("Push messaging not supported in this browser.");

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) throw new Error("Missing NEXT_PUBLIC_FCM_VAPID_KEY.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission denied.");

  const token = await getToken(messaging, { vapidKey });
  if (!token) throw new Error("Failed to get FCM token.");

  const tokenId = token.slice(0, 32);
  await setDoc(
    doc(db, "deviceTokens", uid, "tokens", tokenId),
    { token, platform: "web", createdAt: serverTimestamp(), lastSeenAt: serverTimestamp() },
    { merge: true },
  );

  return token;
}

