"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getUsersByUids } from "@/lib/users";
import UserCard from "@/components/UserCard";
import { motion, AnimatePresence } from "framer-motion";
import { query, orderBy, limit } from "firebase/firestore";

type Tab = "discover" | "followers" | "following";

export default function FriendsPage() {
  const me = useSelector((s: RootState) => s.user);
  const [tab, setTab] = React.useState<Tab>("discover");
  const [discoverUsers, setDiscoverUsers] = React.useState<any[]>([]);
  const [followerProfiles, setFollowerProfiles] = React.useState<any[]>([]);
  const [followingProfiles, setFollowingProfiles] = React.useState<any[]>([]);
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});

  // Discover: all users
  React.useEffect(() => {
    const qRef = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(30),
    );
    return onSnapshot(qRef, snap => {
      setDiscoverUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    });
  }, []);

  // Following state
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

  // Followers list
  React.useEffect(() => {
    if (!me.uid || tab !== "followers") return;
    const unsub = onSnapshot(
      collection(db, "follows", me.uid, "followers"),
      async snap => {
        const uids = snap.docs.map(d => d.id);
        const profiles = await getUsersByUids(uids);
        setFollowerProfiles(profiles);
      },
    );
    return () => unsub();
  }, [me.uid, tab]);

  // Following list
  React.useEffect(() => {
    if (!me.uid || tab !== "following") return;
    const unsub = onSnapshot(
      collection(db, "follows", me.uid, "following"),
      async snap => {
        const uids = snap.docs.map(d => d.id);
        const profiles = await getUsersByUids(uids);
        setFollowingProfiles(profiles);
      },
    );
    return () => unsub();
  }, [me.uid, tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "discover", label: "Discover" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
  ];

  const renderList = (list: any[]) =>
    list.length === 0 ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 text-center text-black/40"
      >
        <div className="text-3xl mb-2">👤</div>
        <p>Nothing here yet</p>
      </motion.div>
    ) : (
      <div className="p-3 space-y-1">
        <AnimatePresence initial={false}>
          {list.map(u => (
            <UserCard
              key={u.uid}
              profile={u}
              isFollowing={!!following[u.uid]}
              currentUid={me.uid || undefined}
            />
          ))}
        </AnimatePresence>
      </div>
    );

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader
        title="Friends"
        subtitle={me.uid ? "Your community" : "Log in to follow"}
      />

      {/* Tab switcher */}
      <div className="sticky top-0 z-40 glass border-b border-app-border">
        <div className="flex">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-semibold relative transition-colors ${
                tab === key
                  ? "text-app-fg"
                  : "text-black/40 hover:text-black/70"
              }`}
            >
              {label}
              {tab === key && (
                <motion.div
                  layoutId="friends-tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-10 bg-app-brand rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "discover" &&
            renderList(discoverUsers.filter(u => u.uid !== me.uid))}
          {tab === "followers" &&
            me.uid &&
            renderList(followerProfiles.map(p => ({ ...p, uid: p.uid })))}
          {tab === "following" &&
            me.uid &&
            renderList(followingProfiles.map(p => ({ ...p, uid: p.uid })))}
          {(tab === "followers" || tab === "following") && !me.uid && (
            <div className="p-8 text-center text-black/50">
              Log in to see your connections
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
