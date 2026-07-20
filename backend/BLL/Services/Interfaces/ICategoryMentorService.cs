using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICategoryMentorService
    {
        Task<CategoryMentorDto> CreateAsync(AddCategoryMentorRequest request, Guid userId);
        Task<CategoryMentorDto?> GetByIdAsync(Guid categoryMentorId);
        Task<List<CategoryMentorDto>> GetAllAsync();
        Task<List<CategoryMentorDto>> GetByMentorUserIdAsync(Guid mentorUserId);
        Task<List<CategoryMentorDetailDto>> GetByCategoryIdAsync(Guid categoryId);
        Task<CategoryMentorDto> UpdateAsync(UpdateCategoryMentorRequest request);
        Task DeleteAsync(Guid categoryMentorId);
        Task<CategoryMentorDto> ApproveAsync(Guid categoryMentorId, Guid mentorUserId);
        Task<CategoryMentorDto> RejectAsync(Guid categoryMentorId, Guid mentorUserId);
    }
}
