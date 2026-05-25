export type CitizenStatus =
  | 'pending_otp'
  | 'active'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'suspended';

export interface CitizenProfile {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  status: CitizenStatus;
  passportNumber: string | null;
  verifiedAt: string | null;
}

export type ChatProposalStatus =
  | 'confirmed'
  | 'wrong_service'
  | 'out_of_scope';

export interface ChatMessageAttachment {
  id: string;
  fileName: string;
  mimeType: string | null;
  uri: string;
  remote?: boolean;
}

export interface ChatMessageMetadata {
  type?: 'proposal' | 'ticket_created';
  source?: 'voice' | 'text';
  status?: ChatProposalStatus;
  departmentId?: string;
  departmentName?: string;
  formulatedSubject?: string;
  formulatedDescription?: string;
  suggestedDepartmentCode?: string | null;
  confirmed?: boolean;
  ticketId?: string;
  referenceCode?: string;
  ticketKind?: 'inquiry' | 'complaint';
  proposalMessageId?: string;
  escalateSuggested?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'staff' | 'system';
  content: string;
  metadata?: ChatMessageMetadata;
  attachments?: ChatMessageAttachment[];
  createdAt: string;
}

export interface ChatProposal {
  status: ChatProposalStatus;
  canConfirm: boolean;
  formulatedSubject: string;
  formulatedDescription: string;
  departmentId: string;
  departmentName: string;
  ticketKind: 'inquiry' | 'complaint';
  suggestedDepartmentCode: string | null;
  proposalMessageId: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface CitizenTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  referenceCode: string | null;
  createdAt: string;
  department?: Department | null;
  messages?: { id: string; content: string; createdAt: string }[];
}
