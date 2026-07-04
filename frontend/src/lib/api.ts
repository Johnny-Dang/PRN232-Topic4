import { apiClient } from '../services/api/apiClient';

export interface User {
  UserID: string;
  Email: string;
  FullName: string;
  Phone: string;
  Role: 'Leader' | 'Member' | 'Mentor' | 'Judge' | 'Coordinator';
  AccountStatus: string;
}

export interface StudentProfile {
  ProfileID: string;
  UserID: string;
  StudentType: 'FPT' | 'External';
  StudentCode: string;
  UniversityName: string;
}

export interface Event {
  EventID: string;
  EventName: string;
  Season: string;
  Year: number;
  Description: string;
  StartDate: string;
  EndDate: string;
}

export interface Round {
  RoundID: string;
  EventID: string;
  RoundName: string;
  RoundOrder: number;
  SubmissionDeadline: string;
  StartDate: string;
  EndDate: string;
}

export interface Category {
  CategoryID: string;
  EventID: string;
  CategoryName: string;
  Description: string;
}

export interface Team {
  TeamID: string;
  TeamName: string;
  TeamLeaderId: string;
  CategoryID: string;
  TeamStatus: 'Active' | 'Pending' | 'Disqualified';
}

export interface TeamMember {
  TeamMemberId: string;
  TeamID: string;
  UserId: string;
  JoinDate: string;
}

export interface Submission {
  SubmissionID: string;
  TeamID: string;
  RoundID: string;
  RepositoryURL: string;
  DemoURL: string;
  SlideURL: string;
  SubmittedAt: string;
  Status: 'Submitted' | 'Updated' | 'Graded' | 'Disqualified';
}

export interface Criteria {
  CriteriaID: string;
  TemplateID: string;
  CriteriaName: string;
  Weight: number;
}

export interface EventCriteria {
  EventCriteriaId: string;
  EventID: string;
  CriteriaID: string;
  Weight: number;
  CriteriaName?: string;
}

export interface Score {
  ScoreID: string;
  SubmissionID: string;
  AssignmentId: string;
  CriteriaID: string;
  ScoreValue: number;
  Comment: string;
  ScoredAt: string;
}

export interface CalibrationScore {
  CalibrationId: string;
  JudgeID: string;
  CriteriaID: string;
  SubmissionID: string;
  ScoreValue: number;
}

export interface AuditLog {
  LogID: string;
  UserID: string;
  ActionType: string;
  OldValue: string | null;
  NewValue: string;
  CreatedAt: string;
}

export interface AdvancementRule {
  RuleId: string;
  RoundId: string;
  CategoryId: string;
  TopN: number;
}

export interface Elimination {
  EliminationId: string;
  SubmissionId: string;
  UserId: string;
  Reason: string;
  EliminatedAt: string;
}

export interface Ranking {
  RankingId: string;
  TeamId: string;
  RoundId: string;
  RankPosition: number;
  TotalScore: number;
}

export interface Announcement {
  AnnouncementID: string;
  Title: string;
  Content: string;
  Type: 'info' | 'warning' | 'success' | 'danger';
  PublishedAt: string;
  EventID?: string;
  RoundID?: string;
}

export interface DetailedCompetition {
  ID: string;
  Name: string;
  Description: string;
  Category: 'Technology' | 'Design' | 'Academic' | 'Startup' | 'Language' | 'Science' | 'Environment' | 'SoftSkills' | 'Volunteer' | 'Art';
  CategoryLabel: string;
  Status: 'open' | 'expiring' | 'upcoming' | 'closed';
  Deadline: string;
  Format: 'Online' | 'Offline' | 'Hybrid';
  Audience: 'Hoc sinh' | 'Sinh vien' | 'Tat ca';
  Organizer: string;
  Prize: string;
  BannerUrl: string;
  DaysLeft: number;
  IsFeatured?: boolean;
}

export interface BackendEvent {
  eventId?: string;
  EventId?: string;
  EventID?: string;
  eventName?: string;
  EventName?: string;
  season?: string;
  Season?: string;
  year?: number;
  Year?: number;
  description?: string;
  Description?: string;
  startDate?: string;
  StartDate?: string;
  endDate?: string;
  EndDate?: string;
  status?: string;
  Status?: string;
  isPublished?: boolean;
  IsPublished?: boolean;
  isFeatured?: boolean;
  IsFeatured?: boolean;
  bannerUrl?: string;
  BannerUrl?: string;
  organizer?: string;
  Organizer?: string;
  format?: string;
  Format?: string;
  audience?: string;
  Audience?: string;
  prize?: string;
  Prize?: string;
  rounds?: BackendRound[];
  Rounds?: BackendRound[];
}

