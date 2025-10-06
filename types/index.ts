
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  pdfUrl?: string;
  audioUrl?: string;
  summary: string;
  languages: string[];
  translations: { [languageCode: string]: BookTranslation };
  price?: number;
  isPurchased: boolean;
  isInLibrary: boolean;
  createdAt: string;
  updatedAt: string;
  writerId?: string;
  notes: Note[];
  highlights: Highlight[];
}

export interface BookTranslation {
  title: string;
  description: string;
  summary: string;
  pdfUrl?: string;
  audioUrl?: string;
}

export interface Note {
  id: string;
  bookId: string;
  content: string;
  page?: number;
  position?: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  page?: number;
  position?: string;
  color: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'reader' | 'writer';
  subscription?: Subscription;
  purchasedBooks: string[];
  personalLibrary: string[];
}

export interface Subscription {
  id: string;
  type: 'monthly' | 'yearly';
  isActive: boolean;
  expiresAt: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
