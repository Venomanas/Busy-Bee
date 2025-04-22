'use client'

import { closeCommentModal } from "@/redux/slices/modalSlice";
import { RootState } from "@/redux/store";
import { Modal } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CommentModal() {
  const open = useSelector((state: RootState) => state.modal.commentModalOpen);
  const dispatch = useDispatch();
  return (
    <>
      <Modal open={open} onClose={() => dispatch(closeCommentModal())}>
        <div className="w-[400px] h-[400px]">Comment Modal</div>
      </Modal>
    </>
  );
}
