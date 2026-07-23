-- =========================================================
-- SEED DATA SCRIPT - SEAL Hackathon
-- Schema aligned with backend/DAL/Database/Entities
-- Password for all users: 123456
-- All event & operational dates start from 23/07/2026 onwards
--
-- Structure:
-- - 6 Events (Spring 2026, Summer 2026, Fall 2026, Winter 2026, Master 2026, Hackathon 2026)
-- - 3 Teams (Phoenix AI, Beta Coders, Delta Devs)
-- - 3 Mentors (Tony AI, Hannah Web, David Mobile)
-- =========================================================
USE SEAL_Hackathon;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- Clear existing data (in reverse dependency order)
    DELETE FROM MentoringFeedbacks;
    DELETE FROM MentorBookings;
    DELETE FROM MentorSchedules;
    DELETE FROM TeamApplications;
    DELETE FROM TeamRecruitments;
    DELETE FROM UserSkills;
    DELETE FROM Scores;
    DELETE FROM CalibrationScores;
    DELETE FROM Eliminations;
    DELETE FROM Rankings;
    DELETE FROM AdvancementRules;
    DELETE FROM EventCriteria;
    DELETE FROM JudgeAssignments;
    DELETE FROM Submissions;
    DELETE FROM SubmissionAssets;
    DELETE FROM TeamMembers;
    DELETE FROM Teams;
    DELETE FROM EventParticipants;
    DELETE FROM CategoryMentors;
    DELETE FROM Notifications;
    DELETE FROM AuditLogs;
    DELETE FROM StudentProfiles;
    DELETE FROM Criteria;
    DELETE FROM Categories;
    DELETE FROM Rounds;
    DELETE FROM SubmissionTemplates;
    DELETE FROM Events;
    DELETE FROM RefreshTokens;
    DELETE FROM Users;

    -- =========================================================
    -- 1. USERS AND STUDENT PROFILES
    -- =========================================================
    INSERT INTO Users (UserID, Email, Password, FullName, Phone, ShortId, Role, AccountStatus, CreatedAt) VALUES
    -- Team leaders (3 teams)
    ('00000000-0000-0000-0000-000000000001','leader.phoenix@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Daniel Tran','0901000001','TM0001','TeamLeader','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000005','leader.beta@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Henry Pham','0901000005','TM0002','TeamLeader','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000020','leader.delta@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Michael Vu','0901000020','TM0020','TeamLeader','Active','2026-07-23 08:00:00'),

    -- Team members - Phoenix AI (3 members)
    ('00000000-0000-0000-0000-000000000002','member.phoenix1@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Noah Nguyen','0901000002','TM0003','TeamMember','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000003','member.phoenix2@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Leo Le','0901000003','TM0004','TeamMember','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000004','member.phoenix3@uit.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Kevin Vo','0901000004','TM0005','TeamMember','Active','2026-07-23 08:00:00'),

    -- Team members - Beta Coders (3 members)
    ('00000000-0000-0000-0000-000000000006','member.beta1@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Brian Truong','0901000006','TM0006','TeamMember','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000007','member.beta2@hcmus.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Tristan Dang','0901000007','TM0007','TeamMember','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000008','member.beta3@hcmute.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Logan Bui','0901000008','TM0008','TeamMember','Active','2026-07-23 08:00:00'),

    -- Team members - Delta Devs (3 members)
    ('00000000-0000-0000-0000-000000000021','member.delta1@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Olivia Tran','0901000021','TM0021','TeamMember','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000022','member.delta2@uit.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Ethan Hoang','0901000022','TM0022','TeamMember','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000023','member.delta3@hcmus.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Sophia Phan','0901000023','TM0023','TeamMember','Active','2026-07-23 08:00:00'),

    -- Mentors (3 mentors - AI, Web, Mobile)
    ('00000000-0000-0000-0000-000000000009','mentor.ai@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Tony Pham','0901000009','ME0001','Mentor','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000010','mentor.web@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Hannah Nguyen','0901000010','ME0002','Mentor','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000024','mentor.mobile@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'David Lee','0901000024','ME0003','Mentor','Active','2026-07-23 08:00:00'),

    -- Judges
    ('00000000-0000-0000-0000-000000000011','judge.internal1@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Harry Le','0901000011','JU0001','Judge','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000012','judge.internal2@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Lam Tran','0901000012','JU0002','Judge','Active','2026-07-23 08:00:00'),

    -- Event coordinators
    ('00000000-0000-0000-0000-000000000013','coordinator.se@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Casey Tran','0901000013','CO0001','Coordinator','Active','2026-07-23 08:00:00'),
    ('00000000-0000-0000-0000-000000000014','coordinator.pdp@fpt.edu.vn','$2a$12$AWgb9KdKy9sz7BM4KUxXxuH0tPdjFNp.ccFtpnmgB.Zfjv8zXaufm',N'Morgan Nguyen','0901000014','CO0002','Coordinator','Active','2026-07-23 08:00:00');

    INSERT INTO StudentProfiles (ProfileID, UserID, StudentType, StudentCode, UniversityName) VALUES
    -- Phoenix AI team
    ('A1111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'FPT', 'SE170001', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000002', 'FPT', 'SE170002', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000003', 'FPT', 'SE170003', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000004', 'External', 'UIT001', 'University of Information Technology'),
    -- Beta Coders team
    ('A1111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000005', 'FPT', 'SE170010', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111106', '00000000-0000-0000-0000-000000000006', 'FPT', 'SE170011', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111107', '00000000-0000-0000-0000-000000000007', 'External', 'HCMUS001', 'University of Science HCMC'),
    ('A1111111-1111-1111-1111-111111111108', '00000000-0000-0000-0000-000000000008', 'External', 'UTE001', 'HCMC University of Technology and Education'),
    -- Delta Devs team
    ('A1111111-1111-1111-1111-111111111120', '00000000-0000-0000-0000-000000000020', 'FPT', 'SE170020', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111121', '00000000-0000-0000-0000-000000000021', 'FPT', 'SE170021', 'FPT University'),
    ('A1111111-1111-1111-1111-111111111122', '00000000-0000-0000-0000-000000000022', 'External', 'UIT002', 'University of Information Technology'),
    ('A1111111-1111-1111-1111-111111111123', '00000000-0000-0000-0000-000000000023', 'External', 'HCMUS002', 'University of Science HCMC');

    -- =========================================================
    -- 2. EVENTS (6 Events) - Starting on 23/07/2026
    -- =========================================================
    -- Event 1: SEAL Spring 2026 (Phoenix AI joins, Tony mentor)
    INSERT INTO Events (
        EventID, EventName, Season, Year, Description, StartDate, EndDate,
        Status, IsPublished, PublishedAt, PublishedBy, IsFeatured,
        BannerUrl, Organizer, Format, Audience, Prize, IsDeleted
    ) VALUES
    (
        'E0000000-0000-0000-0000-000000000001',
        'SEAL Spring 2026',
        'Spring',
        2026,
        N'Software Engineering Agile League Spring 2026 for Web, Mobile, and AI product development.',
        '2026-07-23',
        '2026-09-30',
        'Published',
        1,
        '2026-07-23 08:00:00',
        '00000000-0000-0000-0000-000000000013',
        0,
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=80',
        N'FPT University - Software Engineering Department',
        'Hybrid',
        'Students',
        N'Total prize 30,000,000 VND',
        0
    ),
    -- Event 2: SEAL Summer 2026 (Beta Coders joins, Hannah mentor)
    (
        'E0000000-0000-0000-0000-000000000002',
        'SEAL Summer 2026',
        'Summer',
        2026,
        N'Software Engineering Agile League Summer 2026 focused on Blockchain and advanced Web products.',
        '2026-07-23',
        '2026-09-30',
        'Published',
        1,
        '2026-07-23 08:00:00',
        '00000000-0000-0000-0000-000000000013',
        1,
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
        N'FPT University - SEAL Hackathon Committee',
        'Online',
        'Students',
        N'Total prize 50,000,000 VND',
        0
    ),
    -- Event 3: SEAL Fall 2026 (Beta Coders joins, Hannah mentor)
    (
        'E0000000-0000-0000-0000-000000000003',
        'SEAL Fall 2026',
        'Fall',
        2026,
        N'Software Engineering Agile League Fall 2026 for AI/ML and IoT solutions.',
        '2026-07-23',
        '2026-09-30',
        'Published',
        1,
        '2026-07-23 08:00:00',
        '00000000-0000-0000-0000-000000000014',
        0,
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80',
        N'FPT University - Innovation Lab',
        'Offline',
        'Students',
        N'Scholarship and outstanding project awards',
        0
    ),
    -- Event 4: SEAL Winter 2026 (Phoenix AI joins, Tony mentor)
    (
        'E0000000-0000-0000-0000-000000000004',
        'SEAL Winter 2026',
        'Winter',
        2026,
        N'Software Engineering Agile League Winter 2026 focused on Cloud and DevOps solutions.',
        '2026-07-23',
        '2026-09-30',
        'Published',
        1,
        '2026-07-23 08:00:00',
        '00000000-0000-0000-0000-000000000014',
        0,
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1600&auto=format&fit=crop&q=80',
        N'FPT University - Cloud Computing Lab',
        'Hybrid',
        'Students',
        N'Total prize 40,000,000 VND',
        0
    ),
    -- Event 5: SEAL Master 2026 (Delta Devs joins, David mentor)
    (
        'E0000000-0000-0000-0000-000000000005',
        'SEAL Master 2026',
        'Fall',
        2026,
        N'Software Engineering Agile League Master 2026 for Mobile and Web applications.',
        '2026-07-23',
        '2026-09-30',
        'Published',
        1,
        '2026-07-23 08:00:00',
        '00000000-0000-0000-0000-000000000013',
        0,
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80',
        N'FPT University - Software Engineering Department',
        'Hybrid',
        'Students',
        N'Total prize 25,000,000 VND',
        0
    ),
    -- Event 6: SEAL Hackathon 2026 (Delta Devs joins, David mentor)
    (
        'E0000000-0000-0000-0000-000000000006',
        'SEAL Hackathon 2026',
        'Summer',
        2026,
        N'24-hour intensive hackathon focused on innovative solutions for real-world problems.',
        '2026-07-23',
        '2026-09-30',
        'Published',
        1,
        '2026-07-23 08:00:00',
        '00000000-0000-0000-0000-000000000013',
        1,
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80',
        N'FPT University - Innovation Hub',
        'Offline',
        'Students',
        N'Total prize 60,000,000 VND',
        0
    );

    -- =========================================================
    -- ROUNDS for each Event
    -- =========================================================
    INSERT INTO Rounds (RoundID, EventID, RoundName, RoundOrder, SubmissionDeadline, StartDate, EndDate) VALUES
    -- Spring 2026 (3 rounds) - Starting from 23/07/2026
    ('A0000000-0000-0000-0000-000000000001','E0000000-0000-0000-0000-000000000001','Preliminary Round',1,'2026-07-25','2026-07-23','2026-07-25'),
    ('A0000000-0000-0000-0000-000000000002','E0000000-0000-0000-0000-000000000001','Semi Final Round',2,'2026-07-28','2026-07-26','2026-07-28'),
    ('A0000000-0000-0000-0000-000000000003','E0000000-0000-0000-0000-000000000001','Final Round',3,'2026-07-31','2026-07-29','2026-07-31'),
    -- Summer 2026 (2 rounds)
    ('A0000000-0000-0000-0000-000000000004','E0000000-0000-0000-0000-000000000002','Preliminary Round',1,'2026-07-25','2026-07-23','2026-07-25'),
    ('A0000000-0000-0000-0000-000000000005','E0000000-0000-0000-0000-000000000002','Final Round',2,'2026-07-28','2026-07-26','2026-07-28'),
    -- Fall 2026 (2 rounds)
    ('A0000000-0000-0000-0000-000000000006','E0000000-0000-0000-0000-000000000003','Preliminary Round',1,'2026-07-25','2026-07-23','2026-07-25'),
    ('A0000000-0000-0000-0000-000000000007','E0000000-0000-0000-0000-000000000003','Final Round',2,'2026-07-28','2026-07-26','2026-07-28'),
    -- Winter 2026 (2 rounds)
    ('A0000000-0000-0000-0000-000000000008','E0000000-0000-0000-0000-000000000004','Preliminary Round',1,'2026-07-25','2026-07-23','2026-07-25'),
    ('A0000000-0000-0000-0000-000000000009','E0000000-0000-0000-0000-000000000004','Final Round',2,'2026-07-28','2026-07-26','2026-07-28'),
    -- SEAL Master 2026 (3 rounds)
    ('A0000000-0000-0000-0000-000000000010','E0000000-0000-0000-0000-000000000005','Preliminary Round',1,'2026-07-25','2026-07-23','2026-07-25'),
    ('A0000000-0000-0000-0000-000000000011','E0000000-0000-0000-0000-000000000005','Semi Final Round',2,'2026-07-28','2026-07-26','2026-07-28'),
    ('A0000000-0000-0000-0000-000000000012','E0000000-0000-0000-0000-000000000005','Final Round',3,'2026-07-31','2026-07-29','2026-07-31'),
    -- Hackathon 2026 (1 round)
    ('A0000000-0000-0000-0000-000000000013','E0000000-0000-0000-0000-000000000006','Final Round',1,'2026-07-25','2026-07-23','2026-07-25');

    -- =========================================================
    -- CATEGORIES for each Event (Unique category names per event)
    -- =========================================================
    INSERT INTO Categories (CategoryID, EventID, CategoryName, Description) VALUES
    -- Spring 2026 categories
    ('C0000000-0000-0000-0000-000000000001','E0000000-0000-0000-0000-000000000001','Spring Web App',N'Web-based software projects'),
    ('C0000000-0000-0000-0000-000000000002','E0000000-0000-0000-0000-000000000001','Spring Mobile App',N'Mobile software solutions'),
    ('C0000000-0000-0000-0000-000000000003','E0000000-0000-0000-0000-000000000001','AI Solution',N'Artificial Intelligence projects'),
    -- Summer 2026 categories
    ('C0000000-0000-0000-0000-000000000004','E0000000-0000-0000-0000-000000000002','Blockchain Solution',N'Blockchain applications'),
    ('C0000000-0000-0000-0000-000000000005','E0000000-0000-0000-0000-000000000002','Summer Web Platform',N'Web-based software projects'),
    -- Fall 2026 categories
    ('C0000000-0000-0000-0000-000000000006','E0000000-0000-0000-0000-000000000003','AI/ML Solution',N'Machine Learning projects'),
    ('C0000000-0000-0000-0000-000000000007','E0000000-0000-0000-0000-000000000003','IoT Solution',N'Internet of Things projects'),
    -- Winter 2026 categories
    ('C0000000-0000-0000-0000-000000000008','E0000000-0000-0000-0000-000000000004','Cloud Solution',N'Cloud and DevOps projects'),
    ('C0000000-0000-0000-0000-000000000009','E0000000-0000-0000-0000-000000000004','Winter Web Services',N'Web-based software projects'),
    -- Master 2026 categories
    ('C0000000-0000-0000-0000-000000000010','E0000000-0000-0000-0000-000000000005','Master Mobile App',N'Mobile software solutions'),
    ('C0000000-0000-0000-0000-000000000011','E0000000-0000-0000-0000-000000000005','Master Fullstack Web',N'Web-based software projects'),
    -- Hackathon 2026 categories
    ('C0000000-0000-0000-0000-000000000012','E0000000-0000-0000-0000-000000000006','Open Innovation',N'Open innovation solutions');

    -- =========================================================
    -- CATEGORY MENTORS (Mentors linked to Categories via Events)
    -- Phoenix AI: Spring 2026 (AI Solution) + Winter 2026 (Cloud Solution) -> Tony Pham
    -- Beta Coders: Summer 2026 (Blockchain) + Fall 2026 (IoT) -> Hannah Nguyen
    -- Delta Devs: Master 2026 (Mobile) + Hackathon 2026 (Innovation) -> David Lee
    -- =========================================================
    INSERT INTO CategoryMentors (CategoryMentorId, CategoryID, UserId, Status) VALUES
    -- Tony Pham (AI Mentor) - mentors AI Solution in Spring 2026 and Cloud in Winter 2026
    ('B1111111-1111-1111-1111-111111111101','C0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000009','Approved'),
    ('B1111111-1111-1111-1111-111111111102','C0000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000009','Approved'),
    -- Hannah Nguyen (Web Mentor) - mentors Blockchain in Summer 2026 and IoT in Fall 2026
    ('B1111111-1111-1111-1111-111111111103','C0000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000010','Approved'),
    ('B1111111-1111-1111-1111-111111111104','C0000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000010','Approved'),
    -- David Lee (Mobile Mentor) - mentors Mobile in Master 2026 and Innovation in Hackathon 2026
    ('B1111111-1111-1111-1111-111111111105','C0000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000024','Approved'),
    ('B1111111-1111-1111-1111-111111111106','C0000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000024','Approved');

    -- =========================================================
    -- 3. TEAMS AND MEMBERS
    -- Phoenix AI -> Spring 2026 (AI Solution)
    -- Beta Coders -> Summer 2026 (Blockchain)
    -- Delta Devs -> Master 2026 (Mobile)
    -- =========================================================
    INSERT INTO Teams (TeamID, TeamName, TeamLeaderId, EventID, CategoryID, TeamStatus, HealthStatus) VALUES
    -- Phoenix AI participates in Spring 2026 (AI Solution)
    ('70000000-0000-0000-0000-000000000001','Phoenix AI','00000000-0000-0000-0000-000000000001','E0000000-0000-0000-0000-000000000001','C0000000-0000-0000-0000-000000000003','Active','Green'),
    -- Beta Coders participates in Summer 2026 (Blockchain)
    ('70000000-0000-0000-0000-000000000002','Beta Coders','00000000-0000-0000-0000-000000000005','E0000000-0000-0000-0000-000000000002','C0000000-0000-0000-0000-000000000004','Active','Green'),
    -- Delta Devs participates in Master 2026 (Mobile)
    ('70000000-0000-0000-0000-000000000003','Delta Devs','00000000-0000-0000-0000-000000000020','E0000000-0000-0000-0000-000000000005','C0000000-0000-0000-0000-000000000010','Active','Green');

    INSERT INTO TeamMembers (TeamMemberId, TeamID, UserId, JoinDate) VALUES
    -- Phoenix AI members
    ('91111111-1111-1111-1111-111111111101','70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','2026-07-23'),
    ('91111111-1111-1111-1111-111111111102','70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','2026-07-23'),
    ('91111111-1111-1111-1111-111111111103','70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','2026-07-23'),
    ('91111111-1111-1111-1111-111111111104','70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','2026-07-23'),
    -- Beta Coders members
    ('91111111-1111-1111-1111-111111111105','70000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','2026-07-23'),
    ('91111111-1111-1111-1111-111111111106','70000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000006','2026-07-23'),
    ('91111111-1111-1111-1111-111111111107','70000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000007','2026-07-23'),
    ('91111111-1111-1111-1111-111111111108','70000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000008','2026-07-23'),
    -- Delta Devs members
    ('91111111-1111-1111-1111-111111111120','70000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000020','2026-07-23'),
    ('91111111-1111-1111-1111-111111111121','70000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000021','2026-07-23'),
    ('91111111-1111-1111-1111-111111111122','70000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000022','2026-07-23'),
    ('91111111-1111-1111-1111-111111111123','70000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000023','2026-07-23');

    INSERT INTO EventParticipants (EventParticipantId, EventID, UserId, RegisteredAt, Status) VALUES
    -- Phoenix AI team in Spring 2026
    ('A1111111-1111-1111-1111-111111111101','E0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111102','E0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111103','E0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111104','E0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','2026-07-23','Registered'),
    -- Beta Coders team in Summer 2026
    ('A1111111-1111-1111-1111-111111111105','E0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111106','E0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000006','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111107','E0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000007','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111108','E0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000008','2026-07-23','Registered'),
    -- Delta Devs team in Master 2026
    ('A1111111-1111-1111-1111-111111111120','E0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000020','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111121','E0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000021','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111122','E0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000022','2026-07-23','Registered'),
    ('A1111111-1111-1111-1111-111111111123','E0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000023','2026-07-23','Registered');

    INSERT INTO RefreshTokens (RefreshTokenId, Token, UserId, ExpiresAt, CreatedAt, RevokedAt) VALUES
    ('F1000000-0000-0000-0000-000000000001', 'seed-refresh-token-leader-phoenix-2026', '00000000-0000-0000-0000-000000000001', '2027-12-31 23:59:59', '2026-07-23 08:00:00', NULL),
    ('F1000000-0000-0000-0000-000000000002', 'seed-refresh-token-coordinator-2026', '00000000-0000-0000-0000-000000000013', '2027-12-31 23:59:59', '2026-07-23 08:00:00', NULL);

    INSERT INTO Notifications (NotificationId, UserId, Message, IsRead, CreatedAt) VALUES
    ('F2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', N'[NOTIFICATION] Team Phoenix AI đã đăng ký SEAL Spring 2026.', 0, '2026-07-23 09:00:00'),
    ('F2000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', N'[NOTIFICATION] Team Beta Coders đã đăng ký SEAL Summer 2026.', 1, '2026-07-23 09:05:00'),
    ('F2000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000020', N'[NOTIFICATION] Team Delta Devs đã đăng ký SEAL Master 2026.', 1, '2026-07-23 09:10:00');

    -- =========================================================
    -- 4. JUDGING TEMPLATES AND CRITERIA
    -- =========================================================
    INSERT INTO SubmissionTemplates (TemplateID, TemplateName, Description) VALUES
    ('F0000000-0000-0000-0000-000000000001','Default Hackathon Template',N'General software evaluation criteria'),
    ('F0000000-0000-0000-0000-000000000002','AI Hackathon Template',N'Advanced AI project evaluation criteria'),
    ('F0000000-0000-0000-0000-000000000003','Mobile Template',N'Mobile application evaluation criteria');

    INSERT INTO Criteria (CriteriaID, TemplateID, CriteriaName, Weight) VALUES
    ('CC000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000001','Innovation',0.4),
    ('CC000000-0000-0000-0000-000000000002','F0000000-0000-0000-0000-000000000001','Technical Complexity',0.3),
    ('CC000000-0000-0000-0000-000000000003','F0000000-0000-0000-0000-000000000001','UI/UX',0.3),
    ('CC000000-0000-0000-0000-000000000004','F0000000-0000-0000-0000-000000000002','AI Accuracy',0.4),
    ('CC000000-0000-0000-0000-000000000005','F0000000-0000-0000-0000-000000000002','Model Performance',0.3),
    ('CC000000-0000-0000-0000-000000000006','F0000000-0000-0000-0000-000000000002','Business Impact',0.3),
    ('CC000000-0000-0000-0000-000000000007','F0000000-0000-0000-0000-000000000003','User Experience',0.35),
    ('CC000000-0000-0000-0000-000000000008','F0000000-0000-0000-0000-000000000003','Performance',0.35),
    ('CC000000-0000-0000-0000-000000000009','F0000000-0000-0000-0000-000000000003','Code Quality',0.3);

    INSERT INTO EventCriteria (EventCriteriaId, EventID, CriteriaID, Weight) VALUES
    -- Spring 2026
    ('ECA00001-0001-0001-0001-000000000001','E0000000-0000-0000-0000-000000000001','CC000000-0000-0000-0000-000000000001',0.4),
    ('ECA00001-0001-0001-0001-000000000002','E0000000-0000-0000-0000-000000000001','CC000000-0000-0000-0000-000000000002',0.3),
    ('ECA00001-0001-0001-0001-000000000003','E0000000-0000-0000-0000-000000000001','CC000000-0000-0000-0000-000000000003',0.3),
    -- Summer 2026
    ('ECA00001-0001-0001-0001-000000000004','E0000000-0000-0000-0000-000000000002','CC000000-0000-0000-0000-000000000001',0.35),
    ('ECA00001-0001-0001-0001-000000000005','E0000000-0000-0000-0000-000000000002','CC000000-0000-0000-0000-000000000004',0.35),
    ('ECA00001-0001-0001-0001-000000000006','E0000000-0000-0000-0000-000000000002','CC000000-0000-0000-0000-000000000006',0.3),
    -- Fall 2026
    ('ECA00001-0001-0001-0001-000000000007','E0000000-0000-0000-0000-000000000003','CC000000-0000-0000-0000-000000000001',0.4),
    ('ECA00001-0001-0001-0001-000000000008','E0000000-0000-0000-0000-000000000003','CC000000-0000-0000-0000-000000000002',0.3),
    ('ECA00001-0001-0001-0001-000000000009','E0000000-0000-0000-0000-000000000003','CC000000-0000-0000-0000-000000000003',0.3),
    -- Winter 2026
    ('ECA00001-0001-0001-0001-000000000010','E0000000-0000-0000-0000-000000000004','CC000000-0000-0000-0000-000000000001',0.4),
    ('ECA00001-0001-0001-0001-000000000011','E0000000-0000-0000-0000-000000000004','CC000000-0000-0000-0000-000000000002',0.3),
    ('ECA00001-0001-0001-0001-000000000012','E0000000-0000-0000-0000-000000000004','CC000000-0000-0000-0000-000000000003',0.3),
    -- Master 2026
    ('ECA00001-0001-0001-0001-000000000013','E0000000-0000-0000-0000-000000000005','CC000000-0000-0000-0000-000000000001',0.4),
    ('ECA00001-0001-0001-0001-000000000014','E0000000-0000-0000-0000-000000000005','CC000000-0000-0000-0000-000000000002',0.3),
    ('ECA00001-0001-0001-0001-000000000015','E0000000-0000-0000-0000-000000000005','CC000000-0000-0000-0000-000000000003',0.3),
    -- Hackathon 2026
    ('ECA00001-0001-0001-0001-000000000016','E0000000-0000-0000-0000-000000000006','CC000000-0000-0000-0000-000000000001',0.5),
    ('ECA00001-0001-0001-0001-000000000017','E0000000-0000-0000-0000-000000000006','CC000000-0000-0000-0000-000000000002',0.5);

    -- =========================================================
    -- 5. SUBMISSIONS AND SCORING
    -- =========================================================
    INSERT INTO JudgeAssignments (AssignmentId, UserId, RoundID) VALUES
    -- Spring 2026 rounds
    ('AAA00001-0001-0001-0001-000000000001','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000001'),
    ('AAA00001-0001-0001-0001-000000000002','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000001'),
    ('AAA00001-0001-0001-0001-000000000003','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000002'),
    ('AAA00001-0001-0001-0001-000000000004','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000002'),
    ('AAA00001-0001-0001-0001-000000000005','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000003'),
    ('AAA00001-0001-0001-0001-000000000006','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000003'),
    -- Summer 2026 rounds
    ('AAA00001-0001-0001-0001-000000000007','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000004'),
    ('AAA00001-0001-0001-0001-000000000008','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000004'),
    ('AAA00001-0001-0001-0001-000000000009','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000005'),
    ('AAA00001-0001-0001-0001-000000000010','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000005'),
    -- Fall 2026 rounds
    ('AAA00001-0001-0001-0001-000000000011','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000006'),
    ('AAA00001-0001-0001-0001-000000000012','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000006'),
    ('AAA00001-0001-0001-0001-000000000013','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000007'),
    ('AAA00001-0001-0001-0001-000000000014','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000007'),
    -- Winter 2026 rounds
    ('AAA00001-0001-0001-0001-000000000015','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000008'),
    ('AAA00001-0001-0001-0001-000000000016','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000008'),
    ('AAA00001-0001-0001-0001-000000000017','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000009'),
    ('AAA00001-0001-0001-0001-000000000018','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000009'),
    -- Master 2026 rounds
    ('AAA00001-0001-0001-0001-000000000019','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000010'),
    ('AAA00001-0001-0001-0001-000000000020','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000010'),
    ('AAA00001-0001-0001-0001-000000000021','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000011'),
    ('AAA00001-0001-0001-0001-000000000022','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000011'),
    ('AAA00001-0001-0001-0001-000000000023','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000012'),
    ('AAA00001-0001-0001-0001-000000000024','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000012'),
    -- Hackathon 2026 rounds
    ('AAA00001-0001-0001-0001-000000000025','00000000-0000-0000-0000-000000000011','A0000000-0000-0000-0000-000000000013'),
    ('AAA00001-0001-0001-0001-000000000026','00000000-0000-0000-0000-000000000012','A0000000-0000-0000-0000-000000000013');

    -- Submissions
    INSERT INTO Submissions (SubmissionID, TeamID, RoundID, RepositoryURL, DemoURL, SlideURL, SubmittedAt, Status, IsCalibrationSample, CalibrationTitle) VALUES
    -- Submissions for Spring 2026 (Phoenix AI)
    ('D0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001', 'https://github.com/phoenix-ai/project-v1', 'https://youtube.com/phoenix-demo-1', 'https://drive.google.com/phoenix-slide-1', '2026-07-24 14:00:00', 'Submitted', 0, N''),
    ('D0000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000002', 'https://github.com/phoenix-ai/project-v2', 'https://youtube.com/phoenix-demo-2', 'https://drive.google.com/phoenix-slide-2', '2026-07-27 10:00:00', 'Submitted', 0, N''),
    ('D0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000003', 'https://github.com/phoenix-ai/project-final', 'https://youtube.com/phoenix-demo-final', 'https://drive.google.com/phoenix-slide-final', '2026-07-30 09:00:00', 'Submitted', 0, N''),
    -- Submissions for Summer 2026 (Beta Coders)
    ('D0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000004', 'https://github.com/beta-coders/blockchain-v1', 'https://youtube.com/beta-demo-1', 'https://drive.google.com/beta-slide-1', '2026-07-24 14:30:00', 'Submitted', 0, N''),
    ('D0000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000005', 'https://github.com/beta-coders/blockchain-final', 'https://youtube.com/beta-demo-final', 'https://drive.google.com/beta-slide-final', '2026-07-27 11:00:00', 'Submitted', 0, N''),
    -- Submissions for Master 2026 (Delta Devs)
    ('D0000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000010', 'https://github.com/delta-devs/mobile-v1', 'https://youtube.com/delta-demo-1', 'https://drive.google.com/delta-slide-1', '2026-07-24 15:00:00', 'Submitted', 0, N''),
    ('D0000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000011', 'https://github.com/delta-devs/mobile-v2', 'https://youtube.com/delta-demo-2', 'https://drive.google.com/delta-slide-2', '2026-07-27 11:30:00', 'Submitted', 0, N'');

    -- Seeding SubmissionAssets metadata
    INSERT INTO SubmissionAssets (
        SubmissionAssetId, SubmissionId, TeamId, RoundId, AssetType, Provider,
        CloudinaryAssetId, PublicId, SecureUrl, ResourceType, OriginalFileName,
        Format, ContentType, FileSize, DurationSeconds, UploadStatus, CreatedAt, UploadedAt
    ) VALUES
    (
        'F3000000-0000-0000-0000-000000000001', 'D0000000-0000-0000-0000-000000000001',
        '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001',
        'VideoDemo', 'Cloudinary', 'seed-video-asset-001', 'seal-hackathon/seed/phoenix-demo-1',
        'https://res.cloudinary.com/hackathon/video/upload/v1/seal-hackathon/seed/phoenix-demo-1.mp4',
        'video', 'phoenix-demo-1.mp4', 'mp4', 'video/mp4', 10485760, 120.5, 'Uploaded',
        '2026-07-24 13:45:00', '2026-07-24 13:46:00'
    ),
    (
        'F3000000-0000-0000-0000-000000000002', 'D0000000-0000-0000-0000-000000000004',
        '70000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000004',
        'SlideDocument', 'Cloudinary', 'seed-slide-asset-002', 'seal-hackathon/seed/beta-slide-1',
        'https://res.cloudinary.com/hackathon/raw/upload/v1/seal-hackathon/seed/beta-slide-1.pdf',
        'raw', 'beta-slide-1.pdf', 'pdf', 'application/pdf', 524288, NULL, 'Uploaded',
        '2026-07-24 14:15:00', '2026-07-24 14:16:00'
    );

    -- Scores for Phoenix AI in Spring 2026
    INSERT INTO Scores (ScoreId, SubmissionID, AssignmentId, CriteriaID, ScoreValue, Comment, ScoredAt) VALUES
    ('D1111111-1111-1111-1111-000000000001','D0000000-0000-0000-0000-000000000001','AAA00001-0001-0001-0001-000000000001','CC000000-0000-0000-0000-000000000001',9.0, N'Excellent AI innovation', '2026-07-24 15:00:00'),
    ('D1111111-1111-1111-1111-000000000002','D0000000-0000-0000-0000-000000000001','AAA00001-0001-0001-0001-000000000001','CC000000-0000-0000-0000-000000000002',8.5, N'Good architecture and scalability', '2026-07-24 15:10:00'),
    ('D1111111-1111-1111-1111-000000000003','D0000000-0000-0000-0000-000000000001','AAA00001-0001-0001-0001-000000000001','CC000000-0000-0000-0000-000000000003',8.0, N'Nice interface and user experience', '2026-07-24 15:20:00'),
    ('D1111111-1111-1111-1111-000000000004','D0000000-0000-0000-0000-000000000002','AAA00001-0001-0001-0001-000000000003','CC000000-0000-0000-0000-000000000001',9.2, N'Outstanding AI innovation and improvements', '2026-07-27 11:00:00'),
    ('D1111111-1111-1111-1111-000000000005','D0000000-0000-0000-0000-000000000002','AAA00001-0001-0001-0001-000000000003','CC000000-0000-0000-0000-000000000002',8.8, N'Excellent technical complexity', '2026-07-27 11:10:00'),
    ('D1111111-1111-1111-1111-000000000006','D0000000-0000-0000-0000-000000000002','AAA00001-0001-0001-0001-000000000003','CC000000-0000-0000-0000-000000000003',8.3, N'Very good UI improvements', '2026-07-27 11:20:00'),
    ('D1111111-1111-1111-1111-000000000007','D0000000-0000-0000-0000-000000000003','AAA00001-0001-0001-0001-000000000005','CC000000-0000-0000-0000-000000000001',9.3, N'Outstanding AI innovation - champion level', '2026-07-30 10:00:00'),
    ('D1111111-1111-1111-1111-000000000008','D0000000-0000-0000-0000-000000000003','AAA00001-0001-0001-0001-000000000005','CC000000-0000-0000-0000-000000000002',9.0, N'Excellent technical complexity', '2026-07-30 10:10:00'),
    ('D1111111-1111-1111-1111-000000000009','D0000000-0000-0000-0000-000000000003','AAA00001-0001-0001-0001-000000000005','CC000000-0000-0000-0000-000000000003',8.5, N'Very good UI/UX', '2026-07-30 10:20:00'),
    -- Scores for Beta Coders in Summer 2026
    ('D1111111-1111-1111-1111-000000000010','D0000000-0000-0000-0000-000000000004','AAA00001-0001-0001-0001-000000000007','CC000000-0000-0000-0000-000000000001',8.5, N'Good blockchain innovation', '2026-07-24 16:00:00'),
    ('D1111111-1111-1111-1111-000000000011','D0000000-0000-0000-0000-000000000004','AAA00001-0001-0001-0001-000000000007','CC000000-0000-0000-0000-000000000004',8.2, N'Good technical implementation', '2026-07-24 16:10:00'),
    ('D1111111-1111-1111-1111-000000000012','D0000000-0000-0000-0000-000000000004','AAA00001-0001-0001-0001-000000000007','CC000000-0000-0000-0000-000000000006',7.8, N'Good design', '2026-07-24 16:20:00'),
    ('D1111111-1111-1111-1111-000000000013','D0000000-0000-0000-0000-000000000005','AAA00001-0001-0001-0001-000000000009','CC000000-0000-0000-0000-000000000001',8.8, N'Excellent blockchain innovation', '2026-07-27 14:00:00'),
    ('D1111111-1111-1111-1111-000000000014','D0000000-0000-0000-0000-000000000005','AAA00001-0001-0001-0001-000000000009','CC000000-0000-0000-0000-000000000004',8.7, N'Excellent technical complexity', '2026-07-27 14:10:00'),
    ('D1111111-1111-1111-1111-000000000015','D0000000-0000-0000-0000-000000000005','AAA00001-0001-0001-0001-000000000009','CC000000-0000-0000-0000-000000000006',8.5, N'Good design', '2026-07-27 14:20:00'),
    -- Scores for Delta Devs in Master 2026
    ('D1111111-1111-1111-1111-000000000016','D0000000-0000-0000-0000-000000000006','AAA00001-0001-0001-0001-000000000019','CC000000-0000-0000-0000-000000000001',8.5, N'Good innovation', '2026-07-24 17:00:00'),
    ('D1111111-1111-1111-1111-000000000017','D0000000-0000-0000-0000-000000000006','AAA00001-0001-0001-0001-000000000019','CC000000-0000-0000-0000-000000000002',8.3, N'Good technical implementation', '2026-07-24 17:10:00'),
    ('D1111111-1111-1111-1111-000000000018','D0000000-0000-0000-0000-000000000006','AAA00001-0001-0001-0001-000000000019','CC000000-0000-0000-0000-000000000003',8.0, N'Good UI/UX', '2026-07-24 17:20:00'),
    ('D1111111-1111-1111-1111-000000000019','D0000000-0000-0000-0000-000000000007','AAA00001-0001-0001-0001-000000000021','CC000000-0000-0000-0000-000000000001',8.8, N'Excellent innovation', '2026-07-27 15:00:00'),
    ('D1111111-1111-1111-1111-000000000020','D0000000-0000-0000-0000-000000000007','AAA00001-0001-0001-0001-000000000021','CC000000-0000-0000-0000-000000000002',8.6, N'Good technical implementation', '2026-07-27 15:10:00'),
    ('D1111111-1111-1111-1111-000000000021','D0000000-0000-0000-0000-000000000007','AAA00001-0001-0001-0001-000000000021','CC000000-0000-0000-0000-000000000003',8.5, N'Very good UI', '2026-07-27 15:20:00');

    INSERT INTO CalibrationScores (CalibrationScoreId, JudgeId, CriteriaId, SubmissionId, ScoreValue, Comment, ScoredAt) VALUES
    ('CAC00001-0001-0001-0001-000000000001','00000000-0000-0000-0000-000000000011','CC000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000001',9.0, N'Calibration baseline score', '2026-07-24 08:00:00'),
    ('CAC00001-0001-0001-0001-000000000002','00000000-0000-0000-0000-000000000012','CC000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000004',8.5, N'Calibration baseline score', '2026-07-24 08:00:00'),
    ('CAC00001-0001-0001-0001-000000000003','00000000-0000-0000-0000-000000000011','CC000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000006',8.5, N'Calibration baseline score', '2026-07-24 08:00:00');

    -- =========================================================
    -- 6. LOGS, ADVANCEMENT, RANKINGS, AND ELIMINATIONS
    -- =========================================================
    INSERT INTO AuditLogs (LogID, UserID, ActionType, OldValue, NewValue, CreatedAt) VALUES
    ('AAA00001-0001-0001-0001-000000000001','00000000-0000-0000-0000-000000000013','EVENT_CREATE', NULL, '{"EventName":"SEAL Spring 2026"}', '2026-07-23 08:00:00'),
    ('AAA00001-0001-0001-0001-000000000002','00000000-0000-0000-0000-000000000013','EVENT_CREATE', NULL, '{"EventName":"SEAL Summer 2026"}', '2026-07-23 08:10:00'),
    ('AAA00001-0001-0001-0001-000000000003','00000000-0000-0000-0000-000000000014','EVENT_CREATE', NULL, '{"EventName":"SEAL Fall 2026"}', '2026-07-23 08:20:00'),
    ('AAA00001-0001-0001-0001-000000000004','00000000-0000-0000-0000-000000000001','TEAM_CREATE', NULL, '{"TeamName":"Phoenix AI"}', '2026-07-23 09:00:00'),
    ('AAA00001-0001-0001-0001-000000000005','00000000-0000-0000-0000-000000000005','TEAM_CREATE', NULL, '{"TeamName":"Beta Coders"}', '2026-07-23 09:05:00'),
    ('AAA00001-0001-0001-0001-000000000006','00000000-0000-0000-0000-000000000020','TEAM_CREATE', NULL, '{"TeamName":"Delta Devs"}', '2026-07-23 09:10:00');

    INSERT INTO AdvancementRules (RuleId, RoundId, CategoryId, TopN) VALUES
    ('B0000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000003', 2),
    ('B0000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000002', 'C0000000-0000-0000-0000-000000000003', 1),
    ('B0000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000004', 'C0000000-0000-0000-0000-000000000004', 1),
    ('B0000000-0000-0000-0000-000000000004', 'A0000000-0000-0000-0000-000000000010', 'C0000000-0000-0000-0000-000000000010', 1);

    INSERT INTO Rankings (RankingId, TeamId, RoundId, CategoryId, RankPosition, TotalScore, GeneratedAt) VALUES
    -- Spring 2026 rankings (Phoenix AI)
    ('A1000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000003', 1, 25.50, '2026-07-25 18:00:00'),
    ('A1000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000002', 'C0000000-0000-0000-0000-000000000003', 1, 26.30, '2026-07-28 18:00:00'),
    ('A1000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000003', 'C0000000-0000-0000-0000-000000000003', 1, 26.80, '2026-07-31 18:00:00'),
    -- Summer 2026 rankings (Beta Coders)
    ('A1000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000004', 'C0000000-0000-0000-0000-000000000004', 1, 24.50, '2026-07-25 18:00:00'),
    ('A1000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000005', 'C0000000-0000-0000-0000-000000000004', 1, 26.00, '2026-07-28 18:00:00'),
    -- Master 2026 rankings (Delta Devs)
    ('A1000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000010', 'C0000000-0000-0000-0000-000000000010', 1, 24.80, '2026-07-25 18:00:00'),
    ('A1000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000011', 'C0000000-0000-0000-0000-000000000010', 1, 25.90, '2026-07-28 18:00:00'),
    ('A1000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000012', 'C0000000-0000-0000-0000-000000000010', 1, 25.90, '2026-07-31 18:00:00');

    -- =========================================================
    -- 7. MATCHMAKING, MENTORSHIP AND USER SKILLS
    -- =========================================================
    INSERT INTO UserSkills (UserSkillId, UserId, Role, SkillName, ExperienceLevel, CreatedAt) VALUES
    ('E1111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Frontend Developer', 'React/Next.js', 'Advanced', '2026-07-23 08:00:00'),
    ('E1111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'UI/UX Designer', 'Figma', 'Intermediate', '2026-07-23 08:00:00'),
    ('E1111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000002', 'Backend Developer', 'ASP.NET Core', 'Advanced', '2026-07-23 08:00:00'),
    ('E1111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000005', 'Blockchain Developer', 'Solidity', 'Advanced', '2026-07-23 08:00:00'),
    ('E1111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000020', 'Mobile Developer', 'React Native', 'Advanced', '2026-07-23 08:00:00');

    INSERT INTO TeamRecruitments (RecruitmentId, TeamId, RoleNeeded, Description, Quantity, Status, CreatedAt, UpdatedAt) VALUES
    ('50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'AI Researcher', N'Looking for someone with deep knowledge in LLMs and Prompt Engineering.', 1, 'OPEN', '2026-07-23 08:00:00', NULL),
    ('50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'Blockchain Developer', N'We need a developer specialized in Web3 and smart contracts.', 1, 'OPEN', '2026-07-23 08:00:00', NULL),
    ('50000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003', 'UI Designer', N'Looking for a creative UI designer for our mobile app.', 1, 'OPEN', '2026-07-23 08:00:00', NULL);

    INSERT INTO TeamApplications (ApplicationId, RecruitmentId, TeamId, UserId, Message, Status, CreatedAt, UpdatedAt) VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', N'I have strong blockchain skills and would love to join your team!', 'PENDING', '2026-07-23 08:00:00', NULL);

    -- Mentor Schedules
    INSERT INTO MentorSchedules (ScheduleId, MentorUserId, StartTime, EndTime, MeetingLocation, IsBooked) VALUES
    -- Tony Pham (AI Mentor) schedules
    ('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', '2026-07-24 09:00:00', '2026-07-24 10:00:00', N'Lab 402', 1),
    ('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', '2026-07-24 10:30:00', '2026-07-24 11:30:00', N'Lab 402', 0),
    ('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', '2026-07-27 09:00:00', '2026-07-27 10:00:00', N'Google Meet', 0),
    -- Hannah Nguyen (Web Mentor) schedules
    ('80000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', '2026-07-24 14:00:00', '2026-07-24 15:00:00', N'Google Meet', 1),
    ('80000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', '2026-07-24 15:30:00', '2026-07-24 16:30:00', N'Google Meet', 0),
    ('80000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', '2026-07-27 14:00:00', '2026-07-27 15:00:00', N'Google Meet', 0),
    -- David Lee (Mobile Mentor) schedules
    ('80000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000024', '2026-07-24 09:00:00', '2026-07-24 10:00:00', N'Lab 301', 1),
    ('80000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000024', '2026-07-24 10:30:00', '2026-07-24 11:30:00', N'Lab 301', 0),
    ('80000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000024', '2026-07-27 09:00:00', '2026-07-27 10:00:00', N'Lab 301', 0);

    -- Mentor Bookings (Phoenix AI with Tony, Beta Coders with Hannah, Delta Devs with David)
    INSERT INTO MentorBookings (BookingId, ScheduleId, TeamId, MentorUserId, Objective, Status, MeetingLink, Notes, CreatedAt) VALUES
    ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', N'Consult on AI Model architecture and integration with Next.js frontend.', 'COMPLETED', 'https://meet.google.com/abc-defg-hij', N'Discussed model quantization and API response optimization.', '2026-07-23 10:00:00'),
    ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', N'Review React Component structure and state management workflow.', 'ACCEPTED', 'https://meet.google.com/xyz-uvwx-yza', N'Prepare code repository link before meeting.', '2026-07-23 11:00:00'),
    ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000024', N'Consult on Mobile UI/UX design and navigation patterns.', 'COMPLETED', 'https://meet.google.com/lmn-opqr-stu', N'Discussed navigation architecture and component reusability.', '2026-07-23 12:00:00');

    INSERT INTO MentoringFeedbacks (FeedbackId, BookingId, TeamId, MentorUserId, HealthStatus, Content, CreatedAt) VALUES
    ('40000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'Green', N'The Phoenix AI team is progressing very well. They understood the quantization techniques and successfully integrated the model API.', '2026-07-24 10:15:00'),
    ('40000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000024', 'Green', N'Delta Devs team showed excellent progress in mobile development. The UI/UX design is well thought out.', '2026-07-24 11:15:00');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

-- Verify seeded data
SELECT 'Users Count' AS [Table], COUNT(*) AS [Rows] FROM Users UNION ALL
SELECT 'StudentProfiles Count', COUNT(*) FROM StudentProfiles UNION ALL
SELECT 'Events Count', COUNT(*) FROM Events UNION ALL
SELECT 'Rounds Count', COUNT(*) FROM Rounds UNION ALL
SELECT 'Categories Count', COUNT(*) FROM Categories UNION ALL
SELECT 'CategoryMentors Count', COUNT(*) FROM CategoryMentors UNION ALL
SELECT 'Teams Count', COUNT(*) FROM Teams UNION ALL
SELECT 'TeamMembers Count', COUNT(*) FROM TeamMembers UNION ALL
SELECT 'EventParticipants Count', COUNT(*) FROM EventParticipants UNION ALL
SELECT 'RefreshTokens Count', COUNT(*) FROM RefreshTokens UNION ALL
SELECT 'Notifications Count', COUNT(*) FROM Notifications UNION ALL
SELECT 'SubmissionTemplates Count', COUNT(*) FROM SubmissionTemplates UNION ALL
SELECT 'Criteria Count', COUNT(*) FROM Criteria UNION ALL
SELECT 'EventCriteria Count', COUNT(*) FROM EventCriteria UNION ALL
SELECT 'JudgeAssignments Count', COUNT(*) FROM JudgeAssignments UNION ALL
SELECT 'Submissions Count', COUNT(*) FROM Submissions UNION ALL
SELECT 'SubmissionAssets Count', COUNT(*) FROM SubmissionAssets UNION ALL
SELECT 'Scores Count', COUNT(*) FROM Scores UNION ALL
SELECT 'CalibrationScores Count', COUNT(*) FROM CalibrationScores UNION ALL
SELECT 'AuditLogs Count', COUNT(*) FROM AuditLogs UNION ALL
SELECT 'AdvancementRules Count', COUNT(*) FROM AdvancementRules UNION ALL
SELECT 'Rankings Count', COUNT(*) FROM Rankings UNION ALL
SELECT 'Eliminations Count', COUNT(*) FROM Eliminations UNION ALL
SELECT 'UserSkills Count', COUNT(*) FROM UserSkills UNION ALL
SELECT 'TeamRecruitments Count', COUNT(*) FROM TeamRecruitments UNION ALL
SELECT 'TeamApplications Count', COUNT(*) FROM TeamApplications UNION ALL
SELECT 'MentorSchedules Count', COUNT(*) FROM MentorSchedules UNION ALL
SELECT 'MentorBookings Count', COUNT(*) FROM MentorBookings UNION ALL
SELECT 'MentoringFeedbacks Count', COUNT(*) FROM MentoringFeedbacks;

-- Verify relationship integrity
PRINT '';
PRINT '=== TEAM-EVENT RELATIONSHIP ===';
SELECT t.TeamName, e.EventName, c.CategoryName, m.FullName as MentorName
FROM Teams t
JOIN Events e ON t.EventID = e.EventID
JOIN Categories c ON t.CategoryID = c.CategoryID
JOIN CategoryMentors cm ON c.CategoryID = cm.CategoryID
JOIN Users m ON cm.UserId = m.UserID;

PRINT '';
PRINT '=== MENTOR-EVENT RELATIONSHIP ===';
SELECT m.FullName as Mentor, e.EventName, c.CategoryName
FROM CategoryMentors cm
JOIN Users m ON cm.UserId = m.UserID
JOIN Categories c ON cm.CategoryID = c.CategoryID
JOIN Events e ON c.EventID = e.EventID
ORDER BY m.FullName;
