import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { Plus, Search, Loader2, Trash2, Edit, Users, FileUp, Download, AlertCircle, CheckCircle, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gender?: string;
  isActive: boolean;
  createdAt: string;
}

const roles = ["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "STUDENT", "FINANCE"];
const genders = ["MALE", "FEMALE"];
const pageSizes = [10, 25, 50, 100];

const USER_CSV_HEADERS = ["name", "email", "role", "phone", "gender", "password"];

function generateUserTemplate(): string {
  const header = USER_CSV_HEADERS.join(",");
  const example1 = '"Budi Santoso","budi@example.com","TEACHER","08123456789","MALE","password123"';
  const example2 = '"Siti Aminah","siti@example.com","STUDENT","08129876543","FEMALE","password123"';
  return [header, example1, example2].join("\n");
}

function parseUserCSV(content: string): Array<{ name: string; email: string; role: string; phone: string; gender: string; password: string }> {
  const lines = content.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const colMap: Record<string, number> = {};
  header.forEach((h, i) => { colMap[h] = i; });

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const name = values[colMap["name"]] || "";
    const email = values[colMap["email"]] || "";
    if (!name || !email) continue;

    results.push({
      name,
      email,
      role: (values[colMap["role"]] || "STUDENT").toUpperCase(),
      phone: values[colMap["phone"]] || "",
      gender: (values[colMap["gender"]] || "").toUpperCase(),
      password: values[colMap["password"]] || "",
    });
  }
  return results;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STUDENT", phone: "", gender: "" });
  const [editForm, setEditForm] = useState({ id: "", name: "", phone: "", password: "", gender: "" });

  // Bulk CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Array<{ name: string; email: string; role: string; phone: string; gender: string; password: string }>>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [bulkDefaultPassword, setBulkDefaultPassword] = useState("password123");
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, limit, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (roleFilter) params.append("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User created successfully");
        setCreateDialogOpen(false);
        setFormData({ name: "", email: "", password: "", role: "STUDENT", phone: "", gender: "" });
        loadUsers();
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch {
      toast.error("Failed to create user");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name: editForm.name, phone: editForm.phone, gender: editForm.gender };
      if (editForm.password) payload.password = editForm.password;
      const res = await fetch(`/api/admin/users/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated");
        setEditDialogOpen(false);
        loadUsers();
      } else {
        toast.error(data.error || "Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setCsvErrors(["Failed to read file"]); return;
      }
      try {
        const parsed = parseUserCSV(content);
        if (parsed.length === 0) {
          setCsvErrors(["No valid users found. Ensure CSV has name and email columns."]); return;
        }
        const errs: string[] = [];
        parsed.forEach((u, i) => {
          if (!roles.includes(u.role)) errs.push(`Row ${i + 2}: Invalid role "${u.role}"`);
          if (u.gender && !genders.includes(u.gender)) errs.push(`Row ${i + 2}: Invalid gender "${u.gender}"`);
        });
        setCsvPreview(parsed);
        setCsvErrors(errs);
      } catch {
        setCsvErrors(["Failed to parse CSV"]); setCsvPreview([]);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleBulkCreate = async () => {
    const validUsers = csvPreview.filter((u) => u.name && u.email);
    if (validUsers.length === 0) { toast.error("No valid users to create"); return; }
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: validUsers, defaultPassword: bulkDefaultPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Created ${data.data.created} users${data.data.errors.length > 0 ? `, ${data.data.errors.length} errors` : ""}`);
        setBulkDialogOpen(false);
        resetBulkState();
        loadUsers();
      } else {
        toast.error(data.error || "Failed to create users");
      }
    } catch {
      toast.error("Failed to bulk create users");
    } finally { setBulkLoading(false); }
  };

  const resetBulkState = () => {
    setCsvFile(null); setCsvPreview([]); setCsvErrors([]); setBulkDefaultPassword("password123");
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([generateUserTemplate()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "user_template.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("User deactivated"); loadUsers(); }
      else { toast.error(data.error); }
    } catch { toast.error("Failed to delete user"); }
  };

  const openEdit = (user: User) => {
    setEditForm({ id: user.id, name: user.name, phone: user.phone || "", password: "", gender: user.gender || "" });
    setEditDialogOpen(true);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage all users in the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { resetBulkState(); setBulkDialogOpen(true); }}><Users className="mr-2 h-4 w-4" />Bulk Create</Button>
          <Button onClick={() => setCreateDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add User</Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Full Name</Label><Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Email</Label><Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Password</Label><Input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v ?? '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => (<SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v ?? '' })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>{genders.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button type="submit">Create User</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v ?? '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{genders.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>New Password (leave blank to keep)</Label><Input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Dialog - CSV Upload */}
      <Dialog open={bulkDialogOpen} onOpenChange={(open) => { if (!open) resetBulkState(); setBulkDialogOpen(open); }}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>Bulk Create Users</DialogTitle>
            <DialogDescription>Upload a CSV file to create multiple users at once</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0">
            {/* Template Download */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Download className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">Need a template?</p>
                <p className="text-xs text-slate-400">Download a sample CSV with the correct format</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />Download Template
              </Button>
            </div>

            {/* Default Password */}
            <div className="space-y-2">
              <Label className="text-slate-700">Default Password (used when CSV password column is empty)</Label>
              <Input value={bulkDefaultPassword} onChange={(e) => setBulkDefaultPassword(e.target.value)} placeholder="password123" />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-slate-700">Upload CSV</Label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200">
                  <FileUp className="h-4 w-4" />
                  {csvFile ? csvFile.name : "Choose CSV File"}
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
                {csvFile && (
                  <Button variant="ghost" size="sm" onClick={() => { setCsvFile(null); setCsvPreview([]); setCsvErrors([]); }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-400">Required columns: name, email. Optional: role, phone, gender, password</p>
            </div>

            {/* Errors */}
            {csvErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4" /> Errors found
                </div>
                {csvErrors.map((err, i) => (
                  <p key={i} className="pl-6">{err}</p>
                ))}
              </div>
            )}

            {/* Preview */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-medium text-slate-700">Preview: {csvPreview.length} users ready to import</p>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <div className="max-h-[45vh] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs">Phone</TableHead>
                          <TableHead className="text-xs">Gender</TableHead>
                          <TableHead className="text-xs">Password</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvPreview.map((u, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{u.name}</TableCell>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{u.role}</Badge></TableCell>
                            <TableCell className="text-sm">{u.phone || "-"}</TableCell>
                            <TableCell className="text-sm">{u.gender || "-"}</TableCell>
                            <TableCell className="text-sm">{u.password ? "••••••••" : "default"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-2 gap-2 shrink-0 border-t border-slate-100">
            <Button variant="outline" onClick={() => { setBulkDialogOpen(false); resetBulkState(); }}>Cancel</Button>
            <Button
              onClick={handleBulkCreate}
              disabled={bulkLoading || csvPreview.length === 0 || csvErrors.length > 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
              Create {csvPreview.length} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div><CardTitle>All Users</CardTitle><CardDescription>Total: {total} users</CardDescription></div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search..." className="pl-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v ?? ''); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Roles" /></SelectTrigger>
                <SelectContent><SelectItem value="">All Roles</SelectItem>{roles.map((r) => (<SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant="outline">{user.role?.replace("_", " ")}</Badge></TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell><Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No users found</TableCell></TableRow>)}
                </TableBody>
              </Table>

              {/* Pagination - rows per page on left bottom */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Rows per page</span>
                  <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{pageSizes.map((s) => (<SelectItem key={s} value={s.toString()}>{s}</SelectItem>))}</SelectContent>
                  </Select>
                  <span className="text-sm text-slate-400">
                    {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
