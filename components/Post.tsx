"use client";
import {
  openCommentModal,
  openLoginModal,
  setCommnetDetails,
} from "@/redux/slices/modalSlice";
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from "@heroicons/react/24/solid";
import {
  DocumentData,
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";
import { db } from "@/firebase";
import { RootState } from "@/redux/store";
import { toggleBookmark } from "@/lib/bookmarks";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";

interface PostProps {
  data: DocumentData;
  id: string;
  index?: number;
}

export default function Post({ data, id, index = 0 }: PostProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [likeAnimKey, setLikeAnimKey] = React.useState(0);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    if (!user.uid) {
      setLiked(false);
      return;
    }
    const likeRef = doc(db, "posts", id, "likes", user.uid);
    return onSnapshot(likeRef, snap => setLiked(snap.exists()));
  }, [id, user.uid]);

  React.useEffect(() => {
    if (!user.uid) {
      setBookmarked(false);
      return;
    }
    const bmRef = doc(db, "bookmarks", user.uid, "items", id);
    return onSnapshot(bmRef, snap => setBookmarked(snap.exists()));
  }, [id, user.uid]);

  async function likePost() {
    if (!user.username) {
      dispatch(openLoginModal());
      return;
    }
    const postRef = doc(db, "posts", id);
    const likeRef = doc(db, "posts", id, "likes", user.uid);
    const existing = await getDoc(likeRef);
    if (existing.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likesCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, {
        likesCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      setLikeAnimKey(k => k + 1);
    }
  }

  async function sharePost() {
    const url = `${window.location.origin}/${id}`;
    if (navigator.share) {
      await navigator.share({ url, title: data.text?.slice(0, 60) });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const commentsCount =
    typeof data.commentsCount === "number"
      ? data.commentsCount
      : (data.comments?.length ?? 0);
  const likesCount =
    typeof data.likesCount === "number"
      ? data.likesCount
      : (data.likes?.length ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.04 }}
      className="border-b border-app-border hover:bg-app-surface transition-colors duration-150"
    >
     
        <PostHeader
          username={data.authorUsername ?? data.username}
          name={data.authorName ?? data.name}
          photoURL={data.authorPhotoURL}
          timestamp={data.createdAt ?? data.timestamp}
          text={data.text}
        />
        {/* Post image */}
        {data.imageURL && (
          <div className="ml-16 pr-3 pb-2">
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{ maxHeight: 320 }}
            >
              <Image
                src={data.imageURL}
                alt="post image"
                width={600}
                height={320}
                className="w-full object-cover rounded-2xl"
              />
            </div>
          </div>
        )}

      {/* Actions row */}
      <div className="ml-16 pb-3 pr-3 flex items-center space-x-8">
        {/* Comment */}
        <ActionBtn
          onClick={() => {
            if (!user.username) {
              dispatch(openLoginModal());
              return;
            }
            dispatch(
              setCommnetDetails({
                name: data.authorName ?? data.name,
                username: data.authorUsername ?? data.username,
                id,
                text: data.text,
              }),
            );
            dispatch(openCommentModal());
          }}
          count={commentsCount}
          label="comment"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-[20px] h-[20px]" />
        </ActionBtn>

        {/* Like */}
        <div
          className="relative flex items-center gap-1.5 cursor-pointer group"
          onClick={likePost}
        >
          <AnimatePresence mode="wait">
            {liked ? (
              <motion.span
                key={`liked-${likeAnimKey}`}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <HeartSolidIcon className="w-[20px] h-[20px] text-pink-500" />
              </motion.span>
            ) : (
              <motion.span key="not-liked" whileTap={{ scale: 0.8 }}>
                <HeartIcon className="w-[20px] h-[20px] group-hover:text-pink-400 transition-colors" />
              </motion.span>
            )}
          </AnimatePresence>
          {likesCount > 0 && (
            <span
              className={`text-xs font-medium transition-colors ${liked ? "text-pink-500" : "text-black/40 group-hover:text-pink-400"}`}
            >
              {likesCount}
            </span>
          )}
        </div>

        {/* Views (decorative) */}
        <div className="group flex items-center gap-1.5 cursor-default">
          <ChartBarIcon className="w-[20px] h-[20px] text-black/25" />
        </div>

        {/* Bookmark */}
        <div
          className="group flex items-center gap-1.5 cursor-pointer"
          onClick={async e => {
            e.preventDefault();
            if (!user.uid) {
              dispatch(openLoginModal());
              return;
            }
            await toggleBookmark(user.uid, id);
          }}
        >
          {bookmarked ? (
            <BookmarkSolidIcon className="w-[20px] h-[20px] text-app-brand" />
          ) : (
            <BookmarkIcon className="w-[20px] h-[20px] group-hover:text-app-brand transition-colors" />
          )}
        </div>

        {/* Share */}
        <div
          className="group flex items-center gap-1.5 cursor-pointer"
          onClick={sharePost}
        >
          <ArrowUpTrayIcon className="w-[20px] h-[20px] group-hover:text-app-brand transition-colors" />
          <AnimatePresence>
            {shared && (
              <motion.span
                key="copied"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-app-brand font-medium"
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tiny helper for action buttons ─────────────────────────────────────────
function ActionBtn({
  children,
  onClick,
  count,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  count: number;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="group flex items-center gap-1.5 hover:text-app-brand transition-colors"
    >
      {children}
      {count > 0 && (
        <span className="text-xs font-medium text-black/40 group-hover:text-app-brand transition-colors">
          {count}
        </span>
      )}
    </button>
  );
}

// ─── PostHeader ──────────────────────────────────────────────────────────────
interface PostHeaderProps {
  username: string;
  name: string;
  photoURL?: string;
  timestamp?: Timestamp;
  text: string;
  replyTo?: string;
}

export function PostHeader({
  username,
  name,
  photoURL,
  timestamp,
  text,
  replyTo,
}: PostHeaderProps) {
  return (
    <div className="flex p-3 space-x-3">
      <Link href={`/u/${username}`} onClick={e => e.stopPropagation()}>
        <Avatar
          photoURL={photoURL}
          name={name}
          size={44}
          className="flex-shrink-0"
        />
      </Link>
      <div className="text-[15px] flex flex-col space-y-1 min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 flex-wrap text-black/50 text-sm">
          <Link
            href={`/u/${username}`}
            onClick={e => e.stopPropagation()}
            className="font-bold text-app-fg hover:underline whitespace-nowrap"
          >
            {name}
          </Link>
          <Link
            href={`/u/${username}`}
            onClick={e => e.stopPropagation()}
            className="hover:underline whitespace-nowrap"
          >
            @{username}
          </Link>
          {timestamp && (
            <>
              <span>·</span>
              <Moment fromNow className="whitespace-nowrap">
                {timestamp.toDate()}
              </Moment>
            </>
          )}
        </div>
        <p className="text-app-fg leading-snug">{text}</p>
        {replyTo && (
          <span className="text-sm text-black/50">
            Replying to <span className="text-app-brand">@{replyTo}</span>
          </span>
        )}
      </div>
    </div>
  );
}
