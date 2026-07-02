'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User as SealUser } from '@/lib/api';

interface HeaderProps {
  currentUser: SealUser | null;
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  scrollToSection: (ref: React.RefObject<HTMLDivElement | null>) => void;
  competitionsSectionRef: React.RefObject<HTMLDivElement | null>;
  announcementsSectionRef: React.RefObject<HTMLDivElement | null>;
  handleAction: (title: string, message: string, isRedirect?: boolean) => void;
}

export default function Header({
  currentUser,
  isScrolled,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
  scrollToSection,
  competitionsSectionRef,
  announcementsSectionRef,
  handleAction,
}: HeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled
      ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-md border-b border-slate-200/50 dark:border-slate-800/50 py-3'
      : 'bg-transparent py-5'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-slate-850 dark:text-slate-150 tracking-tight leading-none text-base">
              SEAL LEAGUE
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
              Competition Hub
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-655 dark:text-slate-350">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Trang chủ</a>
          <button onClick={() => scrollToSection(competitionsSectionRef)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-transparent border-none">Cuộc thi</button>
          <button onClick={() => scrollToSection(announcementsSectionRef)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-transparent border-none">Thông báo</button>
          <button onClick={() => handleAction('Tra cứu Lịch thi', 'Hệ thống lịch thi đồng bộ đang được tạo dựng bởi ban tổ chức.', false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-transparent border-none">Lịch thi</button>
          <button onClick={() => handleAction('Xem Kết quả', 'Tính năng công bố kết quả tự động đang được hoàn thiện.', false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-transparent border-none">Kết quả</button>
          <button onClick={() => handleAction('Tải Hướng dẫn', 'Tài liệu hướng dẫn cuộc thi và tiêu chí kỹ thuật.', false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-transparent border-none">Hướng dẫn</button>
          <a href="#footer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Liên hệ</a>
        </nav>

        {/* User Auth Action (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              {/* Dropdown Trigger */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer outline-none select-none text-left"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-200/20">
                  {currentUser.FullName ? currentUser.FullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {currentUser.FullName}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                    {currentUser.Role}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Overlay */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}

              {/* Dropdown Menu Card */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.FullName}</p>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">{currentUser.Email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/member');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Quản lý
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-xs font-bold h-9 px-4 text-slate-700 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="text-xs font-bold h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl cursor-pointer"
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>

        {/* Mobile hamburger menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent border-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3.5 text-sm font-bold text-slate-655 dark:text-slate-350">
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-indigo-600">Trang chủ</a>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection(competitionsSectionRef); }} className="text-left hover:text-indigo-600 bg-transparent border-none cursor-pointer">Cuộc thi</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection(announcementsSectionRef); }} className="text-left hover:text-indigo-600 bg-transparent border-none cursor-pointer">Thông báo</button>
            <button onClick={() => { setIsMobileMenuOpen(false); handleAction('Tra cứu Lịch thi', 'Lịch thi đồng bộ đang tạo.', false); }} className="text-left hover:text-indigo-600 bg-transparent border-none cursor-pointer">Lịch thi</button>
            <button onClick={() => { setIsMobileMenuOpen(false); handleAction('Xem Kết quả', 'Hệ thống công bố kết quả.', false); }} className="text-left hover:text-indigo-600 bg-transparent border-none cursor-pointer">Kết quả</button>
            <button onClick={() => { setIsMobileMenuOpen(false); handleAction('Xem Hướng dẫn', 'Tài liệu thể lệ thi.', false); }} className="text-left hover:text-indigo-600 bg-transparent border-none cursor-pointer">Hướng dẫn</button>
            <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-indigo-600">Liên hệ</a>
          </nav>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{currentUser.FullName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{currentUser.Role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/member'); }}
                    className="flex-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4"
                  >
                    Quản lý
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="rounded-xl text-xs font-semibold h-9 px-3 text-rose-500 border-rose-100"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
                  className="w-full text-xs font-bold h-9 rounded-xl border-slate-200 dark:border-slate-800"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/register'); }}
                  className="w-full text-xs font-bold h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  Đăng ký thành viên
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
