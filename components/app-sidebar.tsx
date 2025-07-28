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
            style={{ overflow: "visible", height: "100%" }}
            className="min-h-0 h-full flex-none"
        >
            <Sidebar className="bg-gradient-to-b from-[var(--sidebar)] to-[var(--sidebar-accent)] shadow-xl border-r border-[var(--sidebar-border)] rounded-r-2xl overflow-hidden">
                {/* 상단 로고/앱명 */}
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-4 py-4 bg-[var(--sidebar-primary)] rounded-br-2xl shadow-md">
                        <Monitor className="w-7 h-7 text-[var(--sidebar-primary-foreground)] drop-shadow" />
                        <span className="font-extrabold text-xl tracking-tight text-[var(--sidebar-primary-foreground)]">
                            Visionix EMS
                        </span>
                    </div>
                </SidebarHeader>
                <SidebarContent className="overflow-hidden px-2">
                    {/* 메인 메뉴 그룹 */}
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[var(--sidebar-accent-foreground)] font-semibold tracking-wide text-xs uppercase mb-1">
                            메뉴
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem className="mb-1">
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === "/"}
                                        className="rounded-lg transition-all duration-150 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] focus:bg-[var(--sidebar-accent)] focus:text-[var(--sidebar-accent-foreground)] px-3 py-2 shadow-sm"
                                    >
                                        <Link
                                            href="/"
                                            onClick={handleMenuClick}
                                        >
                                            <Home className="w-4 h-4 mr-2" />
                                            <span>대시보드</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem className="mb-1">
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(
                                            "/device"
                                        )}
                                        className="rounded-lg transition-all duration-150 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] focus:bg-[var(--sidebar-accent)] focus:text-[var(--sidebar-accent-foreground)] px-3 py-2 shadow-sm"
                                    >
                                        <Link
                                            href="/device"
                                            onClick={handleMenuClick}
                                        >
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
                    <div className="bg-[var(--sidebar-accent)] rounded-t-xl px-4 py-3 shadow-inner flex items-center gap-2">
                        <Settings className="w-4 h-4 mr-2 text-[var(--sidebar-accent-foreground)]" />
                        <span className="text-[var(--sidebar-accent-foreground)] font-medium">
                            설정
                        </span>
                    </div>
                </SidebarFooter>
            </Sidebar>
        </motion.div>
    );
}
