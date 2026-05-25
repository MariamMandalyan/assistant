import { citizenApi } from '../api/citizenApi';
import type { Complaint, NewComplaintInput } from '../types/complaint';

export const complaintsStore = {
  async list(): Promise<Complaint[]> {
    return citizenApi.complaints();
  },

  async listInquiries(): Promise<Complaint[]> {
    return citizenApi.inquiries();
  },

  async get(id: string): Promise<Complaint | null> {
    try {
      return await citizenApi.complaint(id);
    } catch {
      return null;
    }
  },

  async reply(ticketId: string, content: string): Promise<void> {
    await citizenApi.ticketMessage(ticketId, content);
  },

  async create(input: NewComplaintInput): Promise<Complaint> {
    return citizenApi.createComplaint({
      subject: input.subject,
      description: input.description,
      departmentId: input.departmentId,
      images: input.images,
    });
  },
};
