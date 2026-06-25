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
        private readonly IUnitOfWork _unitOfWork;

        public CategoryMentorService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _categoryMentorRepository = _unitOfWork.GetRepository<CategoryMentors>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _userRepository = _unitOfWork.GetRepository<Users>();
        }

        public async Task<CategoryMentorDto> CreateAsync(AddCategoryMentorRequest request, Guid userId)
        {
            await ValidateForeignKeysAsync(request.CategoryId, request.UserId);

            var categoryMentor = new CategoryMentors
            {
                CategoryMentorId = Guid.NewGuid(),
                CategoryId = request.CategoryId,
                UserId = request.UserId
            };

            var created = await _categoryMentorRepository.AddAsync(categoryMentor);

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
                    created.UserId
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

        private async Task ValidateForeignKeysAsync(Guid categoryId, Guid userId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Category with id {categoryId} not found");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"User with id {userId} not found");
        }

        private static CategoryMentorDto MapToDto(CategoryMentors categoryMentor)
        {
            return new CategoryMentorDto
            {
                CategoryMentorId = categoryMentor.CategoryMentorId,
                CategoryId = categoryMentor.CategoryId,
                UserId = categoryMentor.UserId
            };
        }
    }
}
