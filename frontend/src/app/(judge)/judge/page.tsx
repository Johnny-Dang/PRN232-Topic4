'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, ExternalLink, RefreshCw, Send, CheckCircle2, Video, FileCode2, FileText, Info, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  getTeams,
  getSubmissions,
  getCategories,
  getRounds,
  mockCriteria,
  Team,
  Submission,
  Category,
  Round,
  Criteria
} from '@/lib/api';

export default function JudgePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Selection states
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  
  // Score form states
  const [scores, setScores] = useState<{ [criteriaId: string]: number }>({});
  const [comments, setComments] = useState<{ [criteriaId: string]: string }>({});

  // Loaded states
  const [submissions, setSubmissions] = useState<(Submission & { Team: Team })[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Derived states
  const activeSubmission = submissions.find(s => s.SubmissionID === selectedSubId);
  const activeRound = activeSubmission ? rounds.find(r => r.RoundID === activeSubmission.RoundID) : null;
  const activeCategory = activeSubmission ? categories.find(c => c.CategoryID === activeSubmission.Team.CategoryID) : null;

  // Filter criteria for active category
  // If AI Solution -> AI Accuracy, Model Performance, Business Impact
  // If Web Application -> Innovation, Technical Complexity, UI/UX
  const getActiveCriteria = (): Criteria[] => {
    if (!activeCategory) return [];
    if (activeCategory.CategoryName.includes('AI') || activeCategory.CategoryName.includes('ML')) {
      return mockCriteria.filter(c => c.TemplateID === 'F0000000-0000-0000-0000-000000000002');
    } else if (activeCategory.CategoryName.includes('Mobile')) {
      return mockCriteria.filter(c => c.TemplateID === 'F0000000-0000-0000-0000-000000000003');
    }
    // Default general template
    return mockCriteria.filter(c => c.TemplateID === 'F0000000-0000-0000-0000-000000000001');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedRounds = await getRounds();
      setRounds(fetchedRounds);

      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);

      const fetchedSubs = await getSubmissions();
      // Filter submissions for Preliminary & Semi final rounds
      const activeSubs = fetchedSubs.filter(s => s.Status !== 'Disqualified');
      setSubmissions(activeSubs);

      if (activeSubs.length > 0) {
        setSelectedSubId(activeSubs[0].SubmissionID);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize form fields when active submission changes
  useEffect(() => {
    if (activeSubmission) {
      const activeCriteria = getActiveCriteria();
      const initialScores: { [id: string]: number } = {};
      const initialComments: { [id: string]: string } = {};
      activeCriteria.forEach(c => {
        initialScores[c.CriteriaID] = 8.5; // default starting score
        initialComments[c.CriteriaID] = '';
      });
      setScores(initialScores);
      setComments(initialComments);
      setSuccessMessage('');
    }
  }, [selectedSubId]);

  const handleScoreChange = (criteriaId: string, val: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: Math.min(10, Math.max(0, val))
    }));
  };

  const handleCommentChange = (criteriaId: string, val: string) => {
    setComments(prev => ({
      ...prev,
      [criteriaId]: val
    }));
  };

  const calculateWeightedTotal = (): number => {
    const activeCriteria = getActiveCriteria();
    return activeCriteria.reduce((total, c) => {
      const score = scores[c.CriteriaID] || 0;
      return total + (score * c.Weight);
    }, 0);
  };

  const handleSubmitScores = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(`Đã lưu điểm số kỹ thuật số cho đội ${activeSubmission?.Team.TeamName} thành công! Điểm trung bình trọng số: ${calculateWeightedTotal().toFixed(2)}`);
      
      // Update local submission status to Graded
      if (activeSubmission) {
        activeSubmission.Status = 'Graded';
      }
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
            Cổng Chấm Điểm Kỹ Thuật Số (Judge Portal)
          </h2>
          <p className="text-slate-500 text-xs mt-1 dark:text-slate-400 font-medium leading-relaxed">
            Chấm điểm trực tuyến độc lập theo tiêu chí và lưu trữ trực tiếp, loại bỏ file Excel rời rạc.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-9 border-slate-200 text-xs font-semibold"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <Skeleton className="h-56 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left panel: Submissions list */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Bài nộp cần đánh giá ({submissions.length})
            </h3>
            
            <div className="space-y-3">
              {submissions.map((sub) => {
                const isSelected = sub.SubmissionID === selectedSubId;
                const round = rounds.find(r => r.RoundID === sub.RoundID);
                return (
                  <Card
                    key={sub.SubmissionID}
                    className={`bg-white border-slate-200 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${
                      isSelected ? 'ring-2 ring-emerald-600 dark:ring-emerald-400' : ''
                    }`}
                    onClick={() => setSelectedSubId(sub.SubmissionID)}
                  >
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {sub.Team.TeamName}
                        </h4>
                        <Badge className={
                          sub.Status === 'Graded'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 text-[9px]'
                            : 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 text-[9px]'
                        }>
                          {sub.Status === 'Graded' ? 'Đã chấm' : 'Chưa chấm'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        {round?.RoundName}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active Scorecard */}
          <div className="lg:col-span-2 space-y-6">
            {activeSubmission ? (
              <form onSubmit={handleSubmitScores} className="space-y-6">
                
                {/* Project Links & Details */}
                <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">
                      Chi tiết bài nộp: {activeSubmission.Team.TeamName}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-medium">
                      Hạng mục: {activeCategory?.CategoryName} | Vòng thi: {activeRound?.RoundName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800">
                    {activeSubmission.RepositoryURL && (
                      <a href={activeSubmission.RepositoryURL} target="_blank" rel="noopener noreferrer" className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:border-slate-700">
                        <FileCode2 className="w-4 h-4 text-slate-500" /> Xem mã nguồn GitHub
                      </a>
                    )}
                    {activeSubmission.DemoURL && (
                      <a href={activeSubmission.DemoURL} target="_blank" rel="noopener noreferrer" className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 text-rose-600 dark:border-slate-700">
                        <Video className="w-4 h-4" /> Xem Video Demo
                      </a>
                    )}
                    {activeSubmission.SlideURL && (
                      <a href={activeSubmission.SlideURL} target="_blank" rel="noopener noreferrer" className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:border-slate-700">
                        <FileText className="w-4 h-4 text-indigo-500" /> Báo cáo & Slides
                      </a>
                    )}
                  </CardContent>
                </Card>

                {/* Criteria Score Forms */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Tiêu chí đánh giá & Điểm số
                  </h3>
                  
                  {getActiveCriteria().map(crit => (
                    <Card key={crit.CriteriaID} className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{crit.CriteriaName}</h4>
                              <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-bold dark:bg-indigo-950/20 dark:text-indigo-400">
                                Trọng số: {crit.Weight * 100}%
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                              Đánh giá mức độ sáng tạo, độ phức tạp công nghệ và giao diện UX/UI của sản phẩm.
                            </p>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {/* Number Input */}
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                className="w-20 text-center font-bold text-slate-800 h-10 rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                value={scores[crit.CriteriaID] || ''}
                                onChange={(e) => handleScoreChange(crit.CriteriaID, parseFloat(e.target.value) || 0)}
                                required
                              />
                              <span className="text-xs text-slate-400 font-bold">/ 10</span>
                            </div>
                          </div>
                        </div>

                        {/* Comment box per criteria */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ý kiến nhận xét cho tiêu chí này</label>
                          <textarea
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                            placeholder="Nhập nhận xét cụ thể để làm cơ sở cho điểm số..."
                            value={comments[crit.CriteriaID] || ''}
                            onChange={(e) => handleCommentChange(crit.CriteriaID, e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Weighted Total display & Submit */}
                <Card className="bg-slate-900 text-white dark:bg-slate-900 border-none shadow-md rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng điểm trọng số</span>
                        <p className="text-2xl font-black text-white">{calculateWeightedTotal().toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 10.0</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                      {successMessage && (
                        <div className="p-2 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-xl text-xs font-semibold text-right">
                          {successMessage}
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold px-6 text-xs transition-colors w-full md:w-auto"
                        disabled={submitting}
                      >
                        <Send className="w-3.5 h-3.5 mr-2" /> {submitting ? 'Đang gửi...' : 'Nộp điểm số kỹ thuật số'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </form>
            ) : (
              <Card className="bg-white border-slate-200 p-8 text-center text-slate-400 dark:bg-slate-900 dark:border-slate-800">
                Vui lòng chọn bài nộp ở cột bên trái để hiển thị phiếu chấm điểm.
              </Card>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
