using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<CategoryDto> CreateAsync(AddCategoryRequest request, Guid userId);
        Task<CategoryDto?> GetByIdAsync(Guid categoryId);
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto> UpdateAsync(UpdateCategoryRequest request);
        Task DeleteAsync(Guid categoryId);
    }
}
