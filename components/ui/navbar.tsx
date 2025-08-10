"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const { toggleSidebar, open } = useSidebar();
  
  return (
    <>
      {/* 모바일 네브바 - 고정 위치 */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-primary text-primary-foreground md:hidden">
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
      
      {/* 데스크톱 - 사이드바가 닫혔을 때만 표시되는 열기 버튼 */}
      {!open && (
        <div className="hidden md:flex fixed top-6 left-0 z-50">
          <button
            type="button"
            aria-label="사이드바 열기"
            onClick={toggleSidebar}
            className="h-12 w-6 bg-background border border-border shadow-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 rounded-r-lg flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
} 