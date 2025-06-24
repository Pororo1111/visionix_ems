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
} from "@/components/ui/sidebar";
import { Home, Monitor, Settings, User } from "lucide-react";
import Link from "next/link";

export default function AppSidebar() {
  return (
    <Sidebar>
      {/* 상단 로고/앱명 */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <Monitor className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">Visionix EMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* 메인 메뉴 그룹 */}
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    <span>대시보드</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/device">
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
              <Link href="#">
                <User className="w-4 h-4 mr-2" />
                <span>내 정보</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <Settings className="w-4 h-4 mr-2" />
                <span>설정</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 