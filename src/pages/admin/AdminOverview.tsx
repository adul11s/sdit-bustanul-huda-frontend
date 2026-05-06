import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Users, GraduationCap, BookOpen, Calculator, TrendingUp, UserPlus, ArrowRight, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStudents: 0, totalTeachers: 0, totalAdmins: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      });
    fetch("/api/admin/users?page=1&limit=5")
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecentUsers(data.data);
      });
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-emerald-500", path: "/admin/users" },
    { title: "Students", value: stats.totalStudents, icon: GraduationCap, color: "bg-green-500", path: "/admin/users?role=STUDENT" },
    { title: "Teachers", value: stats.totalTeachers, icon: BookOpen, color: "bg-purple-500", path: "/admin/users?role=TEACHER" },
    { title: "Admins", value: stats.totalAdmins, icon: Calculator, color: "bg-orange-500", path: "/admin/users?role=ADMIN" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin/users?action=create")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(stat.path)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" onClick={() => navigate("/admin/classes")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Manage Classes
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/admin/subjects")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Manage Subjects
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/admin/academic-years")}>
              <Calendar className="mr-2 h-4 w-4" />
              Academic Years
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/admin/promotions")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Student Promotions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <Badge variant="outline" className="capitalize">{user.role.toLowerCase().replace("_", " ")}</Badge>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-center text-slate-500 py-4">No users yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}