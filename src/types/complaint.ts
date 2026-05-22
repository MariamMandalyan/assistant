export type ComplaintStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'waiting_citizen'
  | 'resolved'
  | 'closed';

export type ComplaintImage = {
  id: string;
  uri: string;
  fileName?: string;
  /** Server URL — Image needs Authorization header */
  remote?: boolean;
};

export type Complaint = {
  id: string;
  subject: string;
  description: string;
  departmentName?: string;
  status: ComplaintStatus;
  referenceCode: string;
  images: ComplaintImage[];
  /** When list loaded without full image URLs */
  imageCount?: number;
  createdAt: string;
};

export type NewComplaintInput = {
  subject: string;
  description: string;
  departmentId?: string;
  images: ComplaintImage[];
};
