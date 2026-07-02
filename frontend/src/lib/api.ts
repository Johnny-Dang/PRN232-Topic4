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
  Status: 'Submitted' | 'Graded' | 'Disqualified';
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
  Audience: 'Học sinh' | 'Sinh viên' | 'Tất cả';
  Organizer: string;
  Prize: string;
  BannerUrl: string;
  DaysLeft: number;
  IsFeatured?: boolean;
}


// Mock database data representing seeddata_updated.sql
export const mockUsers: User[] = [
  { UserID: '00000000-0000-0000-0000-000000000001', Email: 'leader.phoenix@fpt.edu.vn', FullName: 'Trần Minh Đức', Phone: '0901000001', Role: 'Leader', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000005', Email: 'leader.beta@fpt.edu.vn', FullName: 'Phạm Gia Huy', Phone: '0901000005', Role: 'Leader', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000002', Email: 'member.phoenix1@fpt.edu.vn', FullName: 'Nguyễn Thanh Nam', Phone: '0901000002', Role: 'Member', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000003', Email: 'member.phoenix2@fpt.edu.vn', FullName: 'Lê Hoàng Anh', Phone: '0901000003', Role: 'Member', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000004', Email: 'member.phoenix3@uit.edu.vn', FullName: 'Võ Minh Khang', Phone: '0901000004', Role: 'Member', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000006', Email: 'member.beta1@fpt.edu.vn', FullName: 'Trương Quốc Bảo', Phone: '0901000006', Role: 'Member', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000007', Email: 'member.beta2@hcmus.edu.vn', FullName: 'Đặng Minh Triết', Phone: '0901000007', Role: 'Member', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000008', Email: 'member.beta3@hcmute.edu.vn', FullName: 'Bùi Nhật Long', Phone: '0901000008', Role: 'Member', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000009', Email: 'mentor.ai@fpt.edu.vn', FullName: 'Phạm Văn Tùng', Phone: '0901000009', Role: 'Mentor', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000010', Email: 'mentor.web@fpt.edu.vn', FullName: 'Nguyễn Thị Hương', Phone: '0901000010', Role: 'Mentor', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000011', Email: 'judge.internal1@fpt.edu.vn', FullName: 'Lê Minh Hải', Phone: '0901000011', Role: 'Judge', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000012', Email: 'judge.internal2@fpt.edu.vn', FullName: 'Trần Bảo Lâm', Phone: '0901000012', Role: 'Judge', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000013', Email: 'coordinator.se@fpt.edu.vn', FullName: 'Trần Điều Phối', Phone: '0901000013', Role: 'Coordinator', AccountStatus: 'Approved' },
  { UserID: '00000000-0000-0000-0000-000000000014', Email: 'coordinator.pdp@fpt.edu.vn', FullName: 'Nguyễn Event Manager', Phone: '0901000014', Role: 'Coordinator', AccountStatus: 'Approved' },
];

export const mockStudentProfiles: StudentProfile[] = [
  { ProfileID: 'A1111111-1111-1111-1111-111111111101', UserID: '00000000-0000-0000-0000-000000000001', StudentType: 'FPT', StudentCode: 'SE170001', UniversityName: 'FPT University' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111102', UserID: '00000000-0000-0000-0000-000000000002', StudentType: 'FPT', StudentCode: 'SE170002', UniversityName: 'FPT University' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111103', UserID: '00000000-0000-0000-0000-000000000003', StudentType: 'FPT', StudentCode: 'SE170003', UniversityName: 'FPT University' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111104', UserID: '00000000-0000-0000-0000-000000000004', StudentType: 'External', StudentCode: 'UIT001', UniversityName: 'UIT' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111105', UserID: '00000000-0000-0000-0000-000000000005', StudentType: 'FPT', StudentCode: 'SE170010', UniversityName: 'FPT University' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111106', UserID: '00000000-0000-0000-0000-000000000006', StudentType: 'FPT', StudentCode: 'SE170011', UniversityName: 'FPT University' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111107', UserID: '00000000-0000-0000-0000-000000000007', StudentType: 'External', StudentCode: 'HCMUS001', UniversityName: 'HCMUS' },
  { ProfileID: 'A1111111-1111-1111-1111-111111111108', UserID: '00000000-0000-0000-0000-000000000008', StudentType: 'External', StudentCode: 'UTE001', UniversityName: 'HCMUTE' },
];

export const mockEvents: Event[] = [
  { EventID: 'E0000000-0000-0000-0000-000000000001', EventName: 'SEAL Spring 2026', Season: 'Spring', Year: 2026, Description: 'Software Engineering Agile League Spring 2026', StartDate: '2026-03-01', EndDate: '2026-04-30' },
  { EventID: 'E0000000-0000-0000-0000-000000000002', EventName: 'SEAL Summer 2026', Season: 'Summer', Year: 2026, Description: 'Software Engineering Agile League Summer 2026', StartDate: '2026-06-01', EndDate: '2026-07-30' },
  { EventID: 'E0000000-0000-0000-0000-000000000003', EventName: 'SEAL Fall 2026', Season: 'Fall', Year: 2026, Description: 'Software Engineering Agile League Fall 2026', StartDate: '2026-09-01', EndDate: '2026-10-31' },
];

export const mockRounds: Round[] = [
  { RoundID: 'A0000000-0000-0000-0000-000000000001', EventID: 'E0000000-0000-0000-0000-000000000001', RoundName: 'Preliminary Round', RoundOrder: 1, SubmissionDeadline: '2026-03-20', StartDate: '2026-03-01', EndDate: '2026-03-25' },
  { RoundID: 'A0000000-0000-0000-0000-000000000002', EventID: 'E0000000-0000-0000-0000-000000000001', RoundName: 'Semi Final Round', RoundOrder: 2, SubmissionDeadline: '2026-04-05', StartDate: '2026-03-28', EndDate: '2026-04-07' },
  { RoundID: 'A0000000-0000-0000-0000-000000000003', EventID: 'E0000000-0000-0000-0000-000000000001', RoundName: 'Final Round', RoundOrder: 3, SubmissionDeadline: '2026-04-20', StartDate: '2026-04-15', EndDate: '2026-04-25' },
  { RoundID: 'A0000000-0000-0000-0000-000000000004', EventID: 'E0000000-0000-0000-0000-000000000002', RoundName: 'Preliminary Round', RoundOrder: 1, SubmissionDeadline: '2026-06-20', StartDate: '2026-06-01', EndDate: '2026-06-25' },
  { RoundID: 'A0000000-0000-0000-0000-000000000005', EventID: 'E0000000-0000-0000-0000-000000000002', RoundName: 'Final Round', RoundOrder: 2, SubmissionDeadline: '2026-07-10', StartDate: '2026-07-01', EndDate: '2026-07-15' },
  { RoundID: 'A0000000-0000-0000-0000-000000000006', EventID: 'E0000000-0000-0000-0000-000000000003', RoundName: 'Preliminary Round', RoundOrder: 1, SubmissionDeadline: '2026-09-20', StartDate: '2026-09-01', EndDate: '2026-09-25' },
];

