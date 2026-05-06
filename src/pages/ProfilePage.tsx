import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { AvatarUpload } from '../../components/ui/avatar-upload';
import { Loader2, User, Mail, Phone, MapPin, Calendar, BookOpen, Heart, GraduationCap, Save, Pencil, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  avatar?: string | null;
  title?: string | null;
  teachingStyle?: string | null;
  hobby?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    class?: { name: string; level?: { name: string }; homeroomTeacher?: { user?: { name: string } } } | null;
    enrollments?: Array<{ subject?: { name: string } }>;
  } | null;
  teacher?: {
    subjects?: Array<{ name: string }>;
    homeroomClass?: { name: string; level?: { name: string } } | null;
  } | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setFormData({
          name: json.data.name,
          phone: json.data.phone || '',
          address: json.data.address || '',
          birthDate: json.data.birthDate ? new Date(json.data.birthDate).toISOString().split('T')[0] : '',
          birthPlace: json.data.birthPlace || '',
          avatar: json.data.avatar || '',
          title: json.data.title || '',
          teachingStyle: json.data.teachingStyle || '',
          hobby: json.data.hobby || '',
        });
      } else {
        toast.error(json.error || 'Failed to load profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(json.error || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || '',
        address: profile.address || '',
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
        birthPlace: profile.birthPlace || '',
        avatar: profile.avatar || '',
        title: profile.title || '',
        teachingStyle: profile.teachingStyle || '',
        hobby: profile.hobby || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  const isTeacher = profile.role === 'TEACHER' || profile.role === 'HOMEROOM_TEACHER';
  const isStudent = profile.role === 'STUDENT';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
              <p className="text-slate-500">Manage your personal information</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Personal Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              {isEditing ? (
                <AvatarUpload
                  value={formData.avatar}
                  onChange={(base64) => setFormData({ ...formData, avatar: base64 })}
                />
              ) : (
                <Avatar className="h-20 w-20 border-2 border-emerald-100">
                  <AvatarImage src={profile.avatar || undefined} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                    {profile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-emerald-50 text-emerald-700">{profile.role}</Badge>
                  {profile.isActive ? (
                    <Badge className="bg-green-50 text-green-700">Active</Badge>
                  ) : (
                    <Badge className="bg-red-50 text-red-700">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-500">Full Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <User className="w-4 h-4 text-slate-400" /> {profile.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Email</Label>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Mail className="w-4 h-4 text-slate-400" /> {profile.email}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Phone</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Your phone number"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" /> {profile.phone || <span className="text-slate-400 italic">Not set</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Gender</Label>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <User className="w-4 h-4 text-slate-400" /> {profile.gender || <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Birth Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-slate-400 italic">Not set</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Birth Place</Label>
                {isEditing ? (
                  <Input
                    value={formData.birthPlace || ''}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Your birthplace"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" /> {profile.birthPlace || <span className="text-slate-400 italic">Not set</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-500">Address</Label>
                {isEditing ? (
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your address"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" /> {profile.address || <span className="text-slate-400 italic">Not set</span>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher-specific Card */}
        {isTeacher && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" /> Teaching Profile
              </CardTitle>
              <CardDescription>Public information displayed on the school website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-500">Academic Title</Label>
                  {isEditing ? (
                    <Input
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. S.Pd, M.Pd"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> {profile.title || <span className="text-slate-400 italic">Not set</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-500">Hobby</Label>
                  {isEditing ? (
                    <Input
                      value={formData.hobby || ''}
                      onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
                      placeholder="Your hobbies"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <Heart className="w-4 h-4 text-slate-400" /> {profile.hobby || <span className="text-slate-400 italic">Not set</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-500">Teaching Style</Label>
                  {isEditing ? (
                    <textarea
                      className="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.teachingStyle || ''}
                      onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value })}
                      placeholder="Describe your teaching approach..."
                    />
                  ) : (
                    <div className="flex items-start gap-2 text-slate-900 font-medium">
                      <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                      {profile.teachingStyle || <span className="text-slate-400 italic">Not set</span>}
                    </div>
                  )}
                </div>
              </div>

              {profile.teacher && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Teaching Details</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.teacher.subjects?.map((s) => (
                      <Badge key={s.name} variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                  {profile.teacher.homeroomClass && (
                    <p className="mt-2 text-sm text-slate-600">
                      Homeroom Teacher: <span className="font-semibold text-emerald-700">{profile.teacher.homeroomClass.level?.name} - {profile.teacher.homeroomClass.name}</span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Student-specific Card */}
        {isStudent && profile.student && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" /> Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-slate-500">Class</Label>
                  <p className="text-slate-900 font-medium">
                    {profile.student.class?.level?.name} - {profile.student.class?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Homeroom Teacher</Label>
                  <p className="text-slate-900 font-medium">
                    {profile.student.class?.homeroomTeacher?.user?.name || 'Not assigned'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">Enrolled Subjects</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.student.enrollments?.map((e, i) => (
                    <Badge key={i} variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                      {e.subject?.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-slate-500">Member Since</Label>
                <p className="text-slate-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <Label className="text-slate-500">Last Updated</Label>
                <p className="text-slate-900 font-medium">
                  {new Date(profile.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