export interface BackendRound {
  roundId?: string;
  RoundId?: string;
  RoundID?: string;
  eventId?: string;
  EventId?: string;
  EventID?: string;
  roundName?: string;
  RoundName?: string;
  roundOrder?: number;
  RoundOrder?: number;
  submissionDeadline?: string;
  SubmissionDeadline?: string;
  startDate?: string;
  StartDate?: string;
  endDate?: string;
  EndDate?: string;
}

export interface BackendCategory {
  categoryId?: string;
  CategoryId?: string;
  CategoryID?: string;
  eventId?: string;
  EventId?: string;
  EventID?: string;
  categoryName?: string;
  CategoryName?: string;
  description?: string;
  Description?: string;
}

export interface BackendTeam {
  teamId?: string;
  TeamId?: string;
  TeamID?: string;
  teamName?: string;
  TeamName?: string;
  teamLeaderId?: string;
  TeamLeaderId?: string;
  categoryId?: string;
  CategoryId?: string;
  CategoryID?: string;
  teamStatus?: string;
  TeamStatus?: string;
}

export interface BackendSubmission {
  submissionId?: string;
  SubmissionId?: string;
  SubmissionID?: string;
  teamId?: string;
  TeamId?: string;
  TeamID?: string;
  roundId?: string;
  RoundId?: string;
  RoundID?: string;
  repositoryUrl?: string;
  repositoryURL?: string;
  RepositoryURL?: string;
  demoUrl?: string;
  demoURL?: string;
  DemoURL?: string;
  slideUrl?: string;
  slideURL?: string;
  SlideURL?: string;
  submittedAt?: string;
  SubmittedAt?: string;
  status?: string;
  Status?: string;
}

export interface BackendScore {
  scoreId?: string;
  ScoreId?: string;
  ScoreID?: string;
  submissionId?: string;
  SubmissionId?: string;
  SubmissionID?: string;
  assignmentId?: string;
  AssignmentId?: string;
  criteriaId?: string;
  CriteriaId?: string;
  CriteriaID?: string;
  scoreValue?: number;
  ScoreValue?: number;
  comment?: string;
  Comment?: string;
  scoredAt?: string;
  ScoredAt?: string;
  criteriaName?: string;
  CriteriaName?: string;
  weight?: number;
  Weight?: number;
}

export interface BackendAdvancementRule {
  ruleId?: string;
  RuleId?: string;
  roundId?: string;
  RoundId?: string;
  categoryId?: string;
  CategoryId?: string;
  topN?: number;
  TopN?: number;
}

export interface BackendRanking {
  rankingId?: string;
  RankingId?: string;
  teamId?: string;
  TeamId?: string;
  roundId?: string;
  RoundId?: string;
  rankPosition?: number;
  RankPosition?: number;
  totalScore?: number;
  TotalScore?: number;
}

export interface BackendEventCriteria {
  eventCriteriaId?: string;
  EventCriteriaId?: string;
  eventId?: string;
  EventId?: string;
  criteriaId?: string;
  CriteriaId?: string;
  criteriaName?: string;
  CriteriaName?: string;
  weight?: number;
  Weight?: number;
}

interface BackendSubmissionWithScores extends BackendSubmission {
  scores?: BackendScore[];
  Scores?: BackendScore[];
}

let useLiveApi = true;

export const isLiveApiEnabled = () => useLiveApi;
export const setLiveApiEnabled = (enabled: boolean) => {
  useLiveApi = enabled;
};

const emptyUser = (userId = ''): User => ({
  UserID: userId,
  Email: '',
  FullName: '',
  Phone: '',
  Role: 'Member',
  AccountStatus: '',
});

const logApiError = (source: string, error: unknown) => {
  const status =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;
  console.warn(`Live API error for ${source}${status ? ` (HTTP ${status})` : ''}. Returning empty data.`);
};

export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const calculateVariance = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
};

export const calculateStdDev = (values: number[]): number => {
  return Math.sqrt(calculateVariance(values));
};

