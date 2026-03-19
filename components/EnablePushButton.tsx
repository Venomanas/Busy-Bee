"use client";

import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { enableWebPush } from "@/lib/push";

export default function EnablePushButton() {
  const uid = useSelector((s: RootState) => s.user.uid);
  const [status, setStatus] = React.useState<string | null>(null);

  if (!uid) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        className="h-[40px] px-4 rounded-full bg-black text-white font-semibold"
        onClick={async () => {
          setStatus(null);
          try {
            await enableWebPush(uid);
            setStatus("Push enabled.");
          } catch (e: any) {
            setStatus(e?.message ?? "Failed to enable push.");
          }
        }}
      >
        Enable push
      </button>
      {status ? <div className="text-sm text-black/60">{status}</div> : null}
    </div>
  );
}

