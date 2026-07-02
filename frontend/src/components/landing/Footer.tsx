'use client';

import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Info Col 1 */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="font-extrabold text-white text-sm">SEAL League</span>
          </div>
          <p className="text-[11px] font-semibold leading-relaxed">
            Hệ thống quản lý, tổ chức thi và liên kết các hoạt động phát triển năng lực công nghệ, kỹ năng Agile và học thuật chất lượng cao.
          </p>
        </div>

        {/* Links Col 2 */}
        <div className="space-y-3 text-left">
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Mùa giải nổi bật</h4>
          <ul className="space-y-2 text-[11px] font-semibold">
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Olympic Tin học Sinh viên</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Sáng tạo Công nghệ SEAL 2026</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Ý tưởng Khởi nghiệp trẻ</a></li>
          </ul>
        </div>

        {/* Links Col 3 */}
        <div className="space-y-3 text-left">
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Hỗ trợ kỹ thuật</h4>
          <ul className="space-y-2 text-[11px] font-semibold">
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Tài liệu API tích hợp</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Quy định chống gian lận</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Đánh giá hệ số IRR</a></li>
          </ul>
        </div>

        {/* Info Col 4 */}
        <div className="space-y-3 text-left">
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Kênh liên hệ</h4>
          <p className="text-[11px] font-semibold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> support.seal@fpt.edu.vn
          </p>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Khu vực FPT University, An ninh kết nối SSL bảo mật.</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium text-slate-500 gap-4">
        <span>© 2026 SEAL League. Bảo lưu mọi quyền đối với các quy chế cuộc thi gốc.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-indigo-400 transition-colors">Quyền riêng tư</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Điều khoản dịch vụ</a>
        </div>
      </div>
    </footer>
  );
}
