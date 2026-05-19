using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICategoryMentorService
    {
        Task<CategoryMentorDto> CreateAsync(AddCategoryMentorRequest request);
        Task<CategoryMentorDto?> GetByIdAsync(Guid categoryMentorId);
        Task<List<CategoryMentorDto>> GetAllAsync();
        Task<CategoryMentorDto> UpdateAsync(UpdateCategoryMentorRequest request);
        Task DeleteAsync(Guid categoryMentorId);
    }
}
