"use client";
import React, { useState } from "react";
import { Modal } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { openLoginModal, closeLoginModal } from "@/redux/slices/modalSlice";
import { AppDispatch } from "@/redux/store";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

export default function LoginModal() {
  const [showPassword, setShowPassword] = useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword] = useState('');
  const isOpen = useSelector((state: any) => state.modal.LoginModalOpen);
  const dispatch:AppDispatch = useDispatch();

    async function handleLogin(){
      signInWithEmailAndPassword(auth, email , password)
    }

    async function handleGuestLogin() {
        await signInWithEmailAndPassword(auth, "jacky12345@gmail.com","123456789")
    }

  return (
    <>
      <button
        className="w-full h-[48px] md:w-[88px] md:h-[40px] text-md md:text-sm border-2 border-gray-100 rounded-full text-white font-bold hover:bg-white hover:bg-opacity-25 hover:text-black transition"
        onClick={() => dispatch(openLoginModal())}
      >
        Log In
      </button>

      <Modal
        open={isOpen}
        onClose={() => dispatch(closeLoginModal())}
        className="flex justify-center items-center"
      >
        <div className="w-full h-full sm:w-[600px] sm:h-fit bg-white sm:rounded-xl outline-none">
          <XMarkIcon
            className="w-7 mt-5 ms-5 cursor-pointer"
            onClick={() => dispatch(closeLoginModal())}
          />
          <div className="pt-10 pb-20 px-4 sm:px-20">
            <h1 className="text-3xl font-bold mb-10">Login to Busy Bee</h1>
            <div className="w-full space-y-5 mb-10">
              <input
                className="w-full h-[54px] border border-gray-200 outline-none pl-3 rounded-[4px] focus:border-[#F4AF01] transition"
                type="email"
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
                value={email}
              />
              <div className="w-full h-[54px] border border-gray-200 rounded-[4px] focus-within:border-[#F4AF01] transition flex items-center overflow-hidden pr-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full h-full ps-3 outline-none"
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-7 h-7 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </div>
              </div>
            </div>
            <button
              className="bg-[#F4Af01] text-white h-[48px] rounded-full shadow-md mb-5 w-full"
              onClick={() => handleLogin()}
            >
              Log In
            </button>
            <span className="mb-5 text-sm text-center block">or</span>
            <button
              className="bg-[#F4Af01] text-white h-[48px] rounded-full shadow-md mb-5 w-full"
              onClick={() => handleGuestLogin()}
            >
              Log In as guest
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
