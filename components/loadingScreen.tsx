"use client";
import React from "react";
import Image from "next/image";
import { LinearProgress } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { usePathname } from "next/navigation";
import { closeLoadingScreen } from "@/redux/slices/loadingSlice";

export default function LoadingScreen() {
  const loadingScreenOpen = useSelector(
    (state: RootState) => state.loading.loadingScreenOpen,
  );
  const dispatch = useDispatch();
  const pathname = usePathname();

  // Auto-dismiss after 4s max so it never permanently blocks non-feed pages
  React.useEffect(() => {
    if (!loadingScreenOpen) return;
    const timer = setTimeout(() => dispatch(closeLoadingScreen()), 4000);
    return () => clearTimeout(timer);
  }, [loadingScreenOpen, dispatch]);

  // Dismiss instantly when navigating away from the home feed
  React.useEffect(() => {
    if (pathname !== "/") dispatch(closeLoadingScreen());
  }, [pathname, dispatch]);

  return (
    <div
      className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-500 ${
        loadingScreenOpen
          ? "opacity-100 z-[200]"
          : "opacity-0 -z-50 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center">
        <Image
          src="/assets/beee.jpg"
          width={120}
          height={120}
          alt="Busy bee loading"
          className="mb-5 rounded-2xl"
        />
        <h1 className="text-5xl font-black mb-10 gradient-text">Busy Bee</h1>
        <LinearProgress
          sx={{
            width: 220,
            height: 6,
            borderRadius: 99,
            backgroundColor: "hsl(42 96% 85%)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "hsl(42 96% 49%)",
              borderRadius: 99,
            },
          }}
        />
      </div>
    </div>
  );
}
