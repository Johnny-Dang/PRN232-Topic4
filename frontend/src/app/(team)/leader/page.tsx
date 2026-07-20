'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle,
  ExternalLink,
  FileCode2,
  FileText,
  Info,
  RefreshCw,
  Send,
  Upload,
  Users,
  Video,
  UserPlus,
  PlusCircle,
  Briefcase,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  createSubmissionLinks,
  getCategories,
  getEvents,
  getRounds,
  getScores,
  getSubmissionAssets,
  getTeamMembers,
  getTeams,
  getTeamSubmissions,
  updateSubmissionLinks,
  uploadSubmissionAsset,
  getRecruitmentsByTeamApi,
  closeRecruitmentApi,
  TeamRecruitment,
  Event as ApiEvent,
  Round as ApiRound,
  Submission,
  SubmissionAsset,
  Team,
} from '@/lib/api';
import CreateRecruitmentModal from '@/components/recruitment/CreateRecruitmentModal';
import ApplicantListModal from '@/components/application/ApplicantListModal';
import MentoringBookingPanel from './components/MentoringBookingPanel';

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];
type ScoreWithDetails = Awaited<ReturnType<typeof getScores>>[number];
type SubmissionWithTeam = Submission & { Team: Team };

const getStringProperty = (value: unknown, keys: string[]): string | null => {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const property = record[key];
    if (typeof property === 'string' && property.trim()) return property;
  }

  return null;
};

const getStoredUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return null;

  try {
    return getStringProperty(JSON.parse(storedUser) as unknown, ['UserID', 'UserId', 'userId']);
  } catch (error) {
    console.error('Cannot parse seal_user from localStorage:', error);
    return null;
  }
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || fallback;
};

const getSubmissionStatusLabel = (status: Submission['Status']): string => {
  if (status === 'Graded') return 'Đã chấm điểm';
  if (status === 'Updated') return 'Đã cập nhật';
  if (status === 'Disqualified') return 'Đã loại';
  return 'Đã nộp bài';
};

