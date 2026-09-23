import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(onReportNew, onReportUpdated) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('🔌 Socket connected'));
    socket.on('report:new', (report) => onReportNew?.(report));
    socket.on('report:updated', (report) => onReportUpdated?.(report));
    socket.on('connect_error', (err) => console.log('Socket error:', err.message));

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}