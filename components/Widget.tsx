"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase";
import { followUser, unfollowUser } from "@/lib/follows";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import Avatar from "@/components/Avatar";
import { motion } from "framer-motion";

function extractHashtags(posts: any[]): { tag: string; count: number }[] {
  const freq: Record<string, number> = {};
  posts.forEach(p => {
    const matches = (p.text ?? "").match(/#[\w]+/g) ?? [];
    matches.forEach((tag: string) => {
      const t = tag.toLowerCase();
      freq[t] = (freq[t] ?? 0) + 1;
    });
  });
  return Object.entries(freq)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function Widget() {
  const router = useRouter();
  const me = useSelector((s: RootState) => s.user);
  const [searchQ, setSearchQ] = React.useState("");
  const [trending, setTrending] = React.useState<
    { tag: string; count: number }[]
  >([]);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});

  // Live trending hashtags
  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(60),
    );
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => d.data());
      setTrending(extractHashtags(docs));
    });
  }, []);

  // Live "Who to Follow" — real users from Firestore
  React.useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(8),
    );
    return onSnapshot(q, snap => {
      setSuggestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Track following state
  React.useEffect(() => {
    if (!me.uid) {
      setFollowing({});
      return;
    }
    const unsub = onSnapshot(
      collection(db, "follows", me.uid, "following"),
      snap => {
        const next: Record<string, boolean> = {};
        snap.docs.forEach(d => (next[d.id] = true));
        setFollowing(next);
      },
    );
    return () => unsub();
  }, [me.uid]);

  const filteredSuggestions = suggestions
    .filter(u => u.id !== me.uid && !following[u.id])
    .slice(0, 3);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim())
      router.push(`/explore?q=${encodeURIComponent(searchQ.trim())}`);
  }

  return (
    <div className="p-3 hidden lg:flex flex-col space-y-4 w-[340px] ps-6">
      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 bg-app-muted h-[44px] rounded-full pl-4 pr-2 border border-transparent focus-within:border-app-brand focus-within:bg-white transition-all shadow-sm"
      >
        <MagnifyingGlassIcon className="w-4 h-4 text-black/40 flex-shrink-0" />
        <input
          type="text"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="Search Bumble"
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-black/40"
        />
      </form>

      {/* Trending */}
      <div className="bg-app-muted rounded-2xl p-4 space-y-1">
        <h2 className="text-[17px] font-bold mb-3">Trending</h2>
        {trending.length === 0 && (
          <p className="text-sm text-black/40 py-2">
            No trends yet – post something with a #hashtag!
          </p>
        )}
        {trending.map(({ tag, count }, i) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/explore?q=${encodeURIComponent(tag)}`}
              className="flex flex-col py-2.5 border-b border-app-border/60 last:border-0 group"
            >
              <span className="text-xs text-black/40">Trending</span>
              <span className="font-bold text-sm group-hover:text-app-brand transition-colors">
                {tag}
              </span>
              <span className="text-xs text-black/40">
                {count} {count === 1 ? "post" : "posts"}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Who to follow */}
      {filteredSuggestions.length > 0 && (
        <div className="bg-app-muted rounded-2xl p-4 space-y-1">
          <h2 className="text-[17px] font-bold mb-3">Who to follow</h2>
          {filteredSuggestions.map((u, i) => {
            const isFollow = !!following[u.id];
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center justify-between py-2 gap-2"
              >
                <Link
                  href={`/u/${u.username}`}
                  className="flex items-center gap-2 min-w-0 group"
                >
                  <Avatar
                    photoURL={u.photoURL}
                    name={u.displayName}
                    size={36}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate group-hover:text-app-brand transition-colors">
                      {u.displayName || "User"}
                    </div>
                    <div className="text-xs text-black/50 truncate">
                      @{u.username}
                    </div>
                  </div>
                </Link>
                {me.uid && (
                  <button
                    onClick={async () => {
                      if (isFollow) await unfollowUser(me.uid, u.id);
                      else await followUser(me.uid, u.id);
                    }}
                    className={`text-xs h-[30px] px-3 rounded-full font-semibold flex-shrink-0 transition-all ${
                      isFollow
                        ? "border border-app-border bg-white hover:text-red-500"
                        : "bg-app-fg text-white hover:bg-app-fg/80"
                    }`}
                  >
                    {isFollow ? "Following" : "Follow"}
                  </button>
                )}
              </motion.div>
            );
          })}
          <Link
            href="/friends"
            className="block text-sm text-app-brand hover:underline pt-1"
          >
            Show more →
          </Link>
        </div>
      )}
    </div>
  );
}
