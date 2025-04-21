import { ArrowDownCircleIcon, ArrowUpCircleIcon, ArrowUpTrayIcon, ChartBarIcon, ChatBubbleOvalLeftEllipsisIcon, HeartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image'
import React from 'react'

export default function Post() {
  return (
    <div>
      <PostHeader />
      <div className="ml-16 p-3 flex space-x-14">
        <div className=" relative ">
          <ChatBubbleOvalLeftEllipsisIcon className="w-[22px] h-[22px] cursor-pointer hover:text-[#F4AF01] transition" />
          <span className="absolute text-xs top-1 -right-3">2</span>
        </div>
        <div className=" relative ">
          <HeartIcon className="w-[22px] h-[22px] cursor-pointer hover:text-[#f787f3] transition" />
          <span className="absolute text-xs top-1 -right-3">2</span>
        </div>
        <div className=" relative ">
          <ChartBarIcon className="w-[22px] h-[22px] cursor-not-allowed"/>
        </div>
        <div className=" relative ">
          <ArrowUpTrayIcon className="w-[22px] h-[22px] cursor-not-allowed "/>
        </div>
      </div>
    </div>
  );
}

export function PostHeader(){
    return (
      <div className="flex p-3 space-x-5">
        <Image
          src="/assets/profile-pic.jpg"
          width={44}
          height={44}
          alt="profile-pic"
          className="w-11 h-11"
        />

        <div className="text-[15px] flex flex-col space-y-1.5">
          <div className="flex space-x-1.5 text-[#707E89]">
            <span className="font-bold text-[#0F1419] inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] min-[400px]:max-w-[100px] min-[500]:max-w-[140px] sm:max-w-[160px]">
              Guest randommizer
            </span>
            <span className=" inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] min-[400px]:max-w-[100px] min-[500]:max-w-[140px] sm:max-w-[160px]">
              guest@0002343
            </span>
            <span> · </span>
            <span> a day ago</span>
          </div>

          <span>content </span>
        </div>
      </div>
    );
}
