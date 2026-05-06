import React from "react";
import { Badge } from "../../components/ui/badge";
import { Calendar, User } from "lucide-react";

interface BulletinPreviewProps {
  title: string;
  content: string;
  image?: string;
  media?: Array<{ image: string; order: number }>;
  category?: string;
  eventDate?: string;
  authorName?: string;
}

export function BulletinPreview({
  title,
  content,
  image,
  media,
  category,
  eventDate,
  authorName,
}: BulletinPreviewProps) {
  const categoryColors: Record<string, string> = {
    EVENT: "bg-blue-100 text-blue-800",
    ACHIEVEMENT: "bg-amber-100 text-amber-800",
    ANNOUNCEMENT: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border shadow-sm overflow-hidden">
      {image && (
        <div className="w-full h-64 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          {category && (
            <Badge className={categoryColors[category] || "bg-gray-100 text-gray-800"}>
              {category}
            </Badge>
          )}
          {eventDate && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(eventDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title || "Untitled Bulletin"}</h2>
        {authorName && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="w-4 h-4" />
            {authorName}
          </div>
        )}
        <div
          className="prose prose-sm max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: content || "<p>No content yet...</p>" }}
        />
        {media && media.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-4">
            {media.map((m, i) => (
              <div key={i} className="rounded-lg overflow-hidden border">
                <img src={m.image} alt={`Media ${i + 1}`} className="w-full h-40 object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
