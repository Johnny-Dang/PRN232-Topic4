using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class TeamApplicationService : ITeamApplicationService
    {
        private const int MAX_TEAM_MEMBERS = 5;

        private readonly IGenericRepository<TeamApplications> _applicationRepository;
        private readonly IGenericRepository<TeamRecruitments> _recruitmentRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<TeamMembers> _teamMemberRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<UserSkills> _userSkillRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;

        public TeamApplicationService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _applicationRepository = _unitOfWork.GetRepository<TeamApplications>();
            _recruitmentRepository = _unitOfWork.GetRepository<TeamRecruitments>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _teamMemberRepository = _unitOfWork.GetRepository<TeamMembers>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _userSkillRepository = _unitOfWork.GetRepository<UserSkills>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<TeamApplicationDto> ApplyToTeamAsync(Guid recruitmentId, Guid candidateUserId, ApplyToTeamRequest request)
        {
            var recruitment = await _recruitmentRepository.FirstOrDefaultWithIncludeAsync(
                r => r.RecruitmentId == recruitmentId,
                r => r.Team
            );

            if (recruitment == null)
                throw new Exception($"Recruitment post '{recruitmentId}' not found");

            if (recruitment.Status != "OPEN" || recruitment.Quantity <= 0)
                throw new Exception("This recruitment post is closed or full");

            var candidate = await _userRepository.GetByIdAsync(candidateUserId);
            if (candidate == null)
                throw new Exception($"User '{candidateUserId}' not found");

            if (string.Equals(candidate.Role, "Mentor", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(candidate.Role, "Judge", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(candidate.Role, "Coordinator", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception($"Tài khoản có vai trò {candidate.Role} không được phép nộp đơn gia nhập đội thi.");
            }

            // Check if user is the leader or already a member of this team
            if (recruitment.Team != null && recruitment.Team.TeamLeaderId == candidateUserId)
                throw new Exception("You are the Team Leader of this team and cannot apply to your own recruitment post");

            var existingMembers = await _teamMemberRepository.FindAsync(m => m.TeamId == recruitment.TeamId && m.UserId == candidateUserId);
            if (existingMembers.Any())
                throw new Exception("You are already a member of this team");

            // Check if user has already applied and is pending/accepted
            var existingApps = await _applicationRepository.FindAsync(
                a => a.RecruitmentId == recruitmentId && a.UserId == candidateUserId && (a.Status == "PENDING" || a.Status == "ACCEPTED")
            );
            if (existingApps.Any())
                throw new Exception("You have already applied to this recruitment post");

            var application = new TeamApplications
            {
                ApplicationId = Guid.NewGuid(),
                RecruitmentId = recruitmentId,
                TeamId = recruitment.TeamId,
                UserId = candidateUserId,
                Message = request.Message?.Trim() ?? string.Empty,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            await _applicationRepository.AddAsync(application);

            // Audit log
            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = candidateUserId,
                ActionType = "TEAM_APPLICATION_SUBMIT",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(new { application.ApplicationId, application.RecruitmentId, application.TeamId, application.UserId }),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            // Gửi thông báo cho Team Leader khi có đơn ứng tuyển mới
            var teamLeader = await _userRepository.GetByIdAsync(recruitment.Team!.TeamLeaderId);
            if (teamLeader != null)
            {
                var notificationMessage = $"[THÔNG BÁO] {candidate.FullName} đã nộp đơn ứng tuyển vào đội {recruitment.Team!.TeamName} cho vai trò {recruitment.RoleNeeded}.";
                await _notificationService.CreateNotificationAsync(teamLeader.UserId, notificationMessage);
            }

            var skills = await _userSkillRepository.FindAsync(s => s.UserId == candidateUserId);
            return MapToDto(application, recruitment.Team, candidate, skills.ToList());
        }

        public async Task<List<TeamApplicationDto>> GetApplicationsByTeamAsync(Guid teamId, Guid leaderUserId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Team '{teamId}' not found");

            if (team.TeamLeaderId != leaderUserId)
                throw new Exception("Only the Team Leader can view applications");

            var apps = await _applicationRepository.GetAllWithIncludeAsync(a => a.Team, a => a.User);
            var teamApps = apps.Where(a => a.TeamId == teamId).ToList();

            var result = new List<TeamApplicationDto>();
            foreach (var app in teamApps)
            {
                var skills = await _userSkillRepository.FindAsync(s => s.UserId == app.UserId);
                result.Add(MapToDto(app, app.Team, app.User, skills.ToList()));
            }

            return result;
        }

        public async Task<List<TeamApplicationDto>> GetMyApplicationsAsync(Guid candidateUserId)
        {
            var candidate = await _userRepository.GetByIdAsync(candidateUserId);
            if (candidate == null)
                throw new Exception($"User '{candidateUserId}' not found");

            var apps = await _applicationRepository.GetAllWithIncludeAsync(a => a.Team, a => a.User);
            var userApps = apps.Where(a => a.UserId == candidateUserId).ToList();

            var skills = (await _userSkillRepository.FindAsync(s => s.UserId == candidateUserId)).ToList();

            return userApps.Select(app => MapToDto(app, app.Team, candidate, skills)).ToList();
        }

        public async Task<TeamApplicationDto> ProcessApplicationAsync(Guid applicationId, Guid leaderUserId, ProcessApplicationRequest request)
        {
            var application = await _applicationRepository.FirstOrDefaultWithIncludeAsync(
                a => a.ApplicationId == applicationId,
                a => a.Team,
                a => a.User,
                a => a.Recruitment
            );

            if (application == null)
                throw new Exception($"Application '{applicationId}' not found");

            if (application.Team != null && application.Team.TeamLeaderId != leaderUserId)
                throw new Exception("Only the Team Leader can process applications");

            if (application.Status != "PENDING")
                throw new Exception($"Application is already processed with status '{application.Status}'");

            if (request.Accept)
            {
                // Validate team member limit
                var currentMembers = await _teamMemberRepository.FindAsync(m => m.TeamId == application.TeamId);
                if (currentMembers.Count >= MAX_TEAM_MEMBERS)
                    throw new Exception($"Team member limit reached. Maximum allowed is {MAX_TEAM_MEMBERS} members.");

                application.Status = "ACCEPTED";
                application.UpdatedAt = DateTime.UtcNow;

                // Create TeamMembers record
                var newMember = new TeamMembers
                {
                    TeamMemberId = Guid.NewGuid(),
                    TeamId = application.TeamId,
                    UserId = application.UserId,
                    JoinDate = DateTime.UtcNow
                };
                await _teamMemberRepository.AddAsync(newMember);

                // Update Recruitment quantity & status
                var recruitment = application.Recruitment;
                if (recruitment != null)
                {
                    recruitment.Quantity -= 1;
                    if (recruitment.Quantity <= 0)
                    {
                        recruitment.Quantity = 0;
                        recruitment.Status = "CLOSED";
                    }
                    recruitment.UpdatedAt = DateTime.UtcNow;
                    _recruitmentRepository.Update(recruitment);
                }

                await _auditLogRepository.AddAsync(new AuditLogs
                {
                    LogId = Guid.NewGuid(),
                    UserId = leaderUserId,
                    ActionType = "TEAM_APPLICATION_ACCEPT",
                    OldValue = "PENDING",
                    NewValue = JsonSerializer.Serialize(new { application.ApplicationId, application.UserId, application.TeamId }),
                    CreatedAt = DateTime.UtcNow
                });

                // Gửi thông báo cho ứng viên khi được chấp nhận
                var acceptedUser = await _userRepository.GetByIdAsync(application.UserId);
                if (acceptedUser != null && application.Team != null)
                {
                    var acceptMessage = $"[CHẤP NHẬN] Đơn ứng tuyển của bạn vào đội {application.Team.TeamName} đã được chấp nhận! Bạn là thành viên của đội rồi.";
                    await _notificationService.CreateNotificationAsync(application.UserId, acceptMessage);
                }
            }
            else
            {
                application.Status = "REJECTED";
                application.UpdatedAt = DateTime.UtcNow;

                await _auditLogRepository.AddAsync(new AuditLogs
                {
                    LogId = Guid.NewGuid(),
                    UserId = leaderUserId,
                    ActionType = "TEAM_APPLICATION_REJECT",
                    OldValue = "PENDING",
                    NewValue = JsonSerializer.Serialize(new { application.ApplicationId, application.UserId, application.TeamId }),
                    CreatedAt = DateTime.UtcNow
                });

                // Gửi thông báo cho ứng viên khi bị từ chối
                var rejectedUser = await _userRepository.GetByIdAsync(application.UserId);
                if (rejectedUser != null && application.Team != null)
                {
                    var rejectMessage = $"[TỪ CHỐI] Rất tiếc, đơn ứng tuyển của bạn vào đội {application.Team.TeamName} đã bị từ chối.";
                    await _notificationService.CreateNotificationAsync(application.UserId, rejectMessage);
                }
            }

            _applicationRepository.Update(application);
            await _unitOfWork.SaveChangesAsync();

            var userSkills = (await _userSkillRepository.FindAsync(s => s.UserId == application.UserId)).ToList();
            return MapToDto(application, application.Team, application.User, userSkills);
        }

        private static TeamApplicationDto MapToDto(TeamApplications app, Teams team, Users user, List<UserSkills> skills)
        {
            return new TeamApplicationDto
            {
                ApplicationId = app.ApplicationId,
                RecruitmentId = app.RecruitmentId,
                TeamId = app.TeamId,
                TeamName = team?.TeamName ?? string.Empty,
                UserId = app.UserId,
                ApplicantName = user?.FullName ?? string.Empty,
                ApplicantEmail = user?.Email ?? string.Empty,
                ApplicantSkills = skills.Select(s => new UserSkillDto
                {
                    UserSkillId = s.UserSkillId,
                    UserId = s.UserId,
                    Role = s.Role,
                    SkillName = s.SkillName,
                    ExperienceLevel = s.ExperienceLevel,
                    CreatedAt = s.CreatedAt
                }).ToList(),
                Message = app.Message,
                Status = app.Status,
                CreatedAt = app.CreatedAt,
                UpdatedAt = app.UpdatedAt
            };
        }
    }
}
