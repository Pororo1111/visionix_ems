"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const { toggleSidebar, isMobile } = useSidebar();
  // PC에서는 네브바를 숨김, 모바일에서만 보임
  return (
    <nav className="flex items-center justify-between h-14 px-4 border-b bg-primary text-primary-foreground md:hidden">
      <div className="flex items-center">
        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={toggleSidebar}
          className="mr-2 rounded-md p-2 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg">Visionix EMS</span>
      </div>
      <ThemeToggle />
    </nav>
  );
} 