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
    public class UserSkillService : IUserSkillService
    {
        private readonly IGenericRepository<UserSkills> _userSkillRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserSkillService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _userSkillRepository = _unitOfWork.GetRepository<UserSkills>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<List<UserSkillDto>> UpdateUserSkillsAsync(Guid userId, UpdateUserSkillsRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"User with id '{userId}' not found");

            // Remove existing skills for this user
            var existingSkills = await _userSkillRepository.FindAsync(s => s.UserId == userId);
            foreach (var existing in existingSkills)
            {
                _userSkillRepository.Delete(existing);
            }

            var newSkills = new List<UserSkills>();
            foreach (var item in request.Skills)
            {
                var skill = new UserSkills
                {
                    UserSkillId = Guid.NewGuid(),
                    UserId = userId,
                    Role = item.Role.Trim(),
                    SkillName = item.SkillName.Trim(),
                    ExperienceLevel = item.ExperienceLevel?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };
                await _userSkillRepository.AddAsync(skill);
                newSkills.Add(skill);
            }

            // Write Audit Log
            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "PROFILE_SKILL_UPDATE",
                OldValue = JsonSerializer.Serialize(existingSkills.Select(s => new { s.Role, s.SkillName })),
                NewValue = JsonSerializer.Serialize(newSkills.Select(s => new { s.Role, s.SkillName })),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            return newSkills.Select(MapToDto).ToList();
        }

        public async Task<List<UserSkillDto>> GetUserSkillsAsync(Guid userId)
        {
            var skills = await _userSkillRepository.FindAsync(s => s.UserId == userId);
            return skills.Select(MapToDto).ToList();
        }

        private static UserSkillDto MapToDto(UserSkills entity)
        {
            return new UserSkillDto
            {
                UserSkillId = entity.UserSkillId,
                UserId = entity.UserId,
                Role = entity.Role,
                SkillName = entity.SkillName,
                ExperienceLevel = entity.ExperienceLevel,
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
