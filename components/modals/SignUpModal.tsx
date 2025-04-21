"use client";
import React , {useState} from "react";
import { Modal } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { openSignUpModal, closeSignUpModal } from "@/redux/slices/modalSlice";
import { AppDispatch } from "@/redux/store"; 
import { EyeIcon, EyeSlashIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SignUpModal() {
  const [showPassword,setShowPassword] = useState(false);
  // Fix: Properly type your state. RootState should come from your store, not reduxjs/toolkit

const isOpen = useSelector((state: any) => state.modal.SignUpModalOpen);

  // Fix: Added missing useDispatch hook import and call
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      <button
        className="w-full h-[48px] md:w-[88px] md:h-[40px] text-md md:text-sm bg-white rounded-full font-bold hover:bg-white hover:bg-opacity-25 transition"
        onClick={() => dispatch(openSignUpModal())}
      >
        Sign Up
      </button>

      <Modal
        open={isOpen}
        onClose={() => dispatch(closeSignUpModal())}
        className="flex justify-center items-center"
      >
        <div className="w-full h-full sm:w-[600px] sm:h-fit bg-white sm:rounded-xl">
          <XMarkIcon className="w-7 mt-5 ms-5 cursor-pointer"
              onClick={() => dispatch(closeSignUpModal())}
          />
          <form className="pt-10 pb-20 px-4 sm:px-20">
            <h1 className="text-3xl font-bold mb-10"> Create your account </h1>
            <div className="w-full space-y-5 mb-10">
              <input
                className="w-full h-[54px] border border-gray-200 outline-none pl-3 rounded-[4px] focus:border-[#F4AF01] transition "
                type="text"
                placeholder="Name"
              />
              <input
                className="w-full h-[54px] border border-gray-200 outline-none pl-3 rounded-[4px] focus:border-[#F4AF01] transition "
                type="email"
                placeholder="Email"
              />
              <div className="w-full h-[54px] border border-gray-200   rounded-[4px] focus-within:border-[#F4AF01] transition flex items-center overflow-hidden pr-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full h-full ps-3 outline-none "
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-7 h-7 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </div>
              </div>
            </div>
            <button className="bg-[#F4Af01] text-white h-[48px] rounded-full shadow-md mb-5 w-full">
              Sign Up
            </button>
            <span className="mb-5 text-sm  text-center block"> or </span>
            <button className="bg-[#F4Af01] text-white h-[48px] rounded-full shadow-md mb-5 w-full">
              Log In as guest
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
