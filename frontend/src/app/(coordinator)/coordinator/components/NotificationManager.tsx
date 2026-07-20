'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, Users, User, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/services/api/apiClient';

interface UserOption {
  UserID: string;
  FullName: string;
  Email: string;
  Role: string;
}

export default function NotificationManager() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; recipientCount?: number } | null>(null);

  const roles = ['TeamLeader', 'TeamMember', 'Judge', 'Mentor', 'Coordinator'];

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/User');
        setUsers(response.data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadUsers();
  }, []);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllByRole = (role: string) => {
    const usersInRole = users
      .filter((u) => u.Role === role)
      .map((u) => u.UserID);
    
    const allSelected = usersInRole.every((id) => selectedUsers.includes(id));
    
    if (allSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !usersInRole.includes(id)));
    } else {
      setSelectedUsers((prev) => [...new Set([...prev, ...usersInRole])]);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      setResult({ success: false, message: 'Vui lòng nhập nội dung thông báo' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const userIds = selectedUsers.map((id) => id);
      
      const response = await apiClient.post('/Notification/create', {
        message: notificationMessage,
        userIds: userIds,
        targetRole: targetRole || null,
      });

      setResult({
        success: true,
        message: 'Đã gửi thông báo thành công!',
        recipientCount: userIds.length,
      });
      
      setNotificationMessage('');
      setSelectedUsers([]);
      setTargetRole('');
    } catch (error: unknown) {
      console.error('Failed to send notification:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Không thể gửi thông báo';
      setResult({ success: false, message: errorMessage || 'Lỗi khi gửi thông báo' });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = targetRole
    ? users.filter((u) => u.Role === targetRole)
    : users;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-slate-800 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Quản lý Thông báo</CardTitle>
              <CardDescription className="text-xs">
                Gửi thông báo đến người dùng cụ thể hoặc theo nhóm role
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Notification Form */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold">Tạo Thông báo Mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Nội dung thông báo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Target Role Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Chọn theo Role (tùy chọn)
            </Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const count = users.filter((u) => u.Role === role).length;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      if (targetRole === role) {
                        setTargetRole('');
                      } else {
                        setTargetRole(role);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      targetRole === role
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    {role} ({count})
                  </button>
                );
              })}
            </div>
            {targetRole && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Đang chọn tất cả {users.filter((u) => u.Role === targetRole).length} user có role {targetRole}
              </p>
            )}
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Chọn người nhận cụ thể ({selectedUsers.length} đã chọn)
              </Label>
              {targetRole && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAllByRole(targetRole)}
                  className="h-7 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {users.filter((u) => u.Role === targetRole).every((u) => selectedUsers.includes(u.UserID))
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </Button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-500">Không có user nào</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.UserID}
                      type="button"
                      onClick={() => handleUserToggle(user.UserID)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${
                        selectedUsers.includes(user.UserID)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                          : 'border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded ${
                        selectedUsers.includes(user.UserID)
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {selectedUsers.includes(user.UserID) && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-700 dark:text-slate-300">
                          {user.FullName}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {user.Role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSendNotification}
              disabled={sending || !notificationMessage.trim() || selectedUsers.length === 0}
              className="h-10 rounded-xl bg-indigo-600 text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Đang gửi...' : 'Gửi Thông báo'}
            </Button>
            
            {selectedUsers.length > 0 && (
              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <User className="mr-1 h-3 w-3" />
                {selectedUsers.length} người nhận
              </Badge>
            )}
          </div>

          {/* Result Message */}
          {result && (
            <div className={`rounded-xl border p-3 text-xs font-medium ${
              result.success
                ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
            }`}>
              {result.message}
              {result.recipientCount !== undefined && (
                <span className="ml-2">({result.recipientCount} người nhận)</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Thống kê người dùng theo Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {roles.map((role) => {
              const count = users.filter((u) => u.Role === role).length;
              const colors: Record<string, string> = {
                TeamLeader: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
                TeamMember: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
                Judge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
                Mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
                Coordinator: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
              };
              return (
                <div
                  key={role}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{role}</span>
                  <Badge className={colors[role] || 'bg-slate-100 text-slate-600'}>
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
