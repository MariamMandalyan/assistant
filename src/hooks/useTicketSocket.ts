import { useCallback, useEffect, useRef, useState } from 'react';
import type { TicketMessage } from '../types/complaint';
import {
  connectTicketSocket,
  joinTicketRoom,
  leaveTicketRoom,
  sendTicketMessageSocket,
  type TicketSocketMessage,
  type TicketUpdatedEvent,
  getTicketSocket,
} from '../socket/ticketSocket';

type Options = {
  ticketId: string;
  enabled?: boolean;
  onNewMessage?: (message: TicketMessage) => void;
  onTicketUpdated?: (payload: TicketUpdatedEvent) => void;
};

export function useTicketSocket({
  ticketId,
  enabled = true,
  onNewMessage,
  onTicketUpdated,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const onMessageRef = useRef(onNewMessage);
  const onUpdatedRef = useRef(onTicketUpdated);
  onMessageRef.current = onNewMessage;
  onUpdatedRef.current = onTicketUpdated;

  useEffect(() => {
    if (!enabled || !ticketId) return;

    let cancelled = false;
    const socket = getTicketSocket();

    const handleMessage = (msg: TicketSocketMessage) => {
      if (msg.ticketId !== ticketId) return;
      onMessageRef.current?.({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        authorType: msg.authorType,
        authorName: msg.authorName ?? null,
      });
    };

    const handleTicketUpdated = (payload: TicketUpdatedEvent) => {
      if (payload.ticketId !== ticketId) return;
      onUpdatedRef.current?.(payload);
    };

    (async () => {
      try {
        await connectTicketSocket();
        if (cancelled) return;
        await joinTicketRoom(socket, ticketId);
        if (cancelled) return;
        setConnected(true);
        socket.on('message:new', handleMessage);
        socket.on('ticket:updated', handleTicketUpdated);
      } catch {
        setConnected(false);
      }
    })();

    return () => {
      cancelled = true;
      setConnected(false);
      socket.off('message:new', handleMessage);
      socket.off('ticket:updated', handleTicketUpdated);
      leaveTicketRoom(socket, ticketId);
    };
  }, [ticketId, enabled]);

  const sendMessage = useCallback(
    async (content: string): Promise<TicketMessage | null> => {
      const trimmed = content.trim();
      if (!trimmed) return null;
      setSending(true);
      try {
        const socket = getTicketSocket();
        if (!socket.connected) await connectTicketSocket();
        await joinTicketRoom(socket, ticketId);
        const msg = await sendTicketMessageSocket(socket, ticketId, trimmed);
        return {
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt,
          authorType: msg.authorType,
          authorName: msg.authorName ?? null,
        };
      } finally {
        setSending(false);
      }
    },
    [ticketId],
  );

  return { connected, sending, sendMessage };
}
