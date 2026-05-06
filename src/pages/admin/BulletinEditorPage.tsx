import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { RichTextEditor } from "../../components/RichTextEditor";
import { BulletinPreview } from "../../components/BulletinPreview";
import { AvatarUpload } from "../../../components/ui/avatar-upload";
import { fileToBase64, validateImageFile } from "../../../lib/file-utils";
import { toast } from "sonner";
import { Loader2, Plus, Eye, Trash2, ImagePlus } from "lucide-react";

interface Bulletin {
  id: string;
  title: string;
  content: string;
  image?: string;
  isPublished: boolean;
  category: string;
  eventDate?: string;
  status: string;
  author: { name: string };
  media: Array<{ image: string; order: number }>;
  createdAt: string;
}

const CATEGORIES = [
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "EVENT", label: "Event" },
  { value: "ACHIEVEMENT", label: "Achievement" },
];

export default function BulletinEditorPage() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBulletin, setPreviewBulletin] = useState<Bulletin | null>(null);

  const [form, setForm] = useState({
    id: "",
    title: "",
    content: "",
    image: "",
    category: "ANNOUNCEMENT",
    eventDate: "",
    isPublished: false,
    media: [] as string[],
  });

  useEffect(() => {
    loadBulletins();
  }, []);

  const loadBulletins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bulletins");
      const data = await res.json();
      if (data.success) setBulletins(data.data);
    } catch (err) {
      toast.error("Failed to load bulletins");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ id: "", title: "", content: "", image: "", category: "ANNOUNCEMENT", eventDate: "", isPublished: false, media: [] });
  };

  const handleSubmit = async (publish = false) => {
    try {
      const { id, ...payload } = { ...form, isPublished: publish };
      // Strip empty date strings before sending
      if (payload.eventDate === "") payload.eventDate = null;
      const url = form.id ? `/api/admin/bulletins/${form.id}` : "/api/admin/bulletins";
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(publish ? "Bulletin published" : "Bulletin saved as draft");
        resetForm();
        setActiveTab("list");
        loadBulletins();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save bulletin");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bulletin?")) return;
    try {
      const res = await fetch(`/api/admin/bulletins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Bulletin deleted");
        loadBulletins();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const openPreview = (bulletin: Bulletin) => {
    setPreviewBulletin(bulletin);
    setPreviewOpen(true);
  };

  const openEdit = (bulletin: Bulletin) => {
    setForm({
      id: bulletin.id,
      title: bulletin.title,
      content: bulletin.content,
      image: bulletin.image || "",
      category: bulletin.category,
      eventDate: bulletin.eventDate ? new Date(bulletin.eventDate).toISOString().split("T")[0] : "",
      isPublished: bulletin.isPublished,
      media: bulletin.media.map((m) => m.image),
    });
    setActiveTab("editor");
  };

  const addMediaImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setForm({ ...form, media: [...form.media, base64] });
      } catch {
        toast.error("Failed to process image");
      }
    };
    input.click();
  };

  const removeMedia = (index: number) => {
    setForm({ ...form, media: form.media.filter((_, i) => i !== index) });
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "EVENT": return "bg-blue-100 text-blue-800";
      case "ACHIEVEMENT": return "bg-amber-100 text-amber-800";
      default: return "bg-emerald-100 text-emerald-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bulletin Management</h1>
        <p className="text-slate-500 mt-1">Create and manage school bulletins with rich content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Bulletins</TabsTrigger>
          <TabsTrigger value="editor">{form.id ? "Edit Bulletin" : "Create Bulletin"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : bulletins.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No bulletins yet</CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {bulletins.map((b) => (
                <Card key={b.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={categoryColor(b.category)}>{b.category}</Badge>
                          {!b.isPublished && <Badge variant="outline">Draft</Badge>}
                        </div>
                        <CardTitle className="text-lg">{b.title}</CardTitle>
                        <CardDescription>By {b.author.name} • {new Date(b.createdAt).toLocaleDateString()}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openPreview(b)}><Eye className="h-3.5 w-3.5 mr-1" /> Preview</Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(b)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Bulletin Content</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2" placeholder="Enter bulletin title" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Event Date (optional)</Label>
                    <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="mt-2" />
                  </div>
                  <div>
                    <Label>Cover Image (optional)</Label>
                    <AvatarUpload
                      value={form.image}
                      onChange={(base64) => setForm({ ...form, image: base64 || "" })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <div className="mt-2">
                      <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
                    </div>
                  </div>
                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Additional Images</span>
                      <Button type="button" variant="outline" size="sm" onClick={addMediaImage}><ImagePlus className="h-3.5 w-3.5 mr-1" /> Add Image</Button>
                    </Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {form.media.map((img, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border">
                          <img src={img} alt="" className="w-full h-20 object-cover" />
                          <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
                <CardContent>
                  <BulletinPreview
                    title={form.title}
                    content={form.content}
                    image={form.image}
                    media={form.media.map((img, i) => ({ image: img, order: i }))}
                    category={form.category}
                    eventDate={form.eventDate}
                    authorName="Admin"
                  />
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleSubmit(false)}>Save Draft</Button>
                <Button className="flex-1" onClick={() => handleSubmit(true)}>Publish</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Bulletin Preview</DialogTitle></DialogHeader>
          {previewBulletin && (
            <BulletinPreview
              title={previewBulletin.title}
              content={previewBulletin.content}
              image={previewBulletin.image}
              media={previewBulletin.media}
              category={previewBulletin.category}
              eventDate={previewBulletin.eventDate}
              authorName={previewBulletin.author.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
