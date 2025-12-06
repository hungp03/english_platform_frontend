"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardSignature,
  Flag,
  FilePenLine,
  LayoutList,
  Layers,
  ListChecks,
  ShoppingBag,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";

const AdminSidebar = () => {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname === path || pathname.startsWith(path + "/");
  };

  const menuItems = [
    { title: "Tổng quan", path: "/admin", icon: BarChart3 },
    { title: "Quản lí người dùng", path: "/admin/users", icon: Users },
    { title: "Quản lí giảng viên", path: "/admin/instructors", icon: GraduationCap },
    { title: "Quản lí khóa học", path: "/admin/courses", icon: BookOpen },
    { title: "Quản lí phân loại forum", path: "/admin/forum/categories", icon: Layers },
    { title: "Quản lí report forum", path: "/admin/forum/reports", icon: Flag },
    {
      title: "Quản lí danh mục blog",
      path: "/admin/content/categories",
      icon: Layers,
    },
    {
      title: "Quản lí blog",
      path: "/admin/content/posts",
      icon: FilePenLine,
    },
    {
      title: "Quản lí loại đề thi",
      path: "/admin/quiz-types",
      icon: ListChecks,
    },
    {
      title: "Quản lí phần thi",
      path: "/admin/quiz-sections",
      icon: LayoutList,
    },
    {
      title: "Quản lí đề thi",
      path: "/admin/quizzes",
      icon: ClipboardSignature,
    },
    { title: "Quản lí đơn hàng", path: "/admin/orders", icon: ShoppingBag },
    { title: "Quản lí rút tiền", path: "/admin/withdrawals", icon: Wallet },
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-6 flex-shrink-0">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Panel
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-smooth group ${active
                  ? "bg-gradient-primary text-white shadow-soft"
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:text-primary"}`} />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;