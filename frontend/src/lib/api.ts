import { apiClient } from "../services/api/apiClient";

export interface User {
  UserID: string;
  Email: string;
  FullName: string;
  Phone: string;
  ShortId: string;
  Role: "Leader" | "Member" | "Mentor" | "Judge" | "Coordinator";
  AccountStatus: string;
}

export interface StudentProfile {
  ProfileID: string;
  UserID: string;
  StudentType: "FPT" | "External";
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
  Status: string;
  IsPublished: boolean;
  Format: string;
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
  EventID: string;
  CategoryID: string;
  TeamStatus: "Active" | "Pending" | "Disqualified";
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
  Status: "Submitted" | "Updated" | "Graded" | "Disqualified";
}

export type SubmissionAssetType = "VideoDemo" | "SlideDocument";

export interface SubmissionAsset {
  SubmissionAssetId: string;
  SubmissionId: string;
  TeamID: string;
  RoundID: string;
  AssetType: SubmissionAssetType;
  Provider: string;
  CloudinaryAssetId: string;
  PublicId: string;
  SecureUrl: string;
  ResourceType: "video" | "raw";
  OriginalFileName: string;
  Format: string;
  ContentType: string;
  FileSize: number;
  DurationSeconds?: number | null;
  UploadStatus: "Pending" | "Uploaded" | "Failed" | "Deleted";
  CreatedAt: string;
  UploadedAt?: string | null;
}

export interface CloudinaryUploadSignature {
  SubmissionAssetId: string;
  CloudName: string;
  ApiKey: string;
  Timestamp: number;
  Signature: string;
  Folder: string;
  PublicId: string;
  ResourceType: "video" | "raw";
  UploadUrl: string;
  AllowedFormats: string[];
  MaxFileSize: number;
}

