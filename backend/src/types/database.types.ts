export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
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