export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface ComplaintCategory {
  id: number;
  name: string;
}

export interface Complaint {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
  response: string | null;
}

export interface ComplaintResponse {
  id: number;
  response: string;
  status: ComplaintStatus;
}