export interface Criteria {
  CriteriaID: string;
  TemplateID?: string;
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

// ============================================================================
// CALIBRATION TYPES
// ============================================================================

export interface CalibrationSubmission {
  CalibrationId: string;
  EventId?: string;
  EventName?: string;
  RoundId: string;
  RoundName?: string;
  CalibrationTitle: string;
  RepositoryURL?: string;
  DemoURL?: string;
  SlideURL?: string;
  SubmittedAt: string;
  Status: "Pending" | "InProgress" | "Completed";
  JudgeCount: number;
  TotalJudges?: number;
}

export interface CalibrationScoreInput {
  CriteriaId: string;
  ScoreValue: number;
  Comment?: string;
}

export interface CalibrationScoreOutput {
  CalibrationScoreId: string;
  CalibrationId: string;
  JudgeId: string;
  JudgeCode: string;
  CriteriaId: string;
  CriteriaName: string;
  ScoreValue: number;
  Comment?: string;
  ScoredAt: string;
}

export interface CalibrationScoreWithMyScore {
  scores: CalibrationScoreOutput[];
  myScore?: CalibrationScoreOutput[];
  hasScored?: boolean;
}

export interface CriteriaVariance {
  CriteriaId: string;
  CriteriaName: string;
  MeanScore: number;
  Variance: number;
  StandardDeviation: number;
  MinScore: number;
  MaxScore: number;
  ScoreRange: number;
}

export interface JudgeSummary {
  JudgeId: string;
  JudgeCode: string;
  AverageScore: number;
  DeviationFromGroupMean: number;
  ConsistencyLabel: "Harsher" | "Neutral" | "Lenient" | "Consistent";
}

export interface CalibrationAnalysis {
  SubmissionId: string;
  CalibrationTitle: string;
  JudgeCount: number;
  CriteriaCount: number;
  OverallMean: number;
  CriteriaVariance: CriteriaVariance[];
  JudgeSummaries: JudgeSummary[];
  InconsistencyFlags: string[];
}

export interface BackendCalibrationSubmission {
  calibrationId?: string;
  CalibrationId?: string;
  submissionId?: string;
  SubmissionId?: string;
  eventId?: string;
  EventId?: string;
  eventName?: string;
  EventName?: string;
  roundId?: string;
  RoundId?: string;
  roundName?: string;
  RoundName?: string;
  calibrationTitle?: string;
  CalibrationTitle?: string;
  repositoryURL?: string;
  RepositoryURL?: string;
  demoURL?: string;
  DemoURL?: string;
  slideURL?: string;
  SlideURL?: string;
  submittedAt?: string;
  SubmittedAt?: string;
  status?: string;
  Status?: string;
  judgeCount?: number;
  JudgeCount?: number;
  totalJudges?: number;
  TotalJudges?: number;
}

export interface BackendCalibrationScore {
  calibrationScoreId?: string;
  CalibrationScoreId?: string;
  calibrationId?: string;
  CalibrationId?: string;
  judgeId?: string;
  JudgeId?: string;
  judgeCode?: string;
  JudgeCode?: string;
  criteriaId?: string;
  CriteriaId?: string;
  criteriaName?: string;
  CriteriaName?: string;
  scoreValue?: number;
  ScoreValue?: number;
  comment?: string;
  Comment?: string;
  scoredAt?: string;
  ScoredAt?: string;
}

export interface BackendCalibrationAnalysis {
  submissionId?: string;
  SubmissionId?: string;
  calibrationTitle?: string;
  CalibrationTitle?: string;
  judgeCount?: number;
  JudgeCount?: number;
  criteriaCount?: number;
  CriteriaCount?: number;
  overallMean?: number;
  OverallMean?: number;
  criteriaVariance?: BackendCriteriaVariance[];
  CriteriaVariance?: BackendCriteriaVariance[];
  judgeSummaries?: BackendJudgeSummary[];
  JudgeSummaries?: BackendJudgeSummary[];
  inconsistencyFlags?: string[];
  InconsistencyFlags?: string[];
}

export interface BackendCriteriaVariance {
  criteriaId?: string;
  CriteriaId?: string;
  criteriaName?: string;
  CriteriaName?: string;
  meanScore?: number;
  MeanScore?: number;
  variance?: number;
  Variance?: number;
  standardDeviation?: number;
  StandardDeviation?: number;
  minScore?: number;
  MinScore?: number;
  maxScore?: number;
  MaxScore?: number;
  scoreRange?: number;
  ScoreRange?: number;
}

export interface BackendJudgeSummary {
  judgeId?: string;
  JudgeId?: string;
  judgeCode?: string;
  JudgeCode?: string;
  averageScore?: number;
  AverageScore?: number;
  deviationFromGroupMean?: number;
  DeviationFromGroupMean?: number;
  consistencyLabel?: string;
  ConsistencyLabel?: string;
}

// ============================================================================
// EXISTING INTERFACES (keeping for reference)
// ============================================================================

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

export interface JudgeAssignedSubmission {
  submissionId: string;
  teamId: string;
  teamName: string;
  roundId: string;
  assignmentId: string;
  categoryId: string | null;
  repositoryURL: string;
  demoURL: string;
  slideURL: string;
  status: string;
  submittedAt: string;
  scores: Score[];
}

export interface Announcement {
  AnnouncementID: string;
  Title: string;
  Content: string;
  Type: "info" | "warning" | "success" | "danger";
  PublishedAt: string;
  EventID?: string;
  RoundID?: string;
}

export interface DetailedCompetition {
  ID: string;
  Name: string;
  Description: string;
  Category: string;
  CategoryLabel: string;
  Status: "open" | "expiring" | "upcoming" | "closed";
  Deadline: string;
  Format: "Online" | "Offline" | "Hybrid";
  Audience: "Hoc sinh" | "Sinh vien" | "Tat ca";
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
  eventId?: string;
  EventId?: string;
  EventID?: string;
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

export interface BackendSubmissionAsset {
  submissionAssetId?: string;
  SubmissionAssetId?: string;
  submissionId?: string | null;
  SubmissionId?: string | null;
  teamId?: string;
  TeamId?: string;
  TeamID?: string;
  roundId?: string;
  RoundId?: string;
  RoundID?: string;
  assetType?: string;
  AssetType?: string;
  provider?: string;
  Provider?: string;
  cloudinaryAssetId?: string;
  CloudinaryAssetId?: string;
  publicId?: string;
  PublicId?: string;
  secureUrl?: string;
  SecureUrl?: string;
  resourceType?: string;
  ResourceType?: string;
  originalFileName?: string;
  OriginalFileName?: string;
  format?: string;
  Format?: string;
  contentType?: string;
  ContentType?: string;
  fileSize?: number;
  FileSize?: number;
  durationSeconds?: number | null;
  DurationSeconds?: number | null;
  uploadStatus?: string;
  UploadStatus?: string;
  createdAt?: string;
  CreatedAt?: string;
  uploadedAt?: string | null;
  UploadedAt?: string | null;
}

export interface BackendCloudinaryUploadSignature {
  submissionAssetId?: string;
  SubmissionAssetId?: string;
  cloudName?: string;
  CloudName?: string;
  apiKey?: string;
  ApiKey?: string;
  timestamp?: number;
  Timestamp?: number;
  signature?: string;
  Signature?: string;
  folder?: string;
  Folder?: string;
  publicId?: string;
  PublicId?: string;
  resourceType?: string;
  ResourceType?: string;
  uploadUrl?: string;
  UploadUrl?: string;
  allowedFormats?: string[];
  AllowedFormats?: string[];
  maxFileSize?: number;
  MaxFileSize?: number;
}

interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
  duration?: number;
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

export interface JudgeAssignment {
  AssignmentId: string;
  UserId: string;
  UserFullName: string;
  UserEmail: string;
  RoundId: string;
  User?: User;
  Round?: Round;
}

export interface BackendJudgeAssignment {
  assignmentId?: string;
  AssignmentId?: string;
  userId?: string;
  UserId?: string;
  userFullName?: string;
  UserFullName?: string;
  userEmail?: string;
  UserEmail?: string;
  roundId?: string;
  RoundId?: string;
  user?: BackendUser;
  User?: BackendUser;
  round?: BackendRound;
  Round?: BackendRound;
}

export interface BackendUser {
  userId?: string;
  UserId?: string;
  email?: string;
  Email?: string;
  fullName?: string;
  FullName?: string;
  phone?: string;
  Phone?: string;
  shortId?: string;
  ShortId?: string;
  role?: string;
  Role?: string;
  accountStatus?: string;
  AccountStatus?: string;
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

const emptyUser = (userId = ""): User => ({
  UserID: userId,
  Email: "",
  FullName: "",
  Phone: "",
  ShortId: "",
  Role: "Member",
  AccountStatus: "",
});

const logApiError = (source: string, error: unknown) => {
  const status =
    typeof error === "object" && error !== null && "response" in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;
  console.warn(
    `Live API error for ${source}${status ? ` (HTTP ${status})` : ""}. Returning empty data.`,
  );
};

export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const calculateVariance = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  return (
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length
  );
};

export const calculateStdDev = (values: number[]): number => {
  return Math.sqrt(calculateVariance(values));
};

const mapEvent = (event: BackendEvent): Event => ({
  EventID: event.eventId || event.EventId || event.EventID || "",
  EventName: event.eventName || event.EventName || "",
  Season: event.season || event.Season || "",
  Year: event.year || event.Year || 0,
  Description: event.description || event.Description || "",
  StartDate: event.startDate || event.StartDate || "",
  EndDate: event.endDate || event.EndDate || "",
  Status: event.status || event.Status || "",
  IsPublished: event.isPublished ?? event.IsPublished ?? false,
  Format: event.format || event.Format || "",
});

const mapUser = (user: BackendUser): User => ({
  UserID: user.userId || user.UserId || "",
  Email: user.email || user.Email || "",
  FullName: user.fullName || user.FullName || "",
  Phone: user.phone || user.Phone || "",
  ShortId: user.shortId || user.ShortId || "",
  Role: (user.role || user.Role || "Member") as User["Role"],
  AccountStatus: user.accountStatus || user.AccountStatus || "",
});

const mapRound = (round: BackendRound): Round => ({
  RoundID: round.roundId || round.RoundId || round.RoundID || "",
  EventID: round.eventId || round.EventId || round.EventID || "",
  RoundName: round.roundName || round.RoundName || "",
  RoundOrder: round.roundOrder || round.RoundOrder || 0,
  SubmissionDeadline:
    round.submissionDeadline || round.SubmissionDeadline || "",
  StartDate: round.startDate || round.StartDate || "",
  EndDate: round.endDate || round.EndDate || "",
});

const mapCategory = (category: BackendCategory): Category => ({
  CategoryID:
    category.categoryId || category.CategoryId || category.CategoryID || "",
  EventID: category.eventId || category.EventId || category.EventID || "",
  CategoryName: category.categoryName || category.CategoryName || "",
  Description: category.description || category.Description || "",
});

const mapTeam = (team: BackendTeam): Team => ({
  TeamID: team.teamId || team.TeamId || team.TeamID || "",
  TeamName: team.teamName || team.TeamName || "",
  TeamLeaderId: team.teamLeaderId || team.TeamLeaderId || "",
  EventID: team.eventId || team.EventId || team.EventID || "",
  CategoryID: team.categoryId || team.CategoryId || team.CategoryID || "",
  TeamStatus: (team.teamStatus ||
    team.TeamStatus ||
    "Pending") as Team["TeamStatus"],
});

const mapSubmission = (submission: BackendSubmission): Submission => ({
  SubmissionID:
    submission.submissionId ||
    submission.SubmissionId ||
    submission.SubmissionID ||
    "",
  TeamID: submission.teamId || submission.TeamId || submission.TeamID || "",
  RoundID: submission.roundId || submission.RoundId || submission.RoundID || "",
  RepositoryURL:
    submission.repositoryURL ||
    submission.repositoryUrl ||
    submission.RepositoryURL ||
    "",
  DemoURL: submission.demoURL || submission.demoUrl || submission.DemoURL || "",
  SlideURL:
    submission.slideURL || submission.slideUrl || submission.SlideURL || "",
  SubmittedAt: submission.submittedAt || submission.SubmittedAt || "",
  Status: (submission.status ||
    submission.Status ||
    "Submitted") as Submission["Status"],
});

const mapSubmissionAsset = (
  asset: BackendSubmissionAsset,
): SubmissionAsset => ({
  SubmissionAssetId: asset.submissionAssetId || asset.SubmissionAssetId || "",
  SubmissionId: asset.submissionId || asset.SubmissionId || "",
  TeamID: asset.teamId || asset.TeamId || asset.TeamID || "",
  RoundID: asset.roundId || asset.RoundId || asset.RoundID || "",
  AssetType: (asset.assetType ||
    asset.AssetType ||
    "VideoDemo") as SubmissionAssetType,
  Provider: asset.provider || asset.Provider || "Cloudinary",
  CloudinaryAssetId: asset.cloudinaryAssetId || asset.CloudinaryAssetId || "",
  PublicId: asset.publicId || asset.PublicId || "",
  SecureUrl: asset.secureUrl || asset.SecureUrl || "",
  ResourceType: (asset.resourceType ||
    asset.ResourceType ||
    "raw") as SubmissionAsset["ResourceType"],
  OriginalFileName: asset.originalFileName || asset.OriginalFileName || "",
  Format: asset.format || asset.Format || "",
  ContentType: asset.contentType || asset.ContentType || "",
  FileSize: asset.fileSize || asset.FileSize || 0,
  DurationSeconds: asset.durationSeconds ?? asset.DurationSeconds ?? null,
  UploadStatus: (asset.uploadStatus ||
    asset.UploadStatus ||
    "Pending") as SubmissionAsset["UploadStatus"],
  CreatedAt: asset.createdAt || asset.CreatedAt || "",
  UploadedAt: asset.uploadedAt ?? asset.UploadedAt ?? null,
});

const mapCloudinaryUploadSignature = (
  signature: BackendCloudinaryUploadSignature,
): CloudinaryUploadSignature => ({
  SubmissionAssetId:
    signature.submissionAssetId || signature.SubmissionAssetId || "",
  CloudName: signature.cloudName || signature.CloudName || "",
  ApiKey: signature.apiKey || signature.ApiKey || "",
  Timestamp: signature.timestamp || signature.Timestamp || 0,
  Signature: signature.signature || signature.Signature || "",
  Folder: signature.folder || signature.Folder || "",
  PublicId: signature.publicId || signature.PublicId || "",
  ResourceType: (signature.resourceType ||
    signature.ResourceType ||
    "raw") as CloudinaryUploadSignature["ResourceType"],
  UploadUrl: signature.uploadUrl || signature.UploadUrl || "",
  AllowedFormats: signature.allowedFormats || signature.AllowedFormats || [],
  MaxFileSize: signature.maxFileSize || signature.MaxFileSize || 0,
});

const mapScore = (score: BackendScore): Score => ({
  ScoreID: score.scoreId || score.ScoreId || score.ScoreID || "",
  SubmissionID:
    score.submissionId || score.SubmissionId || score.SubmissionID || "",
  AssignmentId: score.assignmentId || score.AssignmentId || "",
  CriteriaID: score.criteriaId || score.CriteriaId || score.CriteriaID || "",
  ScoreValue: score.scoreValue || score.ScoreValue || 0,
  Comment: score.comment || score.Comment || "",
  ScoredAt: score.scoredAt || score.ScoredAt || "",
});

const mapAdvancementRule = (rule: BackendAdvancementRule): AdvancementRule => ({
  RuleId: rule.ruleId || rule.RuleId || "",
  RoundId: rule.roundId || rule.RoundId || "",
  CategoryId: rule.categoryId || rule.CategoryId || "",
  TopN: rule.topN || rule.TopN || 0,
});

const mapJudgeAssignment = (a: BackendJudgeAssignment): JudgeAssignment => ({
  AssignmentId: a.assignmentId || a.AssignmentId || "",
  UserId: a.userId || a.UserId || "",
  UserFullName:
    a.userFullName ||
    a.UserFullName ||
    a.user?.fullName ||
    a.user?.FullName ||
    "",
  UserEmail: a.userEmail || a.UserEmail || a.user?.email || a.user?.Email || "",
  RoundId: a.roundId || a.RoundId || "",
  User: a.user ? mapUser(a.user) : undefined,
  Round: a.round ? mapRound(a.round) : undefined,
});

const mapRanking = (ranking: BackendRanking): Ranking => ({
  RankingId: ranking.rankingId || ranking.RankingId || "",
  TeamId: ranking.teamId || ranking.TeamId || "",
  RoundId: ranking.roundId || ranking.RoundId || "",
  RankPosition: ranking.rankPosition || ranking.RankPosition || 0,
  TotalScore: ranking.totalScore || ranking.TotalScore || 0,
});

const mapEventCriteria = (criteria: BackendEventCriteria): Criteria => ({
  CriteriaID: criteria.criteriaId || criteria.CriteriaId || "",
  TemplateID: criteria.eventCriteriaId || criteria.EventCriteriaId || "",
  CriteriaName: criteria.criteriaName || criteria.CriteriaName || "",
  Weight: criteria.weight || criteria.Weight || 0,
});

// ============================================================================
// CALIBRATION MAPPING FUNCTIONS
// ============================================================================

const mapCalibrationSubmission = (
  data: BackendCalibrationSubmission,
): CalibrationSubmission => ({
  CalibrationId: data.submissionId || data.SubmissionId || data.calibrationId || data.CalibrationId || "",
  EventId: data.eventId || data.EventId || "",
  EventName: data.eventName || data.EventName || "",
  RoundId: data.roundId || data.RoundId || "",
  RoundName: data.roundName || data.RoundName || "",
  CalibrationTitle: data.calibrationTitle || data.CalibrationTitle || "",
  RepositoryURL: data.repositoryURL || data.RepositoryURL || "",
  DemoURL: data.demoURL || data.DemoURL || "",
  SlideURL: data.slideURL || data.SlideURL || "",
  SubmittedAt: data.submittedAt || data.SubmittedAt || "",
  Status: (data.status ||
    data.Status ||
    "Pending") as CalibrationSubmission["Status"],
  JudgeCount: data.judgeCount || data.JudgeCount || 0,
  TotalJudges: data.totalJudges || data.TotalJudges || 0,
});

const mapCalibrationScore = (
  score: BackendCalibrationScore,
): CalibrationScoreOutput => ({
  CalibrationScoreId:
    score.calibrationScoreId || score.CalibrationScoreId || "",
  CalibrationId: score.calibrationId || score.CalibrationId || "",
  JudgeId: score.judgeId || score.JudgeId || "",
  JudgeCode: score.judgeCode || score.JudgeCode || "",
  CriteriaId: score.criteriaId || score.CriteriaId || "",
  CriteriaName: score.criteriaName || score.CriteriaName || "",
  ScoreValue: score.scoreValue || score.ScoreValue || 0,
  Comment: score.comment || score.Comment || "",
  ScoredAt: score.scoredAt || score.ScoredAt || "",
});

const mapCriteriaVariance = (
  data: BackendCriteriaVariance,
): CriteriaVariance => ({
  CriteriaId: data.criteriaId || data.CriteriaId || "",
  CriteriaName: data.criteriaName || data.CriteriaName || "",
  MeanScore: data.meanScore || data.MeanScore || 0,
  Variance: data.variance || data.Variance || 0,
  StandardDeviation: data.standardDeviation || data.StandardDeviation || 0,
  MinScore: data.minScore || data.MinScore || 0,
  MaxScore: data.maxScore || data.MaxScore || 0,
  ScoreRange: data.scoreRange || data.ScoreRange || 0,
});

const mapJudgeSummary = (data: BackendJudgeSummary): JudgeSummary => ({
  JudgeId: data.judgeId || data.JudgeId || "",
  JudgeCode: data.judgeCode || data.JudgeCode || "",
  AverageScore: data.averageScore || data.AverageScore || 0,
  DeviationFromGroupMean:
    data.deviationFromGroupMean || data.DeviationFromGroupMean || 0,
  ConsistencyLabel: (data.consistencyLabel ||
    data.ConsistencyLabel ||
    "Neutral") as JudgeSummary["ConsistencyLabel"],
});

const mapCalibrationAnalysis = (
  data: BackendCalibrationAnalysis,
): CalibrationAnalysis => ({
  SubmissionId: data.submissionId || data.SubmissionId || "",
  CalibrationTitle: data.calibrationTitle || data.CalibrationTitle || "",
  JudgeCount: data.judgeCount || data.JudgeCount || 0,
  CriteriaCount: data.criteriaCount || data.CriteriaCount || 0,
  OverallMean: data.overallMean || data.OverallMean || 0,
  CriteriaVariance: (data.criteriaVariance || data.CriteriaVariance || []).map(
    mapCriteriaVariance,
  ),
  JudgeSummaries: (data.judgeSummaries || data.JudgeSummaries || []).map(
    mapJudgeSummary,
  ),
  InconsistencyFlags: data.inconsistencyFlags || data.InconsistencyFlags || [],
});

const normalizeDate = (value: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateForDisplay = (value: string): string => {
  const date = normalizeDate(value);
  if (!date) return "";
  return date.toLocaleDateString("vi-VN");
};

const calculateDaysLeft = (deadlineValue: string): number => {
  const deadline = normalizeDate(deadlineValue);
  if (!deadline) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.ceil((deadline.getTime() - today.getTime()) / 86400000),
  );
};

const getCompetitionStatus = (
  event: BackendEvent,
): DetailedCompetition["Status"] => {
  const startDate = normalizeDate(event.startDate || event.StartDate || "");
  const endDate = normalizeDate(event.endDate || event.EndDate || "");
  const now = new Date();

  if (endDate && now > endDate) return "closed";
  if (startDate && now < startDate) return "upcoming";
  return "open";
};

const mapPublishedEventToDetailedCompetition = (
  event: BackendEvent,
): DetailedCompetition => {
  const format = (event.format ||
    event.Format ||
    "Online") as DetailedCompetition["Format"];

  return {
    ID: event.eventId || event.EventId || event.EventID || "",
    Name: event.eventName || event.EventName || "",
    Description: event.description || event.Description || "",
    Category: "Technology",
    CategoryLabel: "",
    Status: getCompetitionStatus(event),
    Deadline: formatDateForDisplay(event.startDate || event.StartDate || ''),
    Format: ['Online', 'Offline', 'Hybrid'].includes(format) ? format : 'Online',
    Audience: 'Sinh vien',
    Organizer: event.organizer || event.Organizer || '',
    Prize: event.prize || event.Prize || '',
    BannerUrl: event.bannerUrl || event.BannerUrl || '/images/hackathon_banner.png',
    DaysLeft: calculateDaysLeft(event.startDate || event.StartDate || ''),
    IsFeatured: event.isFeatured ?? event.IsFeatured ?? false,
  };
};

export async function getEvents(): Promise<Event[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendEvent[]>("/Event/all");
    return response.data.map(mapEvent);
  } catch (error: unknown) {
    logApiError("getEvents", error);
    return [];
  }
}

export async function getRounds(eventId?: string): Promise<Round[]> {
  if (!useLiveApi) return [];
  try {
    if (eventId) {
      const response = await apiClient.get<BackendRound[]>(
        `/Round/events/${eventId}`,
      );
      return response.data.map(mapRound);
    }

    const response = await apiClient.get<BackendEvent[]>("/Event/all");
    return response.data.flatMap((event) =>
      (event.rounds || event.Rounds || []).map(mapRound),
    );
  } catch (error: unknown) {
    logApiError("getRounds", error);
    return [];
  }
}

export async function getCategories(eventId?: string): Promise<Category[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendCategory[]>("/Category");
    const categories = response.data.map(mapCategory);
    return eventId
      ? categories.filter((category) => category.EventID === eventId)
      : categories;
  } catch (error: unknown) {
    logApiError("getCategories", error);
    return [];
  }
}

