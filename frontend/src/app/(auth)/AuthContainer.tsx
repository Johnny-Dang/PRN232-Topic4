'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  ArrowRight, 
  UserCheck, 
  Key, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  ArrowLeft, 
  UserPlus, 
  Phone, 
  User, 
  School, 
  Heart,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockUsers } from '@/lib/api';

export default function AuthContainer({ initialMode }: { initialMode: 'login' | 'register' }) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState<string>('');

  // Register Form States
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regFullName, setRegFullName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regRole, setRegRole] = useState<string>('Member');
  const [regStudentType, setRegStudentType] = useState<string>('FPT');
  const [regStudentCode, setRegStudentCode] = useState<string>('');
  const [regUniversity, setRegUniversity] = useState<string>('FPT University');
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [regSuccess, setRegSuccess] = useState<string>('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    window.history.pushState(null, '', newMode === 'login' ? '/login' : '/register');
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess('');

    setTimeout(() => {
      const matchedUser = mockUsers.find(u => u.Email.toLowerCase() === loginEmail.trim().toLowerCase());
      
      if (!matchedUser) {
        setLoginError('Email không tồn tại trong hệ thống SEAL Hackathon.');
        setLoginLoading(false);
        return;
      }

      setLoginSuccess(`Đăng nhập thành công! Vai trò: ${matchedUser.Role}`);
      localStorage.setItem('seal_user', JSON.stringify(matchedUser));

      setTimeout(() => {
        if (matchedUser.Role === 'Leader') {
          router.push('/leader');
        } else if (matchedUser.Role === 'Member') {
          router.push('/member');
        } else if (matchedUser.Role === 'Mentor') {
          router.push('/mentor');
        } else if (matchedUser.Role === 'Judge') {
          router.push('/judge');
        } else if (matchedUser.Role === 'Coordinator') {
          router.push('/coordinator');
        } else {
          router.push('/');
        }
      }, 800);
    }, 1000);
  };

  // Quick login handler
  const handleQuickLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('HASH001');
    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess('');
    
    setTimeout(() => {
      const matchedUser = mockUsers.find(u => u.Email.toLowerCase() === email.toLowerCase())!;
      setLoginSuccess(`Đăng nhập nhanh thành công! Vai trò: ${matchedUser.Role}`);
      localStorage.setItem('seal_user', JSON.stringify(matchedUser));
      
      setTimeout(() => {
        if (matchedUser.Role === 'Leader') {
          router.push('/leader');
        } else if (matchedUser.Role === 'Member') {
          router.push('/member');
        } else if (matchedUser.Role === 'Mentor') {
          router.push('/mentor');
        } else if (matchedUser.Role === 'Judge') {
          router.push('/judge');
        } else if (matchedUser.Role === 'Coordinator') {
          router.push('/coordinator');
        }
      }, 800);
    }, 800);
  };

  // Register handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegSuccess('');

    setTimeout(() => {
      setRegSuccess('Đăng ký thành công! Đang chờ ban tổ chức phê duyệt...');
      setRegLoading(false);

      setTimeout(() => {
        switchMode('login');
        setRegSuccess('');
        setLoginEmail(regEmail);
      }, 1500);
    }, 1200);
  };

  const isStudent = regRole === 'Leader' || regRole === 'Member';

  const quickUsers = [
    { label: 'Trưởng nhóm', email: 'leader.phoenix@fpt.edu.vn' },
    { label: 'Giám khảo', email: 'judge.internal1@fpt.edu.vn' },
    { label: 'Cố vấn', email: 'mentor.ai@fpt.edu.vn' },
    { label: 'Điều phối viên', email: 'coordinator.se@fpt.edu.vn' }
  ];

  return (
    <div className="h-screen w-full relative flex overflow-hidden bg-white dark:bg-slate-950 select-none">
      
      {/* 1. SLIDING BANNER OVERLAY (Desktop only - 40% Width) */}
      <div 
        className={`hidden md:flex absolute top-0 bottom-0 z-20 w-[40%] transition-transform duration-700 ease-in-out text-white flex-col justify-between p-12 overflow-hidden ${
          mode === 'login' ? 'translate-x-0 left-0' : 'translate-x-[150%] left-0'
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-xs z-0" />

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 z-10 w-fit outline-none group">
          <div className="w-10 h-10 rounded-2xl bg-white text-indigo-950 flex items-center justify-center font-black text-xl shadow-md transition-transform group-hover:scale-105">
            S
          </div>
          <div>
            <h2 className="font-extrabold text-white tracking-tight text-sm leading-none">
              SEAL HACKATHON
            </h2>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">
              Agile League 2026
            </p>
          </div>
        </Link>


        {/* Sliding Contents (Fade transitions) */}
        <div className="relative flex-1 flex items-center z-10">
          
          {/* Content for Login Mode */}
          <div className={`absolute inset-0 flex flex-col justify-center space-y-5 transition-all duration-500 ease-in-out ${
            mode === 'login' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-8 pointer-events-none'
          }`}>
            <Badge className="bg-white/10 text-indigo-200 border-none text-[8.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> LIÊN MINH CÔNG NGHỆ CHUYÊN NGHIỆP
            </Badge>
            <h3 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-50 to-indigo-200">
              Hệ thống xác thực và nộp bài tập trung
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed font-semibold">
              Đăng nhập tài khoản thành viên để bắt đầu nộp dự án, tra cứu kết quả đánh giá phân tách theo tiêu chuẩn Inter-rater Reliability (IRR) và thăng hạng trên bảng xếp hạng các mùa giải.
            </p>
          </div>

          {/* Content for Register Mode */}
          <div className={`absolute inset-0 flex flex-col justify-center space-y-5 transition-all duration-500 ease-in-out ${
            mode === 'register' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}>
            <Badge className="bg-white/10 text-indigo-200 border-none text-[8.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-450" /> KIẾN TẠO TƯƠNG LAI CÔNG NGHỆ
            </Badge>
            <h3 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-50 to-indigo-200">
              Trở thành một phần của SEAL Hackathon
            </h3>
            <p className="text-slate-350 text-xs leading-relaxed font-semibold">
              Đăng ký tài khoản để thành lập đội thi của bạn, mời các thành viên cùng tham gia phát triển dự án và nhận sự hỗ trợ chuyên môn từ các cố vấn doanh nghiệp.
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="z-10 text-[9px] text-indigo-300/80 font-medium">
          © 2026 SEAL Hackathon. Bảo mật quy chế chống đạo văn tự động.
        </div>
      </div>

      {/* 2. SLIDING FORM CONTAINERS (Desktop - 60% Width) */}
      <div 
        className={`absolute top-0 bottom-0 w-full md:w-[60%] transition-all duration-700 ease-in-out h-full overflow-hidden bg-white dark:bg-slate-950 ${
          mode === 'login' ? 'left-0 md:left-[40%]' : 'left-0'
        }`}
      >
        <Link 
          href="/" 
          className="absolute top-5 left-6 md:left-12 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold z-30"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang chủ
        </Link>


        {/* Relative content frame */}
        <div className="w-full h-full relative flex items-center justify-center p-6 md:p-12">
          
          {/* LOGIN FORM BOX */}
          <div className={`absolute w-full max-w-sm px-6 transition-all duration-500 ease-in-out ${
            mode === 'login' ? 'opacity-100 translate-x-0 pointer-events-auto z-10' : 'opacity-0 -translate-x-12 pointer-events-none z-0'
          }`}>
            
            {/* Logo for mobile */}
            <div className="flex items-center gap-3 md:hidden mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">S</div>
              <div>
                <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">SEAL League</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Authentication Portal</p>
              </div>
            </div>

            <div className="space-y-1 mb-5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[8.5px] font-black uppercase dark:bg-indigo-950/30 dark:border-indigo-900/40 w-fit">
                <Sparkles className="w-3 h-3 mr-0.5" /> SECURE LOGIN
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight dark:text-white pt-1">
                Đăng nhập hệ thống
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-normal">
                Sử dụng Email đăng ký học tập của bạn để truy cập.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ Email
                </label>
                <Input
                  type="email"
                  placeholder="username@fpt.edu.vn"
                  className="rounded-xl h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold focus-visible:ring-indigo-600"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required={mode === 'login'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" /> Mật khẩu bảo mật
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold focus-visible:ring-indigo-600"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required={mode === 'login'}
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-start gap-2 font-semibold leading-normal">
                  <ShieldAlert className="w-4 h-4 text-rose-650 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-start gap-2 font-semibold leading-normal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold text-xs transition-colors mt-2 cursor-pointer"
                disabled={loginLoading}
              >
                {loginLoading ? 'Đang xác thực...' : 'Xác thực Đăng nhập'} <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Quick login */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2.5 mt-4">
              <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                ĐĂNG NHẬP NHANH TÀI KHOẢN MẪU:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {quickUsers.map((qu) => (
                  <button
                    key={qu.email}
                    type="button"
                    onClick={() => handleQuickLogin(qu.email)}
                    disabled={loginLoading}
                    className="p-2 border border-slate-200 dark:border-slate-800 text-left rounded-xl bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition-colors text-[9.5px] font-bold text-slate-750 dark:text-slate-350 outline-none cursor-pointer"
                  >
                    <div className="truncate">{qu.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-slate-450 dark:text-slate-500 font-semibold pt-4">
              Chưa có tài khoản?{' '}
              <button 
                onClick={() => switchMode('register')}
                className="text-indigo-650 hover:text-indigo-700 font-extrabold dark:text-indigo-400 cursor-pointer outline-none"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>

          {/* REGISTER FORM BOX (COMPACT - NO SCROLL) */}
          <div className={`absolute w-full max-w-xl px-6 transition-all duration-500 ease-in-out h-full flex flex-col justify-center ${
            mode === 'register' ? 'opacity-100 translate-x-0 pointer-events-auto z-10' : 'opacity-0 translate-x-12 pointer-events-none z-0'
          }`}>
            
            {/* Logo for mobile */}
            <div className="flex items-center gap-3 md:hidden mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">S</div>
              <div>
                <h2 className="font-extrabold text-slate-800 dark:text-white text-xs">SEAL League</h2>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Register Portal</p>
              </div>
            </div>

            <div className="space-y-0.5 mb-3">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[8px] font-black uppercase dark:bg-indigo-950/30 dark:border-indigo-900/40 w-fit">
                <Sparkles className="w-3 h-3 mr-0.5" /> NEW ACCOUNT
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight dark:text-white">
                Tạo hồ sơ đăng ký mới
              </h3>
              <p className="text-slate-400 text-[10.5px] font-semibold leading-none">
                Vui lòng điền thông tin chính xác. Hồ sơ sẽ được kiểm duyệt trước khi kích hoạt.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Row 1: Email & Password */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email đăng nhập
                  </label>
                  <Input
                    type="email"
                    placeholder="example@fpt.edu.vn"
                    className="rounded-xl h-8.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-semibold focus-visible:ring-indigo-650"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required={mode === 'register'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-slate-400" /> Mật khẩu bảo mật
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl h-8.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-semibold focus-visible:ring-indigo-655"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required={mode === 'register'}
                  />
                </div>

                {/* Row 2: Fullname & Phone */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Họ tên đầy đủ
                  </label>
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="rounded-xl h-8.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-semibold focus-visible:ring-indigo-650"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required={mode === 'register'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                  </label>
                  <Input
                    type="tel"
                    placeholder="0901xxxxxx"
                    className="rounded-xl h-8.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-semibold focus-visible:ring-indigo-655"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required={mode === 'register'}
                  />
                </div>

                {/* Row 3: Role & Student Type */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" /> Vai trò thi đấu
                  </label>
                  <select
                    className="w-full h-8.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] font-bold focus:outline-none"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="Member">Thành viên (Member)</option>
                    <option value="Leader">Trưởng nhóm (Leader)</option>
                    <option value="Mentor">Cố vấn (Mentor)</option>
                    <option value="Judge">Giám khảo (Judge)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Đối tượng kiểm tra
                  </label>
                  <select
                    disabled={!isStudent}
                    className={`w-full h-8.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] font-bold focus:outline-none ${
                      !isStudent ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    value={regStudentType}
                    onChange={(e) => {
                      setRegStudentType(e.target.value);
                      setRegUniversity(e.target.value === 'FPT' ? 'FPT University' : '');
                    }}
                  >
                    <option value="FPT">Sinh viên FPT (Nội bộ)</option>
                    <option value="External">Trường đại học khác</option>
                  </select>
                </div>

                {/* Row 4 (Conditional): MSSV & University Name */}
                {isStudent && (
                  <>
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Mã sinh viên (MSSV)
                      </label>
                      <Input
                        type="text"
                        placeholder={regStudentType === 'FPT' ? 'SE17xxxx' : 'SVxxxx'}
                        className="rounded-xl h-8.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-semibold focus-visible:ring-indigo-650"
                        value={regStudentCode}
                        onChange={(e) => setRegStudentCode(e.target.value)}
                        required={isStudent}
                      />
                    </div>

                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <School className="w-3.5 h-3.5" /> Tên trường học
                      </label>
                      <Input
                        type="text"
                        placeholder="Đại học Bách Khoa, UIT..."
                        className="rounded-xl h-8.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-semibold focus-visible:ring-indigo-655"
                        value={regUniversity}
                        onChange={(e) => setRegUniversity(e.target.value)}
                        disabled={regStudentType === 'FPT'}
                        required={isStudent}
                      />
                    </div>
                  </>
                )}

              </div>

              {regSuccess && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10.5px] flex items-start gap-2 font-semibold leading-normal">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8.5 font-bold text-xs transition-colors mt-1 cursor-pointer"
                disabled={regLoading}
              >
                {regLoading ? 'Đang tạo hồ sơ...' : 'Gửi yêu cầu đăng ký'} <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="text-center text-xs text-slate-450 dark:text-slate-500 font-semibold mt-3">
              Đã có tài khoản?{' '}
              <button 
                onClick={() => switchMode('login')}
                className="text-indigo-655 hover:text-indigo-700 font-extrabold dark:text-indigo-400 cursor-pointer outline-none"
              >
                Đăng nhập ngay
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
