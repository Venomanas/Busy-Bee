"use client";
import React, { useRef, useState } from "react";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  FaceSmileIcon,
  MapIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, app } from "@/firebase";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { closeCommentModal, openLoginModal } from "@/redux/slices/modalSlice";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import Image from "next/image";

const MAX_CHARS = 280;

interface PostInputProps {
  insideModal?: boolean;
}

export default function PostInput({ insideModal }: PostInputProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const user = useSelector((state: RootState) => state.user);
  const commentDetails = useSelector(
    (state: RootState) => state.modal.commentPostDetails,
  );
  const dispatch = useDispatch();

  const remaining = MAX_CHARS - text.length;
  const overLimit = remaining < 0;
  const nearLimit = remaining <= 20 && !overLimit;

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadImage(postId: string): Promise<string | null> {
    if (!imageFile) return null;
    const storage = getStorage(app);
    const storageRef = ref(storage, `posts/${postId}/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return getDownloadURL(storageRef);
  }

  async function sendPost() {
    if (!user.username) {
      dispatch(openLoginModal());
      return;
    }
    if (!text.trim() && !imageFile) return;
    if (overLimit) return;
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        text: text.trim(),
        authorUid: user.uid,
        authorName: user.name,
        authorUsername: user.username,
        authorPhotoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      });
      if (imageFile) {
        const imgURL = await uploadImage(docRef.id);
        if (imgURL) await updateDoc(docRef, { imageURL: imgURL });
      }
      setText("");
      removeImage();
    } finally {
      setSubmitting(false);
    }
  }

  async function sendComment() {
    if (!user.username) {
      dispatch(openLoginModal());
      return;
    }
    if (!text.trim() || overLimit) return;
    setSubmitting(true);
    try {
      const postRef = doc(db, "posts", commentDetails.id);
      await addDoc(collection(db, "posts", commentDetails.id, "comments"), {
        authorUid: user.uid,
        authorName: user.name,
        authorUsername: user.username,
        authorPhotoURL: user.photoURL || "",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, {
        commentsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      setText("");
      dispatch(closeCommentModal());
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    (text.trim().length > 0 || imageFile !== null) && !overLimit && !submitting;

  return (
    <div className="flex space-x-3 p-3 border-b border-app-border">
      <Avatar photoURL={user.photoURL} name={user.name} size={44} />

      <div className="w-full min-w-0">
        <textarea
          className="resize-none outline-none w-full min-h-[56px] text-[17px] placeholder:text-black/30 bg-transparent"
          placeholder={insideModal ? "Write your reply…" : "What's happening?"}
          onChange={e => setText(e.target.value)}
          value={text}
          maxLength={MAX_CHARS + 50}
        />

        {/* Image preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative mt-2 rounded-2xl overflow-hidden w-full max-h-60"
            >
              <Image
                src={imagePreview}
                alt="preview"
                width={600}
                height={240}
                className="w-full object-cover rounded-2xl max-h-60"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center pt-3 border-t border-app-border mt-2">
          {/* Toolbar */}
          <div className="flex space-x-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-1.5 rounded-full hover:bg-app-muted transition text-app-brand"
              title="Add image"
            >
              <PhotoIcon className="w-[20px] h-[20px]" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-app-muted transition text-app-brand/50 cursor-not-allowed">
              <ChartBarIcon className="w-[20px] h-[20px]" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-app-muted transition text-app-brand/50 cursor-not-allowed">
              <FaceSmileIcon className="w-[20px] h-[20px]" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-app-muted transition text-app-brand/50 cursor-not-allowed">
              <CalendarDaysIcon className="w-[20px] h-[20px]" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-app-muted transition text-app-brand/50 cursor-not-allowed">
              <MapIcon className="w-[20px] h-[20px]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Char counter */}
            {text.length > 0 && (
              <span
                className={`text-sm font-medium tabular-nums ${
                  overLimit
                    ? "text-red-500"
                    : nearLimit
                      ? "text-yellow-500"
                      : "text-black/30"
                }`}
              >
                {remaining}
              </span>
            )}

            <motion.button
              whileTap={{ scale: 0.94 }}
              className="bg-app-brand hover:bg-app-brand-dark rounded-full px-5 h-[40px] text-white text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              disabled={!canSubmit}
              onClick={() => (insideModal ? sendComment() : sendPost())}
            >
              {submitting ? (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  …
                </motion.span>
              ) : insideModal ? (
                "Reply"
              ) : (
                "Post"
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