export async function getTeams(): Promise<Team[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendTeam[]>("/Teams");
    return response.data.map(mapTeam);
  } catch (error: unknown) {
    logApiError("getTeams", error);
    return [];
  }
}

export interface MyApplication {
  ApplicationId: string;
  RecruitmentId: string;
  CandidateUserId: string;
  Status: string;
  AppliedAt: string;
}

export async function getMyApplications(): Promise<MyApplication[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<MyApplication[]>("/TeamApplication/my-applications");
    return response.data;
  } catch (error: unknown) {
    logApiError("getMyApplications", error);
    return [];
  }
}

export interface BackendTeamMemberDetail {
  teamMemberId?: string;
  teamId?: string;
  userId?: string;
  joinDate?: string;
  user?: {
    userId?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    shortId?: string;
    role?: string;
    accountStatus?: string;
  };
  studentProfile?: {
    profileId?: string;
    userId?: string;
    studentType?: string;
    studentCode?: string;
    universityName?: string;
  };
}

export async function getTeamMembers(
  teamId: string,
): Promise<(TeamMember & { User: User; StudentProfile?: StudentProfile })[]> {
  if (!useLiveApi || !teamId) return [];
  try {
    const response = await apiClient.get<BackendTeamMemberDetail[]>(
      `/Teams/${teamId}/members`,
    );
    return response.data.map((member) => ({
      TeamMemberId: member.teamMemberId || "",
      TeamID: member.teamId || "",
      UserId: member.userId || "",
      JoinDate: member.joinDate || "",
      User: {
        UserID: member.user?.userId || "",
        Email: member.user?.email || "",
        FullName: member.user?.fullName || "",
        Phone: member.user?.phone || "",
        ShortId: member.user?.shortId || "",
        Role: (member.user?.role || "Member") as User["Role"],
        AccountStatus: member.user?.accountStatus || "",
      },
      StudentProfile: member.studentProfile
        ? {
            ProfileID: member.studentProfile.profileId || "",
            UserID: member.studentProfile.userId || "",
            StudentType: (member.studentProfile.studentType ||
              "External") as StudentProfile["StudentType"],
            StudentCode: member.studentProfile.studentCode || "",
            UniversityName: member.studentProfile.universityName || "",
          }
        : undefined,
    }));
  } catch (error: unknown) {
    logApiError("getTeamMembers", error);
    return [];
  }
}

