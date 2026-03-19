"use client";

import React from "react";

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="py-4 px-3 sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-app-border">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-display font-semibold">{title}</h1>
        {subtitle ? <div className="text-sm text-black/60">{subtitle}</div> : null}
      </div>
    </div>
  );
}

