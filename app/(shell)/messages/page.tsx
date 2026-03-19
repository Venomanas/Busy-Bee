"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { createOrGetConversation, subscribeMyConversations } from "@/lib/chat";
import { uidForUsername } from "@/lib/usernames";

export default function MessagesPage() {
  const uid = useSelector((s: RootState) => s.user.uid);
  const [convos, setConvos] = React.useState<any[]>([]);
  const [startUsername, setStartUsername] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!uid) {
      setConvos([]);
      return;
    }
    return subscribeMyConversations(uid, setConvos);
  }, [uid]);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Messages" subtitle={uid ? "Realtime" : "Log in to chat"} />

      {uid ? (
        <div className="p-3 border-b border-app-border bg-white">
          <form
            className="flex gap-2 items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              const otherUid = await uidForUsername(startUsername);
              if (!otherUid) {
                setError("User not found.");
                return;
              }
              if (otherUid === uid) {
                setError("You can’t message yourself.");
                return;
              }
              const id = await createOrGetConversation(uid, otherUid);
              setStartUsername("");
              window.location.href = `/messages/${id}`;
            }}
          >
            <input
              className="flex-1 h-[44px] rounded-full border border-app-border px-4 outline-none focus:border-app-brand"
              placeholder="Start chat with @username"
              value={startUsername}
              onChange={(e) => setStartUsername(e.target.value.replace(/^@/, ""))}
            />
            <button className="h-[44px] px-4 rounded-full bg-app-brand text-white font-semibold" disabled={!startUsername.trim()}>
              Start
            </button>
          </form>
          {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
        </div>
      ) : null}

      {!uid ? (
        <div className="p-4 text-black/70">Log in to see your conversations.</div>
      ) : convos.length ? (
        <div className="divide-y divide-app-border">
          {convos.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className="block p-4 hover:bg-app-muted">
              <div className="font-semibold">Conversation</div>
              <div className="text-sm text-black/60 truncate">{c.lastMessagePreview || "No messages yet"}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 text-black/60">No conversations yet.</div>
      )}
    </div>
  );
}