function buildAddTeamMemberPayload(userLookup: string) {
  const value = userLookup.trim();
  const guidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (guidPattern.test(value)) {
    return { UserId: value };
  }

  if (value.includes("@")) {
    return { Email: value };
  }

  return { ShortId: value, StudentCode: value };
}

export async function addTeamMember(
  teamId: string,
  userLookup: string,
): Promise<Team | null> {
  if (!useLiveApi || !teamId || !userLookup.trim()) return null;
  try {
    const response = await apiClient.post<BackendTeam>(
      `/Teams/${teamId}/members`,
      buildAddTeamMemberPayload(userLookup),
    );
    return mapTeam(response.data);
  } catch (error: unknown) {
    logApiError("addTeamMember", error);
    throw error;
  }
}

export async function removeTeamMember(
  teamId: string,
  teamMemberId: string,
): Promise<boolean> {
  if (!useLiveApi || !teamId || !teamMemberId) return false;
  try {
    await apiClient.delete(`/Teams/${teamId}/members/${teamMemberId}`);
    return true;
  } catch (error: unknown) {
    logApiError("removeTeamMember", error);
    throw error;
  }
}

export async function createTeam(teamName: string): Promise<Team | null> {
  if (!useLiveApi || !teamName.trim()) return null;
  try {
    const response = await apiClient.post<BackendTeam>("/Teams", {
      TeamName: teamName.trim(),
      TeamStatus: "Active",
    });
    return mapTeam(response.data);
  } catch (error: unknown) {
    logApiError("createTeam", error);
    throw error;
  }
}

