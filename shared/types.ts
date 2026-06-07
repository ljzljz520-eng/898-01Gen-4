export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Attachment {
  id: number;
  questionId?: number;
  answerId?: number;
  filename: string;
  originalName: string;
  fileType: 'schematic' | 'firmware' | 'photo' | 'other';
  fileSize: number;
  license: string;
  downloadCount: number;
  createdAt: string;
}

export interface Question {
  id: number;
  userId: number;
  title: string;
  description: string;
  hardwareType: 'circuit' | 'sensor' | 'case' | 'other';
  firmwareVersion?: string;
  tags: string[];
  status: 'open' | 'solved';
  answerCount: number;
  viewCount: number;
  acceptedAnswerId?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  attachments?: Attachment[];
}

export interface Answer {
  id: number;
  questionId: number;
  userId: number;
  content: string;
  isVerified: boolean;
  verifiedBy?: number;
  isAccepted: boolean;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  attachments?: Attachment[];
}

export interface KnowledgeEntry {
  id: number;
  questionId: number;
  answerId: number;
  title: string;
  summary: string;
  tags: string[];
  hardwareType: string;
  createdAt: string;
}

export interface License {
  id: string;
  name: string;
  fullName: string;
  url: string;
  commercialUse: boolean;
  attributionRequired: boolean;
  shareAlike: boolean;
  description: string;
}

export interface CreateQuestionRequest {
  title: string;
  description: string;
  hardwareType: 'circuit' | 'sensor' | 'case' | 'other';
  firmwareVersion?: string;
  tags: string;
  license: string;
}

export interface CreateAnswerRequest {
  content: string;
  isVerified: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
