"use client";
import Image from "next/image";
import React from "react";

interface AvatarProps {
  photoURL?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

function stringToColor(str: string) {
  const palette = [
    "#F4AF01",
    "#F97316",
    "#EC4899",
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#3B82F6",
    "#EF4444",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function Avatar({
  photoURL,
  name,
  size = 40,
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  if (photoURL && !imgError) {
    return (
      <Image
        src={photoURL}
        width={size}
        height={size}
        alt={name ?? "avatar"}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  const bg = stringToColor(name ?? "user");
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.floor(size * 0.38));

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize }}
      aria-label={name ?? "avatar"}
    >
      {initials}
    </div>
  );
}
