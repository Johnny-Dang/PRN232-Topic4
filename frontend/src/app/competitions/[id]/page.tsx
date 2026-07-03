'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft,
  Award, 
  Clock, 
  Globe, 
  Users, 
  Trophy, 
  Building,
  CheckCircle2,
  ChevronRight,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDetailedCompetitions } from '@/lib/api';
import type { DetailedCompetition, User } from '@/lib/api';

// Shared public components
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import ActionModal from '@/components/landing/ActionModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

type TabType = 'overview' | 'schedule' | 'prizes' | 'rules';

export default function CompetitionDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  // States
  const [competition, setCompetition] = useState<DetailedCompetition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // User Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation Header states
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Dummy refs for Header compatibility
  const dummyCompetitionsRef = useRef<HTMLDivElement | null>(null);
  const dummyAnnouncementsRef = useRef<HTMLDivElement | null>(null);

  // Success Modal states
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [actionTitle, setActionTitle] = useState<string>('');
  const [actionDesc, setActionDesc] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch Session User & Scroll listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seal_user');
      if (stored) {
        try {
          void Promise.resolve().then(() => {
            setCurrentUser(JSON.parse(stored) as User);
          });
        } catch (e) {
          console.error('Lỗi phân tích cú pháp user session:', e);
        }
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Competition by ID
  useEffect(() => {
    void Promise.resolve().then(() => {
      setLoading(true);
      getDetailedCompetitions()
        .then((comps) => {
          const found = comps.find((c) => c.ID === id);
          setCompetition(found ?? null);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Lỗi khi tải chi tiết cuộc thi:', err);
          setLoading(false);
        });
    });
  }, [id]);

  // Determine active dashboard route based on user role
  const getDashboardLink = (): string => {
    if (!currentUser) return '/login';
    switch (currentUser.Role) {
      case 'Leader': return '/leader';
      case 'Member': return '/member';
      case 'Mentor': return '/mentor';
      case 'Judge': return '/judge';
      case 'Coordinator': return '/coordinator';
      default: return '/';
    }
  };

  // Logout handler
  const handleLogout = (): void => {
    localStorage.removeItem('seal_user');
    setCurrentUser(null);
    router.refresh();
  };

  // Process user action, require authentication if needed
  const handleAction = (title: string, desc: string, isRedirect: boolean = true, redirectUrl: string = '/login'): void => {
    setActionTitle(title);
    setActionDesc(desc);
    if (!currentUser && isRedirect) {
      // Force user to login page
      router.push(redirectUrl);
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleShareLink = (): void => {
    if (typeof window !== 'undefined') {
      void navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Đang tải thông tin cuộc thi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Không tìm thấy cuộc thi</h3>
          <p className="text-xs text-slate-500 max-w-sm">Liên kết có thể đã hỏng hoặc cuộc thi này không tồn tại trong cơ sở dữ liệu của SEAL League.</p>
          <Button onClick={() => router.push('/')} className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const isClosed = competition.Status === 'closed';
  const isExpiring = competition.Status === 'expiring';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-400',
          label: 'Đang mở đăng ký'
        };
      case 'expiring':
        return {
          bg: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900/30 dark:text-amber-400 animate-pulse',
          label: 'Sắp hết hạn'
        };
      case 'upcoming':
        return {
          bg: 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/30 dark:text-blue-400',
          label: 'Sắp diễn ra'
        };
      case 'closed':
      default:
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400',
          label: 'Đã kết thúc'
        };
    }
  };

  const statusMeta = getStatusBadge(competition.Status);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'schedule', label: 'Lịch trình vòng thi' },
    { id: 'prizes', label: 'Cơ cấu giải thưởng' },
    { id: 'rules', label: 'Thể lệ & Quy định' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-200 pb-20 md:pb-0">
      
      {/* 1. HEADER */}
      <Header
        currentUser={currentUser}
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        scrollToSection={() => router.push('/')}
        competitionsSectionRef={dummyCompetitionsRef}
        announcementsSectionRef={dummyAnnouncementsRef}
        handleAction={handleAction}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 pb-16">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-550 mb-3.5 select-none">
          <span 
            onClick={() => router.push('/')}
            className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Trang chủ
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-350 dark:text-slate-750" />
          <span 
            onClick={() => router.push('/')}
            className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Cuộc thi
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-350 dark:text-slate-750" />
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] md:max-w-xs">
            {competition.Name}
          </span>
        </div>

        {/* Back navigation */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>

        {/* Dynamic 2-column Course Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          
          {/* LEFT COLUMN: Main content */}
          <div className="flex-1 space-y-8 min-w-0">
            {/* Title Block */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`border font-extrabold text-[10px] py-0.5 px-3 rounded-full ${statusMeta.bg}`}>
                  {statusMeta.label}
                </Badge>
                <Badge className="bg-indigo-600 text-white border-none text-[10px] font-bold py-0.5 px-3 rounded-full">
                  {competition.CategoryLabel}
                </Badge>
                <Badge className="bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-350 text-[10px] font-bold py-0.5 px-3 rounded-full">
                  {competition.Format}
                </Badge>
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-slate-850 dark:text-white leading-tight">
                {competition.Name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>Đơn vị tổ chức:</span>
                <strong className="text-slate-600 dark:text-slate-350">{competition.Organizer}</strong>
              </div>
            </div>

            {/* Mobile Banner Image (Hidden on Desktop) */}
            <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm md:hidden">
              <Image
                src={competition.BannerUrl}
                alt={competition.Name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
            </div>

            {/* Tab Navigation Menu */}
            <div className="border-b border-slate-200 dark:border-slate-800/80 pb-1.5 flex gap-2 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4.5 text-xs font-extrabold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-indigo-650 text-white shadow-sm dark:bg-indigo-600'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="text-sm leading-relaxed text-slate-650 dark:text-slate-350 font-semibold space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-800 dark:text-white">Chi tiết giới thiệu</h3>
                    <p className="font-semibold text-slate-550 dark:text-slate-400">
                      {competition.Description}
                    </p>
                  </div>

                  <div className="bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-indigo-750 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      Mục tiêu và Lĩnh vực thi đấu
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-550 dark:text-slate-400">
                      Được tổ chức nhằm thúc đẩy tinh thần đổi mới và sáng tạo, cuộc thi <strong>{competition.Name}</strong> tạo sân chơi học thuật lành mạnh để học sinh/sinh viên phát huy tiềm năng và kết nối với các doanh nghiệp, nhà tài trợ uy tín. Quy trình đối soát dự án và chấm điểm được triển khai trực tiếp, khách quan dưới sự hỗ trợ chuyên môn từ các chuyên gia giàu kinh nghiệm.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Tiến trình vòng thi</h3>
                  <div className="relative border-l-2 border-indigo-150 dark:border-indigo-900/60 pl-6 ml-3 space-y-8">
                    
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-indigo-650 border-4 border-white dark:border-slate-950" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-white text-sm">Vòng Sơ Loại (Preliminary Round)</span>
                          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8.5px] px-2 py-0 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-450">Đăng ký & nộp hồ sơ</Badge>
                        </div>
                        <p className="text-slate-500 text-xs">Các đội thi đăng ký thông tin đội hình (3 - 5 người) và nộp đề xuất giải pháp trực tuyến. Hạn chót đăng ký là ngày <strong>{competition.Deadline}</strong>.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-950" />
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">Vòng Bán Kết (Semi-Final Round)</span>
                        <p className="text-slate-500 text-xs">Ban giám khảo tiến hành thẩm định kỹ thuật, mã nguồn dự án trên repository và các bản video demo mô phỏng để lọc ra top các đội xuất sắc nhất.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-950" />
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">Vòng Chung Kết (Final Round)</span>
                        <p className="text-slate-500 text-xs">Các đội thi lọt vào chung kết sẽ thuyết trình trực tiếp trước hội đồng ban giám khảo và phản biện để tìm ra nhà vô địch.</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'prizes' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Cơ cấu giải thưởng</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs">Giải Quán Quân</h5>
                      <strong className="block text-amber-600 dark:text-amber-400 text-base">{competition.Prize}</strong>
                      <span className="text-[10px] text-slate-400 block font-bold">Cúp vô địch danh giá + Huy chương Vàng</span>
                    </div>

                    <div className="bg-slate-400/5 border border-slate-400/10 p-5 rounded-2xl text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-slate-400/15 text-slate-400 mx-auto flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs">Giải Á Quân</h5>
                      <strong className="block text-slate-600 dark:text-slate-350 text-base">Huy chương Bạc</strong>
                      <span className="text-[10px] text-slate-400 block font-bold">Giấy chứng nhận + Quà tặng nhà tài trợ</span>
                    </div>

                    <div className="bg-amber-700/5 border border-amber-700/10 p-5 rounded-2xl text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-amber-700/15 text-amber-700 dark:text-amber-655 mx-auto flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs">Giải Quý Quân</h5>
                      <strong className="block text-amber-750 dark:text-amber-600 text-base">Huy chương Đồng</strong>
                      <span className="text-[10px] text-slate-400 block font-bold">Giấy chứng nhận từ BTC</span>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Quy chế tham gia</h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 dark:text-white text-xs block">Quy mô đội thi:</strong>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Yêu cầu đăng ký theo đội nhóm từ 3 đến 5 thành viên. Mỗi nhóm cần chỉ định rõ 1 Đội Trưởng làm đầu mối liên hệ chính.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 dark:text-white text-xs block">Tính liêm chính học thuật:</strong>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Sản phẩm nộp thi phải tự phát triển hoặc chỉ kế thừa các thư viện được công nhận. Các dự án phát hiện vi phạm bản quyền hoặc sao chép mã nguồn không ghi nguồn sẽ bị loại ngay lập tức.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 dark:text-white text-xs block">Cổng nộp bài thi:</strong>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Nhóm nộp dự án qua liên kết Repository GitHub/GitLab công khai, video giới thiệu Demo (Youtube/Drive) và Slide giới thiệu dự án trực tiếp trên hệ thống SEAL League.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Side Action Card (Desktop Only) */}
          <div className="hidden md:block w-80 flex-shrink-0 sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-5">
            
            {/* Small image preview */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-xs">
              <Image
                src={competition.BannerUrl}
                alt={competition.Name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>

            {/* Spec details with icons */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-550 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Giải thưởng lớn</span>
                  <span className="block text-sm font-bold text-amber-600 dark:text-amber-400 truncate">{competition.Prize || 'Không có'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Hạn đăng ký</span>
                  <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{competition.Deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Hình thức</span>
                  <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{competition.Format}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Đối tượng</span>
                  <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{competition.Audience}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
              <Button
                onClick={() => handleAction(`Đăng ký ${competition.Name}`, `Xác nhận ghi danh đội của bạn vào cuộc thi ${competition.Name}.`)}
                disabled={isClosed}
                className={`w-full rounded-xl text-xs font-bold h-10 cursor-pointer transition-all ${
                  isClosed
                    ? 'bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border-none'
                    : isExpiring
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-indigo-650 hover:bg-indigo-750 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700'
                }`}
              >
                {isClosed ? 'Đã kết thúc' : 'Đăng ký ngay'}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleShareLink}
                  className="flex-1 rounded-xl text-xs font-semibold h-9 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedLink ? 'Đã copy!' : 'Chia sẻ'}
                </Button>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* 4. MOBILE STICKY ACTION BOTTOM BAR (Hidden on Desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="min-w-0">
          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Giải thưởng Quán quân</span>
          <span className="block text-xs font-bold text-amber-600 dark:text-amber-400 truncate">{competition.Prize}</span>
        </div>
        <Button
          onClick={() => handleAction(`Đăng ký ${competition.Name}`, `Xác nhận ghi danh đội của bạn vào cuộc thi ${competition.Name}.`)}
          disabled={isClosed}
          className={`rounded-xl text-xs font-bold h-9 px-6 cursor-pointer ${
            isClosed
              ? 'bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border-none'
              : isExpiring
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-650 hover:bg-indigo-750 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700'
          }`}
        >
          {isClosed ? 'Đã kết thúc' : 'Đăng ký'}
        </Button>
      </div>

      {/* 5. FOOTER */}
      <Footer />

      {/* 6. ACTION MODAL */}
      <ActionModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={actionTitle}
        description={actionDesc}
        currentUser={currentUser}
        getDashboardLink={getDashboardLink}
        onRedirect={(url) => router.push(url)}
      />

    </div>
  );
}
