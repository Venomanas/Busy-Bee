import { EllipsisHorizontalIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'
import Image from 'next/image';

export default function Widget() {
  return (
    <div className=" p-3 hidden lg:flex flex-col space-y-5 w-[400px]">
      
      <div className=" bg-[#EFF3F4] text-[#89959D] h-[44px] flex items-center space-x-3 rounded-full pl-5">
        <MagnifyingGlassCircleIcon className="w-[20px] h-[20px]" />
        <input
          type="text"
          placeholder="Search nector"
          className="bg-transparent outline-none"
        />
      </div>
      <div className="bg-[#EFF3F4] rounded-xl p-3  ">
        <h1 className="text-xl font-bold mb-2 ">What's Happening</h1>
        <div className="flex flex-col py-3 space-y-0.5">
          <div className="flex justify-between text-[#536471]">
            <span>Trending in katsukabe </span>
            <EllipsisHorizontalIcon className="w-[20px]   " />
          </div>
          <span className="font-bold  text-sm ">#ReactJs</span>
          <span className=" text-[#536471] text-xs">240k Bumbles</span>
        </div>

        <div className="flex flex-col py-3 space-y-0.5">
          <div className="flex justify-between text-[#536471]">
            <span>Trending in Hokaido </span>
            <EllipsisHorizontalIcon className="w-[20px]   " />
          </div>
          <span className="font-bold  text-sm ">#vite</span>
          <span className=" text-[#536471] text-xs">180k Bumbles</span>
        </div>

        <div className="flex flex-col py-3 space-y-0.5">
          <div className="flex justify-between text-[#536471]">
            <span>Trending in Tokyo </span>
            <EllipsisHorizontalIcon className="w-[20px]   " />
          </div>
          <span className="font-bold  text-sm ">#Angular</span>
          <span className=" text-[#536471] text-xs">140k Bumbles</span>
        </div>

        <div className="flex flex-col py-3 space-y-0.5">
          <div className="flex justify-between text-[#536471]">
            <span>Trending in Osaka </span>
            <EllipsisHorizontalIcon className="w-[20px]   " />
          </div>
          <span className="font-bold  text-sm ">#NextJs</span>
          <span className=" text-[#536471] text-xs">40k Bumbles</span>
        </div>
      </div>
      <div className="bg-[#EFF3F4] rounded-xl p-3 space-y-0.5  ">
        <h1 className="text-xl font-bold mb-2 ">Who To Follow</h1>

        <div className='flex justify-between items-center py-3 '>
          <div className='flex space-x-2'>
          <Image 
          src={'/assets/user-pic.jpg'}   
          width={56}
          height={56}
          alt="logo"
          className="w-14 h-14 rounded-full"
          /> 

          <div className='flex flex-col justify-between text-sm'>
          <span className='font-bold'> Anas sayyed </span>
          <span> @Anassayyed </span>
          </div>

          </div>
         
          <button className='bg-[#0f1419] text-white w-[72px] h-[40px] rounded-xl '> Follow </button>
        </div>

      </div>
    </div>
  );
}
