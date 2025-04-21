import React from 'react'
import SignUpModal from './modals/SignUpModal';
import LoginModal from './modals/LoginModal';

export default function Login() {
  return (
    <div className="w-full h-[80px] bg-[#F4AF01] bottom-0 flex justify-center items-center md:space-x-5 lg:justify-between lg:px-20 xl:px-40 2xl:px-80px">
      <div className="hidden md:flex flex-col text-white">
        <span className="text-xl font-bold">Don't miss out on the <span className='text-black'>Buzzz</span></span>
        <span>Be first to Know . </span>
      </div>

      <div className="flex space-x-2 w-full md:w-fit p-3 ">
      <LoginModal />
      <SignUpModal />
      </div>
    </div>
  );
}
