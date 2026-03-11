"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Megaphone,
  PhoneOff,
  BookOpen,
  Phone,
} from "lucide-react";

const navItems = [
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Do Not Call", href: "/do-not-call", icon: PhoneOff },
  { label: "Knowledge", href: "/knowledge-bases", icon: BookOpen },
  { label: "Phone Nos", href: "/phone-numbers", icon: Phone },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm leading-tight">
            Rooster Partners
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Global Search */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Global Search"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-gray-500"} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function MobileTopBar() {
  const pathname = usePathname();
  const current = navItems.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );
  const pageTitle = current?.label ?? "Dashboard";

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">{pageTitle}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">RP</span>
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 min-w-[240px] bg-white border-r border-gray-200 flex-col h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
