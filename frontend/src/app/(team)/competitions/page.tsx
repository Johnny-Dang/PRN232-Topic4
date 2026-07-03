'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Bell, 
  Calendar, 
  RefreshCw, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target, 
  BookOpen, 
  Award,
  ArrowRight,
  ShieldAlert,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getEvents, 
  getRounds, 
  getCategories, 
  getAdvancementRules, 
  getAnnouncements,
  Announcement,
  Event as ApiEvent,
  Round as ApiRound,
  Category as ApiCategory,
  AdvancementRule
} from '@/lib/api';

export default function CompetitionsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [rounds, setRounds] = useState<ApiRound[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [rules, setRules] = useState<AdvancementRule[]>([]);

  // Filtering states for announcements
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, evData, rndData, catData, ruleData] = await Promise.all([
        getAnnouncements(),
        getEvents(),
        getRounds(),
        getCategories(),
        getAdvancementRules()
      ]);
      setAnnouncements(annData);
      setEvents(evData);
      setRounds(rndData);
      setCategories(catData);
      setRules(ruleData);
    } catch (e) {
      console.error('Error loading competition details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter(ann => {
    const typeMatch = filterType === 'all' || ann.Type === filterType;
    const eventMatch = filterEvent === 'all' || ann.EventID === filterEvent;
    return typeMatch && eventMatch;
  });

  // Get Announcement Badge Styles
  const getAnnouncementBadge = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-600 dark:text-rose-400',
          icon: ShieldAlert,
          label: 'QUAN TRỌNG / VI PHẠM'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 text-amber-600 dark:text-amber-400',
          icon: AlertTriangle,
          label: 'CẢNH BÁO'
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400',
          icon: CheckCircle2,
          label: 'KẾT QUẢ'
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400',
          icon: Info,
          label: 'CẬP NHẬT'
        };
    }
  };

  // Define hardcoded criteria weights structure for display matching DB templates
  const criteriaTemplates = [
    {
      id: 'F0000000-0000-0000-0000-000000000001',
      name: 'Tiêu chuẩn Hackathon Chung (Default)',
      description: 'Dành cho các hạng mục phát triển phần mềm và hệ thống ứng dụng Web/Mobile thông thường.',
      criteria: [
        { name: 'Sự cải tiến & Sáng tạo (Innovation)', weight: '40%' },
        { name: 'Độ phức tạp kỹ thuật (Technical Complexity)', weight: '30%' },
        { name: 'Trải nghiệm người dùng (UI/UX)', weight: '30%' }
      ]
    },
    {
      id: 'F0000000-0000-0000-0000-000000000002',
      name: 'Tiêu chuẩn Giải pháp AI (AI Hackathon)',
      description: 'Dành cho các hạng mục phát triển mô hình Trí tuệ nhân tạo (AI/ML Solution).',
      criteria: [
        { name: 'Độ chính xác của mô hình (AI Accuracy)', weight: '40%' },
        { name: 'Hiệu suất vận hành mô hình (Model Performance)', weight: '30%' },
        { name: 'Tác động thực tiễn & Doanh nghiệp (Business Impact)', weight: '30%' }
      ]
    },
    {
      id: 'F0000000-0000-0000-0000-000000000003',
      name: 'Tiêu chuẩn Ứng dụng Di động (Mobile)',
      description: 'Dành cho các dự án phát triển giải pháp thiết bị di động chuyên biệt.',
      criteria: [
        { name: 'Trải nghiệm người dùng (User Experience)', weight: '35%' },
        { name: 'Hiệu năng ứng dụng di động (Performance)', weight: '35%' },
        { name: 'Chất lượng mã nguồn (Code Quality)', weight: '30%' }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Thông Tin Mục Tiêu & Cuộc Thi
          </h2>
          <p className="text-slate-500 text-xs mt-1 dark:text-slate-400 font-medium leading-relaxed">
            Xem các thông báo mới nhất từ Ban Tổ Chức, tra cứu thể lệ thăng hạng và tiêu chuẩn đánh giá của từng mùa giải.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-9 border-slate-200 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all duration-200"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <Skeleton className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="announcements" className="w-full space-y-6">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <TabsTrigger value="announcements" className="px-4 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer">
              <Bell className="w-4 h-4" />
              Thông báo mới ({filteredAnnouncements.length})
            </TabsTrigger>
            <TabsTrigger value="rules" className="px-4 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer">
              <Target className="w-4 h-4" />
              Mục tiêu & Thể lệ giải đấu
            </TabsTrigger>
          </TabsList>

          {/* Announcements Feed Tab */}
          <TabsContent value="announcements" className="space-y-6">
            
            {/* Filter controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 dark:bg-slate-900 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lọc thông báo:</span>
                
                {/* Severity type filter */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                  {['all', 'info', 'success', 'warning', 'danger'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 text-xs font-semibold border-r last:border-0 border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ${
                        filterType === t 
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
                      }`}
                    >
                      {t === 'all' ? 'Tất cả' : t === 'info' ? 'Cập nhật' : t === 'success' ? 'Kết quả' : t === 'warning' ? 'Cảnh báo' : 'Vi phạm/Khân'}
                    </button>
                  ))}
                </div>

                {/* Event filter dropdown */}
                <select
                  id="announcement-event-filter"
                  aria-label="Lọc thông báo theo giải đấu"
                  title="Lọc thông báo theo giải đấu"
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">Mọi giải đấu</option>
                  {events.map((e) => (
                    <option key={e.EventID} value={e.EventID}>
                      {e.EventName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Hiển thị {filteredAnnouncements.length} của {announcements.length} thông báo.
              </div>
            </div>

            {filteredAnnouncements.length === 0 ? (
              <Card className="border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Info className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Không có thông báo phù hợp</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Vui lòng thay đổi cấu hình bộ lọc hoặc mùa giải để tìm kiếm.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setFilterType('all'); setFilterEvent('all'); }} className="rounded-xl text-xs font-semibold cursor-pointer">
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Timeline Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {filteredAnnouncements.map((ann) => {
                    const style = getAnnouncementBadge(ann.Type);
                    const Icon = style.icon;
                    const eventName = events.find(e => e.EventID === ann.EventID)?.EventName || 'Thông báo chung';
                    
                    return (
                      <Card 
                        key={ann.AnnouncementID} 
                        className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                      >
                        {/* Status Left Accent Border */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          ann.Type === 'danger' ? 'bg-rose-500' : 
                          ann.Type === 'warning' ? 'bg-amber-500' : 
                          ann.Type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`} />
                        
                        <CardHeader className="p-6 pb-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`border text-[10px] font-extrabold tracking-wide py-0.5 px-2 rounded-full ${style.bg}`}>
                                <Icon className="w-3.5 h-3.5 mr-1 shrink-0" />
                                {style.label}
                              </Badge>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wide">
                                {eventName}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(ann.PublishedAt)}
                            </span>
                          </div>
                          
                          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                            {ann.Title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-6 pt-2">
                          <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed font-medium">
                            {ann.Content}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Sidebar Widget Info */}
                <div className="space-y-6">
                  
                  {/* Quick stats / Highlights */}
                  <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none text-white overflow-hidden relative shadow-lg">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                      <Trophy className="w-48 h-48" />
                    </div>
                    <CardHeader className="p-6 pb-2 relative">
                      <Badge className="bg-indigo-500/20 text-indigo-200 border-none text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 mb-2">
                        Đang diễn ra
                      </Badge>
                      <CardTitle className="text-lg font-black tracking-tight leading-tight">
                        SEAL Summer 2026
                      </CardTitle>
                      <CardDescription className="text-slate-300 text-xs mt-1">
                        Software Engineering Agile League
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4 relative">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3 mt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">Hạn chót vòng cuối:</span>
                          <span className="font-extrabold text-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 10/07/2026
                          </span>
                        </div>
                        <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 w-4/5 h-full rounded-full animate-pulse" />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          Các đội thi phải đảm bảo liên kết Repo GitHub hoạt động và cập nhật đầy đủ trước thời hạn.
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiến trình các mùa giải 2026:</h4>
                        
                        <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> SEAL Spring 2026
                          </span>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[9px] font-bold">Hoàn thành</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-200 flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" /> SEAL Summer 2026
                          </span>
                          <Badge className="bg-amber-500/20 text-amber-300 border-none text-[9px] font-bold">Vòng Chung Kết</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" /> SEAL Fall 2026
                          </span>
                          <Badge className="bg-slate-500/20 text-slate-300 border-none text-[9px] font-bold">Sắp diễn ra</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick rule alert widget */}
                  <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                    <CardHeader className="p-5 pb-1">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Chính sách liêm chính
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 space-y-2.5">
                      <p>
                        Mọi hành vi sao chép mã nguồn (Plagiarism) hoặc gian lận đều bị phát hiện bởi cơ chế kiểm toán tự động.
                      </p>
                      <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Đội vi phạm quy chế thi sẽ lập tức bị hủy kết quả (Disqualified) và công bố tên trên bảng tin hệ thống.</span>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            )}
          </TabsContent>

          {/* Goals & Rules Tab */}
          <TabsContent value="rules" className="space-y-8">
            
            {/* Intro Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Mục tiêu Tổng thể giải đấu SEAL Hackathon 2026
              </h3>
              <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed">
                Giải đấu SEAL (Software Engineering Agile League) là sân chơi công nghệ thường niên nhằm tạo cơ hội cho sinh viên FPT University và các đại học đối tác cọ xát thực tế, phát triển các giải pháp phần mềm thông qua quy trình Agile tinh gọn. Giải đấu chia thành các mùa giải (Spring, Summer, Fall) với các đề bài/hạng mục thi đấu khác nhau.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mùa Xuân (Spring)</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Đề bài Web & AI cơ bản</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mùa Hè (Summer)</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Blockchain & Web Nâng cao</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mùa Thu (Fall)</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Giải pháp AI & Hệ thống IoT</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Event details lists */}
              <div className="lg:col-span-2 space-y-6">
                
                {events.map((evt) => {
                  const eventCategories = categories.filter(c => c.EventID === evt.EventID);
                  const eventRounds = rounds.filter(r => r.EventID === evt.EventID).sort((a, b) => a.RoundOrder - b.RoundOrder);
                  
                  return (
                    <Card key={evt.EventID} className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                              {evt.EventName}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-400">
                              {evt.Description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                            NĂM {evt.Year}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 space-y-6">
                        
                        {/* Duration dates */}
                        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Bắt đầu: <strong>{evt.StartDate}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Kết thúc: <strong>{evt.EndDate}</strong></span>
                          </div>
                        </div>

                        {/* Categories details */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            Hạng mục và luật thăng hạng (Top-N)
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {eventCategories.map((cat) => {
                              // Find advancement rules matching this category
                              const catRules = rules.filter(r => r.CategoryId === cat.CategoryID);
                              
                              return (
                                <div key={cat.CategoryID} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-2 hover:border-slate-200 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                      {cat.CategoryName}
                                    </span>
                                    <Badge className="bg-indigo-50/50 text-indigo-600 text-[10px] font-extrabold border-none px-1.5 py-0.5 rounded dark:bg-indigo-950/10 dark:text-indigo-400">
                                      HẠNG MỤC
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                                    {cat.Description}
                                  </p>
                                  
                                  {/* Rules associated */}
                                  {catRules.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Quy tắc thăng hạng:</span>
                                      {catRules.map((rule) => {
                                        const roundName = rounds.find(r => r.RoundID === rule.RoundId)?.RoundName || 'Vòng thi';
                                        return (
                                          <div key={rule.RuleId} className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5 text-indigo-500" /> {roundName}</span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Chọn Top {rule.TopN} đội cao nhất</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rounds Roadmap */}
                        <div className="space-y-4 pt-2">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            Lộ trình các vòng thi & Deadline nộp bài
                          </h4>
                          
                          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-6">
                            {eventRounds.map((rnd) => (
                              <div key={rnd.RoundID} className="relative space-y-1.5">
                                {/* Dot indicator */}
                                <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-600 dark:border-slate-900 dark:bg-indigo-400" />
                                
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {rnd.RoundName} (Thứ tự: {rnd.RoundOrder})
                                  </span>
                                  <Badge className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-extrabold dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                                    Hạn nộp: {rnd.SubmissionDeadline}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                  Thời gian: {rnd.StartDate} đến {rnd.EndDate}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Sidebar Criteria Display */}
              <div className="space-y-6">
                
                <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Tiêu chí & Trọng số Điểm thi
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Mỗi hạng mục áp dụng bộ trọng số đánh giá riêng do ban giám khảo quyết định.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    {criteriaTemplates.map((tpl) => (
                      <div key={tpl.id} className="space-y-2 pb-5 border-b last:border-b-0 border-slate-100 dark:border-slate-800/80 last:pb-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                            {tpl.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {tpl.description}
                        </p>
                        
                        <div className="bg-slate-50 dark:bg-slate-850/40 rounded-xl p-3 space-y-2 mt-2">
                          {tpl.criteria.map((cr, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 dark:text-slate-450 font-medium flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
                                {cr.name}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded px-1.5 py-0.5 text-[10px]">
                                {cr.weight}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
