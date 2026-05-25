import { Platform } from 'react-native';
import { API_BASE_URL } from '../config';
import { apiRequest, apiUploadFile } from './client';
import type { Complaint, ComplaintImage, ComplaintStatus } from '../types/complaint';
import type {
  ChatMessage,
  ChatMessageAttachment,
  ChatProposal,
  CitizenProfile,
  CitizenTicket,
  Department,
} from './types';

type RegisterResponse = { message: string; devOtp?: string };
type VerifyResponse = { accessToken: string; citizen: CitizenProfile };
type ResendResponse = { message: string; devOtp?: string };
type ChatListResponse = { conversationId: string; messages: ChatMessageRaw[] };
type SendChatResponse = {
  conversationId: string;
  userMessage: ChatMessageRaw;
  assistantMessage: ChatMessageRaw;
  proposal: ChatProposalRaw;
};

type ChatProposalRaw = {
  status: string;
  canConfirm: boolean;
  formulatedSubject: string;
  formulatedDescription: string;
  departmentId: string;
  departmentName: string;
  ticketKind?: 'inquiry' | 'complaint';
  suggestedDepartmentCode: string | null;
  proposalMessageId: string;
};

type ConfirmChatResponse = {
  conversationId: string;
  ticket: TicketRaw;
  assistantMessage: ChatMessageRaw;
};

type ChatMessageRaw = {
  id: string;
  role: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  attachments?: TicketAttachmentRaw[];
  createdAt: string;
};

type TicketAttachmentRaw = {
  id: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string;
};

type TicketRaw = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  referenceCode: string | null;
  conversationId?: string | null;
  createdAt: string;
  department?: { id: string; code: string; name: string } | null;
  messages?: {
    id: string;
    content: string;
    createdAt: string;
    authorType?: 'staff' | 'citizen';
    authorUserId?: string | null;
    authorCitizenId?: string | null;
    authorName?: string | null;
  }[];
  attachmentCount?: number;
  attachments?: TicketAttachmentRaw[];
};

function ticketAttachmentFileUrl(ticketId: string, attachmentId: string): string {
  return `${API_BASE_URL}/citizen/tickets/${ticketId}/attachments/${attachmentId}/file`;
}

function chatAttachmentFileUrl(messageId: string, attachmentId: string): string {
  return `${API_BASE_URL}/citizen/chat/messages/${messageId}/attachments/${attachmentId}/file`;
}

function mapAttachments(
  ticketId: string,
  rows: TicketAttachmentRaw[] | undefined,
): ComplaintImage[] {
  return (rows ?? []).map((a) => ({
    id: a.id,
    uri: ticketAttachmentFileUrl(ticketId, a.id),
    fileName: a.fileName,
    remote: true,
  }));
}

function resolveMessageAuthorType(m: {
  authorType?: 'staff' | 'citizen';
  authorUserId?: string | null;
  authorCitizenId?: string | null;
}): 'staff' | 'citizen' {
  if (m.authorType) return m.authorType;
  if (m.authorUserId) return 'staff';
  if (m.authorCitizenId) return 'citizen';
  return 'staff';
}

function mapTicketToComplaint(t: TicketRaw): Complaint {
  const images = mapAttachments(t.id, t.attachments);
  return {
    id: t.id,
    subject: t.subject,
    description: t.description,
    departmentName: t.department?.name,
    status: t.status as ComplaintStatus,
    referenceCode: t.referenceCode ?? '',
    images,
    imageCount: t.attachmentCount ?? images.length,
    conversationId: t.conversationId ?? null,
    messages: (t.messages ?? []).map((m) => ({
      id: m.id,
      content: m.content,
      createdAt:
        typeof m.createdAt === 'string'
          ? m.createdAt
          : new Date(m.createdAt).toISOString(),
      authorType: resolveMessageAuthorType(m),
      authorName: m.authorName ?? null,
    })),
    createdAt:
      typeof t.createdAt === 'string'
        ? t.createdAt
        : new Date(t.createdAt).toISOString(),
  };
}

function guessMime(uri: string, fileName?: string): string {
  const name = (fileName ?? uri).toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.heic') || name.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function mapChatAttachments(
  messageId: string,
  rows: TicketAttachmentRaw[] | undefined,
): ChatMessageAttachment[] {
  return (rows ?? []).map((a) => ({
    id: a.id,
    fileName: a.fileName,
    mimeType: a.mimeType,
    uri: chatAttachmentFileUrl(messageId, a.id),
    remote: true,
  }));
}

function mapChatMessage(m: ChatMessageRaw): ChatMessage {
  return {
    id: m.id,
    role: m.role as ChatMessage['role'],
    content: m.content,
    metadata: m.metadata ?? undefined,
    attachments: mapChatAttachments(m.id, m.attachments),
    createdAt:
      typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt).toISOString(),
  };
}

function mapTicket(t: TicketRaw): CitizenTicket {
  return {
    id: t.id,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    referenceCode: t.referenceCode,
    createdAt:
      typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
    department: t.department ?? null,
    messages: t.messages?.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt:
        typeof m.createdAt === 'string'
          ? m.createdAt
          : new Date(m.createdAt).toISOString(),
    })),
  };
}

