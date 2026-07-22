using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implements
{
    public class TeamService : ITeamService
    {
        private const int MaxConcurrentEventsPerUser = 3;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<TeamMembers> _teamMemberRepository;
        private readonly IGenericRepository<EventParticipants> _eventParticipantRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<StudentProfiles> _studentProfileRepository;
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public TeamService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _teamMemberRepository = _unitOfWork.GetRepository<TeamMembers>();
            _eventParticipantRepository = _unitOfWork.GetRepository<EventParticipants>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _studentProfileRepository = _unitOfWork.GetRepository<StudentProfiles>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _eventRepository = _unitOfWork.GetRepository<Events>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<TeamDto> CreateAsync(Guid creatorUserId, AddTeamRequest request)
        {
            var creator = await _userRepository.GetByIdAsync(creatorUserId);
            if (creator == null)
                throw new Exception($"Không tìm thấy người dùng với id: {creatorUserId}");

            if (string.Equals(creator.Role, "Mentor", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(creator.Role, "Judge", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(creator.Role, "Coordinator", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception($"Tài khoản có vai trò {creator.Role} không được phép tạo đội thi đấu.");
            }

            // Update user role to TeamLeader when creating a team
            if (creator.Role == "TeamMember" || string.IsNullOrWhiteSpace(creator.Role))
            {
                creator.Role = "TeamLeader";
                _userRepository.Update(creator);
            }

            var team = new Teams
            {
                TeamId = Guid.NewGuid(),
                TeamName = request.TeamName,
                TeamLeaderId = creatorUserId,
                CategoryId = null,
                TeamStatus = string.IsNullOrWhiteSpace(request.TeamStatus)
                    ? "Active"
                    : request.TeamStatus,
            };

            var createdTeam = await _teamRepository.AddAsync(team);

            var leaderMember = new TeamMembers
            {
                TeamMemberId = Guid.NewGuid(),
                TeamId = createdTeam.TeamId,
                UserId = creatorUserId,
                JoinDate = DateTime.UtcNow,
            };

            await _teamMemberRepository.AddAsync(leaderMember);
            await WriteAuditLogAsync(
                creatorUserId,
                "TEAM_CREATE",
                null,
                JsonSerializer.Serialize(
                    new
                    {
                        team.TeamId,
                        team.TeamName,
                        team.TeamLeaderId,
                        team.CategoryId,
                        team.TeamStatus,
                    }
                )
            );
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(createdTeam);
        }

        public async Task<TeamDto?> GetByIdAsync(Guid teamId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                return null;
            return MapToDto(team);
        }

        public async Task<List<TeamDto>> GetAllAsync()
        {
            var teams = await _teamRepository.GetAllAsync();
            return teams.Select(MapToDto).ToList();
        }

        public async Task<TeamDto> UpdateAsync(UpdateTeamRequest request)
        {
            var team = await _teamRepository.GetByIdAsync(request.TeamId);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {request.TeamId}");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
                throw new Exception($"Không tìm thấy hạng mục với id: {request.CategoryId}");

            var eventId = request.EventId;
            if (!eventId.HasValue)
            {
                var requestCategory = await _categoryRepository.GetByIdAsync(request.CategoryId);
                eventId = requestCategory?.EventId;
            }

            team.TeamName = request.TeamName;
            team.EventId = eventId;
            team.CategoryId = request.CategoryId;
            team.TeamStatus = request.TeamStatus;

            _teamRepository.Update(team);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(team);
        }

        public async Task<TeamDto> SetCategoryAsync(
            Guid teamId,
            Guid requesterUserId,
            SetTeamCategoryRequest request
        )
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {teamId}");

            var teamMembers = await _teamMemberRepository.FindAsync(x => x.TeamId == teamId);
            var isMember = teamMembers.Any(m => m.UserId == requesterUserId);
            if (team.TeamLeaderId != requesterUserId && !isMember)
                throw new Exception("Chỉ trưởng nhóm hoặc thành viên mới có thể chọn hoặc thay đổi hạng mục");

            // Look up the first category of the event if request.CategoryId is not specified
            Guid categoryId = request.CategoryId ?? Guid.Empty;
            if (categoryId == Guid.Empty)
            {
                var eventCategory = await _categoryRepository.FirstOrDefaultAsync(c => c.EventId == request.EventId);
                if (eventCategory == null)
                    throw new Exception("Không tìm thấy hạng mục nào cho sự kiện này");
                categoryId = eventCategory.CategoryId;
            }

            await ValidateTeamReadyForCategoryAsync(team, categoryId, request.EventId);
 
            if (team.EventId != null && team.EventId != Guid.Empty && team.EventId != request.EventId)
            {
                var newTeamId = Guid.NewGuid();
                var newTeam = new Teams
                {
                    TeamId = newTeamId,
                    TeamName = team.TeamName,
                    TeamLeaderId = team.TeamLeaderId,
                    EventId = request.EventId,
                    CategoryId = categoryId,
                    TeamStatus = "Active",
                    HealthStatus = "Green"
                };
 
                await _teamRepository.AddAsync(newTeam);
 
                foreach (var member in teamMembers)
                {
                    await _teamMemberRepository.AddAsync(new TeamMembers
                    {
                        TeamMemberId = Guid.NewGuid(),
                        TeamId = newTeamId,
                        UserId = member.UserId,
                        JoinDate = DateTime.UtcNow
                    });
                }
 
                await WriteAuditLogAsync(
                    requesterUserId,
                    "TEAM_REGISTER_CLONE",
                    null,
                    JsonSerializer.Serialize(new { teamId, NewTeamId = newTeamId, CategoryId = categoryId, request.EventId })
                );
 
                await _unitOfWork.SaveChangesAsync();
 
                var cat = await _categoryRepository.GetByIdAsync(categoryId);
                var catName = cat?.CategoryName ?? "Không xác định";
                await RegisterTeamMembersAsEventParticipantsAsync(teamMembers, request.EventId);
                await _unitOfWork.SaveChangesAsync();
 
                foreach (var member in teamMembers)
                {
                    var msg = $"[NOTIFICATION] Đội mới của bạn {newTeam.TeamName} (được sao chép từ đội cũ) đã đăng ký thi đấu tại Category {catName}.";
                    await _notificationService.CreateNotificationAsync(member.UserId, msg);
                }
 
                return MapToDto(newTeam);
            }
            else
            {
                team.CategoryId = categoryId;
                team.EventId = request.EventId;
 
                _teamRepository.Update(team);
                await WriteAuditLogAsync(
                    requesterUserId,
                    "TEAM_REGISTER",
                    null,
                    JsonSerializer.Serialize(new { teamId, CategoryId = categoryId, request.EventId })
                );
                await _unitOfWork.SaveChangesAsync();
 
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                var categoryName = category?.CategoryName ?? "Không xác định";
                await RegisterTeamMembersAsEventParticipantsAsync(teamMembers, request.EventId);
                await _unitOfWork.SaveChangesAsync();
 
                foreach (var member in teamMembers)
                {
                    var msg =
                        $"[NOTIFICATION] Đội của bạn {team.TeamName} đã đăng ký thi đấu tại Category {categoryName}.";
                    await _notificationService.CreateNotificationAsync(member.UserId, msg);
                }
 
                return MapToDto(team);
            }
        }

        public async Task DeleteAsync(Guid teamId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {teamId}");

            _teamRepository.Delete(team);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<TeamDto> AddMemberAsync(
            Guid teamId,
            Guid requesterUserId,
            AddTeamMemberRequest request
        )
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {teamId}");

            if (team.TeamLeaderId != requesterUserId)
                throw new Exception("Chỉ trưởng nhóm mới có thể thêm thành viên");

            var currentMembers = await _teamMemberRepository.FindAsync(x => x.TeamId == teamId);
            if (currentMembers.Count >= 5)
                throw new Exception("Đội đã đạt giới hạn tối đa 5 thành viên.");

            var memberUser = await ResolveMemberUserAsync(request);
            if (memberUser == null)
                throw new Exception("Không tìm thấy người dùng qua id, email, mã, hoặc mã sinh viên đã cung cấp.");

            if (string.Equals(memberUser.Role, "Mentor", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(memberUser.Role, "Judge", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(memberUser.Role, "Coordinator", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception($"Tài khoản {memberUser.FullName} (vai trò {memberUser.Role}) không được phép gia nhập đội thi đấu.");
            }

            await ValidateMemberEligibilityAsync(memberUser, team);

            var teamMember = new TeamMembers
            {
                TeamMemberId = Guid.NewGuid(),
                TeamId = teamId,
                UserId = memberUser.UserId,
                JoinDate = DateTime.UtcNow,
            };

            await _teamMemberRepository.AddAsync(teamMember);
            if (team.EventId.HasValue)
                await RegisterEventParticipantAsync(memberUser.UserId, team.EventId.Value);

            await WriteAuditLogAsync(
                requesterUserId,
                "TEAM_ADD_MEMBER",
                null,
                JsonSerializer.Serialize(
                    new
                    {
                        teamId,
                        memberUser.UserId,
                        request.Email,
                        request.ShortId,
                        request.StudentCode,
                    }
                )
            );
            await _unitOfWork.SaveChangesAsync();

            var leaderUser = await _userRepository.GetByIdAsync(requesterUserId);
            var leaderName = leaderUser?.FullName ?? "Trưởng nhóm";
            var msg = $"[NOTIFICATION] Bạn đã được thêm vào đội {team.TeamName} bởi {leaderName}.";
            await _notificationService.CreateNotificationAsync(memberUser.UserId, msg);

            return MapToDto(team);
        }

        private async Task<Users?> ResolveMemberUserAsync(AddTeamMemberRequest request)
        {
            if (request.UserId.HasValue)
                return await _userRepository.GetByIdAsync(request.UserId.Value);

            var email = request.Email?.Trim();
            if (!string.IsNullOrWhiteSpace(email))
            {
                var users = await _userRepository.GetAllAsync();
                return users.FirstOrDefault(user =>
                    string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase)
                );
            }

            var shortId = request.ShortId?.Trim();
            if (!string.IsNullOrWhiteSpace(shortId))
            {
                var userByShortId = await _userRepository.FirstOrDefaultAsync(user =>
                    user.ShortId.ToLower() == shortId.ToLower()
                );

                if (userByShortId != null)
                    return userByShortId;

                var userByStudentCode = await ResolveMemberUserByStudentCodeAsync(shortId);
                if (userByStudentCode != null)
                    return userByStudentCode;
            }

            var studentCode = request.StudentCode?.Trim();
            if (!string.IsNullOrWhiteSpace(studentCode))
            {
                var userByStudentCode = await ResolveMemberUserByStudentCodeAsync(studentCode);
                if (userByStudentCode != null)
                    return userByStudentCode;
            }

            throw new Exception("Vui lòng cung cấp UserId, Email, ShortId, hoặc StudentCode để thêm thành viên vào nhóm.");
        }

        private async Task<Users?> ResolveMemberUserByStudentCodeAsync(string studentCode)
        {
            var studentProfile = await _studentProfileRepository.FirstOrDefaultAsync(profile =>
                profile.StudentCode.ToLower() == studentCode.ToLower()
            );

            return studentProfile == null ? null : await _userRepository.GetByIdAsync(studentProfile.UserId);
        }

        private async Task ValidateTeamReadyForCategoryAsync(Teams team, Guid categoryId, Guid eventId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Không tìm thấy hạng mục với id: {categoryId}");

            if (category.EventId != eventId)
                throw new Exception("Hạng mục đã chọn không thuộc sự kiện đã chọn.");

            // Bypassed: A team can reuse its profile and register for a new event even if the current event hasn't ended.

            var teamMembers = await _teamMemberRepository.FindAsync(x => x.TeamId == team.TeamId);
            if (teamMembers.Count < 3)
                throw new Exception(
                    "Đội phải có ít nhất 3 thành viên trước khi chọn hạng mục."
                );

            if (teamMembers.Count > 5)
                throw new Exception("Đội không thể có quá 5 thành viên.");

            var eventData = await _eventRepository.GetByIdAsync(eventId);
            if (eventData == null)
                throw new Exception("Sự kiện liên kết với hạng mục này không tồn tại.");

            if (!eventData.IsPublished || !string.Equals(eventData.Status, "Published", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Sự kiện đã chọn chưa được công bố để đăng ký.");

            if (DateTime.UtcNow >= eventData.EndDate)
                throw new Exception("Đăng ký cho sự kiện này đã đóng.");

            if (
                DateTime.UtcNow < eventData.EndDate
                && string.Equals(team.TeamStatus, "Closed", StringComparison.OrdinalIgnoreCase)
            )
                throw new Exception("Hạng mục chưa mở để đội chọn.");

            await ValidateTeamMembersConcurrentEventLimitAsync(teamMembers, eventData);
            await ValidateTeamMembersEligibleForEventAsync(team, teamMembers, eventId);
        }

        private async Task ValidateTeamMembersConcurrentEventLimitAsync(
            IReadOnlyList<TeamMembers> teamMembers,
            Events targetEvent
        )
        {
            foreach (var member in teamMembers)
            {
                var registrations = await _eventParticipantRepository.FindAsync(participant =>
                    participant.UserId == member.UserId
                    && participant.EventId != targetEvent.EventId
                );

                var concurrentEvents = 0;
                foreach (var eventId in registrations.Select(item => item.EventId).Distinct())
                {
                    var registeredEvent = await _eventRepository.GetByIdAsync(eventId);
                    if (registeredEvent == null || registeredEvent.EndDate < DateTime.UtcNow)
                        continue;

                    var overlapsTargetEvent = registeredEvent.StartDate <= targetEvent.EndDate
                        && registeredEvent.EndDate >= targetEvent.StartDate;
                    if (overlapsTargetEvent)
                        concurrentEvents++;
                }

                if (concurrentEvents >= MaxConcurrentEventsPerUser)
                {
                    throw new Exception(
                        $"Một thành viên đã đăng ký {MaxConcurrentEventsPerUser} sự kiện trùng lặp. "
                        + "Mỗi người tham gia có thể tham gia tối đa 3 sự kiện cùng lúc."
                    );
                }
            }
        }

        private async Task ValidateTeamMembersEligibleForEventAsync(
            Teams team,
            IReadOnlyList<TeamMembers> teamMembers,
            Guid eventId
        )
        {
            foreach (var member in teamMembers)
            {
                await ValidateMemberEligibilityForEventAsync(member.UserId, team, eventId);
            }
        }

        private async Task ValidateMemberEligibilityAsync(Users memberUser, Teams team)
        {
            //if (!string.Equals(memberUser.AccountStatus, "Approved", StringComparison.OrdinalIgnoreCase))
            //    throw new Exception("The user account has not been approved yet.");
            if (team.EventId.HasValue)
            {
                await ValidateMemberEligibilityForEventAsync(memberUser.UserId, team, team.EventId.Value);
                return;
            }

            var joinedMemberships = await _teamMemberRepository.FindAsync(x => x.UserId == memberUser.UserId);

            foreach (var membership in joinedMemberships)
            {
                if (membership.TeamId == team.TeamId)
                    throw new Exception("Người dùng đã là thành viên của đội này.");

                var joinedTeam = await _teamRepository.GetByIdAsync(membership.TeamId);
                if (joinedTeam?.EventId == null)
                    throw new Exception("Người dùng đã thuộc về một đội khác chưa đăng ký sự kiện.");
            }
        }

        private async Task ValidateMemberEligibilityForEventAsync(Guid userId, Teams team, Guid eventId)
        {
            var joinedMemberships = await _teamMemberRepository.FindAsync(x => x.UserId == userId);

            foreach (var membership in joinedMemberships)
            {
                if (membership.TeamId == team.TeamId)
                    continue;

                var joinedTeam = await _teamRepository.GetByIdAsync(membership.TeamId);
                if (joinedTeam?.EventId == eventId)
                    throw new Exception("Người dùng đã thuộc về một đội khác trong sự kiện này.");
            }

            // Bypassed: A user is allowed to register their team to the event even if they have already registered individually.
        }

        private async Task RegisterTeamMembersAsEventParticipantsAsync(
            IReadOnlyList<TeamMembers> teamMembers,
            Guid eventId
        )
        {
            foreach (var member in teamMembers)
            {
                await RegisterEventParticipantAsync(member.UserId, eventId);
            }
        }

        private async Task RegisterEventParticipantAsync(Guid userId, Guid eventId)
        {
            var existing = await _eventParticipantRepository.FirstOrDefaultAsync(x =>
                x.UserId == userId && x.EventId == eventId);

            if (existing != null)
                return;

            await _eventParticipantRepository.AddAsync(new EventParticipants
            {
                EventParticipantId = Guid.NewGuid(),
                EventId = eventId,
                UserId = userId,
                RegisteredAt = DateTime.UtcNow,
                Status = "Registered"
            });
        }

        private async Task WriteAuditLogAsync(
            Guid userId,
            string actionType,
            string? oldValue,
            string newValue
        )
        {
            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = actionType,
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow,
            };

            await _auditLogRepository.AddAsync(auditLog);
        }

        public async Task<List<TeamMemberDetailDto>> GetMembersAsync(Guid teamId)
        {
            var members = await _teamMemberRepository.FindAsync(x => x.TeamId == teamId);
            var result = new List<TeamMemberDetailDto>();
            var studentProfileRepo = _unitOfWork.GetRepository<StudentProfiles>();

            foreach (var member in members)
            {
                var user = await _userRepository.GetByIdAsync(member.UserId);
                if (user == null)
                    continue;

                var studentProfile = (
                    await studentProfileRepo.FindAsync(x => x.UserId == member.UserId)
                ).FirstOrDefault();

                result.Add(
                    new TeamMemberDetailDto
                    {
                        TeamMemberId = member.TeamMemberId,
                        TeamId = member.TeamId,
                        UserId = member.UserId,
                        JoinDate = member.JoinDate,
                        User = new UserDto
                        {
                            UserId = user.UserId,
                            Email = user.Email,
                            FullName = user.FullName,
                            Phone = user.Phone,
                            ShortId = user.ShortId,
                            Role = user.Role,
                            AccountStatus = user.AccountStatus,
                            CreatedAt = user.CreatedAt,
                        },
                        StudentProfile =
                            studentProfile != null
                                ? new StudentProfileDto
                                {
                                    ProfileId = studentProfile.ProfileId,
                                    UserId = studentProfile.UserId,
                                    StudentType = studentProfile.StudentType,
                                    StudentCode = studentProfile.StudentCode,
                                    UniversityName = studentProfile.UniversityName,
                                }
                                : null,
                    }
                );
            }

            return result;
        }

        private static TeamDto MapToDto(Teams team)
        {
            return new TeamDto
            {
                TeamId = team.TeamId,
                TeamName = team.TeamName,
                TeamLeaderId = team.TeamLeaderId,
                EventId = team.EventId,
                CategoryId = team.CategoryId,
                TeamStatus = team.TeamStatus,
            };
        }
    }
}
