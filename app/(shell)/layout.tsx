"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Widget from "@/components/Widget";
import CommentModal from "@/components/modals/CommentModal";
import Login from "@/components/login";
import LoadingScreen from "@/components/loadingScreen";
import PageTransition from "@/components/PageTransition";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen max-w-[1400px] mx-auto flex justify-center text-app-fg">
        <Sidebar />
        <main className="flex-grow">
          <PageTransition>{children}</PageTransition>
        </main>
        <Widget />
      </div>

      <CommentModal />
      <Login />
      <LoadingScreen />
    </>
  );
}

