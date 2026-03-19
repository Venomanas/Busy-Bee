"use client";
import React, { useEffect, useState } from "react";
import PostInput from "@/components/PostInput";
import Post from "@/components/Post";
import {
  collection,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase";
import { closeLoadingScreen } from "@/redux/slices/loadingSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getFollowingUids } from "@/lib/follows";

export default function PostFeed() {
  const [posts, setPosts] = useState<
    QueryDocumentSnapshot<DocumentData, DocumentData>[]
  >([]);
  const dispatch = useDispatch();
  const uid = useSelector((s: RootState) => s.user.uid);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      // MVP timeline: if user is logged in and following <= 10 accounts, fetch only those + self.
      let qRef = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
      if (uid) {
        const following = await getFollowingUids(uid, 10);
        const authors = Array.from(new Set([uid, ...following])).slice(0, 10);
        if (authors.length) {
          qRef = query(
            collection(db, "posts"),
            where("authorUid", "in", authors),
            orderBy("createdAt", "desc"),
            limit(50),
          );
        }
      }

      unsubscribe = onSnapshot(qRef, (snapshot) => {
        const snapshotDocs = snapshot.docs;
        setPosts(snapshotDocs);
        dispatch(closeLoadingScreen());
      });
    })();

    return () => unsubscribe?.();
  }, [dispatch, uid]);

  return (
    <div className="flex-grow max-w-2xl border-x border-gray-100">
      <div className="py-4 px-3 text-lg sm:text-xl sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm font-bold border-b border-gray-100">
        Home
      </div>
      <PostInput />

      {posts.map(post => (
        <Post 
        key={post.id} 
        data={post.data()}
        id={post.id} />
      ))}
    </div>
  );
}
