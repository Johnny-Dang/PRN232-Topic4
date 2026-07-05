"use client";

import React from "react";
import { Sparkles, Search, ArrowRight, Clock, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  scrollToSection: (ref: React.RefObject<HTMLDivElement | null>) => void;
  competitionsSectionRef: React.RefObject<HTMLDivElement | null>;
  announcementsSectionRef: React.RefObject<HTMLDivElement | null>;
  setSelectedFilter: (filter: string) => void;
  handleAction: (title: string, message: string) => void;
}

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  scrollToSection,
  competitionsSectionRef,
  announcementsSectionRef,
  setSelectedFilter,
  handleAction,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white min-h-screen flex flex-col justify-center pt-24 pb-20 px-6">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-slate-900 to-slate-950" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column content */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-none text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Mở Đăng Ký SEAL Hackathon &
            Academic Leagues
          </Badge>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-50 to-indigo-200">
            Khám phá các cuộc thi mới nhất dành cho học sinh, sinh viên
          </h2>

          <p className="text-slate-350 text-xs md:text-sm max-w-xl leading-relaxed font-semibold">
            Cập nhật nhanh thông báo, thể lệ, thời hạn đăng ký và kết quả các
            cuộc thi học thuật, sáng tạo, công nghệ và kỹ năng hàng đầu toàn
            quốc.
          </p>

          {/* Quick Hero Search Input */}
          <div className="max-w-md w-full bg-white/10 p-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2 border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Tìm nhanh cuộc thi (ví dụ: Tin học, Web, AI...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  scrollToSection(competitionsSectionRef);
                }
              }}
              className="bg-transparent text-white border-0 outline-none text-xs flex-1 placeholder:text-slate-400 py-2 h-full"
            />
            <Button
              onClick={() => scrollToSection(competitionsSectionRef)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold h-9 px-4 cursor-pointer"
            >
              Tìm ngay
            </Button>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              onClick={() => {
                setSelectedFilter("open");
                scrollToSection(competitionsSectionRef);
              }}
              size="lg"
              className="rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-slate-100 px-6 h-11 cursor-pointer"
            >
              Xem cuộc thi đang mở
            </Button>
            <Button
              variant="ghost"
              onClick={() => scrollToSection(announcementsSectionRef)}
              size="lg"
              className="rounded-xl text-xs font-bold text-white hover:bg-white/10 hover:text-white px-6 h-11 cursor-pointer"
            >
              Xem thông báo mới nhất <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Column: Featured Mockup Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <Card className="w-full max-w-sm bg-slate-900/60 border-slate-800 backdrop-blur-md p-5 rounded-2xl relative shadow-2xl overflow-hidden group hover:border-slate-700 transition-all duration-300">
            {/* Expiring tag highlight banner */}
            <div className="absolute right-0 top-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl tracking-wider uppercase z-10 flex items-center gap-1 shadow-md shadow-amber-950/40 animate-pulse">
              <Clock className="w-3 h-3" /> CÒN 2 NGÀY
            </div>

            <CardHeader className="p-0 pb-4 border-b border-white/5 space-y-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-none text-[8px] font-extrabold uppercase px-2 py-0.5 tracking-wider w-fit">
                SẮP HẾT HẠN
              </Badge>

              <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight pt-1">
                Ý tưởng Khởi nghiệp Trẻ 2026
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Đơn vị tổ chức: <strong>FPT Enterprise</strong>
              </p>
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-4 text-xs text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Bệ phóng đầu tư trị giá <strong>100.000.000 VND</strong> dành
                cho các dự án kinh doanh sáng tạo áp dụng Agile League.
              </p>

              <div className="space-y-2 bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">
                    Hình thức thi:
                  </span>
                  <span className="font-extrabold text-white">
                    Hybrid (Online & Offline)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">
                    Giải thưởng:
                  </span>
                  <span className="font-extrabold text-amber-300">
                    100.000.000 VND
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">
                    Hạn đăng ký:
                  </span>
                  <span className="font-extrabold text-slate-200">
                    03/07/2026
                  </span>
                </div>
              </div>

              <Button
                onClick={() =>
                  handleAction(
                    "Đăng ký Ý tưởng Khởi nghiệp Trẻ 2026",
                    "Yêu cầu tham gia cuộc thi Khởi nghiệp của bạn đang được xét duyệt.",
                  )
                }
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold h-9 mt-2 cursor-pointer"
              >
                Đăng Ký Tham Gia Ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => scrollToSection(competitionsSectionRef)}
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300">
          Cuộn xuống
        </span>
        <ChevronDown className="w-4 h-4 text-indigo-400" />
      </div>
    </section>
  );
}
