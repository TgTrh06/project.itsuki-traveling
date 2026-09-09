export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  lastLogin?: string | Date;
  createdAt?: string | Date;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  content?: string;
  cover?: string;
  readTime?: string | number;
  imageUrl?: string;
  author?: User | string;
  destination?: Destination | string;
  interests?: Array<Interest | string>;
  location?: Location;
  meta?: { views?: number; likes?: string[]; likesCount?: number };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Destination {
  _id: string;
  title: string;
  slug: string;
  svgId?: string;
  description?: string;
  imageUrl?: string;
  region?: string;
  articleCount?: number;
}

export interface Interest {
  _id: string;
  title: string;
  slug: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: User | string;
  article?: string;
  createdAt?: string | Date;
}

export interface PlanItem {
  _id: string;
  title?: string;
  location?: Location;
  meta?: unknown;
}

export interface ApiErrorResponse {
  message?: string;
}
