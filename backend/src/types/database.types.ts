export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface Page {
  id: string;
  title: string;
  draft_json: string;
  published_json: string;
  craftData: string;
  status: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface PageVersion {
  id: number;
  pageId: number;
  title: string;
  content: string;
  description: string;
  isOriginal: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface Invoice {
  id: number;
  accountNumber: string;
  customerName: string;
  amount: number;
  description?: string;
  status: string;
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Database {
  users: User[];
  pages: Page[];
  invoices: Invoice[];
}