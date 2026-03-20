"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Avatar from "@/components/Avatar";
import { followUser, unfollowUser } from "@/lib/follows";
import type { UserProfile } from "@/lib/users";

interface UserCardProps {
  profile: UserProfile;
  isFollowing?: boolean;
  currentUid?: string;
  onFollowChange?: (uid: string, newState: boolean) => void;
  compact?: boolean;
}

export default function UserCard({
  profile,
  isFollowing = false,
  currentUid,
  onFollowChange,
  compact = false,
}: UserCardProps) {
  const [loading, setLoading] = React.useState(false);
  const [followed, setFollowed] = React.useState(isFollowing);

  React.useEffect(() => {
    setFollowed(isFollowing);
  }, [isFollowing]);

  async function handleFollow(e: React.MouseEvent) {
    e.preventDefault();
    if (!currentUid || loading) return;
    setLoading(true);
    try {
      if (followed) {
        await unfollowUser(currentUid, profile.uid);
        setFollowed(false);
        onFollowChange?.(profile.uid, false);
      } else {
        await followUser(currentUid, profile.uid);
        setFollowed(true);
        onFollowChange?.(profile.uid, true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        href={`/u/${profile.username}`}
        className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-app-border bg-app-card hover:bg-app-muted transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            photoURL={profile.photoURL}
            name={profile.displayName || profile.username}
            size={compact ? 36 : 44}
          />
          <div className="min-w-0">
            <div className="font-semibold text-app-fg truncate group-hover:text-app-brand transition-colors">
              {profile.displayName || "User"}
            </div>
            <div className="text-sm text-black/50 truncate">
              @{profile.username}
            </div>
            {!compact && profile.bio && (
              <div className="text-xs text-black/60 truncate mt-0.5">
                {profile.bio}
              </div>
            )}
            {!compact && (
              <div className="text-xs text-black/40 mt-0.5">
                {profile.followersCount ?? 0} followers
              </div>
            )}
          </div>
        </div>

        {currentUid && currentUid !== profile.uid && (
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`h-[36px] px-4 rounded-full font-semibold text-sm transition-all flex-shrink-0 ${
              followed
                ? "border border-app-border bg-white hover:border-red-300 hover:text-red-500"
                : "bg-app-brand text-white hover:bg-app-brand-dark shadow-sm"
            } disabled:opacity-60`}
          >
            {loading ? "…" : followed ? "Following" : "Follow"}
          </button>
        )}
      </Link>
    </motion.div>
  );
}