export async function setTeamCategory(
  teamId: string,
  categoryId: string | null | undefined,
  eventId: string,
): Promise<Team | null> {
  if (!useLiveApi || !teamId || !eventId) return null;
  try {
    const response = await apiClient.put<BackendTeam>(
      `/Teams/${teamId}/category`,
      {
        CategoryId: categoryId || null,
        EventId: eventId,
      },
    );
    return mapTeam(response.data);
  } catch (error: unknown) {
    logApiError("setTeamCategory", error);
    throw error;
  }
}

export async function getSubmissions(
  roundId?: string,
): Promise<(Submission & { Team: Team })[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendSubmission[]>("/Submissions");
    const teams = await getTeams();
    const submissions = response.data.map((submission) => {
      const mappedSubmission = mapSubmission(submission);
      const team = teams.find(
        (item) => item.TeamID === mappedSubmission.TeamID,
      ) || {
        TeamID: mappedSubmission.TeamID,
        TeamName: "",
        TeamLeaderId: "",
        EventID: "",
        CategoryID: "",
        TeamStatus: "Pending" as const,
      };

      return { ...mappedSubmission, Team: team };
    });

    return roundId
      ? submissions.filter((submission) => submission.RoundID === roundId)
      : submissions;
  } catch (error: unknown) {
    logApiError("getSubmissions", error);
    return [];
  }
}

const emptyTeamForSubmission = (submission: Submission): Team => ({
  TeamID: submission.TeamID,
  TeamName: "",
  TeamLeaderId: "",
  EventID: "",
  CategoryID: "",
  TeamStatus: "Pending",
});

export async function getTeamSubmissions(
  teamId: string,
): Promise<(Submission & { Team: Team })[]> {
  if (!useLiveApi || !teamId) return [];
  try {
    const response = await apiClient.get<BackendSubmission[]>(
      `/Submissions/team/${teamId}`,
    );
    const teams = await getTeams();
    const team = teams.find((item) => item.TeamID === teamId);

    return response.data.map((submission) => {
      const mappedSubmission = mapSubmission(submission);
      return {
        ...mappedSubmission,
        Team: team || emptyTeamForSubmission(mappedSubmission),
      };
    });
  } catch (error: unknown) {
    logApiError("getTeamSubmissions", error);
    return [];
  }
}

