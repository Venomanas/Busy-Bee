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
import { motion, AnimatePresence } from "framer-motion";

function PostSkeleton() {
  return (
    <div className="p-3 border-b border-app-border flex gap-3 animate-pulse">
      <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton h-3 rounded w-2/5" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function PostFeed() {
  const [posts, setPosts] = useState<
    QueryDocumentSnapshot<DocumentData, DocumentData>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const uid = useSelector((s: RootState) => s.user.uid);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    setLoading(true);

    (async () => {
      let qRef = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(50),
      );
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

      unsubscribe = onSnapshot(qRef, snapshot => {
        setPosts(snapshot.docs);
        setLoading(false);
        dispatch(closeLoadingScreen());
      });
    })();

    return () => unsubscribe?.();
  }, [dispatch, uid]);

  return (
    <div className="flex-grow max-w-2xl border-x border-app-border">
      <div className="py-4 px-3 text-lg sm:text-xl sticky top-0 z-50 glass font-bold border-b border-app-border">
        Home
      </div>
      <PostInput />

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : (
        <AnimatePresence initial={false}>
          {posts.map((post, i) => (
            <Post key={post.id} data={post.data()} id={post.id} index={i} />
          ))}
        </AnimatePresence>
      )}

      {!loading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center text-black/40"
        >
          <div className="text-4xl mb-3">✨</div>
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm mt-1">
            Follow some people or create a post to get started!
          </p>
        </motion.div>
      )}
    </div>
  );
}
