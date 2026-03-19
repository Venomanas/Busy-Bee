"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { PostHeader } from "@/components/Post";
import type { DocumentData } from "firebase/firestore";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { reportPost } from "@/lib/reports";

type CommentDoc = {
  authorName: string;
  authorUsername: string;
  text: string;
  createdAt?: any;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const uid = useSelector((s: RootState) => s.user.uid);
  const [reporting, setReporting] = React.useState(false);
  const [reportMsg, setReportMsg] = React.useState<string | null>(null);

  const [post, setPost] = React.useState<DocumentData | null>(null);
  const [comments, setComments] = React.useState<Array<{ id: string; data: CommentDoc }>>([]);

  React.useEffect(() => {
    const postRef = doc(db, "posts", id);
    const unsubPost = onSnapshot(postRef, (snap) => setPost(snap.exists() ? snap.data() : null));

    const commentsQ = query(collection(db, "posts", id, "comments"), orderBy("createdAt", "asc"));
    const unsubComments = onSnapshot(commentsQ, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, data: d.data() as CommentDoc })));
    });

    return () => {
      unsubPost();
      unsubComments();
    };
  }, [id]);

  return (
    <div className="max-w-2xl border-x border-gray-100">
      <div className="py-4 px-3 text-lg sm:text-xl sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm font-bold border-b border-gray-100 flex items-center">
        <Link href="/" className="flex items-center">
          <ArrowLeftIcon className="w-5 h-5 mr-3" /> Bumble
        </Link>
      </div>

      {!post ? (
        <div className="p-4 text-black/70">Loading…</div>
      ) : (
        <>
          <div className="flex flex-col p-3 space-y-5 border-b border-gray-300">
            <PostHeader
              name={post.authorName ?? post.name ?? ""}
              username={post.authorUsername ?? post.username ?? ""}
              timestamp={post.createdAt ?? post.timestamp}
              text={post.text ?? ""}
            />
            <div className="flex items-center gap-3">
              <button
                className="h-[36px] px-4 rounded-full border border-app-border hover:bg-app-muted text-sm font-semibold"
                disabled={!uid || reporting}
                onClick={async () => {
                  if (!uid) return;
                  const reason = window.prompt("Report reason (optional):") ?? "";
                  setReporting(true);
                  setReportMsg(null);
                  try {
                    await reportPost({ reporterUid: uid, postId: id, reason });
                    setReportMsg("Reported. Thanks.");
                  } finally {
                    setReporting(false);
                  }
                }}
              >
                Report
              </button>
              {reportMsg ? <div className="text-sm text-black/60">{reportMsg}</div> : null}
            </div>
            <div className="border-b border-gray-300 p-3 text-[15px]">
              <span className="font-bold">{post.likesCount ?? post.likes?.length ?? 0}</span>
              <span className="text-black/60"> likes</span>
              <span className="mx-3 text-black/20">•</span>
              <span className="font-bold">{post.commentsCount ?? post.comments?.length ?? 0}</span>
              <span className="text-black/60"> comments</span>
            </div>
          </div>

          {comments.length ? (
            comments.map((c) => (
              <div key={c.id} className="border-b border-gray-100">
                <PostHeader name={c.data.authorName} username={c.data.authorUsername} text={c.data.text} />
              </div>
            ))
          ) : (
            <div className="p-4 text-black/60">No replies yet.</div>
          )}
        </>
      )}
    </div>
  );
}

