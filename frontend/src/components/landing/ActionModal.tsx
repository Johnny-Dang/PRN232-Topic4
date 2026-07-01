'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  currentUser: any | null;
  getDashboardLink: () => string;
  onRedirect: (url: string) => void;
}

export default function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  currentUser,
  getDashboardLink,
  onRedirect,
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose} 
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center space-y-4">

        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Check className="w-6 h-6 stroke-[3px]" />
        </div>

        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-850 dark:text-white">Thao tác thành công!</h4>
          <div className="text-xs text-slate-500 dark:text-slate-450 leading-normal">
            {currentUser ? (
              <span>Chào <strong>{currentUser.FullName}</strong>. Yêu cầu <strong>{title}</strong> của bạn đã được tiếp nhận. {description}</span>
            ) : (
              <span>Yêu cầu <strong>{title}</strong> đã được ghi nhận. {description}</span>
            )}
          </div>
        </div>

        {currentUser && (
          <Button
            onClick={() => {
              onClose();
              onRedirect(getDashboardLink());
            }}
            className="w-full rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9 mt-2 cursor-pointer"
          >
            Đi Tới Bảng Điều Khiển
          </Button>
        )}

        <button
          onClick={onClose}
          className="text-xs text-slate-450 hover:text-slate-600 dark:hover:text-slate-350 font-semibold cursor-pointer bg-transparent border-none outline-none"
        >
          Đóng cửa sổ
        </button>
      </div>
    </div>
  );
}
