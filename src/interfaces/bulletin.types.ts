export interface Bulletin {
  id: string;
  title: string;
  content: string;
  image: string | null;
  category: 'EVENT' | 'ACHIEVEMENT' | 'ANNOUNCEMENT';
  status: 'UPCOMING' | 'ONGOING' | 'PAST';
  eventDate: string | null;
  author: { id: string; name: string };
  createdAt: string;
}