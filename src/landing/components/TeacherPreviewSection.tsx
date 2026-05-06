import { useTeachers } from '../hooks/useTeachers';
import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { GraduationCap, Heart, BookOpen, AlertCircle } from 'lucide-react';

export function TeacherPreviewSection() {
  const { teachers, loading, error } = useTeachers();

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Meet Our Teachers</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Dedicated educators committed to nurturing every student's potential with passion and expertise.
          </p>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">Failed to load teachers</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && teachers.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No teachers available at the moment.</p>
          </div>
        )}

        {!loading && !error && teachers.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="overflow-hidden border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50/50 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-emerald-100 group-hover:border-emerald-200 transition-colors">
                      <AvatarImage src={teacher.avatar || undefined} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-bold">
                        {teacher.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-900">{teacher.name}</h3>
                      {teacher.title && (
                        <p className="text-sm text-emerald-600 font-medium">{teacher.title}</p>
                      )}
                      {teacher.homeroomClass && (
                        <p className="text-xs text-slate-400">Wali Kelas {teacher.homeroomClass}</p>
                      )}
                    </div>
                  </div>

                  {teacher.teachingStyle && (
                    <div className="mb-3">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600 leading-relaxed">{teacher.teachingStyle}</p>
                      </div>
                    </div>
                  )}

                  {teacher.hobby && (
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                      <p className="text-sm text-slate-500">
                        <span className="font-medium text-slate-600">Loves:</span> {teacher.hobby}
                      </p>
                    </div>
                  )}

                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                      {teacher.subjects.map((subject) => (
                        <Badge
                          key={subject}
                          variant="outline"
                          className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50/50"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
