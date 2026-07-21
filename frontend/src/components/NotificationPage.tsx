'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationsQuery, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/services/hooks/coordinator';
import { cn } from '@/lib/utils';

interface NotificationPageProps {
  backHref?: string;
  backLabel?: string;
}

export default function NotificationPage({ backHref = '/', backLabel = 'Quay lại' }: NotificationPageProps) {
  const { data: notifications, isLoading, refetch } = useNotificationsQuery();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications?.filter((n) => !n.IsRead).length ?? 0;

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
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Thông báo
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo chưa đọc`
                : "Tất cả thông báo đã được đọc"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isLoading}
              className="h-9 rounded-xl"
            >
              <RefreshCw className={cn("mr-1.5 h-4 w-4", isLoading && "animate-spin")} />
              Làm mới
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="h-9 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
              >
                <CheckCheck className="mr-1.5 h-4 w-4" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
                Không có thông báo nào
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Các thông báo sẽ xuất hiện ở đây khi có cập nhật mới
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => {
                const id = notification.NotificationId || "";
                const message = notification.Message || "";
                const createdAt = notification.CreatedAt || "";
                const isRead = notification.IsRead ?? false;

                return (
                  <div
                    key={id}
                    className={cn(
                      "flex items-start gap-3 p-4 transition-colors",
                      !isRead && "bg-indigo-50/50 dark:bg-indigo-950/20"
                    )}
                  >
                    <div className={cn(
                      "rounded-full p-2.5",
                      isRead ? "bg-slate-100 dark:bg-slate-800" : "bg-indigo-100 dark:bg-indigo-900"
                    )}>
                      <Bell className={cn(
                        "h-4 w-4",
                        isRead ? "text-slate-400" : "text-indigo-600 dark:text-indigo-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white font-medium"
                      )}>
                        {message.replace(/^\[NOTIFICATION\]\s*/, "")}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {createdAt ? formatTime(createdAt) : ""}
                      </p>
                    </div>
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead.mutate(id)}
                        disabled={markAsRead.isPending}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          "hover:bg-slate-100 dark:hover:bg-slate-800",
                          "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                          "disabled:opacity-50"
                        )}
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