export const mockCategories: Category[] = [
  { CategoryID: 'C0000000-0000-0000-0000-000000000001', EventID: 'E0000000-0000-0000-0000-000000000001', CategoryName: 'Web Application', Description: 'Web-based software projects' },
  { CategoryID: 'C0000000-0000-0000-0000-000000000002', EventID: 'E0000000-0000-0000-0000-000000000001', CategoryName: 'Mobile Application', Description: 'Mobile software solutions' },
  { CategoryID: 'C0000000-0000-0000-0000-000000000003', EventID: 'E0000000-0000-0000-0000-000000000001', CategoryName: 'AI Solution', Description: 'Artificial Intelligence projects' },
  { CategoryID: 'C0000000-0000-0000-0000-000000000004', EventID: 'E0000000-0000-0000-0000-000000000002', CategoryName: 'Blockchain Solution', Description: 'Blockchain applications' },
  { CategoryID: 'C0000000-0000-0000-0000-000000000005', EventID: 'E0000000-0000-0000-0000-000000000002', CategoryName: 'Web Application', Description: 'Web-based software projects' },
  { CategoryID: 'C0000000-0000-0000-0000-000000000006', EventID: 'E0000000-0000-0000-0000-000000000003', CategoryName: 'AI/ML Solution', Description: 'Machine Learning projects' },
  { CategoryID: 'C0000000-0000-0000-0000-000000000007', EventID: 'E0000000-0000-0000-0000-000000000003', CategoryName: 'IoT Solution', Description: 'Internet of Things projects' },
];

export const mockTeams: Team[] = [
  { TeamID: '70000000-0000-0000-0000-000000000001', TeamName: 'Phoenix AI', TeamLeaderId: '00000000-0000-0000-0000-000000000001', CategoryID: 'C0000000-0000-0000-0000-000000000003', TeamStatus: 'Active' },
  { TeamID: '70000000-0000-0000-0000-000000000002', TeamName: 'Beta Coders', TeamLeaderId: '00000000-0000-0000-0000-000000000005', CategoryID: 'C0000000-0000-0000-0000-000000000001', TeamStatus: 'Active' },
];

export const mockTeamMembers: TeamMember[] = [
  { TeamMemberId: '91111111-1111-1111-1111-111111111101', TeamID: '70000000-0000-0000-0000-000000000001', UserId: '00000000-0000-0000-0000-000000000001', JoinDate: '2026-02-15' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111102', TeamID: '70000000-0000-0000-0000-000000000001', UserId: '00000000-0000-0000-0000-000000000002', JoinDate: '2026-02-15' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111103', TeamID: '70000000-0000-0000-0000-000000000001', UserId: '00000000-0000-0000-0000-000000000003', JoinDate: '2026-02-16' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111104', TeamID: '70000000-0000-0000-0000-000000000001', UserId: '00000000-0000-0000-0000-000000000004', JoinDate: '2026-02-17' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111105', TeamID: '70000000-0000-0000-0000-000000000002', UserId: '00000000-0000-0000-0000-000000000005', JoinDate: '2026-02-14' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111106', TeamID: '70000000-0000-0000-0000-000000000002', UserId: '00000000-0000-0000-0000-000000000006', JoinDate: '2026-02-15' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111107', TeamID: '70000000-0000-0000-0000-000000000002', UserId: '00000000-0000-0000-0000-000000000007', JoinDate: '2026-02-16' },
  { TeamMemberId: '91111111-1111-1111-1111-111111111108', TeamID: '70000000-0000-0000-0000-000000000002', UserId: '00000000-0000-0000-0000-000000000008', JoinDate: '2026-02-17' },
];

