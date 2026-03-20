"use client";
import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase";
import { getUserProfile, type UserProfile } from "@/lib/users";
import { uidForUsername } from "@/lib/usernames";
import { followUser, unfollowUser, isFollowing } from "@/lib/follows";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import Post from "@/components/Post";
import Avatar from "@/components/Avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username ?? "");
  const router = useRouter();
  const me = useSelector((s: RootState) => s.user);

  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [profileUid, setProfileUid] = React.useState<string | null>(null);
  const [posts, setPosts] = React.useState<any[]>([]);
  const [followed, setFollowed] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Resolve username → uid → profile
  React.useEffect(() => {
    setLoading(true);
    uidForUsername(username).then(async uid => {
      if (!uid) {
        setLoading(false);
        return;
      }
      setProfileUid(uid);
      const p = await getUserProfile(uid);
      setProfile(p);
      setLoading(false);
    });
  }, [username]);

  // Live posts
  React.useEffect(() => {
    if (!profileUid) return;
    const q = query(
      collection(db, "posts"),
      where("authorUid", "==", profileUid),
      orderBy("createdAt", "desc"),
      limit(30),
    );
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [profileUid]);

  // Live profile (follower counts)
  React.useEffect(() => {
    if (!profileUid) return;
    return onSnapshot(doc(db, "users", profileUid), snap => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    });
  }, [profileUid]);

  // Check follow status
  React.useEffect(() => {
    if (!me.uid || !profileUid || me.uid === profileUid) return;
    isFollowing(me.uid, profileUid).then(setFollowed);
  }, [me.uid, profileUid]);

  async function handleFollow() {
    if (!me.uid || !profileUid) return;
    setFollowLoading(true);
    try {
      if (followed) {
        await unfollowUser(me.uid, profileUid);
        setFollowed(false);
      } else {
        await followUser(me.uid, profileUid);
        setFollowed(true);
      }
    } finally {
      setFollowLoading(false);
    }
  }

  const isMe = me.uid && me.uid === profileUid;

  if (loading) {
    return (
      <div className="max-w-2xl border-x border-app-border">
        <div className="py-4 px-3 flex items-center gap-3 border-b border-app-border">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-full hover:bg-app-muted"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="skeleton h-5 w-32 rounded" />
        </div>
        {/* cover skeleton */}
        <div className="skeleton h-32 w-full" />
        <div className="p-4 -mt-10 flex justify-between items-end mb-4">
          <div className="skeleton w-20 h-20 rounded-full border-4 border-white" />
        </div>
        <div className="px-4 space-y-2 pb-4">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-4 w-full rounded" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl border-x border-app-border p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="text-black/50 mt-2">@{username} doesn't exist</p>
        <Link
          href="/"
          className="mt-4 inline-block text-app-brand hover:underline"
        >
          ← Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl border-x border-app-border">
      {/* Header */}
      <div className="py-3 px-3 flex items-center gap-3 sticky top-0 z-50 glass border-b border-app-border">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-app-muted transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <div className="font-bold text-[17px]">{profile.displayName}</div>
          <div className="text-xs text-black/50">{posts.length} posts</div>
        </div>
      </div>

      {/* Cover */}
      <div className="relative">
        <div className="h-36 w-full brand-gradient" />
        <div className="absolute -bottom-10 left-4">
          <div className="rounded-full border-4 border-white shadow-card">
            <Avatar
              photoURL={profile.photoURL}
              name={profile.displayName}
              size={80}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end px-4 pt-3">
        {isMe ? (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 h-[36px] px-4 rounded-full border border-app-border font-semibold text-sm hover:bg-app-muted transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit profile
          </Link>
        ) : me.uid ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFollow}
            disabled={followLoading}
            className={`h-[36px] px-5 rounded-full font-bold text-sm transition-all shadow-sm ${
              followed
                ? "border border-app-border bg-white hover:border-red-300 hover:text-red-500"
                : "bg-app-brand text-white hover:bg-app-brand-dark"
            } disabled:opacity-60`}
          >
            {followLoading ? "…" : followed ? "Following" : "Follow"}
          </motion.button>
        ) : null}
      </div>

      {/* Bio section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pt-12 pb-4"
      >
        <h1 className="text-xl font-bold">{profile.displayName || "User"}</h1>
        <div className="text-black/50 text-sm">@{profile.username}</div>
        {profile.bio && (
          <p className="mt-2 text-[15px] leading-snug">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-5 mt-4">
          <Link
            href={`/u/${username}/following`}
            className="flex gap-1 text-sm hover:underline"
          >
            <span className="font-bold">{profile.followingCount ?? 0}</span>
            <span className="text-black/50">Following</span>
          </Link>
          <Link
            href={`/u/${username}/followers`}
            className="flex gap-1 text-sm hover:underline"
          >
            <span className="font-bold">{profile.followersCount ?? 0}</span>
            <span className="text-black/50">Followers</span>
          </Link>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="border-b border-app-border" />

      {/* Posts */}
      <AnimatePresence initial={false}>
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-black/40"
          >
            <div className="text-4xl mb-2">📭</div>
            <p>No posts yet</p>
          </motion.div>
        ) : (
          posts.map((p, i) => <Post key={p.id} data={p} id={p.id} index={i} />)
        )}
      </AnimatePresence>
    </div>
  );
}
