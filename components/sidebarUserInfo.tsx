"use client"

import React from 'react'
import Image from 'next/image';
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from '@/redux/slices/userSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { closeLoginModal, closeSignUpModal } from '@/redux/slices/modalSlice';
export default function SidebarUserInfo() {

  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user)

  async function handleSignOut() {
    await signOut(auth);

    dispatch(signOutUser())

    dispatch(closeSignUpModal())

    dispatch(closeLoginModal())
    
  }

  return (
    <div className=" absolute bottom-3 flex items-center space-x-2 xl:p-3 xl:pe-6 hover:bg-gray-500 hover:bg-opacity-10 rounded-full transition cursor-pointer w-fit xl:w-[240px] justify-start "
    onClick={()=> handleSignOut()}>      
      <Image
        src={"/assets/profile-pic.jpg"}
        width={36}
        height={36}
        alt="profile"
        className="w-10 h-10 rounded-full"
      />
      <div className="hidden xl:flex flex-col text-sm max-w-40">
        <span className="whitespace-nowrap text-ellipsis overflow-hidden font-bold ">{user.name}</span>
        <span className="whitespace-nowrap text-ellipsis overflow-hidden text-gray-500">@{user.username}</span>
      </div>
    </div>
  );
}
