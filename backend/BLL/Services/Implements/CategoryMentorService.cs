using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class CategoryMentorService : ICategoryMentorService
    {
        private readonly IGenericRepository<CategoryMentors> _categoryMentorRepository;
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryMentorService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _categoryMentorRepository = _unitOfWork.GetRepository<CategoryMentors>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _notificationService = notificationService;
        }

        public async Task<CategoryMentorDto> CreateAsync(AddCategoryMentorRequest request, Guid userId)
        {
            await ValidateForeignKeysAsync(request.CategoryId, request.UserId);

            var categoryMentor = new CategoryMentors
            {
                CategoryMentorId = Guid.NewGuid(),
                CategoryId = request.CategoryId,
                UserId = request.UserId,
                Status = "Pending"
            };

            var created = await _categoryMentorRepository.AddAsync(categoryMentor);

            // Create notification for the Mentor
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            var coordinator = await _userRepository.GetByIdAsync(userId);
            var mentor = await _userRepository.GetByIdAsync(request.UserId);

            string notificationMessage = $"[NOTIFICATION] Coordinator {coordinator?.FullName ?? "Unknown"} proposed Mentor {mentor?.FullName ?? "Unknown"} for Category {category?.CategoryName ?? "Unknown"}. Status is Pending.";
            Console.WriteLine(notificationMessage);

            // Save notification to DB for the Mentor
            await _notificationService.CreateNotificationAsync(request.UserId, notificationMessage);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "CATEGORY_ASSIGN_MENTOR",
                OldValue = null,
                NewValue = System.Text.Json.JsonSerializer.Serialize(new
                {
                    created.CategoryMentorId,
                    created.CategoryId,
                    created.UserId,
                    created.Status
                }),
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(created);
        }

        public async Task<CategoryMentorDto?> GetByIdAsync(Guid categoryMentorId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null) return null;
            return MapToDto(categoryMentor);
        }

        public async Task<List<CategoryMentorDto>> GetAllAsync()
        {
            var categoryMentors = await _categoryMentorRepository.GetAllAsync();
            return categoryMentors.Select(MapToDto).ToList();
        }

        public async Task<CategoryMentorDto> UpdateAsync(UpdateCategoryMentorRequest request)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(request.CategoryMentorId);
            if (categoryMentor == null)
                throw new Exception($"CategoryMentor with id {request.CategoryMentorId} not found");

            await ValidateForeignKeysAsync(request.CategoryId, request.UserId);

            categoryMentor.CategoryId = request.CategoryId;
            categoryMentor.UserId = request.UserId;

            _categoryMentorRepository.Update(categoryMentor);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(categoryMentor);
        }

        public async Task DeleteAsync(Guid categoryMentorId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                throw new Exception($"CategoryMentor with id {categoryMentorId} not found");

            _categoryMentorRepository.Delete(categoryMentor);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<CategoryMentorDto> ApproveAsync(Guid categoryMentorId, Guid mentorUserId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                throw new Exception($"CategoryMentor assignment with id {categoryMentorId} not found");

            if (categoryMentor.UserId != mentorUserId)
                throw new Exception("You are not authorized to approve this mentor assignment.");

            if (categoryMentor.Status != "Pending")
                throw new Exception($"Assignment status is '{categoryMentor.Status}', but only 'Pending' assignments can be approved.");

            categoryMentor.Status = "Approved";
            _categoryMentorRepository.Update(categoryMentor);

            // Fetch relations for notification message
            var category = await _categoryRepository.GetByIdAsync(categoryMentor.CategoryId);
            var mentor = await _userRepository.GetByIdAsync(mentorUserId);

            string notificationMessage = $"[NOTIFICATION] Mentor {mentor?.FullName ?? "Unknown"} has Approved the assignment for Category {category?.CategoryName ?? "Unknown"}.";
            Console.WriteLine(notificationMessage);

            // Find the Coordinator who made the proposal to notify them
            var auditLogs = await _unitOfWork.GetRepository<AuditLogs>()
                .FindAsync(a => a.ActionType == "CATEGORY_ASSIGN_MENTOR" && a.NewValue.Contains(categoryMentorId.ToString()));
            var coordinatorId = auditLogs.FirstOrDefault()?.UserId;

            if (coordinatorId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(coordinatorId.Value, notificationMessage);
            }

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "CATEGORY_MENTOR_APPROVED",
                OldValue = "Pending",
                NewValue = "Approved",
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(categoryMentor);
        }

        public async Task<CategoryMentorDto> RejectAsync(Guid categoryMentorId, Guid mentorUserId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                throw new Exception($"CategoryMentor assignment with id {categoryMentorId} not found");

            if (categoryMentor.UserId != mentorUserId)
                throw new Exception("You are not authorized to reject this mentor assignment.");

            if (categoryMentor.Status != "Pending")
                throw new Exception($"Assignment status is '{categoryMentor.Status}', but only 'Pending' assignments can be rejected.");

            categoryMentor.Status = "Rejected";
            _categoryMentorRepository.Update(categoryMentor);

            // Fetch relations for notification message
            var category = await _categoryRepository.GetByIdAsync(categoryMentor.CategoryId);
            var mentor = await _userRepository.GetByIdAsync(mentorUserId);

            string notificationMessage = $"[NOTIFICATION] Mentor {mentor?.FullName ?? "Unknown"} has Rejected the assignment for Category {category?.CategoryName ?? "Unknown"}.";
            Console.WriteLine(notificationMessage);

            // Find the Coordinator who made the proposal to notify them
            var auditLogs = await _unitOfWork.GetRepository<AuditLogs>()
                .FindAsync(a => a.ActionType == "CATEGORY_ASSIGN_MENTOR" && a.NewValue.Contains(categoryMentorId.ToString()));
            var coordinatorId = auditLogs.FirstOrDefault()?.UserId;

            if (coordinatorId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(coordinatorId.Value, notificationMessage);
            }

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "CATEGORY_MENTOR_REJECTED",
                OldValue = "Pending",
                NewValue = "Rejected",
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(categoryMentor);
        }

        private async Task ValidateForeignKeysAsync(Guid categoryId, Guid userId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Category with id {categoryId} not found");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"User with id {userId} not found");

            if (user.Role != "Mentor")
                throw new Exception($"User with id {userId} is not a Mentor. Only users with Mentor role can be assigned.");
        }

        private static CategoryMentorDto MapToDto(CategoryMentors categoryMentor)
        {
            return new CategoryMentorDto
            {
                CategoryMentorId = categoryMentor.CategoryMentorId,
                CategoryId = categoryMentor.CategoryId,
                UserId = categoryMentor.UserId,
                Status = categoryMentor.Status
            };
        }
    }
}
