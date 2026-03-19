"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { uidForUsername } from "@/lib/usernames";
import { getUserProfile } from "@/lib/users";

export default function ExplorePage() {
  const [q, setQ] = React.useState("");
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Explore" subtitle="Search users" />
      <div className="p-4 space-y-3">
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setResult(null);
            const uid = await uidForUsername(q);
            if (!uid) {
              setError("No user found.");
              return;
            }
            const profile = await getUserProfile(uid);
            setResult(profile);
          }}
        >
          <input
            className="flex-1 h-[44px] rounded-full border border-app-border px-4 outline-none focus:border-app-brand"
            placeholder="Search by exact @username"
            value={q}
            onChange={(e) => setQ(e.target.value.replace(/^@/, ""))}
          />
          <button className="h-[44px] px-4 rounded-full bg-app-brand text-white font-semibold" disabled={!q.trim()}>
            Search
          </button>
        </form>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {result ? (
          <div className="p-4 rounded-app border border-app-border bg-white">
            <div className="font-semibold">{result.displayName || "User"}</div>
            <div className="text-sm text-black/60">@{result.username}</div>
            {result.bio ? <div className="mt-2 text-sm">{result.bio}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

