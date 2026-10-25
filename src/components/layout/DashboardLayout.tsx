import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "../../../components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "../../lib/auth-context";
import { Badge } from "../../../components/ui/badge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 h-9 w-9 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" />
            <div className="hidden md:flex items-center gap-2">
               <span className="text-sm font-semibold text-slate-800">Academic Year: <span className="text-emerald-600">2023/2024 - Sem 2</span></span>
               <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] uppercase px-2">{user?.role} VIEW</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase">{user?.role}</p>
             </div>
             <div className="h-10 w-10 bg-emerald-50 rounded-full border-2 border-emerald-600 flex items-center justify-center font-bold text-emerald-700 overflow-hidden shadow-sm">
                {user?.name?.charAt(0)}
             </div>
          </div>
        </header>
        <main className="p-6 md:p-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
