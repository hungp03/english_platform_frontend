"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* === Sidebar === */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r shadow-lg transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:relative md:shadow-none`}
      >
        {/* Header trong sidebar (chỉ hiện trên mobile) */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="font-semibold text-lg">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <AdminSidebar />
      </div>

      {/* === Overlay khi mở menu trên mobile === */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === Main content === */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-card md:hidden flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
