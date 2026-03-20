"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { reserveUsername, updateUserProfile } from "@/lib/users";
import { updateProfile } from "firebase/auth";
import { auth, app } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInUser } from "@/redux/slices/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase";
import Post from "@/components/Post";
import { CameraIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user);
  const [displayName, setDisplayName] = React.useState(user.name);
  const [username, setUsername] = React.useState(user.username);
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [posts, setPosts] = React.useState<any[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDisplayName(user.name);
    setUsername(user.username);
    setBio(user.bio ?? "");
  }, [user.name, user.username, user.bio]);

  // Own posts
  React.useEffect(() => {
    if (!user.uid) return;
    const q = query(
      collection(db, "posts"),
      where("authorUid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user.uid]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user.uid) return;
    setUploading(true);
    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserProfile(user.uid, { photoURL: url });
      if (auth.currentUser)
        await updateProfile(auth.currentUser, { photoURL: url });
      dispatch(signInUser({ ...user, photoURL: url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const reserved = await reserveUsername(username, user.uid);
      await updateUserProfile(user.uid, {
        displayName,
        username: reserved,
        bio,
      });
      if (auth.currentUser)
        await updateProfile(auth.currentUser, { displayName });
      dispatch(
        signInUser({ ...user, name: displayName, username: reserved, bio }),
      );
      setSuccess("Profile saved!");
    } catch (err: any) {
      setError(err?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!user.uid) {
    return (
      <div className="max-w-2xl border-x border-app-border">
        <PageHeader title="Profile" subtitle="Log in to edit" />
        <div className="p-8 text-center text-black/50">
          Please log in to view and edit your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Profile" subtitle={`@${user.username}`} />

      {/* Avatar upload */}
      <div className="relative h-32 w-full brand-gradient">
        <div className="absolute -bottom-12 left-4">
          <div className="relative">
            <div className="rounded-full border-4 border-white shadow-card">
              <Avatar photoURL={user.photoURL} name={user.name} size={80} />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              {uploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <CameraIcon className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <Link
            href={`/u/${user.username}`}
            className="text-xs text-white/80 bg-black/20 hover:bg-black/40 rounded-full px-3 py-1 transition-colors"
          >
            View public profile →
          </Link>
        </div>
      </div>

      {/* Edit form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-16 mx-4 p-4 rounded-2xl border border-app-border bg-white shadow-card space-y-3"
        onSubmit={handleSave}
      >
        <div className="text-lg font-bold">Edit profile</div>

        <label className="block">
          <div className="text-sm text-black/50 mb-1">Display name</div>
          <input
            className="w-full h-[44px] border border-app-border rounded-xl px-3 outline-none focus:border-app-brand focus:ring-2 focus:ring-app-ring/30 transition"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </label>
        <label className="block">
          <div className="text-sm text-black/50 mb-1">Username</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
              @
            </span>
            <input
              className="w-full h-[44px] border border-app-border rounded-xl pl-7 pr-3 outline-none focus:border-app-brand focus:ring-2 focus:ring-app-ring/30 transition"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
        </label>
        <label className="block">
          <div className="text-sm text-black/50 mb-1">Bio</div>
          <textarea
            className="w-full min-h-[88px] border border-app-border rounded-xl p-3 outline-none focus:border-app-brand focus:ring-2 focus:ring-app-ring/30 transition resize-none"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell people about yourself…"
          />
        </label>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          className="h-[44px] px-6 rounded-full bg-app-brand text-white font-bold disabled:opacity-60 hover:bg-app-brand-dark transition-colors shadow-sm"
        >
          {saving ? "Saving…" : "Save changes"}
        </motion.button>
      </motion.form>

      {/* Own posts */}
      <div className="mt-4 border-t border-app-border">
        <div className="px-4 py-3 font-bold text-[15px]">Your posts</div>
        {posts.length === 0 ? (
          <div className="p-6 text-center text-black/40 text-sm">
            Nothing posted yet.
          </div>
        ) : (
          posts.map((p, i) => <Post key={p.id} data={p} id={p.id} index={i} />)
        )}
      </div>
    </div>
  );
}
