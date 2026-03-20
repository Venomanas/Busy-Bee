"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import EnablePushButton from "@/components/EnablePushButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserPlusIcon,
  BellIcon,
} from "@heroicons/react/24/solid";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  like: {
    icon: HeartIcon,
    color: "text-app-brand bg-app-brand/10",
    label: "liked your post",
  },
  comment: {
    icon: ChatBubbleOvalLeftEllipsisIcon,
    color: "text-black bg-black/8",
    label: "commented on your post",
  },
  follow: {
    icon: UserPlusIcon,
    color: "text-app-brand bg-app-brand/10",
    label: "followed you",
  },
  default: { icon: BellIcon, color: "text-black/50 bg-app-muted", label: "" },
};

function NotifItem({ n, uid }: { n: any; uid: string }) {
  const cfg = TYPE_CONFIG[n.type as string] ?? TYPE_CONFIG.default!;
  const IconComp = cfg.icon;

  async function markRead() {
    if (n.readAt) return;
    await updateDoc(doc(db, "notifications", uid, "items", n.id), {
      readAt: new Date().toISOString(),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      onClick={markRead}
      className={`flex items-start gap-3 p-4 border-b border-app-border cursor-pointer transition-colors ${n.readAt ? "bg-white" : "bg-app-brand/5 hover:bg-app-brand/10"}`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}
      >
        <IconComp className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold">
          @{n.actorUsername ?? n.actorUid?.slice(0, 8)}
        </span>{" "}
        <span className="text-black/70">{n.message ?? cfg.label}</span>
        {n.postText && (
          <p className="text-sm text-black/50 mt-0.5 truncate">
            "{n.postText}"
          </p>
        )}
        {!n.readAt && (
          <span className="inline-block mt-1 text-[10px] font-semibold text-app-brand bg-app-brand/10 px-2 py-0.5 rounded-full">
            New
          </span>
        )}
      </div>
    </motion.div>
  );
}

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
    return onSnapshot(qRef, snap =>
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    );
  }, [uid]);

  const unread = items.filter(n => !n.readAt).length;

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader
        title="Notifications"
        subtitle={
          uid
            ? unread > 0
              ? `${unread} new`
              : "All caught up"
            : "Log in to see updates"
        }
      />
      <div className="p-3 border-b border-app-border">
        <EnablePushButton />
      </div>

      {!uid ? (
        <div className="p-8 text-center text-black/50">
          Log in to see your notifications.
        </div>
      ) : items.length ? (
        <AnimatePresence initial={false}>
          {items.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <NotifItem n={n} uid={uid} />
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center text-black/40"
        >
          <div className="text-4xl mb-2">🔔</div>
          <p>Nothing yet — stay active to get notified!</p>
        </motion.div>
      )}
    </div>
  );
}
