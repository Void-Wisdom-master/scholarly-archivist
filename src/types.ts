import { type User } from './api';

export type View = 'LIBRARY' | 'GALLERY' | 'CHAT';

export interface Collection {
  id: string;
  title: string;
  description: string;
  sourceCount: number;
  lastUpdated: string;
  createdAt?: string;
  icon: string;
  collectionNum: string;
  isFinished?: boolean;
}

export interface ArchiveCard {
  id: string;
  category: string;
  categoryColor: string;
  date: string;
  title: string;
  content: string;
  source: string;
  icon: string;
  image?: string;
  actionIcon: string;
}

export interface Source {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  url?: string;
  summary?: string;
  contentText?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

export interface Artifact {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
}

export interface ReviewCard {
  front: string;
  back: string;
  tags?: string[];
}
