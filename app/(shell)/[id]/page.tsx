"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { PostHeader } from "@/components/Post";
import type { DocumentData } from "firebase/firestore";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { reportPost } from "@/lib/reports";
import { openLoginModal } from "@/redux/slices/modalSlice";
import { useDispatch } from "react-redux";
import Avatar from "@/components/Avatar";
import { motion, AnimatePresence } from "framer-motion";

type CommentDoc = {
  authorName: string;
  authorUsername: string;
  authorPhotoURL?: string;
  text: string;
  createdAt?: any;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();

  const [post, setPost] = React.useState<DocumentData | null>(null);
  const [comments, setComments] = React.useState<
    Array<{ id: string; data: CommentDoc }>
  >([]);
  const [replyText, setReplyText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);
  const [reportMsg, setReportMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const postRef = doc(db, "posts", id);
    const unsubPost = onSnapshot(postRef, snap =>
      setPost(snap.exists() ? snap.data() : null),
    );
    const commentsQ = query(
      collection(db, "posts", id, "comments"),
      orderBy("createdAt", "asc"),
    );
    const unsubComments = onSnapshot(commentsQ, snap => {
      setComments(
        snap.docs.map(d => ({ id: d.id, data: d.data() as CommentDoc })),
      );
    });
    return () => {
      unsubPost();
      unsubComments();
    };
  }, [id]);

  async function sendReply() {
    if (!user.uid) {
      dispatch(openLoginModal());
      return;
    }
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "posts", id, "comments"), {
        authorUid: user.uid,
        authorName: user.name,
        authorUsername: user.username,
        authorPhotoURL: user.photoURL || "",
        text: replyText.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "posts", id), {
        commentsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      setReplyText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl border-x border-app-border">
      <div className="py-3 px-3 sticky top-0 z-50 glass border-b border-app-border flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 rounded-full hover:bg-app-muted transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <span className="font-bold text-[17px]">Post</span>
      </div>

      {!post ? (
        <div className="p-4 space-y-3">
          <div className="flex gap-3 animate-pulse">
            <div className="skeleton w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton h-3 w-1/3 rounded" />
              <div className="skeleton h-4 rounded w-full" />
              <div className="skeleton h-4 rounded w-5/6" />
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Post body */}
          <div className="p-4 border-b border-app-border">
            <PostHeader
              name={post.authorName ?? post.name ?? ""}
              username={post.authorUsername ?? post.username ?? ""}
              photoURL={post.authorPhotoURL}
              timestamp={post.createdAt ?? post.timestamp}
              text={post.text ?? ""}
            />

            {/* Stats row */}
            <div className="flex gap-4 px-3 py-3 border-t border-app-border text-sm mt-2">
              <span>
                <strong>{post.likesCount ?? 0}</strong>{" "}
                <span className="text-black/50">Likes</span>
              </span>
              <span>
                <strong>{post.commentsCount ?? 0}</strong>{" "}
                <span className="text-black/50">Replies</span>
              </span>
            </div>

            {/* Report */}
            <div className="flex items-center gap-3 px-3">
              <button
                className="h-[34px] px-4 rounded-full border border-app-border hover:bg-app-muted text-sm font-medium transition-colors"
                disabled={!user.uid || reporting}
                onClick={async () => {
                  if (!user.uid) return;
                  const reason =
                    window.prompt("Report reason (optional):") ?? "";
                  setReporting(true);
                  setReportMsg(null);
                  try {
                    await reportPost({
                      reporterUid: user.uid,
                      postId: id,
                      reason,
                    });
                    setReportMsg("Reported. Thanks.");
                  } finally {
                    setReporting(false);
                  }
                }}
              >
                {reporting ? "…" : "Report"}
              </button>
              {reportMsg && (
                <span className="text-sm text-black/50">{reportMsg}</span>
              )}
            </div>
          </div>

          {/* Inline reply input */}
          <div className="flex gap-3 p-3 border-b border-app-border">
            <Avatar photoURL={user.photoURL} name={user.name} size={40} />
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="w-full resize-none outline-none min-h-[56px] text-[15px] placeholder:text-black/30 bg-transparent"
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={!replyText.trim() || submitting}
                  onClick={sendReply}
                  className="h-[36px] px-5 rounded-full bg-app-brand text-white font-bold text-sm disabled:opacity-50 transition-colors hover:bg-app-brand-dark"
                >
                  {submitting ? "…" : "Reply"}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Comments */}
          {comments.length === 0 ? (
            <div className="p-8 text-center text-black/40">
              <div className="text-3xl mb-2">💬</div>
              <p>No replies yet – be first!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-app-border"
                >
                  <PostHeader
                    name={c.data.authorName}
                    username={c.data.authorUsername}
                    photoURL={c.data.authorPhotoURL}
                    text={c.data.text}
                    replyTo={post.authorUsername ?? post.username}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
}
