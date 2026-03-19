import * as admin from "firebase-admin";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";

admin.initializeApp();
const db = admin.firestore();

async function writeNotification(params: {
  ownerUid: string;
  type: string;
  actorUid: string;
  message: string;
  entityPath?: string;
}) {
  const { ownerUid, type, actorUid, message, entityPath } = params;
  if (!ownerUid || ownerUid === actorUid) return;
  const ref = db.collection("notifications").doc(ownerUid).collection("items").doc();
  await ref.set({
    type,
    actorUid,
    message,
    entityPath: entityPath ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    readAt: null,
  });
}

export const onLikeCreated = onDocumentCreated("posts/{postId}/likes/{uid}", async (event) => {
  const postId = event.params.postId as string;
  const actorUid = event.params.uid as string;

  const postSnap = await db.collection("posts").doc(postId).get();
  const post = postSnap.data();
  const ownerUid = post?.authorUid as string | undefined;
  if (!ownerUid) return;

  await writeNotification({
    ownerUid,
    type: "like",
    actorUid,
    message: "liked your post",
    entityPath: `posts/${postId}`,
  });
});

export const onCommentCreated = onDocumentCreated("posts/{postId}/comments/{commentId}", async (event) => {
  const postId = event.params.postId as string;
  const comment = event.data?.data() as any;
  const actorUid = comment?.authorUid as string | undefined;
  if (!actorUid) return;

  const postSnap = await db.collection("posts").doc(postId).get();
  const post = postSnap.data();
  const ownerUid = post?.authorUid as string | undefined;
  if (!ownerUid) return;

  await writeNotification({
    ownerUid,
    type: "comment",
    actorUid,
    message: "replied to your post",
    entityPath: `posts/${postId}`,
  });
});

export const onFollowCreated = onDocumentCreated("follows/{uid}/following/{targetUid}", async (event) => {
  const actorUid = event.params.uid as string;
  const ownerUid = event.params.targetUid as string;

  await writeNotification({
    ownerUid,
    type: "follow",
    actorUid,
    message: "followed you",
    entityPath: `users/${ownerUid}`,
  });
});

// Optional cleanup: delete like-notification is typically not required, so left empty.
export const onLikeDeleted = onDocumentDeleted("posts/{postId}/likes/{uid}", async () => {
  return;
});

