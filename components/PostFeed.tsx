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
} from "firebase/firestore";
import { db } from "@/firebase";

export default function PostFeed() {
  const [posts, setPosts] = useState<
    QueryDocumentSnapshot<DocumentData, DocumentData>[]
  >([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const snapshotDocs = snapshot.docs;
      setPosts(snapshotDocs);
    });

    return unsubscribe;
  }, []);

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
