import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { getToken } from '../api/client';
import type { TicketMessage } from '../types/complaint';

const SOCKET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export type TicketSocketMessage = TicketMessage & { ticketId: string };

export type TicketUpdatedEvent = {
  ticketId: string;
  status: string;
  assigneeUserId?: string | null;
};

let socket: Socket | null = null;

export function getTicketSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_ORIGIN}/tickets`, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export async function connectTicketSocket(): Promise<Socket> {
  const s = getTicketSocket();
  const token = await getToken();
  s.auth = { token: token ?? '' };
  if (!s.connected) {
    await new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        s.off('connect', onConnect);
        s.off('connect_error', onError);
      };
      s.once('connect', onConnect);
      s.once('connect_error', onError);
      s.connect();
    });
  }
  return s;
}

export function disconnectTicketSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinTicketRoom(s: Socket, ticketId: string) {
  return new Promise<void>((resolve, reject) => {
    s.emit('join', { ticketId }, (res: { ok?: boolean; error?: string }) => {
      if (res?.ok) resolve();
      else reject(new Error(res?.error ?? 'join_failed'));
    });
  });
}

export function leaveTicketRoom(s: Socket, ticketId: string) {
  s.emit('leave', { ticketId });
}

export function sendTicketMessageSocket(
  s: Socket,
  ticketId: string,
  content: string,
): Promise<TicketSocketMessage> {
  return new Promise((resolve, reject) => {
    s.emit(
      'message:send',
      { ticketId, content },
      (res: { ok?: boolean; message?: TicketSocketMessage; error?: string }) => {
        if (res?.ok && res.message) resolve(res.message);
        else reject(new Error(res?.error ?? 'send_failed'));
      },
    );
  });
}
