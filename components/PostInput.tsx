import React from 'react'
import Image from 'next/image'
import { CalendarDaysIcon, ChartBarIcon, FaceSmileIcon, MapIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function PostInput() {
  return (
    <div className="flex space-x-5 p-3 ">
      <Image
        src={"/assets/beee.jpg"}
        width={44}
        height={44}
        alt="logo"
        className="w-11 h-11"
      />
      <div className="w-full">
        <textarea
          className="resize-none outline-none w-full min-h-[50px] text-lg"
          placeholder="whats buzzing"
        />
        <div className="flex justify-between pt-5">
          <div className="flex space-x-1.5">
            <PhotoIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <ChartBarIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <FaceSmileIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <CalendarDaysIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
            <MapIcon className="w-[22px] h-[22px] text-[#F4AF01]" />
          </div>
          <button className='bg-[#F4AF01] rounded-full  shadow-md p-4 text-white text-small w-[80px] h-[56px]cursor-pointer '>Bumble</button>
        </div>
      </div>
    </div>
  );
}
