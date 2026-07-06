"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Search, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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

const items = [
  {
    id: "startup",
    title: "Ý tưởng Khởi nghiệp Trẻ 2026",
    category: "Startup",
    image: "/images/startup_banner.png",
    actionTitle: "Đăng ký Ý tưởng Khởi nghiệp Trẻ 2026",
    actionDesc: "Yêu cầu tham gia cuộc thi Khởi nghiệp của bạn đang được xét duyệt."
  },
  {
    id: "academic",
    title: "Academic Leagues 2026",
    category: "Academic",
    image: "/images/academic_banner.png",
    actionTitle: "Đăng ký SEAL Academic Leagues 2026",
    actionDesc: "Yêu cầu tham gia giải học thuật của bạn đang được xét duyệt."
  },
  {
    id: "hackathon",
    title: "SEAL Hackathon 2026",
    category: "Hackathon",
    image: "/images/hackathon_banner.png",
    actionTitle: "Đăng ký SEAL Hackathon 2026",
    actionDesc: "Yêu cầu tham gia cuộc thi Hackathon của bạn đang được xét duyệt."
  },
  {
    id: "coding",
    title: "Coding Challenge 2026",
    category: "Programming",
    image: "/images/coding_banner.png",
    actionTitle: "Đăng ký Coding Challenge 2026",
    actionDesc: "Yêu cầu tham gia thử thách lập trình của bạn đang được xét duyệt."
  },
  {
    id: "robotics",
    title: "Robotics Arena 2026",
    category: "Robotics",
    image: "/images/robotics_banner.png",
    actionTitle: "Đăng ký Robotics Arena 2026",
    actionDesc: "Yêu cầu tham gia đấu trường Robotics của bạn đang được xét duyệt."
  }
];

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  scrollToSection,
  competitionsSectionRef,
  announcementsSectionRef,
  setSelectedFilter,
  handleAction,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Drag states
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Auto rotate every 3.5 seconds
  useEffect(() => {
    if (isHovered || isDragging) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 5);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, isDragging]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + 5) % 5);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % 5);
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;

    // Threshold to switch card is 50px
    if (deltaX > 50) {
      setActiveIndex((prev) => (prev - 1 + 5) % 5);
      setStartX(clientX);
    } else if (deltaX < -50) {
      setActiveIndex((prev) => (prev + 1) % 5);
      setStartX(clientX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  // Touch handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const getCardStyle = (index: number) => {
    let diff = index - activeIndex;
    if (diff < -2) diff += 5;
    if (diff > 2) diff -= 5;

    let transform = "";
    let zIndex = 30;
    let opacity = 0.5;

    if (diff === 0) {
      transform = "rotateY(0deg) translateZ(120px) scale(1)";
      zIndex = 50;
      opacity = 1;
    } else if (diff === 1) {
      transform = "rotateY(-25deg) translateZ(40px) translateX(110px) translateY(10px) scale(0.85)";
      zIndex = 40;
      opacity = 0.75;
    } else if (diff === 2) {
      transform = "rotateY(-45deg) translateZ(-20px) translateX(180px) translateY(20px) scale(0.7)";
      zIndex = 30;
      opacity = 0.4;
    } else if (diff === -1) {
      transform = "rotateY(25deg) translateZ(40px) translateX(-110px) translateY(10px) scale(0.85)";
      zIndex = 40;
      opacity = 0.75;
    } else if (diff === -2) {
      transform = "rotateY(45deg) translateZ(-20px) translateX(-170px) translateY(20px) scale(0.7)";
      zIndex = 30;
      opacity = 0.4;
    }

    return {
      transform,
      zIndex,
      opacity,
    } as React.CSSProperties;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white min-h-screen flex flex-col justify-center pt-24 pb-20 px-6 select-none">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-slate-900 to-slate-950" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column content */}
        <div className="lg:col-span-6 space-y-6 text-left">
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

        {/* Right Column: 3D Cylinder Rotating Gallery */}
        <div 
          className="lg:col-span-6 flex flex-col items-center justify-center py-8 lg:py-0 select-none relative h-[380px] sm:h-[450px] cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleDragEnd();
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={handleDragEnd}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={handleDragEnd}
        >
          {/* 3D Container viewport */}
          <div className="relative w-full max-w-[540px] h-[300px] sm:h-[360px] [perspective:1200px] flex items-center justify-center">
            
            {/* Background glowing aura */}
            <div className="absolute w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-3xl" />

            {items.map((item, index) => {
              const isCenter = index === activeIndex;
              const cardStyle = getCardStyle(index);

              return (
                <div
                  key={item.id}
                  className="absolute w-[160px] sm:w-[200px] h-[240px] sm:h-[300px] rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-2xl transition-all duration-700 ease-out cursor-pointer origin-center select-none"
                  style={cardStyle}
                  onClick={() => {
                    if (isCenter) {
                      handleAction(item.actionTitle, item.actionDesc);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  draggable="false"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center select-none" 
                    style={{ backgroundImage: `url("${item.image}")` }}
                    draggable="false"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent select-none" />
                  
                  {/* Card Content Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-left select-none">
                    <span className={`inline-block border text-[8px] font-black uppercase px-2 py-0.5 tracking-wider rounded w-fit mb-1 ${
                      item.category === 'Startup' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      item.category === 'Academic' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                      item.category === 'Hackathon' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                      item.category === 'Programming' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {item.category}
                    </span>
                    <h4 className="text-[10px] sm:text-xs font-black text-white leading-tight">
                      {item.title}
                    </h4>
                  </div>
                </div>
              );
            })}

            {/* Left Navigation Chevron */}
            <button
              type="button"
              aria-label="Xem mục trước"
              title="Xem mục trước"
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 z-50 bg-slate-950/70 border border-white/15 p-2 rounded-full text-white hover:bg-indigo-650 transition-all hover:scale-110 shadow-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right Navigation Chevron */}
            <button
              type="button"
              aria-label="Xem mục tiếp theo"
              title="Xem mục tiếp theo"
              onClick={handleNext}
              className="absolute right-1 sm:right-4 z-50 bg-slate-950/70 border border-white/15 p-2 rounded-full text-white hover:bg-indigo-650 transition-all hover:scale-110 shadow-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

          {/* Dot Indicators */}
          <div className="flex gap-2 mt-4 z-40">
            {items.map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Chuyển tới mục ${index + 1}`}
                title={`Chuyển tới mục ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-6 bg-indigo-500" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

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
