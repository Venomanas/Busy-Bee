"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  HomeIcon,
  HashtagIcon,
  UserIcon,
  BellIcon,
  InboxIcon,
  BookmarkIcon,
  FireIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  HashtagIcon as HashtagSolid,
  UserIcon as UserSolid,
  BellIcon as BellSolid,
  InboxIcon as InboxSolid,
  BookmarkIcon as BookmarkSolid,
  FireIcon as FireSolid,
} from "@heroicons/react/24/solid";
import SidebarUserInfo from "./sidebarUserInfo";
import { motion, type Variants } from "framer-motion";

const navItems = [
  { href: "/", text: "Home", Icon: HomeIcon, ActiveIcon: HomeSolid },
  {
    href: "/explore",
    text: "Explore",
    Icon: HashtagIcon,
    ActiveIcon: HashtagSolid,
  },
  {
    href: "/notifications",
    text: "Notifications",
    Icon: BellIcon,
    ActiveIcon: BellSolid,
  },
  { href: "/friends", text: "Friends", Icon: FireIcon, ActiveIcon: FireSolid },
  {
    href: "/messages",
    text: "Messages",
    Icon: InboxIcon,
    ActiveIcon: InboxSolid,
  },
  {
    href: "/bookmarks",
    text: "Bookmarks",
    Icon: BookmarkIcon,
    ActiveIcon: BookmarkSolid,
  },
  { href: "/profile", text: "Profile", Icon: UserIcon, ActiveIcon: UserSolid },
  {
    href: "/more",
    text: "More",
    Icon: EllipsisHorizontalCircleIcon,
    ActiveIcon: EllipsisHorizontalCircleIcon,
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden sm:flex flex-col sticky top-0 p-3 h-screen xl:ml-20 xl:mr-10">
      <div className="relative h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="py-3"
        >
          <Image
            src="/assets/beee.jpg"
            width={48}
            height={48}
            alt="logo"
            className="rounded-xl"
          />
        </motion.div>

        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-0.5"
        >
          {navItems.map(({ href, text, Icon, ActiveIcon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <motion.li key={href} variants={item}>
                <Link
                  href={href}
                  className={`flex items-center text-[17px] mb-0.5 gap-3 p-2.5 rounded-full transition-colors ${
                    isActive
                      ? "font-bold text-app-brand bg-app-brand/8"
                      : "hover:bg-app-muted hover:text-app-brand"
                  }`}
                >
                  <span className="relative">
                    {isActive ? (
                      <ActiveIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-app-brand"
                      />
                    )}
                  </span>
                  <span className="hidden xl:block">{text}</span>
                </Link>
              </motion.li>
            );
          })}

          <motion.li variants={item}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="hidden xl:flex items-center justify-center bg-app-brand hover:bg-app-brand-dark w-[200px] h-[48px] rounded-full text-white font-bold cursor-pointer shadow-md mt-3 transition-colors"
            >
              Bumble
            </motion.button>
          </motion.li>
        </motion.ul>

        <SidebarUserInfo />
      </div>
    </nav>
  );
}
