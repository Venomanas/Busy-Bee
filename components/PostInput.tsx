"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  FaceSmileIcon,
  MapIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PostInputProps {
  insideModal?: boolean;
}

export default function PostInput({ insideModal }: PostInputProps) {
  const [text, setText] = useState("");
  const user = useSelector((state: RootState) => state.user);

  async function sendPost() {
    addDoc(collection(db, "posts"), {
      text: text,
      name: user.name,
      username: user.username,
      timestamp: serverTimestamp(),
      likes: [],
      comments: [],
    });
    setText("");
  }

  return (
    <div className="flex space-x-5 p-3 border-b border-gray-100 ">
      <Image
        src={insideModal ? "/assets/profile-pic.jpg" : "/assets/beee.jpg"}
        width={44}
        height={44}
        alt={insideModal ? "profile-pic.jpg" : "logo"}
        className="w-11 h-11 z-10"
      />
      <div className="w-full">
        <textarea
          className="resize-none outline-none w-full min-h-[50px] text-lg"
          placeholder={insideModal?"Send your reply":"whats happening"}
          onChange={e => setText(e.target.value)}
          value={text}
        />
        <div className="flex justify-between pt-5 border-t border-gray-100">
          <div className="flex space-x-1.5">
            <PhotoIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <ChartBarIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <FaceSmileIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <CalendarDaysIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <MapIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
          </div>
          <button
            className="bg-[#F4AF01] rounded-full shadow-md p-4 text-white text-small w-[80px] h-[56px] cursor-pointer disabled:bg-opacity-60"
            disabled={!text}
            onClick={() => sendPost()}
          >
            Bumble
          </button>
        </div>
      </div>
    </div>
  );
}
