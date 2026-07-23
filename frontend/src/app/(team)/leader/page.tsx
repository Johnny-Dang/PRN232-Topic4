'use client';

/* eslint-disable react/no-unescaped-entities */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Video,
  UserPlus,
  PlusCircle,
  Briefcase,
  Trash2,
  Pencil,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/contexts/ToastContext';
import {
  addTeamMember,
  removeTeamMember,
  createSubmissionLinks,
  deleteSubmission,
  getCategories,
  getEvents,
  getRounds,
  getScores,
  getSubmissionAssets,
  getTeamMembers,
  getTeams,
  getTeamRoundProgress,
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
  Category,
} from '@/lib/api';
import CreateRecruitmentModal from '@/components/recruitment/CreateRecruitmentModal';
import ApplicantListModal from '@/components/application/ApplicantListModal';
import MentoringBookingPanel from './components/MentoringBookingPanel';
import { TeamMembersCard } from '@/components/team/TeamMembersCard';
import { TeamRoundsCard } from '@/components/team/TeamRoundsCard';
import SubmissionDetailModal from './components/SubmissionDetailModal';

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
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: {
        data?: {
          message?: string;
          title?: string;
          errors?: Record<string, string[]>;
        };
      };
    }).response;
    const validationMessage = response?.data?.errors
      ? Object.values(response.data.errors).flat().find((message) => message.trim())
      : null;

    return response?.data?.message || validationMessage || response?.data?.title || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
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