const formatDateTime = (value: string): string => {
  if (!value) return 'Chưa có';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const isPastDeadline = (round?: ApiRound | null): boolean => {
  if (!round?.SubmissionDeadline) return false;

  const deadline = new Date(round.SubmissionDeadline);
  return !Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime();
};

const isValidHttpUrl = (value: string): boolean => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const sortRounds = (rounds: ApiRound[]): ApiRound[] => [...rounds].sort((a, b) => a.RoundOrder - b.RoundOrder);

export default function LeaderPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [slideUrl, setSlideUrl] = useState('');
  const [videoAsset, setVideoAsset] = useState<SubmissionAsset | null>(null);
  const [slideAsset, setSlideAsset] = useState<SubmissionAsset | null>(null);
  const [uploadingAssetType, setUploadingAssetType] = useState<'VideoDemo' | 'SlideDocument' | null>(null);

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionWithTeam | null>(null);
  const [scores, setScores] = useState<ScoreWithDetails[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [rounds, setRounds] = useState<ApiRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [recruitments, setRecruitments] = useState<TeamRecruitment[]>([]);
  const [isCreateRecruitmentOpen, setIsCreateRecruitmentOpen] = useState(false);
  const [isApplicantListOpen, setIsApplicantListOpen] = useState(false);

  const fetchTeamRecruitments = useCallback(async (teamId: string) => {
    try {
      const data = await getRecruitmentsByTeamApi(teamId);
      setRecruitments(data);
    } catch (err) {
      console.error('Cannot load team recruitments:', err);
    }
  }, []);

  const orderedRounds = useMemo(() => sortRounds(rounds), [rounds]);
  const selectedRound = useMemo(
    () => orderedRounds.find((round) => round.RoundID === selectedRoundId) || null,
    [orderedRounds, selectedRoundId]
  );
  const deadlinePassed = isPastDeadline(selectedRound);

  const applySubmissionToForm = useCallback((submission: SubmissionWithTeam | null) => {
    setCurrentSubmission(submission);
    setRepoUrl(submission?.RepositoryURL || '');
    setDemoUrl(submission?.DemoURL || '');
    setSlideUrl(submission?.SlideURL || '');
    setVideoAsset(null);
    setSlideAsset(null);
  }, []);

  const chooseDefaultRound = useCallback((roundsData: ApiRound[], submissionData: SubmissionWithTeam[]): string => {
    const sortedRounds = sortRounds(roundsData);
    const openRounds = sortedRounds.filter((round) => !isPastDeadline(round));
    const firstOpenWithoutSubmission = openRounds.find(
      (round) => !submissionData.some((submission) => submission.RoundID === round.RoundID)
    );
    const latestSubmission = [...submissionData].sort(
      (a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime()
    )[0];

    return (
      firstOpenWithoutSubmission?.RoundID ||
      latestSubmission?.RoundID ||
      openRounds[0]?.RoundID ||
      sortedRounds[0]?.RoundID ||
      ''
    );
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const currentUserId = getStoredUserId();
      const fetchedTeams = await getTeams();
      const myTeam = currentUserId
        ? fetchedTeams.find((item) => item.TeamLeaderId.toLowerCase() === currentUserId.toLowerCase())
        : undefined;

      setTeam(myTeam || null);
      if (myTeam) {
        fetchTeamRecruitments(myTeam.TeamID);
      }
      setMembers([]);
      setSubmissions([]);
      setScores([]);
      setEvent(null);
      setRounds([]);
      setSelectedRoundId('');
      applySubmissionToForm(null);

      if (!myTeam) {
        setErrorMessage('Không tìm thấy đội gắn với tài khoản trưởng nhóm hiện tại.');
        return;
      }

      const [membersData, eventsData, categoriesData, teamSubmissions] = await Promise.all([
        getTeamMembers(myTeam.TeamID),
        getEvents(),
        getCategories(),
        getTeamSubmissions(myTeam.TeamID),
      ]);

      const category = categoriesData.find((item) => item.CategoryID === myTeam.CategoryID);
      const teamEventId = myTeam.EventID || category?.EventID || '';
      const myEvent = eventsData.find((item) => item.EventID === teamEventId) || null;
      const roundsData = myEvent ? await getRounds(myEvent.EventID) : [];
      const defaultRoundId = chooseDefaultRound(roundsData, teamSubmissions);

      setMembers(membersData);
      setEvent(myEvent);
      setRounds(roundsData);
      setSubmissions(teamSubmissions);
      setSelectedRoundId(defaultRoundId);
      applySubmissionToForm(teamSubmissions.find((submission) => submission.RoundID === defaultRoundId) || null);
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể tải dữ liệu đội từ API.');
    } finally {
      setLoading(false);
    }
  }, [applySubmissionToForm, chooseDefaultRound, fetchTeamRecruitments]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const handleRoundChange = useCallback(
    (roundId: string) => {
      setSelectedRoundId(roundId);
      applySubmissionToForm(submissions.find((submission) => submission.RoundID === roundId) || null);
    },
    [applySubmissionToForm, submissions]
  );

  useEffect(() => {
    let cancelled = false;
    const loadScores = async () => {
      if (!currentSubmission) {
        if (!cancelled) setScores([]);
        return;
      }

      const scoreData = await getScores(currentSubmission.SubmissionID);
      if (!cancelled) setScores(scoreData);
    };

    void Promise.resolve().then(loadScores);

    return () => {
      cancelled = true;
    };
  }, [currentSubmission]);

  useEffect(() => {
    let cancelled = false;
    const loadAssets = async () => {
      if (!currentSubmission) {
        if (!cancelled) {
          setVideoAsset(null);
          setSlideAsset(null);
        }
        return;
      }

      const assets = await getSubmissionAssets(currentSubmission.SubmissionID);
      if (cancelled) return;

      setVideoAsset(assets.find((asset) => asset.AssetType === 'VideoDemo') || null);
      setSlideAsset(assets.find((asset) => asset.AssetType === 'SlideDocument') || null);
    };

    void Promise.resolve().then(loadAssets);

    return () => {
      cancelled = true;
    };
  }, [currentSubmission]);

  const validateLinks = (links: Pick<Submission, 'RepositoryURL' | 'DemoURL' | 'SlideURL'>): string | null => {
    if (!links.RepositoryURL && !links.DemoURL && !links.SlideURL && !videoAsset && !slideAsset) {
      return 'Vui lòng nhập GitHub URL hoặc upload ít nhất một file bài nộp.';
    }

    if (!isValidHttpUrl(links.RepositoryURL) || !isValidHttpUrl(links.DemoURL) || !isValidHttpUrl(links.SlideURL)) {
      return 'Đường dẫn phải bắt đầu bằng http:// hoặc https://.';
    }

    return null;
  };

  const handleAssetUpload = async (assetType: 'VideoDemo' | 'SlideDocument', file?: File) => {
    if (!file) return;

    if (!team || !selectedRound) {
      setErrorMessage('Vui lòng chọn đội và vòng thi trước khi upload file.');
      return;
    }

    if (deadlinePassed) {
      setErrorMessage('Vòng thi đã quá hạn nộp bài. Không thể upload file.');
      return;
    }

    setUploadingAssetType(assetType);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const uploadedAsset = await uploadSubmissionAsset(team.TeamID, selectedRound.RoundID, assetType, file);
      if (uploadedAsset) {
        if (assetType === 'VideoDemo') setVideoAsset(uploadedAsset);
        if (assetType === 'SlideDocument') setSlideAsset(uploadedAsset);
      }
      setSuccessMessage(assetType === 'VideoDemo' ? 'Upload video demo thành công.' : 'Upload slide/tài liệu thành công.');
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(getApiErrorMessage(error, 'Không thể upload file lên Cloudinary.'));
    } finally {
      setUploadingAssetType(null);
    }
  };

  const handleSubmit = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault();
    if (!team) {
      setErrorMessage('Không tìm thấy đội gắn với tài khoản trưởng nhóm hiện tại.');
      return;
    }

    if (!selectedRound) {
      setErrorMessage('Chưa có vòng thi từ API để tạo bài nộp mới.');
      return;
    }

    if (deadlinePassed) {
      setErrorMessage('Vòng thi đã quá hạn nộp bài. Không thể tạo hoặc cập nhật bài nộp.');
      return;
    }

    const links = {
      RepositoryURL: repoUrl.trim(),
      DemoURL: demoUrl.trim(),
      SlideURL: slideUrl.trim(),
      VideoAssetId: videoAsset?.SubmissionAssetId,
      SlideAssetId: slideAsset?.SubmissionAssetId,
    };
    const validationMessage = validateLinks(links);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (currentSubmission) {
        const updatedSubmission = await updateSubmissionLinks(currentSubmission.SubmissionID, links);
        if (updatedSubmission) {
          const submissionWithTeam = { ...updatedSubmission, Team: team };
          setCurrentSubmission(submissionWithTeam);
          setSubmissions((current) =>
            current.map((item) => (item.SubmissionID === updatedSubmission.SubmissionID ? submissionWithTeam : item))
          );
        }
        setSuccessMessage('Cập nhật đường dẫn bài nộp dự án thành công.');
      } else {
        const createdSubmission = await createSubmissionLinks(team.TeamID, selectedRound.RoundID, links);
        if (createdSubmission) {
          const submissionWithTeam = { ...createdSubmission, Team: team };
          setCurrentSubmission(submissionWithTeam);
          setSubmissions((current) =>
            [submissionWithTeam, ...current].sort(
              (a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime()
            )
          );
        }
        setSuccessMessage('Tạo bài nộp dự án thành công.');
      }
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(getApiErrorMessage(error, 'Không thể cập nhật bài nộp qua API.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Cổng Trưởng Nhóm</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {team ? `Nhóm: ${team.TeamName}` : 'Chưa tìm thấy đội'} | Sự kiện: {event?.EventName || 'Chưa có'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <FileCode2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Cổng nộp bài dự án
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                      Chọn vòng thi, gửi mới hoặc cập nhật repository, demo và slide trước hạn nộp.
                    </CardDescription>
                  </div>
                  {currentSubmission && (
                    <Badge className="w-fit border border-blue-100 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      {getSubmissionStatusLabel(currentSubmission.Status)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="leader-round-select"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Vòng thi
                    </label>
                    <select
                      id="leader-round-select"
                      title="Chọn vòng thi để nộp hoặc cập nhật bài"
                      aria-label="Chọn vòng thi để nộp hoặc cập nhật bài"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      value={selectedRoundId}
                      onChange={(event) => handleRoundChange(event.target.value)}
                      disabled={orderedRounds.length === 0}
                    >
                      {orderedRounds.length === 0 ? (
                        <option value="">Chưa có vòng thi từ API</option>
                      ) : (
                        orderedRounds.map((round) => (
                          <option key={round.RoundID} value={round.RoundID}>
                            {round.RoundName} - hạn nộp {formatDateTime(round.SubmissionDeadline)}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Hạn nộp: {formatDateTime(selectedRound?.SubmissionDeadline || '')}</span>
                      {deadlinePassed ? (
                        <Badge className="border border-rose-100 bg-rose-50 text-rose-600">Đã quá hạn</Badge>
                      ) : (
                        <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-600">Đang mở</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="leader-repo-url"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      GitHub Repository URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="leader-repo-url"
                        type="url"
                        placeholder="https://github.com/team/project"
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                        value={repoUrl}
                        onChange={(event) => setRepoUrl(event.target.value)}
                      />
                      {repoUrl && (
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Mở GitHub Repository URL"
                          title="Mở GitHub Repository URL"
                          className="flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 hover:bg-slate-50 dark:border-slate-700"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="leader-demo-file"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Video Demo File
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <Input
                        id="leader-demo-file"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        className="h-10 rounded-xl border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-900"
                        disabled={uploadingAssetType !== null || deadlinePassed}
                        onChange={(event) => void handleAssetUpload('VideoDemo', event.target.files?.[0])}
                      />
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-900">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-700 dark:text-slate-200">
                            {videoAsset?.OriginalFileName || 'Chưa upload video demo'}
                          </p>
                          <p className="text-slate-400">
                            {uploadingAssetType === 'VideoDemo'
                              ? 'Đang upload lên Cloudinary...'
                              : videoAsset
                                ? `${formatFileSize(videoAsset.FileSize)} · ${videoAsset.Format || videoAsset.ResourceType}`
                                : 'Hỗ trợ MP4, WEBM, MOV'}
                          </p>
                        </div>
                        {videoAsset?.SecureUrl ? (
                          <a
                            href={videoAsset.SecureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Mở video demo đã upload"
                            title="Mở video demo đã upload"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700"
                          >
                            <ExternalLink className="h-4 w-4 text-slate-500" />
                          </a>
                        ) : (
                          <Upload className="h-4 w-4 shrink-0 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="leader-slide-file"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Slide / Tài liệu báo cáo
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <Input
                        id="leader-slide-file"
                        type="file"
                        accept=".ppt,.pptx,.doc,.docx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="h-10 rounded-xl border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-900"
                        disabled={uploadingAssetType !== null || deadlinePassed}
                        onChange={(event) => void handleAssetUpload('SlideDocument', event.target.files?.[0])}
                      />
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-900">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-700 dark:text-slate-200">
                            {slideAsset?.OriginalFileName || 'Chưa upload slide/tài liệu'}
                          </p>
                          <p className="text-slate-400">
                            {uploadingAssetType === 'SlideDocument'
                              ? 'Đang upload lên Cloudinary...'
                              : slideAsset
                                ? `${formatFileSize(slideAsset.FileSize)} · ${slideAsset.Format || slideAsset.ResourceType}`
                                : 'Hỗ trợ PPT, PPTX, DOC, DOCX'}
                          </p>
                        </div>
                        {slideAsset?.SecureUrl ? (
                          <a
                            href={slideAsset.SecureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Mở slide hoặc tài liệu đã upload"
                            title="Mở slide hoặc tài liệu đã upload"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700"
                          >
                            <ExternalLink className="h-4 w-4 text-slate-500" />
                          </a>
                        ) : (
                          <Upload className="h-4 w-4 shrink-0 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {successMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4 text-emerald-600" /> {successMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="h-10 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                      disabled={updating || uploadingAssetType !== null || !team || !selectedRound || deadlinePassed}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {updating ? 'Đang gửi...' : currentSubmission ? 'Cập nhật bài nộp' : 'Tạo bài nộp'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Lịch sử bài nộp qua các vòng</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Danh sách bài nộp lấy từ API Submissions theo đội hiện tại.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {submissions.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có bài nộp từ API.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Vòng thi</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Thời gian</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Liên kết</TableHead>
                          <TableHead className="text-right text-xs font-bold uppercase text-slate-700">
                            Trạng thái
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => {
                          const round = rounds.find((item) => item.RoundID === submission.RoundID);
                          const hasLinks = submission.RepositoryURL || submission.DemoURL || submission.SlideURL;

                          return (
                            <TableRow
                              key={submission.SubmissionID}
                              className={submission.RoundID === selectedRoundId ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}
                            >
                              <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                <button
                                  type="button"
                                  className="text-left hover:text-indigo-600"
                                  onClick={() => handleRoundChange(submission.RoundID)}
                                >
                                  {round?.RoundName || 'Vòng thi'}
                                </button>
                              </TableCell>
                              <TableCell className="text-xs text-slate-500">
                                {formatDateTime(submission.SubmittedAt)}
                              </TableCell>
                              <TableCell>
                                {hasLinks ? (
                                  <div className="flex gap-2">
                                    {submission.RepositoryURL && (
                                      <a
                                        href={submission.RepositoryURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Mở repository"
                                        title="Mở repository"
                                      >
                                        <FileCode2 className="h-4 w-4 text-slate-500" />
                                      </a>
                                    )}
                                    {submission.DemoURL && (
                                      <a
                                        href={submission.DemoURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Mở video demo"
                                        title="Mở video demo"
                                      >
                                        <Video className="h-4 w-4 text-rose-500" />
                                      </a>
                                    )}
                                    {submission.SlideURL && (
                                      <a
                                        href={submission.SlideURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Mở slide báo cáo"
                                        title="Mở slide báo cáo"
                                      >
                                        <FileText className="h-4 w-4 text-indigo-500" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">Chưa có liên kết</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge className="border border-blue-100 bg-blue-50 text-[10px] text-blue-600">
                                  {getSubmissionStatusLabel(submission.Status)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Bảng điểm đánh giá
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Điểm chi tiết của bài nộp đang chọn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {scores.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 py-6 text-center text-xs text-slate-400 dark:bg-slate-950">
                    <Info className="mx-auto mb-1 h-6 w-6 text-slate-300" />
                    Chưa có điểm đánh giá từ API.
                  </div>
                ) : (
                  scores.map((score) => (
                    <div
                      key={score.ScoreID}
                      className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {score.Criteria.CriteriaName}
                        </h5>
                        <p className="text-[10px] leading-normal text-slate-400">Nhận xét: &quot;{score.Comment}&quot;</p>
                      </div>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {score.ScoreValue.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Thành viên nhóm ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {members.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có API trả về danh sách thành viên.
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.TeamMemberId}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {member.User.FullName}
                        </span>
                        <p className="text-[10px] text-slate-400">{member.User.Email}</p>
                      </div>
                      {member.User.UserID === team?.TeamLeaderId && (
                        <Badge className="bg-indigo-600 px-1.5 py-0 text-[8px] font-bold text-white">Lead</Badge>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Tuyển dụng & Ứng viên Card */}
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Quản lý Tuyển dụng ({recruitments.length})
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Đăng bài tìm đồng đội và duyệt các đơn xin gia nhập nhóm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {team && (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsCreateRecruitmentOpen(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Đăng tin tuyển thành viên
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsApplicantListOpen(true)}
                      className="w-full border-slate-200 dark:border-slate-800 text-xs font-medium rounded-xl"
                    >
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Xem đơn ứng tuyển vào nhóm
                    </Button>
                  </div>
                )}

                {recruitments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Tin tuyển đang có:</span>
                    {recruitments.map((rec) => (
                      <div
                        key={rec.RecruitmentId}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{rec.RoleNeeded}</div>
                          <div className="text-[10px] text-slate-400">Cần tuyển: {rec.Quantity} người</div>
                        </div>
                        {rec.Status?.toUpperCase() === 'OPEN' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await closeRecruitmentApi(rec.RecruitmentId);
                                if (team) fetchTeamRecruitments(team.TeamID);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="text-[10px] text-slate-500 hover:text-red-600 h-7 px-2"
                          >
                            Đóng tin
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="text-[9px]">Đã đóng</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mentoring & Booking Section */}
            <MentoringBookingPanel categoryId={team?.CategoryID} teamId={team?.TeamID} />
          </div>
        </div>
      )}

      {team && (
        <>
          <CreateRecruitmentModal
            teamId={team.TeamID}
            isOpen={isCreateRecruitmentOpen}
            onClose={() => setIsCreateRecruitmentOpen(false)}
            onSuccess={() => fetchTeamRecruitments(team.TeamID)}
          />
          <ApplicantListModal
            teamId={team.TeamID}
            isOpen={isApplicantListOpen}
            onClose={() => setIsApplicantListOpen(false)}
          />
        </>
      )}
    </div>
  );
}

