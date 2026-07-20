'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Bell, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7086/api';
const HUB_URL = `${API_URL.replace(/\/api\/?$/, '')}/notificationHub`;

type RealtimeNotification = {
  id: number;
  message: string;
};

type ApiNotification = {
  notificationId: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const getAccessToken = (): string => {
  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return '';

  try {
    const session = JSON.parse(storedUser) as Record<string, unknown>;
    const directToken = session.AccessToken || session.accessToken || session.token;
    if (typeof directToken === 'string') return directToken;

    const auth = session.Auth || session.auth;
    if (typeof auth === 'object' && auth !== null) {
      const authData = auth as Record<string, unknown>;
      const nestedToken = authData.AccessToken || authData.accessToken || authData.token;
      if (typeof nestedToken === 'string') return nestedToken;
    }
  } catch {
    return '';
  }

  return '';
};

const isLoggedIn = (): boolean => {
  return !!getAccessToken();
};

export default function RealtimeProvider() {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const nextId = useRef(0);
  const connectionRef = useRef<import('@microsoft/signalr').HubConnection | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;
  const lastFetchedCount = useRef(0);
  const displayedIds = useRef(new Set<string>());

  const loadUnreadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get<{ items: ApiNotification[]; totalCount: number }>(
        '/Notification?isRead=false&pageSize=10&pageNumber=1'
      );
      
      const items = response.items || [];
      
      // Chỉ hiển thị thông báo chưa từng hiển thị
      const newNotifications: RealtimeNotification[] = [];
      
      for (const item of items) {
        if (!displayedIds.current.has(item.notificationId)) {
          displayedIds.current.add(item.notificationId);
          newNotifications.push({
            id: ++nextId.current,
            message: item.message,
          });
        }
      }
      
      if (newNotifications.length > 0) {
        setNotifications((current) => [...newNotifications.reverse(), ...current]);
      }
      
      lastFetchedCount.current = items.length;
      
      // Lưu vào localStorage để không hiện lại khi reload
      localStorage.setItem('seal_displayed_notifications', JSON.stringify([...displayedIds.current]));
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }, []);

  const loadDisplayedIds = useCallback(() => {
    try {
      const stored = localStorage.getItem('seal_displayed_notifications');
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        displayedIds.current = new Set(ids);
      }
    } catch {
      // Ignore
    }
  }, []);

  const startConnection = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    // Stop existing connection if any
    if (connectionRef.current) {
      connectionRef.current.off('ReceiveNotification');
      if (connectionRef.current.state !== HubConnectionState.Disconnected) {
        await connectionRef.current.stop();
      }
    }

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('ReceiveNotification', (message: string) => {
      const notification = { id: ++nextId.current, message };
      setNotifications((current) => [notification, ...current]);

      // Invalidate specific queries related to scoring and rankings
      void queryClient.invalidateQueries({ queryKey: ['scores'] });
      void queryClient.invalidateQueries({ queryKey: ['rankings'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      window.dispatchEvent(new CustomEvent('seal:notification', { detail: notification }));

      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }, 7000);
    });

    try {
      await connection.start();
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
      console.log('SignalR connected successfully');
    } catch (error) {
      console.warn('Không thể kết nối kênh thông báo realtime.', error);
      setIsConnected(false);

      // Retry with exponential backoff
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        reconnectAttemptRef.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
        setTimeout(() => {
          void startConnection();
        }, delay);
      }
    }
  }, [queryClient]);

  const stopConnection = useCallback(async () => {
    if (connectionRef.current) {
      connectionRef.current.off('ReceiveNotification');
      if (connectionRef.current.state !== HubConnectionState.Disconnected) {
        await connectionRef.current.stop();
      }
      connectionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Load displayed IDs from localStorage first
    loadDisplayedIds();

    // Load unread notifications from API
    if (isLoggedIn()) {
      void loadUnreadNotifications();
    }

    // Initial connection if already logged in
    if (isLoggedIn()) {
      void startConnection();
    }

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'seal_user') {
        if (e.newValue && !e.oldValue) {
          // User logged in
          console.log('User logged in, starting SignalR connection...');
          setTimeout(() => {
            void loadUnreadNotifications();
            void startConnection();
          }, 100);
        } else if (!e.newValue && e.oldValue) {
          // User logged out
          console.log('User logged out, stopping SignalR connection...');
          void stopConnection();
        }
      }
    };

    // Listen for custom login event (for same-tab navigation)
    const handleLoginEvent = () => {
      console.log('Login event detected, starting SignalR connection...');
      setTimeout(() => {
        void loadUnreadNotifications();
        void startConnection();
      }, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('seal:login-success', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('seal:login-success', handleLoginEvent);
      void stopConnection();
    };
  }, [startConnection, stopConnection, loadUnreadNotifications, loadDisplayedIds]);

  return (
    <div aria-live="polite" className="fixed right-4 top-4 z-100 w-[min(24rem,calc(100vw-2rem))] space-y-2">
      {notifications.map((notification) => (
        <div key={notification.id} role="status" className="flex gap-3 rounded-xl border border-indigo-100 bg-white p-3 text-sm text-slate-700 shadow-lg dark:border-indigo-900/60 dark:bg-slate-900 dark:text-slate-200">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <p className="flex-1 text-xs font-medium leading-5">{notification.message}</p>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