const isBeforeStartDate = (round?: ApiRound | null): boolean => {
  if (!round?.StartDate) return false;

  const start = new Date(round.StartDate);
  return !Number.isNaN(start.getTime()) && Date.now() < start.getTime();
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
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedEventId = searchParams.get('eventId') ?? '';
  const requestedEventIdRef = useRef(requestedEventId);
  useEffect(() => {
    requestedEventIdRef.current = requestedEventId;
  }, [requestedEventId]);
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
  const [myLeaderTeams, setMyLeaderTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [allEvents, setAllEvents] = useState<ApiEvent[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionWithTeam | null>(null);
  const [scores, setScores] = useState<ScoreWithDetails[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [rounds, setRounds] = useState<ApiRound[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [recruitments, setRecruitments] = useState<TeamRecruitment[]>([]);
  const [isCreateRecruitmentOpen, setIsCreateRecruitmentOpen] = useState(false);
  const [isApplicantListOpen, setIsApplicantListOpen] = useState(false);
  const [selectedDetailSubmission, setSelectedDetailSubmission] = useState<SubmissionWithTeam | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [newMemberId, setNewMemberId] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addErrorMessage, setAddErrorMessage] = useState('');
  const [addSuccessMessage, setAddSuccessMessage] = useState('');

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberId.trim() || !team) return;

    setAddingMember(true);
    setAddErrorMessage('');
    setAddSuccessMessage('');

    try {
      await addTeamMember(team.TeamID, newMemberId.trim());
      setAddSuccessMessage('Đã thêm thành viên mới thành công!');
      setNewMemberId('');
      const updatedMembers = await getTeamMembers(team.TeamID);
      setMembers(updatedMembers);
      showToast('Đã thêm thành viên thành công!', 'success');
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể thêm thành viên.';
      setAddErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveLeaderMember = async (teamMemberId: string) => {
    if (!team) return;
    try {
      await removeTeamMember(team.TeamID, teamMemberId);
      setMembers((prev) => prev.filter((m) => m.TeamMemberId !== teamMemberId));
      showToast('Đã xóa thành viên khỏi nhóm.', 'success');
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosError.response?.data?.message || axiosError.message || 'Không thể xóa thành viên.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const resetSubmissionForm = useCallback(() => {
    setCurrentSubmission(null);
    setRepoUrl('');
    setDemoUrl('');
    setSlideUrl('');
    setVideoAsset(null);
    setSlideAsset(null);
    const demoInput = document.getElementById('leader-demo-file') as HTMLInputElement | null;
    if (demoInput) demoInput.value = '';
    const slideInput = document.getElementById('leader-slide-file') as HTMLInputElement | null;
    if (slideInput) slideInput.value = '';
  }, []);

  const fetchTeamRecruitments = useCallback(async (teamId: string) => {
    try {
      const data = await getRecruitmentsByTeamApi(teamId);
      setRecruitments(data);
    } catch (err) {
      console.error('Cannot load team recruitments:', err);
    }
  }, []);

  // Lọc events theo team (theo EventID hoặc Category)
  const teamEvents = useMemo(() => {
    // Xây dựng danh sách các event mà user hiện đang tham gia (qua tất cả các team)
    const eventIdSet = new Set<string>();
    for (const t of myLeaderTeams) {
      const cat = allCategories.find((c) => c.CategoryID === t.CategoryID);
      const evId = t.EventID || cat?.EventID;
      if (evId) eventIdSet.add(evId);
    }

    if (eventIdSet.size === 0) {
      // Nếu user chưa có team nào gắn với event, fallback về team hiện tại
      if (!team) return allEvents;
      const category = allCategories.find((c) => c.CategoryID === team.CategoryID);
      const teamEventId = team.EventID || category?.EventID || '';
      const filtered = allEvents.filter((ev) => ev.EventID === teamEventId);
      return filtered.length > 0 ? filtered : allEvents;
    }

    // Hiển thị tất cả event mà user có team, sắp xếp theo tên
    return allEvents.filter((ev) => eventIdSet.has(ev.EventID));
  }, [allCategories, allEvents, myLeaderTeams, team]);

  const orderedRounds = useMemo(() => {
    return sortRounds(rounds);
  }, [rounds]);
  const selectedRound = useMemo(
    () => orderedRounds.find((round) => round.RoundID === selectedRoundId) || null,
    [orderedRounds, selectedRoundId]
  );
  const { data: roundProgress = [] } = useQuery({
    queryKey: ['team-round-progress', team?.TeamID],
    queryFn: () => getTeamRoundProgress(team!.TeamID),
    enabled: Boolean(team?.TeamID),
  });
  const selectedRoundProgress = roundProgress.find(
    (item) => item.RoundId === selectedRoundId,
  );
  const qualificationBlocked = selectedRoundProgress?.IsEligible === false;
  const deadlinePassed = isPastDeadline(selectedRound);
  const beforeStartDate = isBeforeStartDate(selectedRound);
  const effectiveEndPassed = Boolean(
    selectedRound?.EffectiveEndAtUtc
      && Date.now() >= new Date(selectedRound.EffectiveEndAtUtc).getTime(),
  );
  const submissionReadOnly = selectedRoundProgress
    ? !selectedRoundProgress.CanSubmit
    : deadlinePassed
      || beforeStartDate
      || qualificationBlocked
      || effectiveEndPassed
      || Boolean(selectedRound?.IsFinalized);
  const submissionReadOnlyReason = selectedRoundProgress?.BlockedReason
    || (selectedRound?.IsFinalized || effectiveEndPassed
      ? 'Vòng thi đã kết thúc. Bài nộp hiện chỉ có thể xem.'
      : beforeStartDate
        ? 'Vòng thi chưa mở.'
        : deadlinePassed
          ? 'Đã quá hạn nộp bài.'
          : qualificationBlocked
            ? 'Đội chưa đủ điều kiện tham gia vòng này.'
            : 'Bài nộp hiện chỉ có thể xem.');

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
    const openRounds = sortedRounds.filter((round) => !isPastDeadline(round) && !isBeforeStartDate(round));
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

  const loadData = useCallback(async (teamId?: string) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const currentUserId = getStoredUserId();
      const [fetchedTeams, eventsData, categoriesData] = await Promise.all([
        getTeams(),
        getEvents(),
        getCategories(),
      ]);

      setAllEvents(eventsData);
      setEvents(eventsData);
      setAllCategories(categoriesData);

      let userTeams = currentUserId
        ? fetchedTeams.filter((item) => (item.TeamLeaderId || '').toLowerCase() === currentUserId.toLowerCase())
        : [];

      if (userTeams.length === 0 && currentUserId) {
        const memberCheckPromises = fetchedTeams.map(async (t) => {
          try {
            const mList = await getTeamMembers(t.TeamID);
            const isMember = mList.some(
              (m) => (m.UserId || '').toLowerCase().trim() === currentUserId.toLowerCase().trim()
            );
            return isMember ? t : null;
          } catch {
            return null;
          }
        });
        const memberTeams = (await Promise.all(memberCheckPromises)).filter((t): t is Team => t !== null);
        userTeams = memberTeams;
      }

      setMyLeaderTeams(userTeams);

      // Ưu tiên chọn team theo eventId trên URL (deep-link từ /my-events)
      const targetRequestedEventId = requestedEventIdRef.current;
      const findTeamForEvent = (eventId: string): Team | null => {
        if (!eventId) return null;
        // Tìm team trực tiếp có EventID khớp
        const directMatch = userTeams.find(
          (t) => (t.EventID || '').toLowerCase() === eventId.toLowerCase()
        );
        if (directMatch) return directMatch;
        // Nếu không thấy, tìm qua Category
        const catForEvent = categoriesData.find(
          (c) => (c.EventID || '').toLowerCase() === eventId.toLowerCase()
        );
        if (catForEvent) {
          const teamByCat = userTeams.find((t) => t.CategoryID === catForEvent.CategoryID);
          if (teamByCat) return teamByCat;
        }
        return null;
      };

      const targetTeamId = teamId || selectedTeamId;
      const teamFromQuery = targetRequestedEventId ? findTeamForEvent(targetRequestedEventId) : null;
      const activeTeam =
        teamFromQuery ||
        userTeams.find((t) => t.TeamID === targetTeamId) ||
        userTeams[0] ||
        null;

      if (activeTeam) {
        setSelectedTeamId(activeTeam.TeamID);
      }
      setTeam(activeTeam);
      if (activeTeam) {
        fetchTeamRecruitments(activeTeam.TeamID);
      }
      setMembers([]);
      setSubmissions([]);
      setScores([]);
      setEvent(null);
      setRounds([]);
      setSelectedEventId('');
      setSelectedRoundId('');
      applySubmissionToForm(null);

      if (!activeTeam) {
        setLoading(false);
        return;
      }

      const [membersData, teamSubmissions] = await Promise.all([
        getTeamMembers(activeTeam.TeamID),
        getTeamSubmissions(activeTeam.TeamID),
      ]);

      const category = categoriesData.find((item) => item.CategoryID === activeTeam.CategoryID);
      const teamEventId = activeTeam.EventID || category?.EventID || '';
      const availableEvents = eventsData.filter((ev) => ev.EventID === activeTeam.EventID || ev.EventID === teamEventId);
      const myEvent = availableEvents[0] || eventsData[0] || null;

      setMembers(membersData);
      setEvent(myEvent);
      setSubmissions(teamSubmissions);

      if (myEvent) {
        setSelectedEventId(myEvent.EventID);
        try {
          const eventRounds = await getRounds(myEvent.EventID);
          setRounds(eventRounds);
          if (eventRounds.length > 0) {
            const defaultRoundId = chooseDefaultRound(eventRounds, teamSubmissions);
            setSelectedRoundId(defaultRoundId);
            const matchingSub = teamSubmissions.find((s) => s.RoundID === defaultRoundId) || null;
            applySubmissionToForm(matchingSub);
          }
        } catch (roundError) {
          console.error('Cannot load initial rounds:', roundError);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể tải dữ liệu đội từ API.');
    } finally {
      setLoading(false);
    }
  }, [applySubmissionToForm, chooseDefaultRound, fetchTeamRecruitments, selectedTeamId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Theo dõi URL: nếu user back/forward tới ?eventId=xxx khác, tự load lại đúng team
  useEffect(() => {
    if (!requestedEventId) return;
    // Chỉ re-load khi team hiện tại không khớp eventId trên URL
    const currentTeamEvent = team
      ? team.EventID ||
        allCategories.find((c) => c.CategoryID === team.CategoryID)?.EventID ||
        ''
      : '';
    if (currentTeamEvent.toLowerCase() === requestedEventId.toLowerCase()) return;
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedEventId]);

  const handleTeamChange = useCallback(
    async (teamId: string) => {
      setSelectedTeamId(teamId);
      const activeTeam = myLeaderTeams.find((t) => t.TeamID === teamId);
      if (!activeTeam) {
        setTeam(null);
        setMembers([]);
        setSubmissions([]);
        setEvent(null);
        setRounds([]);
        setSelectedEventId('');
        setSelectedRoundId('');
        applySubmissionToForm(null);
        return;
      }

      setTeam(activeTeam);
      fetchTeamRecruitments(activeTeam.TeamID);
      setLoading(true);
      setSuccessMessage('');
      setErrorMessage('');

      try {
        const [membersData, teamSubmissions] = await Promise.all([
          getTeamMembers(activeTeam.TeamID),
          getTeamSubmissions(activeTeam.TeamID),
        ]);

        const category = allCategories.find((item) => item.CategoryID === activeTeam.CategoryID);
        const teamEventId = activeTeam.EventID || category?.EventID || '';
        const myEvent = allEvents.find((item) => item.EventID === teamEventId) || allEvents[0] || null;
        const roundsData = myEvent ? await getRounds(myEvent.EventID) : [];
        const defaultRoundId = chooseDefaultRound(roundsData, teamSubmissions);

        setMembers(membersData);
        setEvent(myEvent);
        if (myEvent) setSelectedEventId(myEvent.EventID);
        setRounds(roundsData);
        setSubmissions(teamSubmissions);
        setSelectedRoundId(defaultRoundId);
        applySubmissionToForm(teamSubmissions.find((submission) => submission.RoundID === defaultRoundId) || null);
      } catch (error) {
        console.error(error);
        setErrorMessage('Không thể chuyển đổi dữ liệu đội từ API.');
      } finally {
        setLoading(false);
      }
    },
    [allCategories, allEvents, applySubmissionToForm, chooseDefaultRound, fetchTeamRecruitments, myLeaderTeams]
  );

  const handleRoundChange = useCallback(
    (roundId: string) => {
      setSelectedRoundId(roundId);
      applySubmissionToForm(submissions.find((submission) => submission.RoundID === roundId) || null);
    },
    [applySubmissionToForm, submissions]
  );

  const handleEventChange = useCallback(
    async (eventId: string) => {
      setSelectedEventId(eventId);
      setSelectedRoundId('');
      setRounds([]);
      applySubmissionToForm(null);
      setErrorMessage('');

      if (!eventId) {
        setEvent(null);
        return;
      }

      // Tìm team của user tương ứng với event đã chọn để auto switch team
      const matchingTeam =
        myLeaderTeams.find((t) => (t.EventID || '').toLowerCase() === eventId.toLowerCase()) ||
        myLeaderTeams.find((t) => {
          const cat = allCategories.find((c) => c.CategoryID === t.CategoryID);
          return cat && (cat.EventID || '').toLowerCase() === eventId.toLowerCase();
        });

      if (matchingTeam && (!team || matchingTeam.TeamID !== team.TeamID)) {
        // Cập nhật URL để đồng bộ query và chuyển team
        if (requestedEventId !== eventId) {
          router.replace(`/leader?eventId=${encodeURIComponent(eventId)}`);
        }
        await handleTeamChange(matchingTeam.TeamID);
        return;
      }

      const foundEvent = events.find((ev) => ev.EventID === eventId) || null;
      setEvent(foundEvent);
      try {
        const eventRounds = await getRounds(eventId);
        setRounds(eventRounds);
        if (eventRounds.length > 0) {
          const defaultRoundId = chooseDefaultRound(eventRounds, submissions);
          setSelectedRoundId(defaultRoundId);
          const matchingSub = submissions.find((s) => s.RoundID === defaultRoundId) || null;
          applySubmissionToForm(matchingSub);
        }
      } catch (error) {
        console.error('Cannot load rounds:', error);
        showToast('Không thể tải danh sách vòng thi.', 'error');
      }
    },
    [applySubmissionToForm, chooseDefaultRound, events, submissions, showToast, myLeaderTeams, allCategories, team, requestedEventId, router, handleTeamChange]
  );

  const handleDeleteClick = useCallback(
    async (submissionId: string) => {
      const submission = submissions.find((item) => item.SubmissionID === submissionId);
      const submissionRound = rounds.find((item) => item.RoundID === submission?.RoundID);
      const progress = roundProgress.find((item) => item.RoundId === submission?.RoundID);
      const effectiveEnd = submissionRound?.EffectiveEndAtUtc
        ? new Date(submissionRound.EffectiveEndAtUtc).getTime()
        : Number.POSITIVE_INFINITY;
      const isReadOnly = progress
        ? !progress.CanSubmit
        : !submissionRound
          || submissionRound.IsFinalized
          || Date.now() >= effectiveEnd
          || isPastDeadline(submissionRound)
          || isBeforeStartDate(submissionRound);

      if (isReadOnly) {
        const reason = progress?.BlockedReason
          || 'Vòng thi đã đóng. Bài nộp hiện chỉ có thể xem và không thể xóa.';
        setErrorMessage(reason);
        showToast(reason, 'error');
        return;
      }

      if (!window.confirm('Bạn có chắc chắn muốn xóa bài nộp này không?')) return;
      try {
        await deleteSubmission(submissionId);
        setSubmissions((prev) => prev.filter((s) => s.SubmissionID !== submissionId));
        if (currentSubmission?.SubmissionID === submissionId) {
          setCurrentSubmission(null);
          setRepoUrl('');
          setDemoUrl('');
          setSlideUrl('');
          setVideoAsset(null);
          setSlideAsset(null);
        }
        setSuccessMessage('Xóa bài nộp thành công.');
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage(getApiErrorMessage(err, 'Không thể xóa bài nộp.'));
        showToast(getApiErrorMessage(err, 'Không thể xóa bài nộp.'), 'error');
      }
    },
    [currentSubmission, roundProgress, rounds, showToast, submissions]
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
      showToast('Vui lòng chọn đội và vòng thi trước khi upload file.', 'error');
      return;
    }

    if (submissionReadOnly) {
      const reason = submissionReadOnlyReason;
      setErrorMessage(reason);
      showToast(reason, 'error');
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
      showToast(assetType === 'VideoDemo' ? 'Upload video demo thành công!' : 'Upload slide/tài liệu thành công!', 'success');
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(getApiErrorMessage(error, 'Không thể upload file lên Cloudinary.'));
      showToast(getApiErrorMessage(error, 'Không thể upload file lên Cloudinary.'), 'error');
    } finally {
      setUploadingAssetType(null);
    }
  };

  const handleSubmit = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault();
    if (!team) {
      setErrorMessage('Không tìm thấy đội gắn với tài khoản trưởng nhóm hiện tại.');
      showToast('Không tìm thấy đội gắn với tài khoản trưởng nhóm hiện tại.', 'error');
      return;
    }

    if (!selectedRound) {
      setErrorMessage('Chưa có vòng thi từ API để nộp bài mới.');
      showToast('Chưa có vòng thi từ API để nộp bài mới.', 'error');
      return;
    }

    if (submissionReadOnly) {
      const reason = submissionReadOnlyReason;
      setErrorMessage(reason);
      showToast(reason, 'error');
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
      showToast(validationMessage, 'error');
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
          setSubmissions((current) =>
            current.map((item) => (item.SubmissionID === updatedSubmission.SubmissionID ? submissionWithTeam : item))
          );
        }
        resetSubmissionForm();
        setSuccessMessage('Cập nhật bài nộp dự án thành công.');
        showToast('Cập nhật bài nộp dự án thành công!', 'success');
      } else {
        const createdSubmission = await createSubmissionLinks(team.TeamID, selectedRound.RoundID, links);
        if (createdSubmission) {
          const submissionWithTeam = { ...createdSubmission, Team: team };
          setSubmissions((current) =>
            [submissionWithTeam, ...current].sort(
              (a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime()
            )
          );
        }
        resetSubmissionForm();
        setSuccessMessage('Nộp bài dự án thành công.');
        showToast('Nộp bài dự án thành công!', 'success');
      }

      setTimeout(() => {
        const historyElement = document.getElementById('submission-history-card');
        if (historyElement) {
          historyElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (error: unknown) {
      console.error(error);
      const errorMsg = getApiErrorMessage(error, 'Không thể cập nhật bài nộp qua API.');
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
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
            {myLeaderTeams.length > 1 && (
              <span className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400">
                (Đang quản lý {myLeaderTeams.length} sự kiện/đội)
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={() => void loadData()}
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
            {team && <TeamRoundsCard teamId={team.TeamID} />}
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <FileCode2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Cổng nộp bài dự án
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                      Chọn đội/sự kiện, vòng thi, gửi mới hoặc cập nhật repository, demo và slide trước hạn nộp.
                    </CardDescription>
                  </div>
                  {currentSubmission && (
                    <div className="flex items-center gap-2">
                      <Badge className="w-fit border border-blue-100 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        {getSubmissionStatusLabel(currentSubmission.Status)}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetSubmissionForm}
                        className="h-7 text-[11px] font-semibold rounded-lg border-slate-200"
                        title="Xóa trắng các ô nhập để nộp bài mới"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" /> Làm mới form
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Team / Event if user has teams */}
                  {myLeaderTeams.length > 0 && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="leader-team-select"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        Đội & Sự kiện
                      </label>
                      <select
                        id="leader-team-select"
                        title="Chọn đội và sự kiện để nộp bài"
                        aria-label="Chọn đội và sự kiện để nộp bài"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        value={selectedTeamId}
                        onChange={(e) => void handleTeamChange(e.target.value)}
                      >
                        {myLeaderTeams.map((t) => {
                          const cat = allCategories.find((c) => c.CategoryID === t.CategoryID);
                          const evId = t.EventID || cat?.EventID;
                          const ev = allEvents.find((e) => e.EventID === evId);
                          return (
                            <option key={t.TeamID} value={t.TeamID}>
                              Đội: {t.TeamName} {ev ? `— Sự kiện: ${ev.EventName}` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {/* Event selector */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="leader-event-select"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Sự kiện
                    </label>
                    <select
                      id="leader-event-select"
                      title="Chọn sự kiện để xem các vòng thi"
                      aria-label="Chọn sự kiện"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      value={selectedEventId}
                      onChange={(event) => void handleEventChange(event.target.value)}
                      disabled={!team}
                    >
                      <option value="">-- Chọn sự kiện --</option>
                      {teamEvents.map((ev) => (
                        <option key={ev.EventID} value={ev.EventID}>
                          {ev.EventName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Round selector */}
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
                      disabled={!team || !selectedEventId || orderedRounds.length === 0}
                    >
                      {!selectedEventId ? (
                        <option value="">Vui lòng chọn sự kiện trước</option>
                      ) : orderedRounds.length === 0 ? (
                        <option value="">Không có vòng thi trong sự kiện này</option>
                      ) : (
                        <>
                          <option value="">-- Chọn vòng thi --</option>
                          {orderedRounds.map((round) => (
                            <option
                              key={round.RoundID}
                              value={round.RoundID}
                              disabled={roundProgress.find((item) => item.RoundId === round.RoundID)?.IsEligible === false}
                            >
                              {round.RoundName} - hạn nộp {formatDateTime(round.SubmissionDeadline)}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Hạn nộp: {formatDateTime(selectedRound?.SubmissionDeadline || '')}</span>
                      {qualificationBlocked ? (
                        <Badge className="border border-rose-100 bg-rose-50 text-rose-600">Không đủ điều kiện</Badge>
                      ) : beforeStartDate ? (
                        <Badge className="border border-amber-100 bg-amber-50 text-amber-600">Chưa mở</Badge>
                      ) : deadlinePassed ? (
                        <Badge className="border border-rose-100 bg-rose-50 text-rose-600">Đã quá hạn</Badge>
                      ) : submissionReadOnly ? (
                        <Badge className="border border-slate-200 bg-slate-50 text-slate-600">Chỉ đọc</Badge>
                      ) : (
                        <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-600">Đang mở</Badge>
                      )}
                    </div>
                    {submissionReadOnly && (
                      <p className="text-xs font-medium text-rose-600">
                        {submissionReadOnlyReason}
                      </p>
                    )}
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
                        disabled={submissionReadOnly}
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
                        className="h-10 rounded-xl border-slate-200 bg-white text-xs cursor-pointer dark:border-slate-700 dark:bg-slate-900"
                        disabled={!team || !selectedRound || uploadingAssetType !== null || submissionReadOnly}
                        onChange={(event) => void handleAssetUpload('VideoDemo', event.target.files?.[0])}
                      />
                      <div
                        className={`mt-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs transition-colors dark:bg-slate-900 ${
                          !team || !selectedRound || uploadingAssetType !== null || submissionReadOnly
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => {
                          if (team && selectedRound && uploadingAssetType === null && !submissionReadOnly) {
                            document.getElementById('leader-demo-file')?.click();
                          }
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-700 dark:text-slate-200">
                            {videoAsset?.OriginalFileName || 'Chưa upload video demo'}
                          </p>
                          <p className="text-slate-400">
                            {uploadingAssetType === 'VideoDemo'
                              ? 'Đang upload lên Cloudinary...'
                              : videoAsset
                                ? `${formatFileSize(videoAsset.FileSize)} · ${videoAsset.Format || videoAsset.ResourceType}`
                                : 'Hỗ trợ MP4, WEBM, MOV (Nhấn vào đây để chọn file)'}
                          </p>
                        </div>
                        {videoAsset?.SecureUrl ? (
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setVideoAsset(null);
                                const input = document.getElementById('leader-demo-file') as HTMLInputElement;
                                if (input) input.value = '';
                              }}
                              disabled={submissionReadOnly}
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                              title="Xóa video demo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                        className="h-10 rounded-xl border-slate-200 bg-white text-xs cursor-pointer dark:border-slate-700 dark:bg-slate-900"
                        disabled={!team || !selectedRound || uploadingAssetType !== null || submissionReadOnly}
                        onChange={(event) => void handleAssetUpload('SlideDocument', event.target.files?.[0])}
                      />
                      <div
                        className={`mt-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs transition-colors dark:bg-slate-900 ${
                          !team || !selectedRound || uploadingAssetType !== null || submissionReadOnly
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => {
                          if (team && selectedRound && uploadingAssetType === null && !submissionReadOnly) {
                            document.getElementById('leader-slide-file')?.click();
                          }
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-700 dark:text-slate-200">
                            {slideAsset?.OriginalFileName || 'Chưa upload slide/tài liệu'}
                          </p>
                          <p className="text-slate-400">
                            {uploadingAssetType === 'SlideDocument'
                              ? 'Đang upload lên Cloudinary...'
                              : slideAsset
                                ? `${formatFileSize(slideAsset.FileSize)} · ${slideAsset.Format || slideAsset.ResourceType}`
                                : 'Hỗ trợ PPT, PPTX, DOC, DOCX (Nhấn vào đây để chọn file)'}
                          </p>
                        </div>
                        {slideAsset?.SecureUrl ? (
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSlideAsset(null);
                                const input = document.getElementById('leader-slide-file') as HTMLInputElement;
                                if (input) input.value = '';
                              }}
                              disabled={submissionReadOnly}
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                              title="Xóa slide/tài liệu"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetSubmissionForm}
                      disabled={submissionReadOnly}
                      className="h-10 rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      Xóa trắng / Nộp mới
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                      disabled={updating || uploadingAssetType !== null || !team || !selectedRound || submissionReadOnly}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {updating ? 'Đang gửi...' : currentSubmission ? 'Cập nhật bài nộp' : 'Nộp bài'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Mentoring Booking Section */}
            <MentoringBookingPanel categoryId={team?.CategoryID} teamId={team?.TeamID} />

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" id="submission-history-card">
              <CardHeader>
                <CardTitle className="text-base font-bold">Lịch sử bài nộp qua các vòng</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Danh sách bài nộp lấy từ API Submissions theo đội hiện tại. Bấm vào bài nộp để xem chi tiết.
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
                          <TableHead className="text-right text-xs font-bold uppercase text-slate-700">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => {
                          const round = rounds.find((item) => item.RoundID === submission.RoundID);
                          const progress = roundProgress.find((item) => item.RoundId === submission.RoundID);
                          const effectiveEnd = round?.EffectiveEndAtUtc
                            ? new Date(round.EffectiveEndAtUtc).getTime()
                            : Number.POSITIVE_INFINITY;
                          const isSubmissionReadOnly = progress
                            ? !progress.CanSubmit
                            : !round
                              || round.IsFinalized
                              || Date.now() >= effectiveEnd
                              || isPastDeadline(round)
                              || isBeforeStartDate(round);
                          const readOnlyReason = progress?.BlockedReason
                            || 'Vòng thi đã đóng. Bài nộp hiện chỉ có thể xem.';
                          const hasLinks = submission.RepositoryURL || submission.DemoURL || submission.SlideURL;

                          return (
                            <TableRow
                              key={submission.SubmissionID}
                              className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${submission.RoundID === selectedRoundId ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                              onClick={() => {
                                setSelectedDetailSubmission(submission);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                <button
                                  type="button"
                                  className="text-left font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDetailSubmission(submission);
                                    setIsDetailModalOpen(true);
                                  }}
                                >
                                  {round?.RoundName || 'Vòng thi'}
                                </button>
                              </TableCell>
                              <TableCell className="text-xs text-slate-500">
                                {formatDateTime(submission.SubmittedAt)}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
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
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedDetailSubmission(submission);
                                      setIsDetailModalOpen(true);
                                    }}
                                    className="h-7 w-7 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                                    title="Xem chi tiết bài nộp"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      handleRoundChange(submission.RoundID);
                                      document.getElementById('leader-repo-url')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className="h-7 w-7 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                    title={isSubmissionReadOnly ? 'Xem bài nộp ở chế độ chỉ đọc' : 'Chỉnh sửa bài nộp'}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => void handleDeleteClick(submission.SubmissionID)}
                                    className="h-7 w-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                                    disabled={isSubmissionReadOnly}
                                    title={isSubmissionReadOnly ? readOnlyReason : 'Xóa bài nộp'}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
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

            {team && (
              <TeamMembersCard
                team={team}
                members={members}
                isLeader={true}
                newMemberId={newMemberId}
                setNewMemberId={setNewMemberId}
                addingMember={addingMember}
                addErrorMessage={addErrorMessage}
                addSuccessMessage={addSuccessMessage}
                onSubmit={handleAddMemberSubmit}
                onRemoveMember={handleRemoveLeaderMember}
              />
            )}

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
          <SubmissionDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            submission={selectedDetailSubmission}
            team={team}
            event={event}
            round={rounds.find((r) => r.RoundID === selectedDetailSubmission?.RoundID) || null}
            onEdit={(sub) => {
              handleRoundChange(sub.RoundID);
              setTimeout(() => {
                document.getElementById('leader-repo-url')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
          />
        </>
      )}
    </div>
  );
}

