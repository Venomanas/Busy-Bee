
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeIcon,
            HashtagIcon,
            UserIcon, 
            BellIcon,
            InboxIcon,
            BookmarkIcon,
            FireIcon,
            EllipsisHorizontalCircleIcon
} from "@heroicons/react/24/outline";
import SidebarUserInfo from "./sidebarUserInfo";
export default function Sidebar() {

  return (
    <nav className="hidden sm:flex flex-col sticky top-0 p-3 h-screen xl:ml-20 xl:mr-10 ">
      <div className="relative h-full flex flex-col">
        <div className="py-3">
          <Image src={"/assets/beee.jpg"} width={48} height={48} alt="logo" />
        </div>
        <ul>
          <SidebarLink href="/" Icon={HomeIcon} text="Home" />
          <SidebarLink href="/explore" Icon={HashtagIcon} text="Explore" />
          <SidebarLink href="/notifications" Icon={BellIcon} text="Notification" />
          <SidebarLink href="/friends" Icon={FireIcon} text="Friends" />
          <SidebarLink href="/messages" Icon={InboxIcon} text="Messages" />
          <SidebarLink href="/bookmarks" Icon={BookmarkIcon} text="Bookmarks" />
          <SidebarLink href="/profile" Icon={UserIcon} text="Profile" />
          <SidebarLink href="/more" Icon={EllipsisHorizontalCircleIcon} text="More" />
          <button className="hidden xl:block bg-[#f4af01] w-[200px] h-[52px] rounded-full text-white font-medium cursor-pointer shadow-md mt-2">
            Bumble
          </button>
        </ul>
      <SidebarUserInfo />
      </div>
    </nav>
  );
}

//typeScript stpped crying after hover over icon and pastwd wiered syntax in 8nterface and then in sidebarlink function get siderbarLinkProps 

interface SidebarLinkProps {
  text: string;
  href: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
}

function SidebarLink({ text, Icon, href } : SidebarLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center text-xl mb-2 space-x-3 p-2.5 rounded-full hover:bg-app-muted transition-colors"
      >
        <Icon className="h-7" />
        <span className="hidden xl:block">{text}</span>
      </Link>
    </li>
  );
}