const mapEvent = (event: BackendEvent): Event => ({
  EventID: event.eventId || event.EventId || event.EventID || '',
  EventName: event.eventName || event.EventName || '',
  Season: event.season || event.Season || '',
  Year: event.year || event.Year || 0,
  Description: event.description || event.Description || '',
  StartDate: event.startDate || event.StartDate || '',
  EndDate: event.endDate || event.EndDate || '',
});

const mapRound = (round: BackendRound): Round => ({
  RoundID: round.roundId || round.RoundId || round.RoundID || '',
  EventID: round.eventId || round.EventId || round.EventID || '',
  RoundName: round.roundName || round.RoundName || '',
  RoundOrder: round.roundOrder || round.RoundOrder || 0,
  SubmissionDeadline: round.submissionDeadline || round.SubmissionDeadline || '',
  StartDate: round.startDate || round.StartDate || '',
  EndDate: round.endDate || round.EndDate || '',
});

const mapCategory = (category: BackendCategory): Category => ({
  CategoryID: category.categoryId || category.CategoryId || category.CategoryID || '',
  EventID: category.eventId || category.EventId || category.EventID || '',
  CategoryName: category.categoryName || category.CategoryName || '',
  Description: category.description || category.Description || '',
});

const mapTeam = (team: BackendTeam): Team => ({
  TeamID: team.teamId || team.TeamId || team.TeamID || '',
  TeamName: team.teamName || team.TeamName || '',
  TeamLeaderId: team.teamLeaderId || team.TeamLeaderId || '',
  CategoryID: team.categoryId || team.CategoryId || team.CategoryID || '',
  TeamStatus: (team.teamStatus || team.TeamStatus || 'Pending') as Team['TeamStatus'],
});

const mapSubmission = (submission: BackendSubmission): Submission => ({
  SubmissionID: submission.submissionId || submission.SubmissionId || submission.SubmissionID || '',
  TeamID: submission.teamId || submission.TeamId || submission.TeamID || '',
  RoundID: submission.roundId || submission.RoundId || submission.RoundID || '',
  RepositoryURL: submission.repositoryURL || submission.repositoryUrl || submission.RepositoryURL || '',
  DemoURL: submission.demoURL || submission.demoUrl || submission.DemoURL || '',
  SlideURL: submission.slideURL || submission.slideUrl || submission.SlideURL || '',
  SubmittedAt: submission.submittedAt || submission.SubmittedAt || '',
  Status: (submission.status || submission.Status || 'Submitted') as Submission['Status'],
});

const mapScore = (score: BackendScore): Score => ({
  ScoreID: score.scoreId || score.ScoreId || score.ScoreID || '',
  SubmissionID: score.submissionId || score.SubmissionId || score.SubmissionID || '',
  AssignmentId: score.assignmentId || score.AssignmentId || '',
  CriteriaID: score.criteriaId || score.CriteriaId || score.CriteriaID || '',
  ScoreValue: score.scoreValue || score.ScoreValue || 0,
  Comment: score.comment || score.Comment || '',
  ScoredAt: score.scoredAt || score.ScoredAt || '',
});

const mapAdvancementRule = (rule: BackendAdvancementRule): AdvancementRule => ({
  RuleId: rule.ruleId || rule.RuleId || '',
  RoundId: rule.roundId || rule.RoundId || '',
  CategoryId: rule.categoryId || rule.CategoryId || '',
  TopN: rule.topN || rule.TopN || 0,
});

const mapRanking = (ranking: BackendRanking): Ranking => ({
  RankingId: ranking.rankingId || ranking.RankingId || '',
  TeamId: ranking.teamId || ranking.TeamId || '',
  RoundId: ranking.roundId || ranking.RoundId || '',
  RankPosition: ranking.rankPosition || ranking.RankPosition || 0,
  TotalScore: ranking.totalScore || ranking.TotalScore || 0,
});

const mapEventCriteria = (criteria: BackendEventCriteria): Criteria => ({
  CriteriaID: criteria.criteriaId || criteria.CriteriaId || '',
  TemplateID: criteria.eventCriteriaId || criteria.EventCriteriaId || '',
  CriteriaName: criteria.criteriaName || criteria.CriteriaName || '',
  Weight: criteria.weight || criteria.Weight || 0,
});

