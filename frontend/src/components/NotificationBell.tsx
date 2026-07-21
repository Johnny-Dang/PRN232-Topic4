"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, X, Users, Calendar, Trophy, FileText, MessageSquare } from "lucide-react";
import {
  useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/services/hooks/coordinator";
import { cn } from "@/lib/utils";

type NotificationType = "TEAM_APPLICATION" | "TEAM_INVITE" | "EVENT" | "SCORE" | "CALIBRATION" | "ADMIN" | "GENERAL";

interface ParsedNotification {
  id: string;
  message: string;
  displayMessage: string;
  type: NotificationType;
  typeLabel: string;
  typeColor: string;
  navigateTo?: string;
  metadata?: {
    teamId?: string;
    teamName?: string;
    eventId?: string;
    userId?: string;
    userName?: string;
  };
}

interface NotificationItem extends ParsedNotification {
  createdAt: string;
  isRead: boolean;
}

const getNotificationConfig = (message: string, notificationId: string): ParsedNotification => {
  const id = notificationId || "";
  
  // Parse message format: [TYPE] Content with optional {data}
  const matchResult = message.match(/^\[([^\]]+)\]\s*(.+)/);
  const type = matchResult ? matchResult[1].toUpperCase() : "GENERAL";
  const content = matchResult ? matchResult[2] : message;

  // Default config
  let config: ParsedNotification = {
    id,
    message,
    displayMessage: content,
    type: "GENERAL",
    typeLabel: "Thông báo",
    typeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  };

  // Parse content for specific info (e.g., team name)
  const teamMatch = content.match(/đội\s+([^.]+)/i);

  if (type.includes("THÔNG BÁO")) {
    if (content.includes("ứng tuyển")) {
      config = {
        ...config,
        type: "TEAM_APPLICATION",
        typeLabel: "Đơn ứng tuyển",
        typeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        navigateTo: "/recruitments",
        metadata: {
          teamName: teamMatch ? teamMatch[1].trim() : undefined,
        },
      };
    } else if (content.includes("lời mời")) {
      config = {
        ...config,
        type: "TEAM_INVITE",
        typeLabel: "Lời mời",
        typeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        navigateTo: "/my-applications",
      };
    }
  } else if (type.includes("ADMIN")) {
    config = {
      ...config,
      type: "ADMIN",
      typeLabel: "Quản trị",
      typeColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      navigateTo: "/",
    };
  } else if (type.includes("NOTIFICATION")) {
    config = {
      ...config,
      type: "GENERAL",
      typeLabel: "Thông báo",
      typeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      navigateTo: "/",
    };
  }

  return config;
};

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case "TEAM_APPLICATION":
      return Users;
    case "TEAM_INVITE":
      return MessageSquare;
    case "EVENT":
      return Calendar;
    case "SCORE":
      return Trophy;
    case "CALIBRATION":
      return FileText;
    case "ADMIN":
      return Bell;
    default:
      return Bell;
  }
};

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: notifications, isLoading } = useNotificationsQuery();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Backend trả về PascalCase: IsRead
  const unreadCount = notifications?.filter((n) => !n.IsRead).length ?? 0;

  // Parse notifications
  const parsedNotifications = useMemo<NotificationItem[]>(() => {
    if (!notifications) return [];
    
    console.log("[NotificationBell] Raw notifications:", notifications);
    
    return notifications.map((n) => {
      const id = String(n.NotificationId || "");
      const message = String(n.Message || "");
      const createdAt = String(n.CreatedAt || "");
      const parsed = getNotificationConfig(message, id);
      return {
        ...parsed,
        createdAt,
        isRead: n.IsRead ?? false,
      };
    });
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    // Close dropdown
    setIsOpen(false);
    // Navigate if there's a destination
    if (notification.navigateTo) {
      router.push(notification.navigateTo);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          "text-slate-600 dark:text-slate-300",
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        )}
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-start justify-end p-4 pt-16",
            "animate-in fade-in-0 duration-200"
          )}
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={dropdownRef}
            className={cn(
              "mt-0 w-80 max-h-[70vh] overflow-hidden flex flex-col rounded-xl shadow-2xl",
              "bg-white dark:bg-slate-900",
              "border border-slate-200 dark:border-slate-700",
              "zoom-in-95 duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  Thông báo
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      "hover:bg-slate-100 dark:hover:bg-slate-800",
                      "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                      "disabled:opacity-50",
                    )}
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                  )}
                  title="Đóng"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  Đang tải...
                </div>
              ) : !parsedNotifications || parsedNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Không có thông báo nào
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedNotifications.map((notification) => {
                    const Icon = getTypeIcon(notification.type);
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            !notification.isRead && "bg-indigo-50/50 dark:bg-indigo-950/20",
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Icon */}
                            <div className={cn(
                              "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                              notification.typeColor
                            )}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={cn(
                                  "text-[10px] font-semibold",
                                  notification.isRead
                                    ? "text-slate-400"
                                    : "text-slate-600 dark:text-slate-300"
                                )}>
                                  {notification.typeLabel}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className={cn(
                                "text-xs leading-snug line-clamp-2 mt-0.5",
                                notification.isRead
                                  ? "text-slate-400 dark:text-slate-500"
                                  : "text-slate-600 dark:text-slate-300",
                              )}>
                                {notification.displayMessage}
                              </p>
                            </div>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {parsedNotifications.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/coordinator/notifications");
                  }}
                  className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
