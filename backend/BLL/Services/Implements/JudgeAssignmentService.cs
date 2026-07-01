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
    public class JudgeAssignmentService : IJudgeAssignmentService
    {
        private readonly IGenericRepository<JudgeAssignments> _assignmentRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public JudgeAssignmentService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
        }

        public async Task<JudgeAssignmentDto> CreateAsync(AddJudgeAssignmentRequest request)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new Exception($"User with id {request.UserId} not found");

            if (user.Role != "Judge")
                throw new Exception("Only users with Judge role can be assigned as judges");

            var round = await _roundRepository.GetByIdAsync(request.RoundId);
            if (round == null)
                throw new Exception($"Round with id {request.RoundId} not found");

            var existingAssignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.UserId == request.UserId && x.RoundId == request.RoundId);

            if (existingAssignment != null)
                throw new Exception("Judge is already assigned to this round");

            var assignment = new JudgeAssignments
            {
                AssignmentId = Guid.NewGuid(),
                UserId = request.UserId,
                RoundId = request.RoundId
            };

            var created = await _assignmentRepository.AddAsync(assignment);
            await _unitOfWork.SaveChangesAsync();

            var message = $"[NOTIFICATION] Bạn đã được phân công chấm bài thi cho vòng {round.RoundName}.";
            await _notificationService.CreateNotificationAsync(request.UserId, message);

            return MapToDto(created);
        }

        public async Task<JudgeAssignmentDto?> GetByIdAsync(Guid assignmentId)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
            if (assignment == null) return null;
            return MapToDto(assignment);
        }

        public async Task<IEnumerable<JudgeAssignmentDto>> GetAllAsync()
        {
            var assignments = await _assignmentRepository.GetAllAsync();
            return assignments.Select(MapToDto);
        }

        public async Task<JudgeAssignmentDto> UpdateAsync(UpdateJudgeAssignmentRequest request)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Judge Assignment with id {request.AssignmentId} not found");

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new Exception($"User with id {request.UserId} not found");

            if (user.Role != "Judge")
                throw new Exception("Only users with Judge role can be assigned as judges");

            var round = await _roundRepository.GetByIdAsync(request.RoundId);
            if (round == null)
                throw new Exception($"Round with id {request.RoundId} not found");

            var existingAssignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.AssignmentId != request.AssignmentId &&
                x.UserId == request.UserId &&
                x.RoundId == request.RoundId);

            if (existingAssignment != null)
                throw new Exception("Judge is already assigned to this round");

            assignment.UserId = request.UserId;
            assignment.RoundId = request.RoundId;

            _assignmentRepository.Update(assignment);
            await _unitOfWork.SaveChangesAsync();

            var message = $"[NOTIFICATION] Bạn đã được phân công chấm bài thi cho vòng {round.RoundName}.";
            await _notificationService.CreateNotificationAsync(request.UserId, message);

            return MapToDto(assignment);
        }

        public async Task DeleteAsync(Guid assignmentId)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
            if (assignment == null)
                throw new Exception($"Judge Assignment with id {assignmentId} not found");

            _assignmentRepository.Delete(assignment);
            await _unitOfWork.SaveChangesAsync();
        }

        private static JudgeAssignmentDto MapToDto(JudgeAssignments assignment)
        {
            return new JudgeAssignmentDto
            {
                AssignmentId = assignment.AssignmentId,
                UserId = assignment.UserId,
                RoundId = assignment.RoundId
            };
        }
    }
}
