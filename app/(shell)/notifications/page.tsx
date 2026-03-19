"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import EnablePushButton from "@/components/EnablePushButton";

export default function NotificationsPage() {
  const uid = useSelector((s: RootState) => s.user.uid);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    const qRef = query(
      collection(db, "notifications", uid, "items"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    return onSnapshot(qRef, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [uid]);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Notifications" subtitle={uid ? "Realtime" : "Log in to see updates"} />
      <div className="p-3 border-b border-app-border bg-white">
        <EnablePushButton />
      </div>
      {!uid ? (
        <div className="p-4 text-black/70">Log in to see your notifications.</div>
      ) : items.length ? (
        <div className="divide-y divide-app-border">
          {items.map((n) => (
            <div key={n.id} className="p-4">
              <div className="text-sm text-black/60">{n.type ?? "notification"}</div>
              <div className="mt-1">
                <span className="font-semibold">@{n.actorUsername ?? n.actorUid?.slice(0, 8)}</span>{" "}
                <span className="text-black/70">{n.message ?? ""}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-black/60">No notifications yet.</div>
      )}
    </div>
  );
}

