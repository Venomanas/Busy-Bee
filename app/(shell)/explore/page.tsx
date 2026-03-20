"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { searchUsers, type UserProfile } from "@/lib/users";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import UserCard from "@/components/UserCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";

function extractHashtags(posts: any[]): { tag: string; count: number }[] {
  const freq: Record<string, number> = {};
  posts.forEach(p => {
    const matches = (p.text ?? "").match(/#[\w]+/g) ?? [];
    matches.forEach((tag: string) => {
      freq[tag.toLowerCase()] = (freq[tag.toLowerCase()] ?? 0) + 1;
    });
  });
  return Object.entries(freq)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";

  const me = useSelector((s: RootState) => s.user);
  const [q, setQ] = React.useState(initialQ);
  const [results, setResults] = React.useState<UserProfile[]>([]);
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});
  const [trending, setTrending] = React.useState<
    { tag: string; count: number }[]
  >([]);
  const [searching, setSearching] = React.useState(false);

  // Trending hashtags from posts
  React.useEffect(() => {
    const qRef = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(80),
    );
    return onSnapshot(qRef, snap => {
      setTrending(extractHashtags(snap.docs.map(d => d.data())));
    });
  }, []);

  // Follow state
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

  // Debounced search
  React.useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsers(q.trim(), 12);
      setResults(res);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // Sync URL q param to input on mount
  React.useEffect(() => {
    if (initialQ) setQ(initialQ);
  }, [initialQ]);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <div className="sticky top-0 z-50 glass border-b border-app-border p-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search people by name…"
            className="w-full h-[44px] bg-app-muted rounded-full pl-10 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-app-ring transition-all text-sm"
          />
        </div>
      </div>

      {/* Trending hashtag pills */}
      {!q && trending.length > 0 && (
        <div className="p-4 border-b border-app-border">
          <h2 className="font-bold text-[15px] mb-3">Trending topics</h2>
          <div className="flex flex-wrap gap-2">
            {trending.map(({ tag, count }, i) => (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setQ(tag)}
                className="px-3 py-1.5 rounded-full bg-app-brand/10 text-app-brand text-sm font-semibold hover:bg-app-brand hover:text-white transition-all"
              >
                {tag} <span className="opacity-60 font-normal">·{count}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      <div className="divide-y divide-app-border">
        {searching && (
          <div className="p-6 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-app-brand border-t-transparent rounded-full mx-auto"
            />
          </div>
        )}
        <AnimatePresence>
          {!searching && q && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-black/40"
            >
              <div className="text-3xl mb-2">🔍</div>
              <p>No users found for "{q}"</p>
            </motion.div>
          )}
          {results.map(profile => (
            <div key={profile.uid} className="px-3 py-1">
              <UserCard
                profile={profile}
                isFollowing={!!following[profile.uid]}
                currentUid={me.uid || undefined}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {!q && (
        <div className="p-8 text-center text-black/40">
          <div className="text-4xl mb-3">🌍</div>
          <p className="font-medium">Find people on Bumble</p>
          <p className="text-sm mt-1">
            Search by name or click a trending topic
          </p>
        </div>
      )}
    </div>
  );
}
