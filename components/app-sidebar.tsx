"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Monitor, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AppSidebar() {
  const sidebar = useSidebar();
  const pathname = usePathname();
  const handleMenuClick = () => {
    if (sidebar.isMobile) sidebar.setOpenMobile(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{ overflow: 'visible', height: '100%' }}
      className="min-h-0 h-full flex-none"
    >
      <Sidebar>
        {/* 상단 로고/앱명 */}
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-3">
            <Monitor className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">Visionix EMS</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          {/* 메인 메뉴 그룹 */}
          <SidebarGroup>
            <SidebarGroupLabel>메뉴</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/"}>
                    <Link href="/" onClick={handleMenuClick}>
                      <Home className="w-4 h-4 mr-2" />
                      <span>대시보드</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/device")}> 
                    <Link href="/device" onClick={handleMenuClick}>
                      <Monitor className="w-4 h-4 mr-2" />
                      <span>디바이스 관리</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          {/* 기타 그룹/메뉴 추가 가능 */}
        </SidebarContent>
        {/* 하단 유저/설정 */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="#" onClick={handleMenuClick}>
                  <Settings className="w-4 h-4 mr-2" />
                  <span>설정</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </motion.div>
  );
} 