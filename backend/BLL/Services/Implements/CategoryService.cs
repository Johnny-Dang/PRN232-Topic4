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
    public class CategoryService : ICategoryService
    {
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _eventRepository = _unitOfWork.GetRepository<Events>();
        }

        public async Task<CategoryDto> CreateAsync(AddCategoryRequest request)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(request.EventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {request.EventId} not found");

            var category = new Categories
            {
                CategoryId = Guid.NewGuid(),
                EventId = request.EventId,
                CategoryName = request.CategoryName,
                Description = request.Description
            };

            var created = await _categoryRepository.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(created);
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null) return null;
            return MapToDto(category);
        }

        public async Task<List<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(MapToDto).ToList();
        }

        public async Task<CategoryDto> UpdateAsync(UpdateCategoryRequest request)
        {
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
                throw new Exception($"Category with id {request.CategoryId} not found");

            var eventEntity = await _eventRepository.GetByIdAsync(request.EventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {request.EventId} not found");

            category.EventId = request.EventId;
            category.CategoryName = request.CategoryName;
            category.Description = request.Description;

            _categoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(category);
        }

        public async Task DeleteAsync(Guid categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Category with id {categoryId} not found");

            _categoryRepository.Delete(category);
            await _unitOfWork.SaveChangesAsync();
        }

        private static CategoryDto MapToDto(Categories category)
        {
            return new CategoryDto
            {
                CategoryId = category.CategoryId,
                EventId = category.EventId,
                CategoryName = category.CategoryName,
                Description = category.Description
            };
        }
    }
}
