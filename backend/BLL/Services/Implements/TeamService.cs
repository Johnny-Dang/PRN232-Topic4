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
    public class TeamService : ITeamService
    {
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<TeamMembers> _teamMemberRepository;
        private readonly IGenericRepository<Users> _userRepository;
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
            _userRepository = _unitOfWork.GetRepository<Users>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _eventRepository = _unitOfWork.GetRepository<Events>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<TeamDto> CreateAsync(Guid creatorUserId, AddTeamRequest request)
        {
            var creator = await _userRepository.GetByIdAsync(creatorUserId);
            if (creator == null)
                throw new Exception($"User with id {creatorUserId} not found");

            if (request.CategoryId.HasValue)
            {
                throw new Exception("Cannot choose a category during team creation. You must have at least 3 members first.");
            }

            var team = new Teams
            {
                TeamId = Guid.NewGuid(),
                TeamName = request.TeamName,
                TeamLeaderId = creatorUserId,
                CategoryId = request.CategoryId,
                TeamStatus = string.IsNullOrWhiteSpace(request.TeamStatus) ? "Active" : request.TeamStatus
            };

            var createdTeam = await _teamRepository.AddAsync(team);

            var leaderMember = new TeamMembers
            {
                TeamMemberId = Guid.NewGuid(),
                TeamId = createdTeam.TeamId,
                UserId = creatorUserId,
                JoinDate = DateTime.UtcNow
            };

            await _teamMemberRepository.AddAsync(leaderMember);
            await WriteAuditLogAsync(creatorUserId, "TEAM_CREATE", null, JsonSerializer.Serialize(new
            {
                team.TeamId,
                team.TeamName,
                team.TeamLeaderId,
                team.CategoryId,
                team.TeamStatus
            }));
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(createdTeam);
        }

        public async Task<TeamDto?> GetByIdAsync(Guid teamId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null) return null;
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
                throw new Exception($"Team with id {request.TeamId} not found");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
                throw new Exception($"Category with id {request.CategoryId} not found");

            team.TeamName = request.TeamName;
            team.CategoryId = request.CategoryId;
            team.TeamStatus = request.TeamStatus;

            _teamRepository.Update(team);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(team);
        }

        public async Task<TeamDto> SetCategoryAsync(Guid teamId, Guid requesterUserId, SetTeamCategoryRequest request)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Team with id {teamId} not found");

            if (team.TeamLeaderId != requesterUserId)
                throw new Exception("Only the team leader can choose or change the category");

            await ValidateTeamReadyForCategoryAsync(team, request.CategoryId);

            team.CategoryId = request.CategoryId;

            _teamRepository.Update(team);
            await WriteAuditLogAsync(requesterUserId, "TEAM_REGISTER", null, JsonSerializer.Serialize(new
            {
                teamId,
                request.CategoryId
            }));
            await _unitOfWork.SaveChangesAsync();

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            var categoryName = category?.CategoryName ?? "Unknown Category";
            var teamMembers = await _teamMemberRepository.FindAsync(x => x.TeamId == teamId);
            foreach (var member in teamMembers)
            {
                var msg = $"[NOTIFICATION] Đội của bạn {team.TeamName} đã đăng ký thi đấu tại Category {categoryName}.";
                await _notificationService.CreateNotificationAsync(member.UserId, msg);
            }

            return MapToDto(team);
        }

        public async Task DeleteAsync(Guid teamId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Team with id {teamId} not found");

            _teamRepository.Delete(team);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<TeamDto> AddMemberAsync(Guid teamId, Guid requesterUserId, AddTeamMemberRequest request)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Team with id {teamId} not found");

            if (team.TeamLeaderId != requesterUserId)
                throw new Exception("Only the team leader can add members");

            var currentMembers = await _teamMemberRepository.FindAsync(x => x.TeamId == teamId);
            if (currentMembers.Count >= 5)
                throw new Exception("The team has already reached the maximum limit of 5 members.");

            var memberUser = await _userRepository.GetByIdAsync(request.UserId);
            if (memberUser == null)
                throw new Exception($"User with id {request.UserId} not found");

            ValidateMemberEligibility(memberUser, teamId);

            var teamMember = new TeamMembers
            {
                TeamMemberId = Guid.NewGuid(),
                TeamId = teamId,
                UserId = request.UserId,
                JoinDate = DateTime.UtcNow
            };

            await _teamMemberRepository.AddAsync(teamMember);
            await WriteAuditLogAsync(requesterUserId, "TEAM_ADD_MEMBER", null, JsonSerializer.Serialize(new
            {
                teamId,
                request.UserId
            }));
            await _unitOfWork.SaveChangesAsync();

            var leaderUser = await _userRepository.GetByIdAsync(requesterUserId);
            var leaderName = leaderUser?.FullName ?? "Trưởng nhóm";
            var msg = $"[NOTIFICATION] Bạn đã được thêm vào đội {team.TeamName} bởi {leaderName}.";
            await _notificationService.CreateNotificationAsync(request.UserId, msg);

            return MapToDto(team);
        }

        private async Task ValidateTeamReadyForCategoryAsync(Teams team, Guid categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Category with id {categoryId} not found");

            var teamMembers = await _teamMemberRepository.FindAsync(x => x.TeamId == team.TeamId);
            if (teamMembers.Count < 3)
                throw new Exception("The team must have at least 3 members before choosing a category.");

            if (teamMembers.Count > 5)
                throw new Exception("The team cannot have more than 5 members.");

            var eventData = await _eventRepository.GetByIdAsync(category.EventId);
            if (eventData == null)
                throw new Exception("The event associated with this category does not exist.");

            if (DateTime.UtcNow >= eventData.StartDate)
                throw new Exception("Registration for this event is already closed.");

            if (DateTime.UtcNow < eventData.EndDate && string.Equals(team.TeamStatus, "Closed", StringComparison.OrdinalIgnoreCase))
                throw new Exception("The category is not open for team selection.");
        }

        private void ValidateMemberEligibility(Users memberUser, Guid teamId)
        {
            if (!string.Equals(memberUser.AccountStatus, "Approved", StringComparison.OrdinalIgnoreCase))
                throw new Exception("The user account has not been approved yet.");

            var joinedTeam = _teamMemberRepository.FirstOrDefaultAsync(x => x.UserId == memberUser.UserId)
                .GetAwaiter()
                .GetResult();

            if (joinedTeam != null)
            {
                if (joinedTeam.TeamId == teamId)
                    throw new Exception("The user is already a member of this team.");
                else
                    throw new Exception("The user already belongs to another team.");
            }
        }

        private async Task WriteAuditLogAsync(Guid userId, string actionType, string? oldValue, string newValue)
        {
            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = actionType,
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow
            };

            await _auditLogRepository.AddAsync(auditLog);
        }

        private static TeamDto MapToDto(Teams team)
        {
            return new TeamDto
            {
                TeamId = team.TeamId,
                TeamName = team.TeamName,
                TeamLeaderId = team.TeamLeaderId,
                CategoryId = team.CategoryId,
                TeamStatus = team.TeamStatus
            };
        }
    }
}