export async function getTeamSubmissionByRound(
  teamId: string,
  roundId: string,
): Promise<(Submission & { Team: Team }) | null> {
  if (!useLiveApi || !teamId || !roundId) return null;
  try {
    const response = await apiClient.get<BackendSubmission>(
      `/Submissions/team/${teamId}/round/${roundId}`,
    );
    const mappedSubmission = mapSubmission(response.data);
    const teams = await getTeams();
    const team = teams.find((item) => item.TeamID === mappedSubmission.TeamID);

    return {
      ...mappedSubmission,
      Team: team || emptyTeamForSubmission(mappedSubmission),
    };
  } catch (error: unknown) {
    const status =
      typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
    if (status !== 404) logApiError("getTeamSubmissionByRound", error);
    return null;
  }
}

export async function getSubmissionAssets(
  submissionId: string,
): Promise<SubmissionAsset[]> {
  if (!useLiveApi || !submissionId) return [];
  try {
    const response = await apiClient.get<BackendSubmissionAsset[]>(
      `/SubmissionAssets/submission/${submissionId}`,
    );
    return response.data.map(mapSubmissionAsset);
  } catch (error: unknown) {
    logApiError("getSubmissionAssets", error);
    return [];
  }
}

export async function getSubmissionAssetsByTeamRound(
  teamId: string,
  roundId: string,
): Promise<SubmissionAsset[]> {
  if (!useLiveApi || !teamId || !roundId) return [];
  try {
    const response = await apiClient.get<BackendSubmissionAsset[]>(
      `/SubmissionAssets/team/${teamId}/round/${roundId}`,
    );
    return response.data.map(mapSubmissionAsset);
  } catch (error: unknown) {
    logApiError("getSubmissionAssetsByTeamRound", error);
    return [];
  }
}

export async function signSubmissionAssetUpload(
  teamId: string,
  roundId: string,
  assetType: SubmissionAssetType,
  file: File,
): Promise<CloudinaryUploadSignature | null> {
  if (!useLiveApi || !teamId || !roundId || !file) return null;
  try {
    const response = await apiClient.post<BackendCloudinaryUploadSignature>(
      "/SubmissionAssets/sign-upload",
      {
        TeamId: teamId,
        RoundId: roundId,
        AssetType: assetType,
        FileName: file.name,
        ContentType: file.type,
        FileSize: file.size,
      },
    );
    return mapCloudinaryUploadSignature(response.data);
  } catch (error: unknown) {
    logApiError("signSubmissionAssetUpload", error);
    throw error;
  }
}

