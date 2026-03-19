"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { followUser, unfollowUser } from "@/lib/follows";
import { doc } from "firebase/firestore";

export default function FriendsPage() {
  const me = useSelector((s: RootState) => s.user);
  const [users, setUsers] = React.useState<any[]>([]);
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const qRef = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(qRef, (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  React.useEffect(() => {
    if (!me.uid) {
      setFollowing({});
      return;
    }
    const unsub = onSnapshot(collection(db, "follows", me.uid, "following"), (snap) => {
      const next: Record<string, boolean> = {};
      snap.docs.forEach((d) => (next[d.id] = true));
      setFollowing(next);
    });
    return () => unsub();
  }, [me.uid]);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Friends" subtitle={me.uid ? "Follow people" : "Log in to follow"} />
      <div className="p-3 space-y-3">
        {users
          .filter((u) => u.id !== me.uid)
          .map((u) => {
            const isFollow = !!following[u.id];
            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 p-3 rounded-app border border-app-border bg-white"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{u.displayName || u.authorName || "User"}</div>
                  <div className="text-sm text-black/60 truncate">@{u.username || u.authorUsername || u.id.slice(0, 8)}</div>
                  <div className="text-xs text-black/50 mt-1">
                    {u.followersCount ?? 0} followers · {u.followingCount ?? 0} following
                  </div>
                </div>
                <button
                  disabled={!me.uid}
                  className={`h-[40px] px-4 rounded-full font-semibold ${
                    isFollow ? "bg-white border border-app-border" : "bg-app-brand text-white"
                  } disabled:opacity-60`}
                  onClick={async () => {
                    if (!me.uid) return;
                    if (isFollow) await unfollowUser(me.uid, u.id);
                    else await followUser(me.uid, u.id);
                  }}
                >
                  {isFollow ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        {!users.length ? <div className="p-4 text-black/60">No users yet.</div> : null}
      </div>
    </div>
  );
}

