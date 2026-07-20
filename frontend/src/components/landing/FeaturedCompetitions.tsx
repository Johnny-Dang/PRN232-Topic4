"use client";

import React from "react";
import Image from "next/image";
import { Clock, Info, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, DetailedCompetition } from "@/lib/api";

interface FeaturedCompetitionsProps {
  competitionsSectionRef: React.RefObject<HTMLDivElement | null>;
  selectedCategory: string;
  categories: Category[];
  setSelectedCategory: (category: string) => void;
  loading: boolean;
  filteredCompetitions: DetailedCompetition[];
  setSelectedFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  onViewDetails: (comp: DetailedCompetition) => void;
}

export default function FeaturedCompetitions({
  competitionsSectionRef,
  selectedCategory,
  categories,
  setSelectedCategory,
  loading,
  filteredCompetitions,
  setSelectedFilter,
  setSearchQuery,
  onViewDetails,
}: FeaturedCompetitionsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return {
          bg: "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400",
          label: "Đang mở đăng ký",
        };
      case "expiring":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-450 animate-pulse",
          label: "Sắp hết hạn",
        };
      case "upcoming":
        return {
          bg: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400",
          label: "Sắp diễn ra",
        };
      case "closed":
      default:
        return {
          bg: "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400",
          label: "Đã kết thúc",
        };
    }
  };

  return (
    <section ref={competitionsSectionRef} className="space-y-8 scroll-mt-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-250 pb-5 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-black text-slate-850 dark:text-white">
              Danh Sách Các Cuộc Thi
            </h3>
          </div>
          <p className="text-slate-500 text-xs font-medium">
            Tìm kiếm, đối soát và lựa chọn thử thách để chinh phục các giải thưởng giá trị.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
            Lĩnh vực:
          </span>
          <select
            id="featured-category-filter"
            aria-label="Lọc cuộc thi theo lĩnh vực"
            title="Lọc cuộc thi theo lĩnh vực"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="px-3.5 py-1.8 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 outline-none cursor-pointer shadow-sm hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
          >
            <option value="all">Tất cả lĩnh vực</option>
            {categories.map((category) => (
              <option key={category.CategoryID} value={category.CategoryID}>
                {category.CategoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-4">
              <Skeleton className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <Card className="border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Info className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">
                Không tìm thấy cuộc thi phù hợp
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Hãy làm mới bộ lọc, thay đổi từ khóa hoặc chọn lĩnh vực thi đấu khác.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFilter("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Đặt lại bộ lọc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitions.map((comp) => {
            const statusMeta = getStatusBadge(comp.Status);
            const isExpiring = comp.Status === "expiring";

            return (
              <Card
                key={comp.ID}
                className="bg-white border-slate-200 dark:bg-slate-905 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden rounded-2xl group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  onClick={() => onViewDetails(comp)}
                  className="relative h-44 overflow-hidden cursor-pointer"
                >
                  <Image
                    src={comp.BannerUrl}
                    alt={comp.Name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute left-3 top-3">
                    <Badge
                      className={`border font-extrabold text-[9px] py-0.5 px-2.5 rounded-full ${statusMeta.bg}`}
                    >
                      {statusMeta.label}
                    </Badge>
                  </div>

                  <div className="absolute right-3 top-3">
                    <Badge className="bg-black/60 backdrop-blur-xs text-white border-none text-[9px] font-bold py-0.5 px-2 rounded">
                      {comp.Format}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      <span>{comp.CategoryLabel || "Chưa phân loại"}</span>
                      <span className="text-slate-400 dark:text-slate-550">
                        Đơn vị: {comp.Organizer}
                      </span>
                    </div>

                    <h4
                      onClick={() => onViewDetails(comp)}
                      className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug cursor-pointer"
                    >
                      {comp.Name}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold line-clamp-3">
                      {comp.Description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <div className="flex justify-between items-center">
                      <span>Đối tượng tham dự:</span>
                      <span className="text-slate-700 dark:text-slate-350">{comp.Audience}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Giải thưởng chính:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{comp.Prize}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800/40 pt-2 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Hạn nộp bài:
                      </span>
                      <strong
                        className={
                          isExpiring
                            ? "text-amber-500 font-bold"
                            : "text-slate-700 dark:text-slate-300"
                        }
                      >
                        {comp.Deadline} (
                        {comp.Status === "closed" ? "Đã kết thúc" : `Còn ${comp.DaysLeft} ngày`})
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => onViewDetails(comp)}
                      className="w-full rounded-xl text-xs font-semibold h-9 border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
