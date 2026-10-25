import React, { useState } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  CreditCard,
  ClipboardList,
  UserCircle,
  CalendarDays,
  Settings,
  ChevronDown,
  ChevronRight,
  School,
  Wallet,
  MessageSquare,
  Award
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "../../../components/ui/sidebar";
import { useAuth } from "../../lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../../lib/utils";

interface SubMenuItem {
  title: string;
  url: string;
}

interface MenuGroup {
  title: string;
  icon: React.ElementType;
  url?: string;
  items?: SubMenuItem[];
}

const ADMIN_MENU: MenuGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin" },
  {
    title: "Akademik",
    icon: School,
    items: [
      { title: "Kelas", url: "/admin/classes" },
      { title: "Mata Pelajaran", url: "/admin/subjects" },
      { title: "Tahun Ajaran", url: "/admin/academic-years" },
      { title: "Jadwal", url: "/admin/schedules" },
    ],
  },
  {
    title: "Manajemen",
    icon: Users,
    items: [
      { title: "Pengguna", url: "/admin/users" },
      { title: "Siswa", url: "/admin/students" },
      { title: "Beban Kerja", url: "/admin/workload" },
    ],
  },
  {
    title: "Komunikasi",
    icon: MessageSquare,
    items: [
      { title: "Pengumuman", url: "/admin/bulletins" },
      { title: "Kalender", url: "/calendar" },
    ],
  },
  {
    title: "Keuangan",
    icon: Wallet,
    items: [
      { title: "Keuangan", url: "/finance" },
      { title: "Pertanyaan", url: "/finance/inquiries" },
    ],
  },
];

const TEACHER_MENU: MenuGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/teacher" },
  {
    title: "Akademik",
    icon: BookOpen,
    items: [
      { title: "Jadwal", url: "/teacher/schedule" },
      { title: "Nilai", url: "/teacher/grades" },
      { title: "Buat Ujian", url: "/teacher/exams/create" },
      { title: "Buat Tugas", url: "/teacher/assignments/create" },
    ],
  },
  { title: "Absensi", icon: ClipboardList, url: "/teacher/attendance" },
  { title: "Kalender", icon: CalendarDays, url: "/calendar" },
];

const HOMEROOM_MENU: MenuGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/homeroom" },
  { title: "Kelas Saya", icon: Users, url: "/homeroom/class" },
  {
    title: "Absensi",
    icon: ClipboardList,
    items: [
      { title: "Input Harian", url: "/homeroom/attendance" },
      { title: "Rekap Bulanan", url: "/homeroom/attendance/monthly" },
    ],
  },
  {
    title: "Guru",
    icon: GraduationCap,
    items: [
      { title: "Jadwal", url: "/teacher/schedule" },
      { title: "Nilai", url: "/teacher/grades" },
      { title: "Absensi", url: "/teacher/attendance" },
    ],
  },
  { title: "Kalender", icon: CalendarDays, url: "/calendar" },
];

const STUDENT_MENU: MenuGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/student" },
  { title: "Info Saya", icon: UserCircle, url: "/student/profile" },
  {
    title: "Akademik",
    icon: BookOpen,
    items: [
      { title: "Mata Pelajaran", url: "/student/subjects" },
      { title: "Jadwal", url: "/student/schedule" },
      { title: "Nilai", url: "/student/grades" },
    ],
  },
  {
    title: "Ujian & Tugas",
    icon: Award,
    items: [
      { title: "Ujian", url: "/student/exams" },
      { title: "Tugas", url: "/student/assignments" },
    ],
  },
  { title: "Tagihan", icon: CreditCard, url: "/student/billing" },
  { title: "Kalender", icon: CalendarDays, url: "/calendar" },
];

const FINANCE_MENU: MenuGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/finance" },
  {
    title: "Keuangan",
    icon: Wallet,
    items: [
      { title: "Ringkasan", url: "/finance" },
      { title: "Pertanyaan", url: "/finance/inquiries" },
    ],
  },
  { title: "Kalender", icon: CalendarDays, url: "/calendar" },
];

const PROFILE_ITEM = { title: "Profil Saya", url: "/profile", icon: Settings };

function MenuGroupItem({ group }: { group: MenuGroup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hasSubItems = group.items && group.items.length > 0;
  const isActive = group.url ? location.pathname === group.url : group.items?.some(i => location.pathname === i.url);
  const isOpen = open || isActive;

  if (!hasSubItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<a />}
          isActive={isActive}
          className={cn(
            "h-11 px-4 rounded-xl transition-all font-medium",
            isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-emerald-50/60 hover:text-emerald-600"
          )}
          onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(group.url!); }}
        >
          <group.icon className="h-4 w-4" />
          <span className="text-sm font-semibold">{group.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <div className="space-y-0.5">
        <SidebarMenuButton
          className={cn(
            "h-11 px-4 rounded-xl transition-all font-medium w-full justify-between",
            isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-emerald-50/60 hover:text-emerald-600"
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            <group.icon className="h-4 w-4" />
            <span className="text-sm font-semibold">{group.title}</span>
          </div>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </SidebarMenuButton>
        {isOpen && (
          <div className="ml-6 pl-3 border-l border-slate-100 space-y-0.5">
            {group.items!.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.url)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                  location.pathname === item.url
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getMenu = (): MenuGroup[] => {
    switch (user?.role) {
      case "ADMIN": return ADMIN_MENU;
      case "TEACHER": return TEACHER_MENU;
      case "HOMEROOM_TEACHER": return HOMEROOM_MENU;
      case "STUDENT": return STUDENT_MENU;
      case "FINANCE": return FINANCE_MENU;
      default: return [];
    }
  };

  const menu = getMenu();

  return (
    <Sidebar variant="sidebar" className="border-r border-slate-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-black">
            NI
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Nurul Islam</h2>
            <p className="text-[10px] text-slate-400 font-medium">School Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {menu.map((group) => (
                <MenuGroupItem key={group.title} group={group} />
              ))}
              <SidebarMenuItem className="mt-2 pt-2 border-t border-slate-100">
                <SidebarMenuButton
                  render={<a />}
                  isActive={location.pathname === PROFILE_ITEM.url}
                  className={cn(
                    "h-11 px-4 rounded-xl transition-all font-medium",
                    location.pathname === PROFILE_ITEM.url ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-emerald-50/60 hover:text-emerald-600"
                  )}
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(PROFILE_ITEM.url); }}
                >
                  <PROFILE_ITEM.icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{PROFILE_ITEM.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="px-2 mb-4">
          <div className="flex flex-col gap-1 font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
            <div>ENVIRONMENT: PROD</div>
            <div>DB_SYNC: SUCCESS</div>
            <div>API_HEALTH: 99.9%</div>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="h-11 px-4 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
