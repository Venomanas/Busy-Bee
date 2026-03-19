"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { collection, limit, onSnapshot, orderBy, query, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { sendMessage } from "@/lib/chat";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const convoId = params.id;
  const uid = useSelector((s: RootState) => s.user.uid);
  const [rows, setRows] = React.useState<any[]>([]);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    const qRef = query(
      collection(db, "conversations", convoId, "messages"),
      orderBy("createdAt", "asc"),
      limit(200),
    );
    return onSnapshot(qRef, async (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      // Mark latest as read for this user (lightweight)
      if (uid) {
        const last = snap.docs[snap.docs.length - 1];
        if (last) {
          await updateDoc(doc(db, "conversations", convoId, "messages", last.id), {
            [`readBy.${uid}`]: serverTimestamp(),
          });
        }
      }
    });
  }, [convoId, uid]);

  return (
    <div className="max-w-2xl border-x border-app-border min-h-[70vh] flex flex-col">
      <div className="py-4 px-3 sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-app-border flex items-center gap-3">
        <Link href="/messages" className="flex items-center">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="font-display text-lg font-semibold">Conversation</div>
      </div>

      <div className="flex-1 p-3 space-y-2">
        {rows.map((m) => {
          const mine = m.senderUid === uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-app px-3 py-2 border ${
                  mine ? "bg-app-muted border-app-border" : "bg-white border-app-border"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="p-3 border-t border-app-border bg-white flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!uid || !text.trim()) return;
          const msg = text.trim();
          setText("");
          await sendMessage(convoId, uid, msg);
        }}
      >
        <input
          className="flex-1 h-[44px] rounded-full border border-app-border px-4 outline-none focus:border-app-brand"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
        />
        <button className="h-[44px] px-4 rounded-full bg-app-brand text-white font-semibold" disabled={!uid || !text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

