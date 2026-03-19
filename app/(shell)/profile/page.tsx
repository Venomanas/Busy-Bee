"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { reserveUsername, updateUserProfile } from "@/lib/users";
import { updateProfile } from "firebase/auth";
import { auth } from "@/firebase";

export default function ProfilePage() {
  const user = useSelector((s: RootState) => s.user);
  const [displayName, setDisplayName] = React.useState(user.name);
  const [username, setUsername] = React.useState(user.username);
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDisplayName(user.name);
    setUsername(user.username);
    setBio(user.bio ?? "");
  }, [user.name, user.username, user.bio]);

  return (
    <div className="max-w-2xl border-x border-app-border">
      <PageHeader title="Profile" subtitle={user.uid ? `@${user.username}` : "Log in to edit"} />

      {!user.uid ? (
        <div className="p-4 text-black/70">Please log in to view and edit your profile.</div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="rounded-app border border-app-border bg-white p-4 shadow-soft">
            <div className="text-sm text-black/60 mb-2">Public profile</div>
            <div className="font-display text-2xl">{user.name || "Unnamed"}</div>
            <div className="text-black/60">@{user.username}</div>
            {user.bio ? <div className="mt-2 whitespace-pre-wrap">{user.bio}</div> : null}
          </div>

          <form
            className="rounded-app border border-app-border bg-white p-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSuccess(null);
              setSaving(true);
              try {
                const uid = user.uid;
                const reserved = await reserveUsername(username, uid);
                await updateUserProfile(uid, { displayName, username: reserved, bio });
                if (auth.currentUser) {
                  await updateProfile(auth.currentUser, { displayName });
                }
                setSuccess("Saved.");
              } catch (err: any) {
                setError(err?.message ?? "Save failed.");
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="text-lg font-semibold font-display">Edit profile</div>
            <label className="block">
              <div className="text-sm text-black/60 mb-1">Display name</div>
              <input
                className="w-full h-[44px] border border-app-border rounded-app px-3 outline-none focus:border-app-brand transition"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-sm text-black/60 mb-1">Username</div>
              <input
                className="w-full h-[44px] border border-app-border rounded-app px-3 outline-none focus:border-app-brand transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-sm text-black/60 mb-1">Bio</div>
              <textarea
                className="w-full min-h-[88px] border border-app-border rounded-app p-3 outline-none focus:border-app-brand transition"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {success ? <div className="text-sm text-green-700">{success}</div> : null}

            <button
              type="submit"
              disabled={saving}
              className="h-[44px] px-4 rounded-full bg-app-brand text-white font-semibold disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

