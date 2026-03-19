"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Post from "@/components/Post";

export default function BookmarksPage() {
  const uid = useSelector((s: RootState) => s.user.uid);
  const [ids, setIds] = React.useState<string[]>([]);
  const [posts, setPosts] = React.useState<Array<{ id: string; data: any }>>([]);

  React.useEffect(() => {
    if (!uid) {
      setIds([]);
      return;
    }
    const qRef = query(collection(db, "bookmarks", uid, "items"), orderBy("createdAt", "desc"));
    return onSnapshot(qRef, (snap) => setIds(snap.docs.map((d) => d.id)));
  }, [uid]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ids.length) {
        setPosts([]);
        return;
      }
      const results = await Promise.all(
        ids.slice(0, 25).map(async (id) => {
          const snap = await getDoc(doc(db, "posts", id));
          return snap.exists() ? { id, data: snap.data() } : null;
        }),
      );
      if (!cancelled) setPosts(results.filter(Boolean) as any);
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Bookmarks" subtitle={uid ? "Saved" : "Log in to save posts"} />
      {!uid ? (
        <div className="p-4 text-black/70">Log in to view bookmarks.</div>
      ) : posts.length ? (
        posts.map((p) => <Post key={p.id} id={p.id} data={p.data} />)
      ) : (
        <div className="p-4 text-black/60">No bookmarks yet.</div>
      )}
    </div>
  );
}

