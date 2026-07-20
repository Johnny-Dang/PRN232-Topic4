"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import {
  useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/services/hooks/coordinator";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: notifications, isLoading } = useNotificationsQuery();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
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
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm",
        )}
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full right-0 mt-2 w-80 max-h-[60vh]",
            "bg-white dark:bg-slate-900",
            "border border-slate-200 dark:border-slate-700",
            "rounded-xl shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "z-[1000] overflow-hidden flex flex-col",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
              Thông báo
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    "text-slate-500 dark:text-slate-400",
                    "disabled:opacity-50",
                  )}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  "text-slate-500 dark:text-slate-400",
                )}
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Đang tải...
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Không có thông báo nào
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <li
                    key={notification.notificationId}
                    className={cn(
                      "relative px-4 py-3 transition-colors",
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      !notification.isRead &&
                        "bg-indigo-50/50 dark:bg-indigo-950/20",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                      <div className="flex-1 min-w-0 pl-2">
                        <p
                          className={cn(
                            "text-sm leading-snug break-words",
                            notification.isRead
                              ? "text-slate-600 dark:text-slate-400"
                              : "text-slate-800 dark:text-slate-200",
                            notification.message?.startsWith("[NOTIFICATION]")
                              ? "font-medium"
                              : "",
                          )}
                        >
                          {notification.message?.replace(
                            /^\[NOTIFICATION\]\s*/,
                            "",
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.notificationId);
                          }}
                          disabled={markAsRead.isPending}
                          className={cn(
                            "p-1.5 rounded-md transition-colors shrink-0",
                            "hover:bg-slate-200 dark:hover:bg-slate-700",
                            "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                            "disabled:opacity-50",
                          )}
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                {unreadCount > 0
                  ? `${unreadCount} thông báo chưa đọc`
                  : "Tất cả đã đọc"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
