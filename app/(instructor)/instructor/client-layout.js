"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LayoutDashboard, Menu, Wallet, X } from "lucide-react";

const menuItems = [
  { title: "Trang Chủ", url: "/", icon: Home, end: true },
  { title: "Dashboard", url: "/instructor", icon: LayoutDashboard, end: true },
  { title: "Khóa Học", url: "/instructor/courses", icon: BookOpen },
  { title: "Ví", url: "/instructor/wallet", icon: Wallet },
];

export default function InstructorLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile); // desktop mở, mobile đóng
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Đóng sidebar khi chọn menu trên mobile
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* --- SIDEBAR --- */}
      <aside
        className={`${isMobile
          ? `fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-64`
          : `w-64 sticky top-0 h-screen`
          } bg-[#0f172a] text-white border-r border-slate-800 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-bold whitespace-nowrap">
            Instructor Portal
          </h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-slate-700 transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400 px-2 mb-2">
            Quản Lý
          </p>
          {menuItems.map((item) => {
            const isActive = item.end
              ? pathname === item.url
              : pathname.startsWith(item.url);

            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? "bg-slate-700 text-white"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
                  }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-700 text-sm font-semibold">
            N
          </div>
        </div>
      </aside>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center px-6 gap-4 sticky top-0 z-10">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">
            Instructor Dashboard
          </h1>
        </header>

        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}