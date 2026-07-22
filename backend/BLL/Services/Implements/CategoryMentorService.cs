using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implements
{
    public class CategoryMentorService : ICategoryMentorService
    {
        private readonly IGenericRepository<CategoryMentors> _categoryMentorRepository;
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryMentorService(
            IUnitOfWork unitOfWork,
            INotificationService notificationService
        )
        {
            _unitOfWork = unitOfWork;
            _categoryMentorRepository = _unitOfWork.GetRepository<CategoryMentors>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _notificationService = notificationService;
        }

        public async Task<CategoryMentorDto> CreateAsync(
            AddCategoryMentorRequest request,
            Guid userId
        )
        {
            await ValidateForeignKeysAsync(request.CategoryId, request.UserId);

            var existingAssignments = await _categoryMentorRepository.FindAsync(assignment =>
                assignment.CategoryId == request.CategoryId
                && assignment.UserId == request.UserId
                && (assignment.Status == "Pending" || assignment.Status == "Approved")
            );

            if (existingAssignments.Any())
                throw new Exception(
                    "Mentor này đã có một phân công đang hoạt động cho hạng mục đã chọn."
                );

            var categoryMentor = new CategoryMentors
            {
                CategoryMentorId = Guid.NewGuid(),
                CategoryId = request.CategoryId,
                UserId = request.UserId,
                Status = "Pending",
            };

            var created = await _categoryMentorRepository.AddAsync(categoryMentor);

            // Create notification for the Mentor
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            var coordinator = await _userRepository.GetByIdAsync(userId);
            var mentor = await _userRepository.GetByIdAsync(request.UserId);

            string notificationMessage =
                $"[NOTIFICATION] Coordinator {coordinator?.FullName ?? "Unknown"} proposed Mentor {mentor?.FullName ?? "Unknown"} for Category {category?.CategoryName ?? "Unknown"}. Status is Pending.";
            Console.WriteLine(notificationMessage);

            // Save notification to DB for the Mentor
            await _notificationService.CreateNotificationAsync(request.UserId, notificationMessage);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "CATEGORY_ASSIGN_MENTOR",
                OldValue = null,
                NewValue = System.Text.Json.JsonSerializer.Serialize(
                    new
                    {
                        created.CategoryMentorId,
                        created.CategoryId,
                        created.UserId,
                        created.Status,
                    }
                ),
                CreatedAt = DateTime.UtcNow,
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return await MapToDtoAsync(created, _categoryRepository, _userRepository);
        }

        public async Task<CategoryMentorDto?> GetByIdAsync(Guid categoryMentorId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                return null;
            return await MapToDtoAsync(categoryMentor, _categoryRepository, _userRepository);
        }

        public async Task<List<CategoryMentorDto>> GetAllAsync()
        {
            var categoryMentors = await _categoryMentorRepository.GetAllAsync();
            var result = new List<CategoryMentorDto>();
            foreach (var cm in categoryMentors)
            {
                result.Add(await MapToDtoAsync(cm, _categoryRepository, _userRepository));
            }
            return result;
        }

        public async Task<List<CategoryMentorDto>> GetByMentorUserIdAsync(Guid mentorUserId)
        {
            var categoryMentors = await _categoryMentorRepository.FindAsync(assignment =>
                assignment.UserId == mentorUserId
            );
            var result = new List<CategoryMentorDto>();
            foreach (var cm in categoryMentors)
            {
                result.Add(await MapToDtoAsync(cm, _categoryRepository, _userRepository));
            }
            return result;
        }

        public async Task<List<CategoryMentorDetailDto>> GetByCategoryIdAsync(Guid categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Không tìm thấy hạng mục với id: {categoryId}");

            var categoryMentors = await _categoryMentorRepository.FindAsync(assignment =>
                assignment.CategoryId == categoryId
            );
            var result = new List<CategoryMentorDetailDto>();

            foreach (var assignment in categoryMentors)
            {
                var mentor = await _userRepository.GetByIdAsync(assignment.UserId);
                result.Add(new CategoryMentorDetailDto
                {
                    CategoryMentorId = assignment.CategoryMentorId,
                    CategoryId = assignment.CategoryId,
                    CategoryName = category.CategoryName,
                    UserId = assignment.UserId,
                    MentorFullName = mentor?.FullName ?? string.Empty,
                    MentorEmail = mentor?.Email ?? string.Empty,
                    Status = assignment.Status
                });
            }

            return result;
        }

        public async Task<CategoryMentorDto> UpdateAsync(UpdateCategoryMentorRequest request)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(
                request.CategoryMentorId
            );
            if (categoryMentor == null)
                throw new Exception($"Không tìm thấy mentor hạng mục với id: {request.CategoryMentorId}");

            await ValidateForeignKeysAsync(request.CategoryId, request.UserId);

            categoryMentor.CategoryId = request.CategoryId;
            categoryMentor.UserId = request.UserId;

            _categoryMentorRepository.Update(categoryMentor);
            await _unitOfWork.SaveChangesAsync();

            return await MapToDtoAsync(categoryMentor, _categoryRepository, _userRepository);
        }

        public async Task DeleteAsync(Guid categoryMentorId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                throw new Exception($"Không tìm thấy mentor hạng mục với id: {categoryMentorId}");

            _categoryMentorRepository.Delete(categoryMentor);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<CategoryMentorDto> ApproveAsync(Guid categoryMentorId, Guid mentorUserId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                throw new Exception(
                    $"Không tìm thấy phân công mentor hạng mục với id: {categoryMentorId}"
                );

            if (categoryMentor.UserId != mentorUserId)
                throw new Exception("Bạn không có quyền phê duyệt phân công mentor này.");

            if (categoryMentor.Status != "Pending")
                throw new Exception(
                    $"Trạng thái phân công là '{categoryMentor.Status}', nhưng chỉ có phân công đang 'Chờ duyệt' mới có thể được phê duyệt."
                );

            categoryMentor.Status = "Approved";
            _categoryMentorRepository.Update(categoryMentor);

            // Fetch relations for notification message
            var category = await _categoryRepository.GetByIdAsync(categoryMentor.CategoryId);
            var mentor = await _userRepository.GetByIdAsync(mentorUserId);

            string notificationMessage =
                $"[NOTIFICATION] Mentor {mentor?.FullName ?? "Unknown"} has Approved the assignment for Category {category?.CategoryName ?? "Unknown"}.";
            Console.WriteLine(notificationMessage);

            // Find the Coordinator who made the proposal to notify them
            var auditLogs = await _unitOfWork
                .GetRepository<AuditLogs>()
                .FindAsync(a =>
                    a.ActionType == "CATEGORY_ASSIGN_MENTOR"
                    && a.NewValue.Contains(categoryMentorId.ToString())
                );
            var coordinatorId = auditLogs.FirstOrDefault()?.UserId;

            if (coordinatorId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(
                    coordinatorId.Value,
                    notificationMessage
                );
            }

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "CATEGORY_MENTOR_APPROVED",
                OldValue = "Pending",
                NewValue = "Approved",
                CreatedAt = DateTime.UtcNow,
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return await MapToDtoAsync(categoryMentor, _categoryRepository, _userRepository);
        }

        public async Task<CategoryMentorDto> RejectAsync(Guid categoryMentorId, Guid mentorUserId)
        {
            var categoryMentor = await _categoryMentorRepository.GetByIdAsync(categoryMentorId);
            if (categoryMentor == null)
                throw new Exception(
                    $"Không tìm thấy phân công mentor hạng mục với id: {categoryMentorId}"
                );

            if (categoryMentor.UserId != mentorUserId)
                throw new Exception("Bạn không có quyền từ chối phân công mentor này.");

            if (categoryMentor.Status != "Pending")
                throw new Exception(
                    $"Trạng thái phân công là '{categoryMentor.Status}', nhưng chỉ có phân công đang 'Chờ duyệt' mới có thể được từ chối."
                );

            categoryMentor.Status = "Rejected";
            _categoryMentorRepository.Update(categoryMentor);

            // Fetch relations for notification message
            var category = await _categoryRepository.GetByIdAsync(categoryMentor.CategoryId);
            var mentor = await _userRepository.GetByIdAsync(mentorUserId);

            string notificationMessage =
                $"[NOTIFICATION] Mentor {mentor?.FullName ?? "Unknown"} has Rejected the assignment for Category {category?.CategoryName ?? "Unknown"}.";
            Console.WriteLine(notificationMessage);

            // Find the Coordinator who made the proposal to notify them
            var auditLogs = await _unitOfWork
                .GetRepository<AuditLogs>()
                .FindAsync(a =>
                    a.ActionType == "CATEGORY_ASSIGN_MENTOR"
                    && a.NewValue.Contains(categoryMentorId.ToString())
                );
            var coordinatorId = auditLogs.FirstOrDefault()?.UserId;

            if (coordinatorId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(
                    coordinatorId.Value,
                    notificationMessage
                );
            }

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "CATEGORY_MENTOR_REJECTED",
                OldValue = "Pending",
                NewValue = "Rejected",
                CreatedAt = DateTime.UtcNow,
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return await MapToDtoAsync(categoryMentor, _categoryRepository, _userRepository);
        }

        private async Task ValidateForeignKeysAsync(Guid categoryId, Guid userId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Không tìm thấy hạng mục với id: {categoryId}");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"Không tìm thấy người dùng với id: {userId}");

            if (user.Role != "Mentor")
                throw new Exception(
                    $"Người dùng với id: {userId} không phải là Mentor. Chỉ có người dùng có vai trò Mentor mới có thể được phân công."
                );
        }

        private static async Task<CategoryMentorDto> MapToDtoAsync(CategoryMentors categoryMentor, IGenericRepository<Categories> categoryRepository, IGenericRepository<Users> userRepository)
        {
            var category = await categoryRepository.GetByIdAsync(categoryMentor.CategoryId);
            var mentor = await userRepository.GetByIdAsync(categoryMentor.UserId);

            return new CategoryMentorDto
            {
                CategoryMentorId = categoryMentor.CategoryMentorId,
                CategoryId = categoryMentor.CategoryId,
                CategoryName = category?.CategoryName ?? string.Empty,
                UserId = categoryMentor.UserId,
                MentorFullName = mentor?.FullName ?? string.Empty,
                MentorEmail = mentor?.Email ?? string.Empty,
                Status = categoryMentor.Status,
            };
        }

        private static CategoryMentorDto MapToDto(CategoryMentors categoryMentor)
        {
            return new CategoryMentorDto
            {
                CategoryMentorId = categoryMentor.CategoryMentorId,
                CategoryId = categoryMentor.CategoryId,
                Status = categoryMentor.Status,
            };
        }
    }
}
