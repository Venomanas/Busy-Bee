import React, { useState } from "react";
import { Modal } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { openSignUpModal, closeSignUpModal } from "@/redux/slices/modalSlice";
import { AppDispatch, RootState } from "@/redux/store"; 
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth }  from "@/firebase";
import { updateProfile } from "firebase/auth";
import { reserveUsername, updateUserProfile } from "@/lib/users";

export default function SignUpModal() {
  const [name,setName] = useState('')
  const [username, setUsername] = useState("");
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [showPassword,setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOpen = useSelector((state: RootState) => state.modal.signUpModalOpen);
  const dispatch : AppDispatch = useDispatch ();
  
 async function handleSignUp() {
    setError(null);
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredentials.user, { displayName: name });

    const reserved = await reserveUsername(username || (email.split("@")[0] ?? ""), userCredentials.user.uid);
    await updateUserProfile(userCredentials.user.uid, {
      displayName: name,
      username: reserved,
      email,
      photoURL: userCredentials.user.photoURL ?? "",
      bio: "",
    });

    dispatch(closeSignUpModal());
  }

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
        <div className="w-full h-full sm:w-[600px] sm:h-fit bg-white sm:rounded-xl outline-none">
          <XMarkIcon
            className="w-7 mt-5 ms-5 cursor-pointer"
            onClick={() => dispatch(closeSignUpModal())}
          />
          <div className="pt-10 pb-20 px-4 sm:px-20">
            <h1 className="text-3xl font-bold mb-10"> Create your account </h1>
            <div className="w-full space-y-5 mb-10">
              <input
                className="w-full h-[54px] border border-gray-200 outline-none pl-3 rounded-[4px] focus:border-[#F4AF01] transition "
                type="text"
                placeholder="Name"
                onChange={e => setName(e.target.value)}
                value={name}
              />
              <input
                className="w-full h-[54px] border border-gray-200 outline-none pl-3 rounded-[4px] focus:border-[#F4AF01] transition "
                type="text"
                placeholder="Username (letters/numbers/_)"
                onChange={e => setUsername(e.target.value)}
                value={username}
              />
              <input
                className="w-full h-[54px] border border-gray-200 outline-none pl-3 rounded-[4px] focus:border-[#F4AF01] transition "
                type="email"
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
                value={email}
              />
              <div className="w-full h-[54px] border border-gray-200   rounded-[4px] focus-within:border-[#F4AF01] transition flex items-center overflow-hidden pr-3">
                <input
                  className="w-full h-full ps-3 outline-none "
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
            {error ? <div className="text-sm text-red-600 mb-3">{error}</div> : null}
            <button
              className="bg-[#F4Af01] text-white h-[48px] rounded-full shadow-md mb-5 w-full"
              onClick={async () => {
                try {
                  await handleSignUp();
                } catch (e: any) {
                  setError(e?.message ?? "Sign up failed.");
                }
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
