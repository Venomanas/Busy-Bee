import { openCommentModal } from "@/redux/slices/modalSlice";
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { DocumentData, Timestamp } from "firebase/firestore";
import Image from "next/image";
import React from "react";
import Moment from "react-moment";
import { useDispatch } from "react-redux";

interface PostProps {
  data: DocumentData;
}

export default function Post({ data }: PostProps) {
  const dispatch = useDispatch();

  return (
    <div className="border-b border-gray-100">
      <PostHeader
        username={data.username}
        name={data.name}
        timestamp={data.timestamp}
        text={data.text}
      />
      <div className="ml-16 p-3 flex space-x-14">
        <div className="relative">
          <ChatBubbleOvalLeftEllipsisIcon
            className="w-[22px] h-[22px] cursor-pointer hover:text-[#F4AF01] transition"
            onClick={() => dispatch(openCommentModal())}
          />
          <span className="absolute text-xs top-1 -right-3">
            {data.comments?.length || 0}
          </span>
        </div>
        <div className="relative">
          <HeartIcon className="w-[22px] h-[22px] cursor-pointer hover:text-[#f787f3] transition" />
          <span className="absolute text-xs top-1 -right-3">
            {data.likes?.length || 0}
          </span>
        </div>
        <div className="relative">
          <ChartBarIcon className="w-[22px] h-[22px] cursor-not-allowed" />
        </div>
        <div className="relative">
          <ArrowUpTrayIcon className="w-[22px] h-[22px] cursor-not-allowed" />
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

        <span className="text-[15px] text-[#707E89]">
          {" "}
          Replying to
          <span className="text-[#F4af01]"> gurst123 </span>
        </span>
      </div>
    </div>
  );
}
