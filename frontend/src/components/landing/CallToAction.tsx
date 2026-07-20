'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallToActionProps {
  handleAction: (title: string, message: string) => void;
}

export default function CallToAction({ handleAction }: CallToActionProps) {
  return (
    <section className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
      {/* Visual background lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent z-0" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0" />

      <div className="max-w-3xl space-y-6 relative z-10 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> LIÊN HỆ ĐỐI TÁC BAN TỔ CHỨC
        </span>
        <h3 className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-white">
          Bạn muốn đăng tải thông tin cuộc thi học thuật của đơn vị mình?
        </h3>
        <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed max-w-xl">
          Hệ thống SEAL League hỗ trợ các Khoa, câu lạc bộ và các tổ chức đối tác đăng ký phân quyền Điều phối viên (Coordinator) để tự quản lý cuộc thi, bài thi và bảng xếp hạng đội thi nội bộ.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={() => handleAction('Đăng ký gửi cuộc thi', 'Vui lòng liên hệ Văn phòng ban Học thuật SEAL League để được cấp quyền Điều phối viên cấp Khoa.')}
            className="rounded-xl bg-white hover:bg-slate-100 text-indigo-950 text-xs font-bold h-11 px-6 cursor-pointer"
          >
            Liên hệ ban tổ chức <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