export async function uploadFileToCloudinary(
  signature: CloudinaryUploadSignature,
  file: File,
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.ApiKey);
  formData.append("timestamp", String(signature.Timestamp));
  formData.append("signature", signature.Signature);
  formData.append("folder", signature.Folder);
  formData.append("public_id", signature.PublicId);

  let response: Response;
  try {
    response = await fetch(signature.UploadUrl, {
      method: "POST",
      body: formData,
    });
  } catch (networkError: unknown) {
    const isNetworkError =
      networkError instanceof TypeError &&
      (networkError.message?.includes("fetch") ||
        networkError.message?.includes("Failed") ||
        networkError.message?.includes("Network"));

    if (isNetworkError) {
      throw new Error(
        `Không thể kết nối đến Cloudinary (${signature.UploadUrl}). Kiểm tra kết nối mạng hoặc VPN.`,
      );
    }
    throw new Error(`Lỗi mạng khi upload: ${networkError instanceof Error ? networkError.message : String(networkError)}`);
  }

  if (!response.ok) {
    let message = "";
    try {
      const body = await response.text();
      if (body) {
        const parsed = JSON.parse(body);
        message = parsed?.error?.message || parsed?.message || body;
      }
    } catch {
      message = response.statusText;
    }
    throw new Error(message || `Cloudinary upload thất bại (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!data.secure_url && !data.secure_url) {
    throw new Error("Cloudinary không trả về URL sau khi upload.");
  }

  return data;
}

export async function completeSubmissionAssetUpload(
  submissionAssetId: string,
  uploadResult: CloudinaryUploadResponse,
): Promise<SubmissionAsset | null> {
  if (!useLiveApi || !submissionAssetId) return null;
  try {
    const response = await apiClient.post<BackendSubmissionAsset>(
      "/SubmissionAssets/complete",
      {
        SubmissionAssetId: submissionAssetId,
        CloudinaryAssetId: uploadResult.asset_id || "",
        PublicId: uploadResult.public_id || "",
        SecureUrl: uploadResult.secure_url || "",
        ResourceType: uploadResult.resource_type || "",
        Format: uploadResult.format || "",
        FileSize: uploadResult.bytes || 0,
        DurationSeconds: uploadResult.duration ?? null,
      },
    );
    return mapSubmissionAsset(response.data);
  } catch (error: unknown) {
    logApiError("completeSubmissionAssetUpload", error);
    throw error;
  }
}

export async function uploadSubmissionAsset(
  teamId: string,
  roundId: string,
  assetType: SubmissionAssetType,
  file: File,
): Promise<SubmissionAsset | null> {
  const signature = await signSubmissionAssetUpload(
    teamId,
    roundId,
    assetType,
    file,
  );
  if (!signature) return null;
  const uploadResult = await uploadFileToCloudinary(signature, file);
  return completeSubmissionAssetUpload(
    signature.SubmissionAssetId,
    uploadResult,
  );
}

export async function createSubmissionLinks(
  teamId: string,
  roundId: string,
  links: Pick<Submission, "RepositoryURL" | "DemoURL" | "SlideURL"> & {
    VideoAssetId?: string;
    SlideAssetId?: string;
  },
): Promise<Submission | null> {
  if (!useLiveApi || !teamId || !roundId) return null;
  try {
    const response = await apiClient.post<BackendSubmission>("/Submissions", {
      TeamId: teamId,
      RoundId: roundId,
      RepositoryURL: links.RepositoryURL.trim() || null,
      DemoURL: links.DemoURL.trim() || null,
      SlideURL: links.SlideURL.trim() || null,
      VideoAssetId: links.VideoAssetId || null,
      SlideAssetId: links.SlideAssetId || null,
    });

    return mapSubmission(response.data);
  } catch (error: unknown) {
    logApiError("createSubmissionLinks", error);
    throw error;
  }
}

export async function updateSubmissionLinks(
  submissionId: string,
  links: Pick<Submission, "RepositoryURL" | "DemoURL" | "SlideURL"> & {
    VideoAssetId?: string;
    SlideAssetId?: string;
  },
): Promise<Submission | null> {
  if (!useLiveApi || !submissionId) return null;
  try {
    const response = await apiClient.put<BackendSubmission>("/Submissions", {
      SubmissionId: submissionId,
      RepositoryURL: links.RepositoryURL.trim() || null,
      DemoURL: links.DemoURL.trim() || null,
      SlideURL: links.SlideURL.trim() || null,
      VideoAssetId: links.VideoAssetId || null,
      SlideAssetId: links.SlideAssetId || null,
    });

    return mapSubmission(response.data);
  } catch (error: unknown) {
    logApiError("updateSubmissionLinks", error);
    throw error;
  }
}

export async function deleteSubmission(submissionId: string): Promise<boolean> {
  if (!useLiveApi || !submissionId) return false;
  try {
    await apiClient.delete(`/Submissions/${submissionId}`);
    return true;
  } catch (error: unknown) {
    logApiError("deleteSubmission", error);
    throw error;
  }
}

export async function getScores(
  submissionId: string,
): Promise<(Score & { Judge: User; Criteria: Criteria })[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendScore[]>(
      `/Scores/submissions/${submissionId}`,
    );
    const scores = response.data || [];

    return scores.map((score) => ({
      ...mapScore(score),
      Judge: emptyUser(),
      Criteria: {
        CriteriaID:
          score.criteriaId || score.CriteriaId || score.CriteriaID || "",
        TemplateID: "",
        CriteriaName: score.criteriaName || score.CriteriaName || "",
        Weight: score.weight || score.Weight || 0,
      },
    }));
  } catch (error: unknown) {
    logApiError("getScores", error);
    return [];
  }
}

export async function getEventCriteria(eventId: string): Promise<Criteria[]> {
  if (!useLiveApi || !eventId) return [];
  try {
    const response = await apiClient.get<BackendEventCriteria[]>(
      `/events/${eventId}/criteria`,
    );
    return response.data.map(mapEventCriteria);
  } catch (error: unknown) {
    logApiError("getEventCriteria", error);
    return [];
  }
}

export async function submitScores(
  submissionId: string,
  scores: { CriteriaId: string; ScoreValue: number; Comment: string }[],
): Promise<Score[]> {
  const response = await apiClient.post<BackendScore[]>(
    `/Scores/submissions/${submissionId}`,
    {
      Scores: scores,
    },
  );
  return response.data.map(mapScore);
}

export async function updateScores(
  submissionId: string,
  scores: { CriteriaId: string; ScoreValue: number; Comment: string }[],
): Promise<Score[]> {
  const response = await apiClient.put<BackendScore[]>(
    `/Scores/submissions/${submissionId}`,
    {
      Scores: scores,
    },
  );
  return response.data.map(mapScore);
}

export async function getAssignedSubmissions(): Promise<
  JudgeAssignedSubmission[]
> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<JudgeAssignedSubmission[]>(
      "/Scores/assigned-submissions",
    );
    return response.data;
  } catch (error: unknown) {
    logApiError("getAssignedSubmissions", error);
    return [];
  }
}

// ============================================================================
// CALIBRATION API FUNCTIONS
// ============================================================================

export async function getCalibrationSubmissions(filters?: {
  roundId?: string;
  eventId?: string;
  status?: string;
}): Promise<CalibrationSubmission[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendCalibrationSubmission[]>(
      "/Calibration/submissions",
      { params: filters },
    );
    return response.data.map(mapCalibrationSubmission);
  } catch (error: unknown) {
    logApiError("getCalibrationSubmissions", error);
    return [];
  }
}

export async function getCalibrationSubmission(
  id: string,
): Promise<CalibrationSubmission | null> {
  if (!useLiveApi || !id) return null;
  try {
    const response = await apiClient.get<BackendCalibrationSubmission>(
      `/Calibration/submissions/${id}`,
    );
    return mapCalibrationSubmission(response.data);
  } catch (error: unknown) {
    logApiError("getCalibrationSubmission", error);
    return null;
  }
}

export async function createCalibrationSubmission(data: {
  roundId: string;
  calibrationTitle: string;
  repositoryURL?: string;
  demoURL?: string;
  slideURL?: string;
}): Promise<CalibrationSubmission | null> {
  if (!useLiveApi) return null;
  try {
    const response = await apiClient.post<BackendCalibrationSubmission>(
      "/Calibration/submissions",
      {
        roundId: data.roundId,
        calibrationTitle: data.calibrationTitle,
        repositoryURL: data.repositoryURL,
        demoURL: data.demoURL,
        slideURL: data.slideURL,
      },
    );
    return mapCalibrationSubmission(response.data);
  } catch (error: unknown) {
    logApiError("createCalibrationSubmission", error);
    throw error;
  }
}

export async function getCalibrationScores(
  calibrationId: string,
): Promise<CalibrationScoreWithMyScore> {
  if (!useLiveApi || !calibrationId) {
    return { scores: [], myScore: [], hasScored: false };
  }
  try {
    const response = await apiClient.get<{
      scores: BackendCalibrationScore[];
      myScore?: BackendCalibrationScore[];
    }>(`/Calibration/submissions/${calibrationId}/scores`);

    const scores = (response.data.scores || []).map(mapCalibrationScore);
    const myScore = (response.data.myScore || []).map(mapCalibrationScore);

    return {
      scores,
      myScore,
      hasScored: myScore.length > 0,
    };
  } catch (error: unknown) {
    logApiError("getCalibrationScores", error);
    return { scores: [], myScore: [], hasScored: false };
  }
}

export async function getMyCalibrationScore(
  calibrationId: string,
): Promise<{ hasScored: boolean; scores: CalibrationScoreOutput[] }> {
  if (!useLiveApi || !calibrationId) {
    return { hasScored: false, scores: [] };
  }
  try {
    const response = await apiClient.get<{
      hasScored: boolean;
      scores: BackendCalibrationScore[];
    }>(`/Calibration/submissions/${calibrationId}/my-score`);

    return {
      hasScored: response.data.hasScored || false,
      scores: (response.data.scores || []).map(mapCalibrationScore),
    };
  } catch (error: unknown) {
    logApiError("getMyCalibrationScore", error);
    return { hasScored: false, scores: [] };
  }
}

export async function submitCalibrationScore(
  calibrationId: string,
  scores: CalibrationScoreInput[],
): Promise<CalibrationScoreOutput[]> {
  const response = await apiClient.post<BackendCalibrationScore[]>(
    `/Calibration/submissions/${calibrationId}/scores`,
    { scores },
  );
  return response.data.map(mapCalibrationScore);
}

export async function updateCalibrationScore(
  calibrationId: string,
  scores: CalibrationScoreInput[],
): Promise<CalibrationScoreOutput[]> {
  const response = await apiClient.put<BackendCalibrationScore[]>(
    `/Calibration/submissions/${calibrationId}/scores`,
    { scores },
  );
  return response.data.map(mapCalibrationScore);
}

export async function getCalibrationAnalysis(
  calibrationId: string,
): Promise<CalibrationAnalysis | null> {
  if (!useLiveApi || !calibrationId) return null;
  try {
    const response = await apiClient.get<BackendCalibrationAnalysis>(
      `/Calibration/submissions/${calibrationId}/analysis`,
    );
    return mapCalibrationAnalysis(response.data);
  } catch (error: unknown) {
    logApiError("getCalibrationAnalysis", error);
    return null;
  }
}

export async function exportCalibrationCSV(
  calibrationId: string,
): Promise<Blob | null> {
  if (!useLiveApi || !calibrationId) return null;
  try {
    const response = await apiClient.get(
      `/Calibration/submissions/${calibrationId}/export`,
      { responseType: "blob" },
    );
    return response.data as Blob;
  } catch (error: unknown) {
    logApiError("exportCalibrationCSV", error);
    throw error;
  }
}

export async function deleteCalibrationSubmission(id: string): Promise<void> {
  await apiClient.delete(`/Calibration/submissions/${id}`);
}

export async function getAdvancementRules(
  roundId?: string,
): Promise<AdvancementRule[]> {
  if (!useLiveApi) return [];
  try {
    const response =
      await apiClient.get<BackendAdvancementRule[]>("/AdvancementRule");
    const rules = response.data.map(mapAdvancementRule);
    return roundId ? rules.filter((rule) => rule.RoundId === roundId) : rules;
  } catch (error: unknown) {
    logApiError("getAdvancementRules", error);
    return [];
  }
}

export async function setEventCriteria(
  eventId: string,
  criteria: { criteriaId: string; criteriaName?: string; weight: number }[],
): Promise<Criteria[]> {
  const response = await apiClient.post<BackendEventCriteria[]>(
    `/events/${eventId}/criteria`,
    {
      criteria: criteria.map((c) => ({
        criteriaId: c.criteriaId,
        criteriaName: c.criteriaName,
        weight: c.weight,
      })),
    },
  );
  return response.data.map(mapEventCriteria);
}

export async function createAdvancementRule(
  roundId: string,
  categoryId: string,
  topN: number,
): Promise<AdvancementRule> {
  const response = await apiClient.post<BackendAdvancementRule>(
    "/AdvancementRule",
    {
      roundId,
      categoryId,
      topN,
    },
  );
  return mapAdvancementRule(response.data);
}

export async function deleteAdvancementRule(ruleId: string): Promise<void> {
  await apiClient.delete(`/AdvancementRule/${ruleId}`);
}

export async function getJudgeAssignments(
  roundId?: string,
): Promise<JudgeAssignment[]> {
  if (!useLiveApi) return [];
  try {
    const response =
      await apiClient.get<BackendJudgeAssignment[]>("/JudgeAssignment");
    const assignments = response.data.map(mapJudgeAssignment);
    return roundId
      ? assignments.filter((a) => a.RoundId === roundId)
      : assignments;
  } catch (error: unknown) {
    logApiError("getJudgeAssignments", error);
    return [];
  }
}

export async function assignJudge(
  userId: string,
  roundId: string,
): Promise<JudgeAssignment> {
  const response = await apiClient.post<BackendJudgeAssignment>(
    "/JudgeAssignment",
    {
      userId,
      roundId,
    },
  );
  return mapJudgeAssignment(response.data);
}

export async function removeJudgeAssignment(
  assignmentId: string,
): Promise<void> {
  await apiClient.delete(`/JudgeAssignment/${assignmentId}`);
}

export async function getAllJudges(): Promise<User[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendUser[]>("/users");
    return response.data
      .filter((u) => u.role === "Judge" || u.role === "Coordinator")
      .map(mapUser);
  } catch (error: unknown) {
    logApiError("getAllJudges", error);
    return [];
  }
}

export async function getUsersByRole(role: string): Promise<User[]> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendUser[]>(`/users/role/${role}`);
    return response.data.map(mapUser);
  } catch (error: unknown) {
    logApiError("getUsersByRole", error);
    return [];
  }
}

export async function getEliminations(): Promise<
  (Elimination & { Submission: Submission; Team: Team; Coordinator: User })[]
> {
  return [];
}

export async function getAuditLogs(): Promise<(AuditLog & { User: User })[]> {
  return [];
}

export async function getRankings(
  roundId?: string,
): Promise<(Ranking & { Team: Team })[]> {
  if (!useLiveApi || !roundId) return [];
  try {
    const response = await apiClient.get<BackendRanking[]>("/Rankings", {
      params: { roundId, cacheBust: Date.now() },
      headers: { "Cache-Control": "no-cache" },
    });
    const teams = await getTeams();
    return response.data.map((ranking) => {
      const mappedRanking = mapRanking(ranking);
      return {
        ...mappedRanking,
        Team: teams.find((team) => team.TeamID === mappedRanking.TeamId) || {
          TeamID: mappedRanking.TeamId,
          TeamName: "",
          TeamLeaderId: "",
          EventID: "",
          CategoryID: "",
          TeamStatus: "Pending" as const,
        },
      };
    });
  } catch (error: unknown) {
    logApiError("getRankings", error);
    return [];
  }
}

export async function getAnnouncements(
  _eventId?: string,
): Promise<Announcement[]> {
  void _eventId;
  return [];
}

export async function getDetailedCompetitions(): Promise<
  DetailedCompetition[]
> {
  if (!useLiveApi) return [];
  try {
    const response = await apiClient.get<BackendEvent[]>("/Event/published");
    return response.data.map(mapPublishedEventToDetailedCompetition);
  } catch (error: unknown) {
    logApiError("getDetailedCompetitions", error);
    return [];
  }
}

// User Skills, Team Recruitment & Team Application Re-exports
export * from "../services/types/skill";
export * from "../services/types/recruitment";
export * from "../services/types/application";
export * from "../services/api/skill";
export * from "../services/api/recruitment";
export * from "../services/api/application";