const normalizeDate = (value: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateForDisplay = (value: string): string => {
  const date = normalizeDate(value);
  if (!date) return '';
  return date.toLocaleDateString('vi-VN');
};

const calculateDaysLeft = (deadlineValue: string): number => {
  const deadline = normalizeDate(deadlineValue);
  if (!deadline) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / 86400000));
};

const getCompetitionStatus = (event: BackendEvent): DetailedCompetition['Status'] => {
  const startDate = normalizeDate(event.startDate || event.StartDate || '');
  const endDate = normalizeDate(event.endDate || event.EndDate || '');
  const now = new Date();

  if (endDate && now > endDate) return 'closed';
  if (startDate && now < startDate) return 'upcoming';
  return 'open';
};

const mapPublishedEventToDetailedCompetition = (event: BackendEvent): DetailedCompetition => {
  const format = (event.format || event.Format || 'Online') as DetailedCompetition['Format'];

  return {
    ID: event.eventId || event.EventId || event.EventID || '',
    Name: event.eventName || event.EventName || '',
    Description: event.description || event.Description || '',
    Category: 'Technology',
    CategoryLabel: '',
    Status: getCompetitionStatus(event),
    Deadline: formatDateForDisplay(event.startDate || event.StartDate || ''),
    Format: ['Online', 'Offline', 'Hybrid'].includes(format) ? format : 'Online',
    Audience: 'Sinh vien',
    Organizer: event.organizer || event.Organizer || '',
    Prize: event.prize || event.Prize || '',
    BannerUrl: event.bannerUrl || event.BannerUrl || '',
    DaysLeft: calculateDaysLeft(event.startDate || event.StartDate || ''),
    IsFeatured: event.isFeatured ?? event.IsFeatured ?? false,
  };
};

export async function getEvents(): Promise<Event[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendEvent[]>('/Event/all');
    return response.data.map(mapEvent);
  } catch (error: unknown) {
    logApiError('getEvents', error);
    return [];
  }
}

export async function getRounds(eventId?: string): Promise<Round[]> {
  if (!useLiveApi) return [];
  try {
    if (eventId) {
      const response = await apiClient.get<BackendRound[]>(`/Round/events/${eventId}`);
      return response.data.map(mapRound);
    }

    const response = await apiClient.get<BackendEvent[]>('/Event/all');
    return response.data.flatMap((event) => (event.rounds || event.Rounds || []).map(mapRound));
  } catch (error: unknown) {
    logApiError('getRounds', error);
    return [];
  }
}

export async function getCategories(eventId?: string): Promise<Category[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendCategory[]>('/Category');
    const categories = response.data.map(mapCategory);
    return eventId ? categories.filter((category) => category.EventID === eventId) : categories;
  } catch (error: unknown) {
    logApiError('getCategories', error);
    return [];
  }
}

export async function getTeams(): Promise<Team[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendTeam[]>('/Teams');
    return response.data.map(mapTeam);
  } catch (error: unknown) {
    logApiError('getTeams', error);
    return [];
  }
}

export async function getTeamMembers(_teamId: string): Promise<(TeamMember & { User: User; StudentProfile?: StudentProfile })[]> {
  void _teamId;
  return [];
}

export async function getSubmissions(roundId?: string): Promise<(Submission & { Team: Team })[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendSubmission[]>('/Submissions');
    const teams = await getTeams();
    const submissions = response.data.map((submission) => {
      const mappedSubmission = mapSubmission(submission);
      const team = teams.find((item) => item.TeamID === mappedSubmission.TeamID) || {
        TeamID: mappedSubmission.TeamID,
        TeamName: '',
        TeamLeaderId: '',
        CategoryID: '',
        TeamStatus: 'Pending' as const,
      };

      return { ...mappedSubmission, Team: team };
    });

    return roundId ? submissions.filter((submission) => submission.RoundID === roundId) : submissions;
  } catch (error: unknown) {
    logApiError('getSubmissions', error);
    return [];
  }
}

export async function createSubmissionLinks(
  teamId: string,
  roundId: string,
  links: Pick<Submission, 'RepositoryURL' | 'DemoURL' | 'SlideURL'>
): Promise<Submission | null> {
  if (!useLiveApi || !teamId || !roundId) return null;
  try {
    const response = await apiClient.post<BackendSubmission>('/Submissions', {
      TeamId: teamId,
      RoundId: roundId,
      RepositoryURL: links.RepositoryURL,
      DemoURL: links.DemoURL,
      SlideURL: links.SlideURL,
    });

    return mapSubmission(response.data);
  } catch (error: unknown) {
    logApiError('createSubmissionLinks', error);
    throw error;
  }
}

