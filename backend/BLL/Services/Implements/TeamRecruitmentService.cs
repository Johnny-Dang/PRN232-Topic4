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
    public class TeamRecruitmentService : ITeamRecruitmentService
    {
        private readonly IGenericRepository<TeamRecruitments> _recruitmentRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IUnitOfWork _unitOfWork;

        public TeamRecruitmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _recruitmentRepository = _unitOfWork.GetRepository<TeamRecruitments>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<TeamRecruitmentDto> CreateRecruitmentAsync(Guid teamId, Guid leaderUserId, CreateTeamRecruitmentRequest request)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Team with id '{teamId}' not found");

            if (team.TeamLeaderId != leaderUserId)
                throw new Exception("Only the Team Leader can create recruitment posts");

            if (request.Quantity <= 0)
                throw new Exception("Quantity must be greater than 0");

            var recruitment = new TeamRecruitments
            {
                RecruitmentId = Guid.NewGuid(),
                TeamId = teamId,
                RoleNeeded = request.RoleNeeded.Trim(),
                Description = request.Description.Trim(),
                Quantity = request.Quantity,
                Status = "OPEN",
                CreatedAt = DateTime.UtcNow
            };

            await _recruitmentRepository.AddAsync(recruitment);

            // Audit log
            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = leaderUserId,
                ActionType = "TEAM_RECRUITMENT_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(new { recruitment.RecruitmentId, recruitment.TeamId, recruitment.RoleNeeded, recruitment.Quantity }),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(recruitment, team);
        }

        public async Task<List<TeamRecruitmentDto>> GetRecruitmentsAsync(Guid? eventId, Guid? categoryId, string? roleNeeded)
        {
            var allRecruitments = await _recruitmentRepository.GetAllWithIncludeAsync(r => r.Team);
            var query = allRecruitments.Where(r => r.Status == "OPEN").AsQueryable();

            if (eventId.HasValue)
                query = query.Where(r => r.Team != null && r.Team.EventId == eventId.Value);

            if (categoryId.HasValue)
                query = query.Where(r => r.Team != null && r.Team.CategoryId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(roleNeeded))
                query = query.Where(r => r.RoleNeeded.Contains(roleNeeded, StringComparison.OrdinalIgnoreCase));

            return query.Select(r => MapToDto(r, r.Team)).ToList();
        }

        public async Task<TeamRecruitmentDto?> GetByIdAsync(Guid recruitmentId)
        {
            var recruitment = await _recruitmentRepository.FirstOrDefaultWithIncludeAsync(
                r => r.RecruitmentId == recruitmentId,
                r => r.Team
            );

            if (recruitment == null)
                return null;

            return MapToDto(recruitment, recruitment.Team);
        }

        public async Task<List<TeamRecruitmentDto>> GetByTeamIdAsync(Guid teamId)
        {
            var recruitments = await _recruitmentRepository.GetAllWithIncludeAsync(r => r.Team);
            var teamRecruitments = recruitments.Where(r => r.TeamId == teamId).ToList();

            return teamRecruitments.Select(r => MapToDto(r, r.Team)).ToList();
        }

        public async Task<TeamRecruitmentDto> CloseRecruitmentAsync(Guid recruitmentId, Guid leaderUserId)
        {
            var recruitment = await _recruitmentRepository.FirstOrDefaultWithIncludeAsync(
                r => r.RecruitmentId == recruitmentId,
                r => r.Team
            );

            if (recruitment == null)
                throw new Exception($"Recruitment with id '{recruitmentId}' not found");

            if (recruitment.Team != null && recruitment.Team.TeamLeaderId != leaderUserId)
                throw new Exception("Only the Team Leader can close recruitment posts");

            recruitment.Status = "CLOSED";
            recruitment.UpdatedAt = DateTime.UtcNow;

            _recruitmentRepository.Update(recruitment);

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = leaderUserId,
                ActionType = "TEAM_RECRUITMENT_UPDATE",
                OldValue = "OPEN",
                NewValue = "CLOSED",
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(recruitment, recruitment.Team);
        }

        private static TeamRecruitmentDto MapToDto(TeamRecruitments entity, Teams team)
        {
            return new TeamRecruitmentDto
            {
                RecruitmentId = entity.RecruitmentId,
                TeamId = entity.TeamId,
                TeamName = team?.TeamName ?? string.Empty,
                EventId = team?.EventId,
                CategoryId = team?.CategoryId,
                RoleNeeded = entity.RoleNeeded,
                Description = entity.Description,
                Quantity = entity.Quantity,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
