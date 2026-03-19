"use client";

import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { signInUser, signOutUser } from "@/redux/slices/userSlice";
import { ensureUserProfile, getUserProfile } from "@/lib/users";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        dispatch(signOutUser());
        return;
      }

      await ensureUserProfile(fbUser);
      const profile = await getUserProfile(fbUser.uid);

      dispatch(
        signInUser({
          name: profile?.displayName ?? fbUser.displayName ?? "",
          username: profile?.username ?? fbUser.email?.split("@")[0] ?? "",
          email: fbUser.email ?? "",
          uid: fbUser.uid,
          photoURL: profile?.photoURL ?? fbUser.photoURL ?? "",
          bio: profile?.bio ?? "",
        }),
      );
    });

    return () => unsub();
  }, [dispatch]);

  return <>{children}</>;
}

