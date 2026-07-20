"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { Bell, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7086/api";
const HUB_URL = `${API_URL.replace(/\/api\/?$/, "")}/notificationHub`;
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

type RealtimeNotification = {
  id: number;
  message: string;
};

type ApiNotification = {
  notificationId?: string;
  NotificationId?: string;
  userId?: string;
  UserId?: string;
  message?: string;
  Message?: string;
  isRead?: boolean;
  IsRead?: boolean;
  createdAt?: string;
  CreatedAt?: string;
};

const getStoredUser = (): Record<string, unknown> | null => {
  try {
    const raw = localStorage.getItem("seal_user");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const getAccessToken = (): string => {
  const session = getStoredUser();
  if (!session) return "";

  const directToken =
    session.AccessToken || session.accessToken || session.token;
  if (typeof directToken === "string") return directToken;

  const auth = session.Auth || session.auth;
  if (typeof auth === "object" && auth !== null) {
    const authData = auth as Record<string, unknown>;
    const nestedToken =
      authData.AccessToken || authData.accessToken || authData.token;
    if (typeof nestedToken === "string") return nestedToken;
  }

  return "";
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000 - TOKEN_EXPIRY_BUFFER_MS;
  } catch {
    return false;
  }
};

const isLoggedIn = (): boolean => !!getAccessToken();

async function refreshTokenApi(): Promise<boolean> {
  const user = getStoredUser();
  const refreshToken = user?.RefreshToken as string | undefined;
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/Auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return false;

  const data = (await response.json()) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (data.accessToken && user) {
    localStorage.setItem(
      "seal_user",
      JSON.stringify({
        ...user,
        AccessToken: data.accessToken,
        RefreshToken: data.refreshToken,
      }),
    );
    return true;
  }

  return false;
}

export default function RealtimeProvider() {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    [],
  );

  const connectionRef = useRef<HubConnection | null>(null);
  const isConnectingRef = useRef(false);
  const isRefreshingTokenRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const isManualStopRef = useRef(false);
  const nextId = useRef(0);

  const maxReconnectAttempts = 5;
  const displayedIds = useRef(new Set<string>());

  const loadUnreadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiNotification[]>("/Notification");

      // Backend trả về array trực tiếp, không phải {items, totalCount}
      const items = response.data || [];

      const newNotifications: RealtimeNotification[] = [];

      for (const item of items) {
        // Backend dùng PascalCase: NotificationId, IsRead
        const id = item.notificationId || item.NotificationId || "";
        if (id && !displayedIds.current.has(id)) {
          displayedIds.current.add(id);
          newNotifications.push({
            id: ++nextId.current,
            message: item.message || item.Message || "",
          });
        }
      }

      if (newNotifications.length > 0) {
        setNotifications((current) => [
          ...newNotifications.reverse(),
          ...current,
        ]);
      }

      localStorage.setItem(
        "seal_displayed_notifications",
        JSON.stringify([...displayedIds.current]),
      );
    } catch (error) {
      console.warn("Failed to load notifications:", error);
    }
  }, []);

  const loadDisplayedIds = useCallback(() => {
    try {
      const stored = localStorage.getItem("seal_displayed_notifications");
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        displayedIds.current = new Set(ids);
      }
    } catch {
      // Ignore
    }
  }, []);

  const cleanupConnection = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      conn.off("ReceiveNotification");
    } catch {
      // ignore
    }

    if (conn.state !== HubConnectionState.Disconnected) {
      try {
        await conn.stop();
      } catch {
        // ignore
      }
    }

    connectionRef.current = null;
  }, []);

  // Stable ref that always points to the latest doStartConnection
  const startFnRef = useRef<(() => Promise<void>) | null>(null);

  const doStartConnection = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    if (isTokenExpired(token) && !isRefreshingTokenRef.current) {
      isConnectingRef.current = false;
      isRefreshingTokenRef.current = true;

      try {
        const ok = await refreshTokenApi();
        isRefreshingTokenRef.current = false;
        if (ok && !isManualStopRef.current) {
          reconnectAttemptRef.current = 0;
          startFnRef.current?.();
        }
      } catch {
        isRefreshingTokenRef.current = false;
      }

      return;
    }

    await cleanupConnection();

    const conn = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: false,
        skipNegotiation: false,
      })
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = conn;

    conn.on("ReceiveNotification", (message: string) => {
      const notification = { id: ++nextId.current, message };
      setNotifications((current) => [notification, ...current]);

      void queryClient.invalidateQueries({ queryKey: ["scores"] });
      void queryClient.invalidateQueries({ queryKey: ["rankings"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      window.dispatchEvent(
        new CustomEvent("seal:notification", { detail: notification }),
      );

      // Auto-remove after 7 seconds
      window.setTimeout(() => {
        setNotifications((current) =>
          current.filter((item) => item.id !== notification.id),
        );
      }, 7000);
    });

    try {
      await conn.start();
      reconnectAttemptRef.current = 0;
      isConnectingRef.current = false;
      console.log("[SignalR] Connected successfully");
    } catch (error: unknown) {
      isConnectingRef.current = false;

      const isAuthError =
        error instanceof Error &&
        (error.message?.includes("401") ||
          error.message?.includes("Unauthorized") ||
          error.message?.includes("Forbidden") ||
          error.message?.includes("Invalid user token") ||
          error.message?.includes("negotiation") ||
          (typeof error === "object" &&
            error !== null &&
            "response" in error));

      if (isAuthError && !isRefreshingTokenRef.current) {
        isRefreshingTokenRef.current = true;

        refreshTokenApi()
          .then((ok) => {
            isRefreshingTokenRef.current = false;
            if (ok && !isManualStopRef.current) {
              reconnectAttemptRef.current = 0;
              startFnRef.current?.();
            }
          })
          .catch(() => {
            isRefreshingTokenRef.current = false;
          });

        return;
      }

      if (
        !isManualStopRef.current &&
        reconnectAttemptRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptRef.current++;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptRef.current),
          30000,
        );
        console.warn(
          `[SignalR] Retry ${reconnectAttemptRef.current}/${maxReconnectAttempts} in ${delay}ms`,
        );
        setTimeout(() => startFnRef.current?.(), delay);
      } else if (
        reconnectAttemptRef.current >= maxReconnectAttempts &&
        !isManualStopRef.current
      ) {
        reconnectAttemptRef.current = 0;
      }
    }
  }, [cleanupConnection, queryClient]);

  // Keep the ref in sync with the latest doStartConnection
  useEffect(() => {
    startFnRef.current = doStartConnection;
  });

  const stopConnection = useCallback(async () => {
    isManualStopRef.current = true;
    await cleanupConnection();
  }, [cleanupConnection]);

  useEffect(() => {
    // Load displayed IDs from localStorage first
    loadDisplayedIds();

    // Load unread notifications from API
    if (isLoggedIn()) {
      // Wrap in setTimeout to avoid cascading renders
      setTimeout(() => {
        void loadUnreadNotifications();
      }, 0);
    }

    // Initial connection if already logged in
    if (isLoggedIn()) {
      void doStartConnection();
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "seal_user") {
        if (e.newValue && !e.oldValue) {
          void doStartConnection();
        } else if (!e.newValue && e.oldValue) {
          void stopConnection();
        }
      }
    };

    const handleLoginSuccess = () => {
      void doStartConnection();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("seal:login-success", handleLoginSuccess);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("seal:login-success", handleLoginSuccess);
      void stopConnection();
    };
  }, [doStartConnection, stopConnection, loadUnreadNotifications, loadDisplayedIds]);

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-100 w-[min(24rem,calc(100vw-2rem))] space-y-2"
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          role="status"
          className="flex gap-3 rounded-xl border border-indigo-100 bg-white p-3 text-sm text-slate-700 shadow-lg dark:border-indigo-900/60 dark:bg-slate-900 dark:text-slate-200"
        >
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <p className="flex-1 text-xs font-medium leading-5">
            {notification.message}
          </p>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() =>
              setNotifications((current) =>
                current.filter((item) => item.id !== notification.id),
              )
            }
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
