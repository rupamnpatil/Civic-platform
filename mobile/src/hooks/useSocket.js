import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../api/client';

/**
 * useSocket
 * @param {Function} onReportNew - called when a new report is created
 * @param {Function} onReportUpdated - called when a report is updated
 * @param {Function} onReportDeleted - called when a report is deleted
 * @param {Function} onAnnouncementNew - called when a new announcement is posted
 * @param {Function} onAnnouncementDeleted - called when an announcement is deleted
 */
export default function useSocket({
  onReportNew,
  onReportUpdated,
  onReportDeleted,
  onAnnouncementNew,
  onAnnouncementDeleted,
} = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token || !isMounted) return;

      const socket = io(SERVER_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => console.log('🔌 Mobile Socket connected'));
      socket.on('connect_error', (err) =>
        console.log('Mobile Socket error:', err.message)
      );

      socket.on('report:new', (data) => onReportNew?.(data));
      socket.on('report:updated', (data) => onReportUpdated?.(data));
      socket.on('report:deleted', (data) => onReportDeleted?.(data));
      socket.on('announcement:new', (data) => onAnnouncementNew?.(data));
      socket.on('announcement:deleted', (data) => onAnnouncementDeleted?.(data));
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef.current;
}