export const mockCriteria: Criteria[] = [
  { CriteriaID: 'CC000000-0000-0000-0000-000000000001', TemplateID: 'F0000000-0000-0000-0000-000000000001', CriteriaName: 'Innovation', Weight: 0.4 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000002', TemplateID: 'F0000000-0000-0000-0000-000000000001', CriteriaName: 'Technical Complexity', Weight: 0.3 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000003', TemplateID: 'F0000000-0000-0000-0000-000000000001', CriteriaName: 'UI/UX', Weight: 0.3 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000004', TemplateID: 'F0000000-0000-0000-0000-000000000002', CriteriaName: 'AI Accuracy', Weight: 0.4 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000005', TemplateID: 'F0000000-0000-0000-0000-000000000002', CriteriaName: 'Model Performance', Weight: 0.3 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000006', TemplateID: 'F0000000-0000-0000-0000-000000000002', CriteriaName: 'Business Impact', Weight: 0.3 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000007', TemplateID: 'F0000000-0000-0000-0000-000000000003', CriteriaName: 'User Experience', Weight: 0.35 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000008', TemplateID: 'F0000000-0000-0000-0000-000000000003', CriteriaName: 'Performance', Weight: 0.35 },
  { CriteriaID: 'CC000000-0000-0000-0000-000000000009', TemplateID: 'F0000000-0000-0000-0000-000000000003', CriteriaName: 'Code Quality', Weight: 0.3 },
];

export const mockSubmissions: Submission[] = [
  // Event 1 - Preliminary
  { SubmissionID: 'D0000000-0000-0000-0000-000000000001', TeamID: '70000000-0000-0000-0000-000000000001', RoundID: 'A0000000-0000-0000-0000-000000000001', RepositoryURL: 'https://github.com/phoenix-ai/project-v1', DemoURL: 'https://youtube.com/phoenix-demo-1', SlideURL: 'https://drive.google.com/phoenix-slide-1', SubmittedAt: '2026-03-19 14:00:00', Status: 'Graded' },
  { SubmissionID: 'D0000000-0000-0000-0000-000000000002', TeamID: '70000000-0000-0000-0000-000000000002', RoundID: 'A0000000-0000-0000-0000-000000000001', RepositoryURL: 'https://github.com/beta-coders/web-project', DemoURL: 'https://youtube.com/beta-demo-1', SlideURL: 'https://drive.google.com/beta-slide-1', SubmittedAt: '2026-03-19 15:30:00', Status: 'Graded' },
  // Event 1 - Semi Final
  { SubmissionID: 'D0000000-0000-0000-0000-000000000003', TeamID: '70000000-0000-0000-0000-000000000001', RoundID: 'A0000000-0000-0000-0000-000000000002', RepositoryURL: 'https://github.com/phoenix-ai/project-v2', DemoURL: 'https://youtube.com/phoenix-demo-2', SlideURL: 'https://drive.google.com/phoenix-slide-2', SubmittedAt: '2026-04-02 10:00:00', Status: 'Graded' },
  { SubmissionID: 'D0000000-0000-0000-0000-000000000004', TeamID: '70000000-0000-0000-0000-000000000002', RoundID: 'A0000000-0000-0000-0000-000000000002', RepositoryURL: 'https://github.com/beta-coders/web-project-v2', DemoURL: 'https://youtube.com/beta-demo-2', SlideURL: 'https://drive.google.com/beta-slide-2', SubmittedAt: '2026-04-02 11:00:00', Status: 'Graded' },
  // Event 1 - Final
  { SubmissionID: 'D0000000-0000-0000-0000-000000000005', TeamID: '70000000-0000-0000-0000-000000000001', RoundID: 'A0000000-0000-0000-0000-000000000003', RepositoryURL: 'https://github.com/phoenix-ai/project-final', DemoURL: 'https://youtube.com/phoenix-demo-final', SlideURL: 'https://drive.google.com/phoenix-slide-final', SubmittedAt: '2026-04-18 09:00:00', Status: 'Graded' },
  { SubmissionID: 'D0000000-0000-0000-0000-000000000006', TeamID: '70000000-0000-0000-0000-000000000002', RoundID: 'A0000000-0000-0000-0000-000000000003', RepositoryURL: 'https://github.com/beta-coders/web-project-final', DemoURL: 'https://youtube.com/beta-demo-final', SlideURL: 'https://drive.google.com/beta-slide-final', SubmittedAt: '2026-04-18 10:00:00', Status: 'Disqualified' }, // Disqualified due to low score comparison
  // Event 2 - Preliminary
  { SubmissionID: 'D0000000-0000-0000-0000-000000000007', TeamID: '70000000-0000-0000-0000-000000000001', RoundID: 'A0000000-0000-0000-0000-000000000004', RepositoryURL: 'https://github.com/phoenix-ai/blockchain-project', DemoURL: 'https://youtube.com/phoenix-demo-3', SlideURL: 'https://drive.google.com/phoenix-slide-3', SubmittedAt: '2026-06-18 13:00:00', Status: 'Graded' },
  { SubmissionID: 'D0000000-0000-0000-0000-000000000008', TeamID: '70000000-0000-0000-0000-000000000002', RoundID: 'A0000000-0000-0000-0000-000000000004', RepositoryURL: 'https://github.com/beta-coders/web-v3', DemoURL: 'https://youtube.com/beta-demo-3', SlideURL: 'https://drive.google.com/beta-slide-3', SubmittedAt: '2026-06-18 14:30:00', Status: 'Graded' },
  // Event 2 - Final
  { SubmissionID: 'D0000000-0000-0000-0000-000000000009', TeamID: '70000000-0000-0000-0000-000000000001', RoundID: 'A0000000-0000-0000-0000-000000000005', RepositoryURL: 'https://github.com/phoenix-ai/blockchain-final', DemoURL: 'https://youtube.com/phoenix-demo-final-2', SlideURL: 'https://drive.google.com/phoenix-slide-final-2', SubmittedAt: '2026-07-08 10:00:00', Status: 'Graded' },
  { SubmissionID: 'D0000000-0000-0000-0000-000000000010', TeamID: '70000000-0000-0000-0000-000000000002', RoundID: 'A0000000-0000-0000-0000-000000000005', RepositoryURL: 'https://github.com/beta-coders/web-final', DemoURL: 'https://youtube.com/beta-demo-final', SlideURL: 'https://drive.google.com/beta-slide-final', SubmittedAt: '2026-07-08 11:00:00', Status: 'Graded' },
  // Event 3 - Preliminary
  { SubmissionID: 'D0000000-0000-0000-0000-000000000011', TeamID: '70000000-0000-0000-0000-000000000001', RoundID: 'A0000000-0000-0000-0000-000000000006', RepositoryURL: 'https://github.com/phoenix-ai/ml-project', DemoURL: 'https://youtube.com/phoenix-demo-4', SlideURL: 'https://drive.google.com/phoenix-slide-4', SubmittedAt: '2026-09-19 15:00:00', Status: 'Graded' },
  { SubmissionID: 'D0000000-0000-0000-0000-000000000012', TeamID: '70000000-0000-0000-0000-000000000002', RoundID: 'A0000000-0000-0000-0000-000000000006', RepositoryURL: 'https://github.com/beta-coders/iot-project', DemoURL: 'https://youtube.com/beta-demo-4', SlideURL: 'https://drive.google.com/beta-slide-4', SubmittedAt: '2026-09-19 16:00:00', Status: 'Disqualified' }, // Plagiarism
];

export const mockScores: Score[] = [
  // Event 1 - Preliminary Round (Phoenix AI - Innovation, Technical, UI/UX)
  { ScoreID: 'D1111111-1111-1111-1111-000000000001', SubmissionID: 'D0000000-0000-0000-0000-000000000001', AssignmentId: 'AAA00001-0001-0001-0001-000000000001', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 9.0, Comment: 'Excellent AI innovation', ScoredAt: '2026-03-21 09:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000002', SubmissionID: 'D0000000-0000-0000-0000-000000000001', AssignmentId: 'AAA00001-0001-0001-0001-000000000001', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.5, Comment: 'Good architecture and scalability', ScoredAt: '2026-03-21 09:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000003', SubmissionID: 'D0000000-0000-0000-0000-000000000001', AssignmentId: 'AAA00001-0001-0001-0001-000000000001', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.0, Comment: 'Nice interface and user experience', ScoredAt: '2026-03-21 09:20:00' },

  // Event 1 - Preliminary Round (Phoenix AI - Scored by Judge 2 as well, to show variance)
  { ScoreID: 'D1111111-1111-1111-1111-000000000001-j2', SubmissionID: 'D0000000-0000-0000-0000-000000000001', AssignmentId: 'AAA00001-0001-0001-0001-000000000002', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.5, Comment: 'Impressive ideas but needs refinement', ScoredAt: '2026-03-21 09:30:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000002-j2', SubmissionID: 'D0000000-0000-0000-0000-000000000001', AssignmentId: 'AAA00001-0001-0001-0001-000000000002', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.8, Comment: 'Very neat tech stack', ScoredAt: '2026-03-21 09:40:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000003-j2', SubmissionID: 'D0000000-0000-0000-0000-000000000001', AssignmentId: 'AAA00001-0001-0001-0001-000000000002', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 7.5, Comment: 'Design could be more polished', ScoredAt: '2026-03-21 09:50:00' },

  // Event 1 - Preliminary Round (Beta Coders - Innovation, Technical, UI/UX)
  { ScoreID: 'D1111111-1111-1111-1111-000000000004', SubmissionID: 'D0000000-0000-0000-0000-000000000002', AssignmentId: 'AAA00001-0001-0001-0001-000000000002', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.5, Comment: 'Good web innovation', ScoredAt: '2026-03-21 10:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000005', SubmissionID: 'D0000000-0000-0000-0000-000000000002', AssignmentId: 'AAA00001-0001-0001-0001-000000000002', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.8, Comment: 'Excellent technical implementation', ScoredAt: '2026-03-21 10:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000006', SubmissionID: 'D0000000-0000-0000-0000-000000000002', AssignmentId: 'AAA00001-0001-0001-0001-000000000002', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.5, Comment: 'Good UI/UX design', ScoredAt: '2026-03-21 10:20:00' },

  // Event 1 - Preliminary Round (Beta Coders - Scored by Judge 1 as well)
  { ScoreID: 'D1111111-1111-1111-1111-000000000004-j1', SubmissionID: 'D0000000-0000-0000-0000-000000000002', AssignmentId: 'AAA00001-0001-0001-0001-000000000001', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.0, Comment: 'Standard web app', ScoredAt: '2026-03-21 10:30:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000005-j1', SubmissionID: 'D0000000-0000-0000-0000-000000000002', AssignmentId: 'AAA00001-0001-0001-0001-000000000001', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.0, Comment: 'Decent code structure', ScoredAt: '2026-03-21 10:40:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000006-j1', SubmissionID: 'D0000000-0000-0000-0000-000000000002', AssignmentId: 'AAA00001-0001-0001-0001-000000000001', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 9.0, Comment: 'Outstanding colors and styling', ScoredAt: '2026-03-21 10:50:00' },

  // Event 1 - Semi Final Round (Phoenix AI)
  { ScoreID: 'D1111111-1111-1111-1111-000000000007', SubmissionID: 'D0000000-0000-0000-0000-000000000003', AssignmentId: 'AAA00001-0001-0001-0001-000000000003', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 9.2, Comment: 'Outstanding AI innovation and improvements', ScoredAt: '2026-04-04 09:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000008', SubmissionID: 'D0000000-0000-0000-0000-000000000003', AssignmentId: 'AAA00001-0001-0001-0001-000000000003', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.8, Comment: 'Excellent technical complexity', ScoredAt: '2026-04-04 09:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000009', SubmissionID: 'D0000000-0000-0000-0000-000000000003', AssignmentId: 'AAA00001-0001-0001-0001-000000000003', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.3, Comment: 'Very good UI improvements', ScoredAt: '2026-04-04 09:20:00' },

  // Event 1 - Semi Final Round (Beta Coders)
  { ScoreID: 'D1111111-1111-1111-1111-000000000010', SubmissionID: 'D0000000-0000-0000-0000-000000000004', AssignmentId: 'AAA00001-0001-0001-0001-000000000004', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.8, Comment: 'Excellent web innovation', ScoredAt: '2026-04-04 10:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000011', SubmissionID: 'D0000000-0000-0000-0000-000000000004', AssignmentId: 'AAA00001-0001-0001-0001-000000000004', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 9.0, Comment: 'Outstanding technical implementation', ScoredAt: '2026-04-04 10:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000012', SubmissionID: 'D0000000-0000-0000-0000-000000000004', AssignmentId: 'AAA00001-0001-0001-0001-000000000004', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.8, Comment: 'Excellent UI/UX', ScoredAt: '2026-04-04 10:20:00' },

  // Event 1 - Final Round (Phoenix AI)
  { ScoreID: 'D1111111-1111-1111-1111-000000000013', SubmissionID: 'D0000000-0000-0000-0000-000000000005', AssignmentId: 'AAA00001-0001-0001-0001-000000000005', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 9.3, Comment: 'Outstanding AI innovation - Champion level', ScoredAt: '2026-04-21 09:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000014', SubmissionID: 'D0000000-0000-0000-0000-000000000005', AssignmentId: 'AAA00001-0001-0001-0001-000000000005', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 9.0, Comment: 'Excellent technical complexity', ScoredAt: '2026-04-21 09:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000015', SubmissionID: 'D0000000-0000-0000-0000-000000000005', AssignmentId: 'AAA00001-0001-0001-0001-000000000005', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.5, Comment: 'Very good UI/UX', ScoredAt: '2026-04-21 09:20:00' },

  // Event 1 - Final Round (Beta Coders)
  { ScoreID: 'D1111111-1111-1111-1111-000000000016', SubmissionID: 'D0000000-0000-0000-0000-000000000006', AssignmentId: 'AAA00001-0001-0001-0001-000000000004', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.9, Comment: 'Excellent web innovation', ScoredAt: '2026-04-21 10:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000017', SubmissionID: 'D0000000-0000-0000-0000-000000000006', AssignmentId: 'AAA00001-0001-0001-0001-000000000004', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.8, Comment: 'Excellent technical implementation', ScoredAt: '2026-04-21 10:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000018', SubmissionID: 'D0000000-0000-0000-0000-000000000006', AssignmentId: 'AAA00001-0001-0001-0001-000000000004', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.7, Comment: 'Very good UI/UX', ScoredAt: '2026-04-21 10:20:00' },

  // Event 2 - Preliminary Round (Phoenix AI)
  { ScoreID: 'D1111111-1111-1111-1111-000000000019', SubmissionID: 'D0000000-0000-0000-0000-000000000007', AssignmentId: 'AAA00001-0001-0001-0001-000000000006', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.5, Comment: 'Good blockchain innovation', ScoredAt: '2026-06-20 10:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000020', SubmissionID: 'D0000000-0000-0000-0000-000000000007', AssignmentId: 'AAA00001-0001-0001-0001-000000000006', CriteriaID: 'CC000000-0000-0000-0000-000000000004', ScoreValue: 8.2, Comment: 'Good technical implementation', ScoredAt: '2026-06-20 10:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000021', SubmissionID: 'D0000000-0000-0000-0000-000000000007', AssignmentId: 'AAA00001-0001-0001-0001-000000000006', CriteriaID: 'CC000000-0000-0000-0000-000000000006', ScoreValue: 7.8, Comment: 'Good design', ScoredAt: '2026-06-20 10:20:00' },

  // Event 2 - Preliminary Round (Beta Coders)
  { ScoreID: 'D1111111-1111-1111-1111-000000000022', SubmissionID: 'D0000000-0000-0000-0000-000000000008', AssignmentId: 'AAA00001-0001-0001-0001-000000000005', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.0, Comment: 'Good web innovation', ScoredAt: '2026-06-20 11:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000023', SubmissionID: 'D0000000-0000-0000-0000-000000000008', AssignmentId: 'AAA00001-0001-0001-0001-000000000005', CriteriaID: 'CC000000-0000-0000-0000-000000000004', ScoreValue: 8.5, Comment: 'Good technical implementation', ScoredAt: '2026-06-20 11:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000024', SubmissionID: 'D0000000-0000-0000-0000-000000000008', AssignmentId: 'AAA00001-0001-0001-0001-000000000005', CriteriaID: 'CC000000-0000-0000-0000-000000000006', ScoreValue: 8.3, Comment: 'Good UI', ScoredAt: '2026-06-20 11:20:00' },

  // Event 2 - Final Round (Phoenix AI)
  { ScoreID: 'D1111111-1111-1111-1111-000000000025', SubmissionID: 'D0000000-0000-0000-0000-000000000009', AssignmentId: 'AAA00001-0001-0001-0001-000000000007', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 9.0, Comment: 'Excellent blockchain innovation', ScoredAt: '2026-07-10 09:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000026', SubmissionID: 'D0000000-0000-0000-0000-000000000009', AssignmentId: 'AAA00001-0001-0001-0001-000000000007', CriteriaID: 'CC000000-0000-0000-0000-000000000004', ScoreValue: 8.8, Comment: 'Excellent technical complexity', ScoredAt: '2026-07-10 09:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000027', SubmissionID: 'D0000000-0000-0000-0000-000000000009', AssignmentId: 'AAA00001-0001-0001-0001-000000000007', CriteriaID: 'CC000000-0000-0000-0000-000000000006', ScoreValue: 8.5, Comment: 'Good design', ScoredAt: '2026-07-10 09:20:00' },

  // Event 2 - Final Round (Beta Coders)
  { ScoreID: 'D1111111-1111-1111-1111-000000000028', SubmissionID: 'D0000000-0000-0000-0000-000000000010', AssignmentId: 'AAA00001-0001-0001-0001-000000000008', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.8, Comment: 'Excellent web innovation', ScoredAt: '2026-07-10 10:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000029', SubmissionID: 'D0000000-0000-0000-0000-000000000010', AssignmentId: 'AAA00001-0001-0001-0001-000000000008', CriteriaID: 'CC000000-0000-0000-0000-000000000004', ScoreValue: 8.7, Comment: 'Excellent technical implementation', ScoredAt: '2026-07-10 10:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000030', SubmissionID: 'D0000000-0000-0000-0000-000000000010', AssignmentId: 'AAA00001-0001-0001-0001-000000000008', CriteriaID: 'CC000000-0000-0000-0000-000000000006', ScoreValue: 8.6, Comment: 'Good UI', ScoredAt: '2026-07-10 10:20:00' },

  // Event 3 - Preliminary Round (Phoenix AI)
  { ScoreID: 'D1111111-1111-1111-1111-000000000031', SubmissionID: 'D0000000-0000-0000-0000-000000000011', AssignmentId: 'AAA00001-0001-0001-0001-000000000007', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 9.0, Comment: 'Excellent ML innovation', ScoredAt: '2026-09-21 10:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000032', SubmissionID: 'D0000000-0000-0000-0000-000000000011', AssignmentId: 'AAA00001-0001-0001-0001-000000000007', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.8, Comment: 'Excellent model implementation', ScoredAt: '2026-09-21 10:10:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000033', SubmissionID: 'D0000000-0000-0000-0000-000000000011', AssignmentId: 'AAA00001-0001-0001-0001-000000000007', CriteriaID: 'CC000000-0000-0000-0000-000000000003', ScoreValue: 8.3, Comment: 'Good visualization', ScoredAt: '2026-09-21 10:20:00' },

  // Event 3 - Preliminary Round (Beta Coders)
  { ScoreID: 'D1111111-1111-1111-1111-000000000034', SubmissionID: 'D0000000-0000-0000-0000-000000000012', AssignmentId: 'AAA00001-0001-0001-0001-000000000008', CriteriaID: 'CC000000-0000-0000-0000-000000000001', ScoreValue: 8.2, Comment: 'Good IoT innovation', ScoredAt: '2026-09-21 11:00:00' },
  { ScoreID: 'D1111111-1111-1111-1111-000000000035', SubmissionID: 'D0000000-0000-0000-0000-000000000012', AssignmentId: 'AAA00001-0001-0001-0001-000000000008', CriteriaID: 'CC000000-0000-0000-0000-000000000002', ScoreValue: 8.0, Comment: 'Good technical implementation', ScoredAt: '2026-09-21 11:10:00' },
];

export const mockCalibrationScores: CalibrationScore[] = [
  { CalibrationId: 'CAC00001-0001-0001-0001-000000000001', JudgeID: '00000000-0000-0000-0000-000000000011', CriteriaID: 'CC000000-0000-0000-0000-000000000001', SubmissionID: 'D0000000-0000-0000-0000-000000000001', ScoreValue: 9.0 },
  { CalibrationId: 'CAC00001-0001-0001-0001-000000000002', JudgeID: '00000000-0000-0000-0000-000000000012', CriteriaID: 'CC000000-0000-0000-0000-000000000001', SubmissionID: 'D0000000-0000-0000-0000-000000000001', ScoreValue: 8.5 },
  { CalibrationId: 'CAC00001-0001-0001-0001-000000000003', JudgeID: '00000000-0000-0000-0000-000000000011', CriteriaID: 'CC000000-0000-0000-0000-000000000001', SubmissionID: 'D0000000-0000-0000-0000-000000000005', ScoreValue: 9.3 },
  { CalibrationId: 'CAC00001-0001-0001-0001-000000000004', JudgeID: '00000000-0000-0000-0000-000000000012', CriteriaID: 'CC000000-0000-0000-0000-000000000001', SubmissionID: 'D0000000-0000-0000-0000-000000000005', ScoreValue: 9.0 },
];

export const mockAdvancementRules: AdvancementRule[] = [
  { RuleId: 'B0000000-0000-0000-0000-000000000001', RoundId: 'A0000000-0000-0000-0000-000000000001', CategoryId: 'C0000000-0000-0000-0000-000000000001', TopN: 2 },
  { RuleId: 'B0000000-0000-0000-0000-000000000002', RoundId: 'A0000000-0000-0000-0000-000000000001', CategoryId: 'C0000000-0000-0000-0000-000000000003', TopN: 2 },
  { RuleId: 'B0000000-0000-0000-0000-000000000003', RoundId: 'A0000000-0000-0000-0000-000000000002', CategoryId: 'C0000000-0000-0000-0000-000000000003', TopN: 1 },
  { RuleId: 'B0000000-0000-0000-0000-000000000004', RoundId: 'A0000000-0000-0000-0000-000000000004', CategoryId: 'C0000000-0000-0000-0000-000000000004', TopN: 1 },
];

export const mockEliminations: Elimination[] = [
  { EliminationId: 'E0000000-0000-0000-0000-000000000001', SubmissionId: 'D0000000-0000-0000-0000-000000000006', UserId: '00000000-0000-0000-0000-000000000013', Reason: 'Lower total score in final round comparison', EliminatedAt: '2026-04-22 11:00:00' },
  { EliminationId: 'E0000000-0000-0000-0000-000000000002', SubmissionId: 'D0000000-0000-0000-0000-000000000012', UserId: '00000000-0000-0000-0000-000000000014', Reason: 'Plagiarism detected in repository source code (copying UI component library codes without accreditation)', EliminatedAt: '2026-09-22 14:30:00' },
];

export const mockAuditLogs: AuditLog[] = [
  { LogID: 'AAA00001-0001-0001-0001-000000000001', UserID: '00000000-0000-0000-0000-000000000013', ActionType: 'EVENT_CREATE', OldValue: null, NewValue: '{"EventName":"SEAL Spring 2026"}', CreatedAt: '2026-01-01 08:00:00' },
  { LogID: 'AAA00001-0001-0001-0001-000000000002', UserID: '00000000-0000-0000-0000-000000000013', ActionType: 'EVENT_CREATE', OldValue: null, NewValue: '{"EventName":"SEAL Summer 2026"}', CreatedAt: '2026-05-01 08:00:00' },
  { LogID: 'AAA00001-0001-0001-0001-000000000003', UserID: '00000000-0000-0000-0000-000000000014', ActionType: 'EVENT_CREATE', OldValue: null, NewValue: '{"EventName":"SEAL Fall 2026"}', CreatedAt: '2026-08-01 08:00:00' },
  { LogID: 'AAA00001-0001-0001-0001-000000000004', UserID: '00000000-0000-0000-0000-000000000001', ActionType: 'TEAM_CREATE', OldValue: null, NewValue: '{"TeamName":"Phoenix AI"}', CreatedAt: '2026-02-15 09:00:00' },
  { LogID: 'AAA00001-0001-0001-0001-000000000005', UserID: '00000000-0000-0000-0000-000000000005', ActionType: 'TEAM_CREATE', OldValue: null, NewValue: '{"TeamName":"Beta Coders"}', CreatedAt: '2026-02-14 09:00:00' },
  { LogID: 'AAA00001-0001-0001-0001-000000000006', UserID: '00000000-0000-0000-0000-000000000001', ActionType: 'SUBMISSION_CREATE', OldValue: null, NewValue: '{"Repository":"phoenix-ai/project-v1"}', CreatedAt: '2026-03-19 14:00:00' },
  { LogID: 'AAA00001-0001-0001-0001-000000000007', UserID: '00000000-0000-0000-0000-000000000005', ActionType: 'SUBMISSION_CREATE', OldValue: null, NewValue: '{"Repository":"beta-coders/web-project"}', CreatedAt: '2026-03-19 15:30:00' },
];

export const mockRankings: Ranking[] = [
  { RankingId: 'A1000000-0000-0000-0000-000000000001', TeamId: '70000000-0000-0000-0000-000000000002', RoundId: 'A0000000-0000-0000-0000-000000000001', RankPosition: 1, TotalScore: 25.80 },
  { RankingId: 'A1000000-0000-0000-0000-000000000002', TeamId: '70000000-0000-0000-0000-000000000001', RoundId: 'A0000000-0000-0000-0000-000000000001', RankPosition: 2, TotalScore: 25.50 },
  { RankingId: 'A1000000-0000-0000-0000-000000000003', TeamId: '70000000-0000-0000-0000-000000000002', RoundId: 'A0000000-0000-0000-0000-000000000002', RankPosition: 1, TotalScore: 26.60 },
  { RankingId: 'A1000000-0000-0000-0000-000000000004', TeamId: '70000000-0000-0000-0000-000000000001', RoundId: 'A0000000-0000-0000-0000-000000000002', RankPosition: 2, TotalScore: 26.30 },
  { RankingId: 'A1000000-0000-0000-0000-000000000005', TeamId: '70000000-0000-0000-0000-000000000001', RoundId: 'A0000000-0000-0000-0000-000000000003', RankPosition: 1, TotalScore: 26.80 },
  { RankingId: 'A1000000-0000-0000-0000-000000000006', TeamId: '70000000-0000-0000-0000-000000000002', RoundId: 'A0000000-0000-0000-0000-000000000003', RankPosition: 2, TotalScore: 26.40 },
  { RankingId: 'A1000000-0000-0000-0000-000000000007', TeamId: '70000000-0000-0000-0000-000000000002', RoundId: 'A0000000-0000-0000-0000-000000000004', RankPosition: 1, TotalScore: 24.80 },
  { RankingId: 'A1000000-0000-0000-0000-000000000008', TeamId: '70000000-0000-0000-0000-000000000001', RoundId: 'A0000000-0000-0000-0000-000000000004', RankPosition: 2, TotalScore: 24.50 },
];

export const mockAnnouncements: Announcement[] = [
  {
    AnnouncementID: 'N001',
    Title: 'Mở cổng nộp bài Vòng Chung Kết SEAL Summer 2026',
    Content: 'Hệ thống đã chính thức mở cổng nộp bài cho Vòng Chung Kết mùa Summer 2026. Hạn cuối nộp liên kết Repository, Video Demo và Slide thuyết trình là 23:59 ngày 10/07/2026. Các đội trưởng lưu ý cập nhật thông tin chính xác qua Cổng Trưởng nhóm.',
    Type: 'info',
    PublishedAt: '2026-07-01 08:00:00',
    EventID: 'E0000000-0000-0000-0000-000000000002',
    RoundID: 'A0000000-0000-0000-0000-000000000005'
  },
  {
    AnnouncementID: 'N002',
    Title: 'Công bố Kết quả Vòng Sơ Loại SEAL Summer 2026',
    Content: 'Ban tổ chức công bố bảng xếp hạng chính thức của Vòng Sơ Loại SEAL Summer 2026 hạng mục Blockchain Solution. Xin chúc mừng đội Beta Coders dẫn đầu với tổng điểm 24.8, tiếp theo là Phoenix AI với 24.5. Cả hai đội chính thức bước vào Vòng Chung Kết!',
    Type: 'success',
    PublishedAt: '2026-06-26 15:30:00',
    EventID: 'E0000000-0000-0000-0000-000000000002',
    RoundID: 'A0000000-0000-0000-0000-000000000004'
  },
  {
    AnnouncementID: 'N003',
    Title: 'Cảnh cáo và Loại Đội thi vi phạm quy chế SEAL Fall 2026',
    Content: 'Ban tổ chức rất tiếc phải thông báo quyết định loại đội thi Beta Coders khỏi hạng mục IoT Solution ở Vòng Sơ loại SEAL Fall 2026 do hệ thống và hội đồng chuyên môn phát hiện hành vi sao chép mã nguồn (Plagiarism) trong dự án nộp ngày 19/09/2026.',
    Type: 'danger',
    PublishedAt: '2026-09-22 14:30:00',
    EventID: 'E0000000-0000-0000-0000-000000000003',
    RoundID: 'A0000000-0000-0000-0000-000000000006'
  },
  {
    AnnouncementID: 'N004',
    Title: 'Vinh danh Nhà Vô Địch SEAL Spring 2026',
    Content: 'Trận chung kết SEAL Spring 2026 đã khép lại thành công rực rỡ! Ngôi vị Quán quân đã chính thức thuộc về Phoenix AI với dự án AI Solution xuất sắc đạt 26.8 điểm. Giải Á quân thuộc về Beta Coders hạng mục Web Application với 26.4 điểm.',
    Type: 'success',
    PublishedAt: '2026-04-26 10:00:00',
    EventID: 'E0000000-0000-0000-0000-000000000001'
  },
  {
    AnnouncementID: 'N005',
    Title: 'Thông tin Thể lệ & Trọng số Điểm thi SEAL Hackathon 2026',
    Content: 'Thể lệ cuộc thi SEAL Hackathon 2026 yêu cầu các dự án phải giải quyết các vấn đề thực tiễn. Trọng số chấm điểm vòng Chung kết cho các hạng mục: Hạng mục AI Solution tập trung vào Độ chính xác AI (40%) và Hiệu suất mô hình (30%). Hạng mục Web Application tập trung vào Sự cải tiến (40%) và Độ phức tạp công nghệ (30%). Chi tiết được hiển thị tại tab Thể lệ mục tiêu.',
    Type: 'info',
    PublishedAt: '2026-03-01 09:00:00'
  }
];

export const mockDetailedCompetitions: DetailedCompetition[] = [
  {
    ID: 'DC001',
    Name: 'Cuộc thi Sáng tạo Công nghệ 2026',
    Description: 'Tìm kiếm các giải pháp công nghệ số sáng tạo giúp tối ưu hóa cuộc sống và học tập thường nhật của học sinh, sinh viên.',
    Category: 'Technology',
    CategoryLabel: 'Công nghệ',
    Status: 'open',
    Deadline: '25/07/2026',
    Format: 'Online',
    Audience: 'Sinh viên',
    Organizer: 'FPT University',
    Prize: '50.000.000 VND',
    BannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    DaysLeft: 24,
    IsFeatured: true
  },
  {
    ID: 'DC002',
    Name: 'Olympic Tin học Sinh viên Toàn quốc',
    Description: 'Kỳ thi học thuật thường niên lớn nhất dành cho sinh viên ngành Công nghệ thông tin nhằm khẳng định năng lực thuật toán và lập trình.',
    Category: 'Academic',
    CategoryLabel: 'Học thuật',
    Status: 'open',
    Deadline: '30/07/2026',
    Format: 'Offline',
    Audience: 'Sinh viên',
    Organizer: 'Hội Tin học Việt Nam',
    Prize: '30.000.000 VND',
    BannerUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&auto=format&fit=crop&q=80',
    DaysLeft: 29,
    IsFeatured: true
  },
  {
    ID: 'DC003',
    Name: 'Ý tưởng Khởi nghiệp Trẻ 2026',
    Description: 'Bệ phóng cho các dự án kinh doanh sáng tạo và tinh thần khởi nghiệp Agile bền vững của thế hệ trẻ.',
    Category: 'Startup',
    CategoryLabel: 'Khởi nghiệp',
    Status: 'expiring',
    Deadline: '03/07/2026',
    Format: 'Hybrid',
    Audience: 'Tất cả',
    Organizer: 'FPT Enterprise',
    Prize: '100.000.000 VND',
    BannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    DaysLeft: 2,
    IsFeatured: true
  },
  {
    ID: 'DC004',
    Name: 'Thiết kế Poster Truyền thông Xanh',
    Description: 'Nơi thể hiện tư duy thẩm mỹ và lan tỏa thông điệp bảo vệ môi trường thông qua tác phẩm thiết kế đồ họa độc đáo.',
    Category: 'Design',
    CategoryLabel: 'Thiết kế',
    Status: 'open',
    Deadline: '06/07/2026',
    Format: 'Online',
    Audience: 'Học sinh',
    Organizer: 'FPT Arena',
    Prize: '15.000.000 VND',
    BannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    DaysLeft: 5,
    IsFeatured: false
  },
  {
    ID: 'DC005',
    Name: 'Cuộc thi Hùng biện Tiếng Anh Global Voices',
    Description: 'Thử thách kỹ năng hùng biện bằng tiếng Anh, tư duy biện luận phản biện và sự tự tin thể hiện góc nhìn cá nhân trước thế giới.',
    Category: 'Language',
    CategoryLabel: 'Ngoại ngữ',
    Status: 'upcoming',
    Deadline: '01/08/2026',
    Format: 'Offline',
    Audience: 'Tất cả',
    Organizer: 'Global Education',
    Prize: '25.000.000 VND',
    BannerUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
    DaysLeft: 31,
    IsFeatured: false
  },
  {
    ID: 'DC006',
    Name: 'Nghiên cứu Khoa học Sinh viên Lần XV',
    Description: 'Khuyến khích hoạt động nghiên cứu khoa học chuyên sâu và ứng dụng thực tiễn giải pháp mới trong đời sống xã hội.',
    Category: 'Science',
    CategoryLabel: 'Khoa học',
    Status: 'closed',
    Deadline: '20/06/2026',
    Format: 'Hybrid',
    Audience: 'Sinh viên',
    Organizer: 'Bộ Giáo dục & Đào tạo',
    Prize: '40.000.000 VND',
    BannerUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    DaysLeft: 0,
    IsFeatured: false
  }
];



// Active source config (mock vs live API)
let useLiveApi = false;
const BASE_URL = 'http://localhost:5279/api';

export const isLiveApiEnabled = () => useLiveApi;
export const setLiveApi = (enabled: boolean) => {
  useLiveApi = enabled;
};

// Asynchronous simulation helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Statistics utilities for RBL (Research-Based Learning)
export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateVariance = (values: number[]): number => {
  if (values.length <= 1) return 0;
  const mean = calculateMean(values);
  const sumOfSquares = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return sumOfSquares / (values.length - 1); // Sample variance
};

export const calculateStdDev = (values: number[]): number => {
  return Math.sqrt(calculateVariance(values));
};

// API calls with simulated latency (1000ms) for skeletal loading states
export async function getEvents(): Promise<Event[]> {
  await delay(800);
  if (useLiveApi) {
    try {
      const res = await fetch(`${BASE_URL}/Event`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Live API error, falling back to mock:', e);
    }
  }
  return mockEvents;
}

export async function getRounds(eventId?: string): Promise<Round[]> {
  await delay(800);
  if (useLiveApi) {
    try {
      const url = eventId ? `${BASE_URL}/Round?eventId=${eventId}` : `${BASE_URL}/Round`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Live API error, falling back to mock:', e);
    }
  }
  return eventId ? mockRounds.filter(r => r.EventID === eventId) : mockRounds;
}

export async function getCategories(eventId?: string): Promise<Category[]> {
  await delay(800);
  if (useLiveApi) {
    try {
      const url = eventId ? `${BASE_URL}/Category?eventId=${eventId}` : `${BASE_URL}/Category`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Live API error, falling back to mock:', e);
    }
  }
  return eventId ? mockCategories.filter(c => c.EventID === eventId) : mockCategories;
}

export async function getTeams(): Promise<Team[]> {
  await delay(800);
  if (useLiveApi) {
    try {
      const res = await fetch(`${BASE_URL}/Teams`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Live API error, falling back to mock:', e);
    }
  }
  return mockTeams;
}

export async function getTeamMembers(teamId: string): Promise<(TeamMember & { User: User; StudentProfile?: StudentProfile })[]> {
  await delay(500);
  const members = mockTeamMembers.filter(m => m.TeamID === teamId);
  return members.map(m => {
    const user = mockUsers.find(u => u.UserID === m.UserId)!;
    const profile = mockStudentProfiles.find(p => p.UserID === m.UserId);
    return {
      ...m,
      User: user,
      StudentProfile: profile
    };
  });
}

export async function getSubmissions(roundId?: string): Promise<(Submission & { Team: Team })[]> {
  await delay(800);
  if (useLiveApi) {
    try {
      const res = await fetch(`${BASE_URL}/Submissions`);
      if (res.ok) {
        const data: Submission[] = await res.json();
        const teams = await getTeams();
        return data.map(sub => ({
          ...sub,
          Team: teams.find(t => t.TeamID === sub.TeamID) || mockTeams[0]
        }));
      }
    } catch (e) {
      console.warn('Live API error, falling back to mock:', e);
    }
  }
  const subs = roundId ? mockSubmissions.filter(s => s.RoundID === roundId) : mockSubmissions;
  return subs.map(s => ({
    ...s,
    Team: mockTeams.find(t => t.TeamID === s.TeamID)!
  }));
}

export async function getScores(submissionId: string): Promise<(Score & { Judge: User; Criteria: Criteria })[]> {
  await delay(600);
  const scores = mockScores.filter(s => s.SubmissionID === submissionId);
  return scores.map(s => {
    const assignment = mockUsers.find(u => u.Role === 'Judge'); // Placeholder mapping if assignment id not directly matched
    // Find criteria
    const criteria = mockCriteria.find(c => c.CriteriaID === s.CriteriaID)!;
    // Map judge: Judge 1 is Lê Minh Hải, Judge 2 is Trần Bảo Lâm
    const isJudge2 = s.ScoreID.includes('-j2') || s.AssignmentId.includes('0002') || s.AssignmentId.includes('0004') || s.AssignmentId.includes('0008');
    const judge = isJudge2 
      ? mockUsers.find(u => u.Email.includes('judge.internal2'))!
      : mockUsers.find(u => u.Email.includes('judge.internal1'))!;
    
    return {
      ...s,
      Judge: judge,
      Criteria: criteria
    };
  });
}

export async function getCalibrationScores(): Promise<(CalibrationScore & { Judge: User; Criteria: Criteria; Submission: Submission; Team: Team })[]> {
  await delay(800);
  return mockCalibrationScores.map(c => {
    const judge = c.JudgeID.includes('11')
      ? mockUsers.find(u => u.Email.includes('judge.internal1'))!
      : mockUsers.find(u => u.Email.includes('judge.internal2'))!;
    const criteria = mockCriteria.find(cr => cr.CriteriaID === c.CriteriaID)!;
    const submission = mockSubmissions.find(s => s.SubmissionID === c.SubmissionID)!;
    const team = mockTeams.find(t => t.TeamID === submission.TeamID)!;
    return {
      ...c,
      Judge: judge,
      Criteria: criteria,
      Submission: submission,
      Team: team
    };
  });
}

export async function getAdvancementRules(roundId?: string): Promise<AdvancementRule[]> {
  await delay(600);
  if (useLiveApi) {
    try {
      const res = await fetch(`${BASE_URL}/AdvancementRule`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Live API error, falling back to mock:', e);
    }
  }
  return roundId ? mockAdvancementRules.filter(r => r.RoundId === roundId) : mockAdvancementRules;
}

export async function getEliminations(): Promise<(Elimination & { Submission: Submission; Team: Team; Coordinator: User })[]> {
  await delay(800);
  return mockEliminations.map(e => {
    const submission = mockSubmissions.find(s => s.SubmissionID === e.SubmissionId)!;
    const team = mockTeams.find(t => t.TeamID === submission.TeamID)!;
    const coordinator = mockUsers.find(u => u.UserID === e.UserId)!;
    return {
      ...e,
      Submission: submission,
      Team: team,
      Coordinator: coordinator
    };
  });
}

export async function getAuditLogs(): Promise<(AuditLog & { User: User })[]> {
  await delay(800);
  return mockAuditLogs.map(l => {
    const user = mockUsers.find(u => u.UserID === l.UserID)!;
    return {
      ...l,
      User: user
    };
  });
}

export async function getRankings(roundId?: string): Promise<(Ranking & { Team: Team })[]> {
  await delay(600);
  const ranks = roundId ? mockRankings.filter(r => r.RoundId === roundId) : mockRankings;
  return ranks.map(r => ({
    ...r,
    Team: mockTeams.find(t => t.TeamID === r.TeamId)!
  }));
}

export async function getAnnouncements(eventId?: string): Promise<Announcement[]> {
  await delay(600);
  return eventId ? mockAnnouncements.filter(a => a.EventID === eventId) : mockAnnouncements;
}

export async function getDetailedCompetitions(): Promise<DetailedCompetition[]> {
  await delay(500);
  return mockDetailedCompetitions;
}


