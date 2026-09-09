import type { Types } from "mongoose";

export type UserRole = "user" | "admin";

export interface UserFields {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationFields {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface ArticleFields {
  title: string;
  slug: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  location?: LocationFields;
  meta: { views: number; likes: Types.ObjectId[] };
  author: Types.ObjectId;
  destination: Types.ObjectId;
  interests: Types.ObjectId[];
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DestinationFields {
  title: string;
  slug: string;
  svgId: string;
  description?: string;
  imageUrl?: string;
  region?: string;
  articles: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InterestFields {
  title: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentFields {
  user: Types.ObjectId;
  article: Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface PlanItemFields {
  _id: string;
  title?: string;
  location?: LocationFields;
  meta?: unknown;
}

export interface PlanFields {
  user: Types.ObjectId;
  items: PlanItemFields[];
  createdAt: Date;
  updatedAt: Date;
}
