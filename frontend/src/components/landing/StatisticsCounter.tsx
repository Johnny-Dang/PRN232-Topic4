'use client';

import React from 'react';

export default function StatisticsCounter() {
  const stats = [
    { value: '120+', label: 'Cuộc thi học thuật', desc: 'Được lưu trữ và điều phối.' },
    { value: '35+', label: 'Đang mở đăng ký', desc: 'Có thể tham gia ngay hôm nay.' },
    { value: '80+', label: 'Đơn vị liên kết', desc: 'Nhà tài trợ & Khoa bộ môn.' },
    { value: '10K+', label: 'Sinh viên tham gia', desc: 'Được cấp chứng nhận và IRR.' }
  ];

  return (
    <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-indigo-900/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center relative z-10">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-1">
            <h4 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-100">
              {stat.value}
            </h4>
            <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {stat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
