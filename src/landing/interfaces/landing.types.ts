export interface IBulletin {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  category: string;
  eventDate?: string | null;
  status: string;
  createdAt: string;
  author?: { name: string };
}

export interface IInquiryPayload {
  parentName: string;
  studentName: string;
  phone: string;
  email?: string;
  gradeInterest: string;
  message?: string;
}

export interface IInquiryResponse {
  id: string;
  parentName: string;
  studentName: string;
  phone: string;
  email: string | null;
  gradeInterest: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export interface ICurriculumItem {
  title: string;
  description: string;
  icon: string;
}

export interface IActivityItem {
  title: string;
  description: string;
  image?: string;
}

export interface IPublicTeacher {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  teachingStyle?: string | null;
  hobby?: string | null;
  gender?: string | null;
  subjects: string[];
  homeroomClass: string | null;
}
