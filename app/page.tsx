import React from "react";
import Sidebar from "@/components/Sidebar";
import PostFeed from "@/components/PostFeed";
import Widget from "@/components/Widget"
import Login from "@/components/login";
import CommentModal from "@/components/modals/CommentModal";
import LoadingScreen from "@/components/loadingScreen";

export default function Home() {
  return (
    <>
      <div
        className="text-[#0f1419] min-h-screen 
    max-w-[1400px] mx-auto flex justify-center"
      >
        <Sidebar />
        <PostFeed />
        <Widget />
      </div>

      <CommentModal />
      <Login />
      <LoadingScreen />
    </>
  );
}
