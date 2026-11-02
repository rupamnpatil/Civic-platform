import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(
  onReportNew,
  onReportUpdated,
  onReportDeleted,
  onAnnouncementNew,
  onAnnouncementDeleted
) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('🔌 Socket connected'));
    socket.on('report:new', (report) => onReportNew?.(report));
    socket.on('report:updated', (report) => onReportUpdated?.(report));
    socket.on('report:deleted', (data) => onReportDeleted?.(data));
    socket.on('announcement:new', (data) => onAnnouncementNew?.(data));
    socket.on('announcement:deleted', (data) => onAnnouncementDeleted?.(data));
    socket.on('connect_error', (err) => console.log('Socket error:', err.message));

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}
