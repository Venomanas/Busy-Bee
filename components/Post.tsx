'use client'
import { openCommentModal, openLoginModal, setCommnetDetails } from "@/redux/slices/modalSlice";
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

import { DocumentData, Timestamp, deleteDoc, doc, getDoc, increment, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";
import { db } from "@/firebase";
import { RootState } from "@/redux/store";
import { toggleBookmark } from "@/lib/bookmarks";
interface PostProps {
  data: DocumentData;
  id: string;
}

export default function Post({ data , id}: PostProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);

  React.useEffect(() => {
    if (!user.uid) {
      setLiked(false);
      return;
    }
    const likeRef = doc(db, "posts", id, "likes", user.uid);
    return onSnapshot(likeRef, (snap) => setLiked(snap.exists()));
  }, [id, user.uid]);

  React.useEffect(() => {
    if (!user.uid) {
      setBookmarked(false);
      return;
    }
    const bmRef = doc(db, "bookmarks", user.uid, "items", id);
    return onSnapshot(bmRef, (snap) => setBookmarked(snap.exists()));
  }, [id, user.uid]);

async function likePost() {

  if(!user.username){
    dispatch(openLoginModal())
    return;
  }

  const postRef = doc(db, "posts", id);
  const likeRef = doc(db, "posts", id, "likes", user.uid);
  const existing = await getDoc(likeRef);
  if (existing.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likesCount: increment(-1), updatedAt: serverTimestamp() });
  } else {
    await setDoc(likeRef, { createdAt: serverTimestamp() });
    await updateDoc(postRef, { likesCount: increment(1), updatedAt: serverTimestamp() });
  }
}

  const commentsCount = typeof data.commentsCount === "number" ? data.commentsCount : (data.comments?.length ?? 0);
  const likesCount = typeof data.likesCount === "number" ? data.likesCount : (data.likes?.length ?? 0);

  return (
    <div className="border-b border-gray-100">
      <Link href={"/" + id}>
        <PostHeader
          username={data.authorUsername ?? data.username}
          name={data.authorName ?? data.name}
          timestamp={data.createdAt ?? data.timestamp}
          text={data.text}
        />
      </Link>

      <div className="ml-16 p-3 flex space-x-14">
        <div className="relative">
          <ChatBubbleOvalLeftEllipsisIcon
            className="w-[22px] h-[22px] cursor-pointer hover:text-[#F4AF01] transition"
            onClick={() => {

              if(!user.username){
                dispatch(openLoginModal())
                return;
              }
              dispatch(
                setCommnetDetails({
                  name: data.authorName ?? data.name,
                  username: data.authorUsername ?? data.username,
                  id: id,
                  text: data.text,
                })
              );
              dispatch(openCommentModal());
            }}
          />
          {
              commentsCount > 0 &&
          <span className="absolute text-xs top-1 -right-3">
            {commentsCount}
          </span>
          }
        </div>
        <div className="relative">
          {liked ? (
            <HeartSolidIcon
              className="w-[22px] h-[22px] cursor-pointer text-pink-500
          "
              onClick={() => likePost()}
            />
          ) : (
            <HeartIcon
              className="w-[22px] h-[22px] cursor-pointer hover:text-[#f787f3] transition 
          "
              onClick={() => likePost()}
            />
          )}
          {
            likesCount > 0 &&  
            <span className="absolute text-xs top-1 -right-3">
            {likesCount}
            </span>
          }
         
        </div>
        <div className="relative">
          <ChartBarIcon className="w-[22px] h-[22px] cursor-not-allowed" />
        </div>
        <div className="relative">
          <BookmarkIcon
            className={`w-[22px] h-[22px] cursor-pointer transition ${bookmarked ? "text-[#F4AF01]" : "hover:text-[#F4AF01]"}`}
            onClick={async (e) => {
              e.preventDefault();
              if (!user.uid) {
                dispatch(openLoginModal());
                return;
              }
              await toggleBookmark(user.uid, id);
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface PostHeaderProps {
  username: string;
  name: string;
  timestamp?: Timestamp;
  text: string;
  replyTo?: string ;
}

export function PostHeader({
  username,
  name,
  timestamp,
  text,
  replyTo,
}: PostHeaderProps) {
  return (
    <div className="flex p-3 space-x-5">
      <Image
        src="/assets/profile-pic.jpg"
        width={44}
        height={44}
        alt="profile-pic"
        className="w-11 h-11 z-10"
      />
      <div className="text-[15px] flex flex-col space-y-1.5">
        <div className="flex space-x-1.5 text-[#707E89]">
          <span className="font-bold text-[#0F1419] inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] min-[400px]:max-w-[100px] min-[500]:max-w-[140px] sm:max-w-[160px]">
            {name}
          </span>
          <span className="inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] min-[400px]:max-w-[100px] min-[500]:max-w-[140px] sm:max-w-[160px]">
            {username}
          </span>
          {timestamp && (
            <>
              <span> · </span>
              <Moment fromNow>{timestamp.toDate()}</Moment>
            </>
          )}
        </div>

        <span>{text}</span>

        {
          replyTo && (
          <span className="text-[15px] text-[#707E89]">
          Replying to
          <span className="text-[#F4af01]"> @{replyTo} </span>
        </span>)
        }
      </div>
    </div>
  );
}