export async function updateSubmissionLinks(
  submissionId: string,
  links: Pick<Submission, 'RepositoryURL' | 'DemoURL' | 'SlideURL'>
): Promise<Submission | null> {
  if (!useLiveApi || !submissionId) return null;
  try {
    const response = await apiClient.put<BackendSubmission>('/Submissions', {
      SubmissionId: submissionId,
      RepositoryURL: links.RepositoryURL,
      DemoURL: links.DemoURL,
      SlideURL: links.SlideURL,
    });

    return mapSubmission(response.data);
  } catch (error: unknown) {
    logApiError('updateSubmissionLinks', error);
    throw error;
  }
}

export async function getScores(submissionId: string): Promise<(Score & { Judge: User; Criteria: Criteria })[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendSubmissionWithScores[]>('/Scores/assigned-submissions');
    const targetSubmission = response.data.find(
      (submission) => (submission.submissionId || submission.SubmissionId || submission.SubmissionID) === submissionId
    );
    const scores = targetSubmission?.scores || targetSubmission?.Scores || [];

    return scores.map((score) => ({
      ...mapScore(score),
      Judge: emptyUser(),
      Criteria: {
        CriteriaID: score.criteriaId || score.CriteriaId || score.CriteriaID || '',
        TemplateID: '',
        CriteriaName: score.criteriaName || score.CriteriaName || '',
        Weight: score.weight || score.Weight || 0,
      },
    }));
  } catch (error: unknown) {
    logApiError('getScores', error);
    return [];
  }
}

export async function getEventCriteria(eventId: string): Promise<Criteria[]> {
  if (!useLiveApi || !eventId) return [];
  try {
    const response = await apiClient.get<BackendEventCriteria[]>(`/events/${eventId}/criteria`);
    return response.data.map(mapEventCriteria);
  } catch (error: unknown) {
    logApiError('getEventCriteria', error);
    return [];
  }
}

export async function submitScores(
  submissionId: string,
  scores: { CriteriaId: string; ScoreValue: number; Comment: string }[]
): Promise<Score[]> {
  const response = await apiClient.post<BackendScore[]>(`/Scores/submissions/${submissionId}`, {
    Scores: scores,
  });
  return response.data.map(mapScore);
}

export async function getCalibrationScores(): Promise<(CalibrationScore & { Judge: User; Criteria: Criteria; Submission: Submission; Team: Team })[]> {
  return [];
}

export async function getAdvancementRules(roundId?: string): Promise<AdvancementRule[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendAdvancementRule[]>('/AdvancementRule');
    const rules = response.data.map(mapAdvancementRule);
    return roundId ? rules.filter((rule) => rule.RoundId === roundId) : rules;
  } catch (error: unknown) {
    logApiError('getAdvancementRules', error);
    return [];
  }
}

export async function getEliminations(): Promise<(Elimination & { Submission: Submission; Team: Team; Coordinator: User })[]> {
  return [];
}

export async function getAuditLogs(): Promise<(AuditLog & { User: User })[]> {
  return [];
}

export async function getRankings(roundId?: string): Promise<(Ranking & { Team: Team })[]> {
  if (!useLiveApi || !roundId) return [];
  try {
    const response = await apiClient.get<BackendRanking[]>('/Rankings', { params: { roundId } });
    const teams = await getTeams();
    return response.data.map((ranking) => {
      const mappedRanking = mapRanking(ranking);
      return {
        ...mappedRanking,
        Team:
          teams.find((team) => team.TeamID === mappedRanking.TeamId) || {
            TeamID: mappedRanking.TeamId,
            TeamName: '',
            TeamLeaderId: '',
            CategoryID: '',
            TeamStatus: 'Pending' as const,
          },
      };
    });
  } catch (error: unknown) {
    logApiError('getRankings', error);
    return [];
  }
}

export async function getAnnouncements(_eventId?: string): Promise<Announcement[]> {
  void _eventId;
  return [];
}

export async function getDetailedCompetitions(): Promise<DetailedCompetition[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendEvent[]>('/Event/published');
    return response.data.map(mapPublishedEventToDetailedCompetition);
  } catch (error: unknown) {
    logApiError('getDetailedCompetitions', error);
    return [];
  }
}
