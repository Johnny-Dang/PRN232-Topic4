'use client';

import { useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Bell, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5279/api';
const HUB_URL = `${API_URL.replace(/\/api\/?$/, '')}/notificationHub`;

type RealtimeNotification = {
  id: number;
  message: string;
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

export default function RealtimeProvider() {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (message: string) => {
      const notification = { id: ++nextId.current, message };
      setNotifications((current) => [...current, notification]);

      // Backend only emits a text notification, so refresh cached API data safely.
      void queryClient.invalidateQueries();
      window.dispatchEvent(new CustomEvent('seal:notification', { detail: notification }));

      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }, 7000);
    });

    void connection.start().catch((error: unknown) => {
      console.warn('Không thể kết nối kênh thông báo realtime.', error);
    });

    return () => {
      connection.off('ReceiveNotification');
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop();
      }
    };
  }, [queryClient]);

  return (
    <div aria-live="polite" className="fixed right-4 top-4 z-[100] w-[min(24rem,calc(100vw-2rem))] space-y-2">
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
