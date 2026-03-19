"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

export default function MorePage() {
  const user = useSelector((s: RootState) => s.user);
  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="More" subtitle="Settings" />
      <div className="p-4 space-y-3">
        <div className="rounded-app border border-app-border bg-white p-4">
          <div className="font-semibold font-display">Account</div>
          <div className="text-sm text-black/60 mt-1">
            {user.uid ? `Logged in as @${user.username}` : "Not logged in"}
          </div>
          {user.uid ? (
            <button
              className="mt-3 h-[40px] px-4 rounded-full border border-app-border font-semibold hover:bg-app-muted"
              onClick={async () => {
                await signOut(auth);
              }}
            >
              Sign out
            </button>
          ) : null}
        </div>

        <div className="rounded-app border border-app-border bg-white p-4 text-sm text-black/70">
          Moderation/reporting UI will be added next (Phase 6).
        </div>
      </div>
    </div>
  );
}