export const citizenApi = {
  register(body: {
    phone: string;
    fullName: string;
    email?: string;
    passportNumber?: string;
  }) {
    return apiRequest<RegisterResponse>('/citizen/register', {
      method: 'POST',
      body,
      debugLabel: 'citizen/register',
    });
  },

  verifyOtp(body: { phone: string; code: string }) {
    return apiRequest<VerifyResponse>('/citizen/verify-otp', {
      method: 'POST',
      body,
    });
  },

  resendOtp(body: { phone: string }) {
    return apiRequest<ResendResponse>('/citizen/resend-otp', {
      method: 'POST',
      body,
    });
  },

  me() {
    return apiRequest<CitizenProfile>('/citizen/me', { auth: true });
  },

  updateMe(body: { fullName?: string; passportNumber?: string }) {
    return apiRequest<CitizenProfile>('/citizen/me', {
      method: 'PATCH',
      body,
      auth: true,
    });
  },

  departments() {
    return apiRequest<Department[]>('/citizen/departments', { auth: true });
  },

  async tickets() {
    const data = await apiRequest<TicketRaw[]>('/citizen/tickets', { auth: true });
    return data.map(mapTicket);
  },

  async ticket(id: string) {
    const data = await apiRequest<TicketRaw>(`/citizen/tickets/${id}`, { auth: true });
    return mapTicket(data);
  },

  createTicket(body: {
    subject: string;
    description: string;
    departmentId?: string;
    conversationId?: string;
  }) {
    return apiRequest<TicketRaw>('/citizen/tickets', {
      method: 'POST',
      body,
      auth: true,
    }).then(mapTicket);
  },

  ticketMessage(ticketId: string, content: string) {
    return apiRequest<{ id: string; content: string; createdAt: string }>(
      `/citizen/tickets/${ticketId}/messages`,
      { method: 'POST', body: { content }, auth: true },
    );
  },

  async chatMessages() {
    const data = await apiRequest<ChatListResponse>('/citizen/chat/messages', {
      auth: true,
    });
    return {
      conversationId: data.conversationId,
      messages: data.messages.map(mapChatMessage),
    };
  },

  transcribeVoice(fileUri: string, fileName = 'voice.m4a') {
    return apiUploadFile<{ text: string }>(
      '/citizen/chat/transcribe',
      {
        uri: fileUri,
        name: fileName,
        type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4',
      },
      'citizen/chat transcribe',
    );
  },

  async sendChat(
    content: string,
    images: ComplaintImage[] = [],
    departmentId?: string,
  ) {
    const data = await apiRequest<SendChatResponse>('/citizen/chat/messages', {
      method: 'POST',
      body: {
        content,
        ...(departmentId ? { departmentId } : {}),
      },
      auth: true,
    });
    const userMessage = mapChatMessage(data.userMessage);
    const uploaded: ChatMessageAttachment[] = [];

    for (const img of images) {
      if (!img.uri || img.remote) continue;
      const att = await apiUploadFile<TicketAttachmentRaw>(
        `/citizen/chat/messages/${userMessage.id}/attachments`,
        {
          uri: img.uri,
          name: img.fileName ?? `photo-${img.id}.jpg`,
          type: guessMime(img.uri, img.fileName),
        },
        'citizen/chat attachment',
      );
      uploaded.push({
        id: att.id,
        fileName: att.fileName,
        mimeType: att.mimeType,
        uri: chatAttachmentFileUrl(userMessage.id, att.id),
        remote: true,
      });
    }

    const userWithPhotos = { ...userMessage, attachments: uploaded };

    return {
      conversationId: data.conversationId,
      userMessage: userWithPhotos,
      assistantMessage: mapChatMessage(data.assistantMessage),
      proposal: mapProposal(data.proposal),
    };
  },

  ticketAttachmentFileUrl,
  chatAttachmentFileUrl,

  async listTickets(): Promise<Complaint[]> {
    const data = await apiRequest<TicketRaw[]>('/citizen/tickets', { auth: true });
    return data.map(mapTicketToComplaint);
  },

  async complaints(): Promise<Complaint[]> {
    const all = await this.listTickets();
    return all.filter((t) => !t.conversationId);
  },

  async inquiries(): Promise<Complaint[]> {
    const all = await this.listTickets();
    return all.filter((t) => !!t.conversationId);
  },

  async complaint(id: string): Promise<Complaint> {
    const data = await apiRequest<TicketRaw>(`/citizen/tickets/${id}`, {
      auth: true,
    });
    return mapTicketToComplaint(data);
  },

  async createComplaint(body: {
    subject: string;
    description: string;
    departmentId?: string;
    images: ComplaintImage[];
  }): Promise<Complaint> {
    const ticket = await this.createTicket({
      subject: body.subject,
      description: body.description,
      departmentId: body.departmentId,
    });

    for (const img of body.images) {
      if (!img.uri || img.remote) continue;
      await apiUploadFile<TicketAttachmentRaw>(
        `/citizen/tickets/${ticket.id}/attachments`,
        {
          uri: img.uri,
          name: img.fileName ?? `photo-${img.id}.jpg`,
          type: guessMime(img.uri, img.fileName),
        },
        'citizen/ticket attachment',
      );
    }

    return this.complaint(ticket.id);
  },

  async confirmChat(proposalMessageId: string) {
    const data = await apiRequest<ConfirmChatResponse>('/citizen/chat/confirm', {
      method: 'POST',
      body: { proposalMessageId },
      auth: true,
    });
    return {
      conversationId: data.conversationId,
      ticket: mapTicket(data.ticket),
      assistantMessage: mapChatMessage(data.assistantMessage),
    };
  },
};

function mapProposal(p: ChatProposalRaw): ChatProposal {
  return {
    status: p.status as ChatProposal['status'],
    canConfirm: p.canConfirm,
    formulatedSubject: p.formulatedSubject,
    formulatedDescription: p.formulatedDescription,
    departmentId: p.departmentId,
    departmentName: p.departmentName,
    ticketKind: p.ticketKind === 'complaint' ? 'complaint' : 'inquiry',
    suggestedDepartmentCode: p.suggestedDepartmentCode,
    proposalMessageId: p.proposalMessageId,
  };
}
