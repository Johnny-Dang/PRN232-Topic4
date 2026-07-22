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
        private readonly IGenericRepository<Scores> _scoreRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public JudgeAssignmentService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _scoreRepository = _unitOfWork.GetRepository<Scores>();
        }

        public async Task<JudgeAssignmentDto> CreateAsync(AddJudgeAssignmentRequest request)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new Exception($"Không tìm thấy người dùng với id: {request.UserId}");

            if (user.Role != "Judge")
                throw new Exception("Chỉ người dùng có vai trò Giám khảo mới có thể được phân công làm giám khảo");

            if (!string.Equals(user.AccountStatus, "Active", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Không thể phân công giám khảo có trạng thái tài khoản không hoạt động");

            var round = await _roundRepository.FirstOrDefaultWithIncludeAsync(
                x => x.RoundId == request.RoundId, x => x.Event);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng thi với id: {request.RoundId}");

            if (round.EndDate < DateTime.UtcNow)
                throw new Exception("Không thể phân công giám khảo cho vòng thi đã kết thúc");

            if (round.Event != null && round.Event.EndDate < DateTime.UtcNow)
                throw new Exception($"Không thể phân công giám khảo: sự kiện '{round.Event.EventName}' đã kết thúc");

            if (round.Event != null && !string.Equals(round.Event.Status, "Active", StringComparison.OrdinalIgnoreCase) 
                && !string.Equals(round.Event.Status, "Ongoing", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(round.Event.Status, "Published", StringComparison.OrdinalIgnoreCase))
                throw new Exception($"Không thể phân công giám khảo: sự kiện '{round.Event.EventName}' không hoạt động");

            var existingAssignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.UserId == request.UserId && x.RoundId == request.RoundId);

            if (existingAssignment != null)
                throw new Exception("Giám khảo đã được phân công cho vòng thi này");

            var assignment = new JudgeAssignments
            {
                AssignmentId = Guid.NewGuid(),
                UserId = request.UserId,
                RoundId = request.RoundId
            };

            var created = await _assignmentRepository.AddAsync(assignment);
            await _unitOfWork.SaveChangesAsync();

            var assignmentWithUser = await _assignmentRepository.FirstOrDefaultWithIncludeAsync(
                x => x.AssignmentId == created.AssignmentId, x => x.User);

            var message = $"[NOTIFICATION] Bạn đã được phân công chấm bài thi cho vòng {round.RoundName}.";
            await _notificationService.CreateNotificationAsync(request.UserId, message);

            return MapToDto(assignmentWithUser!);
        }

        public async Task<JudgeAssignmentDto?> GetByIdAsync(Guid assignmentId)
        {
            var assignment = await _assignmentRepository.FirstOrDefaultWithIncludeAsync(
                x => x.AssignmentId == assignmentId, x => x.User);
            if (assignment == null) return null;
            return MapToDto(assignment);
        }

        public async Task<IEnumerable<JudgeAssignmentDto>> GetAllAsync()
        {
            var assignments = await _assignmentRepository.GetAllWithIncludeAsync(x => x.User);
            return assignments.Select(MapToDto);
        }

        public async Task<JudgeAssignmentDto> UpdateAsync(UpdateJudgeAssignmentRequest request)
        {
            var assignment = await _assignmentRepository.FirstOrDefaultWithIncludeAsync(
                x => x.AssignmentId == request.AssignmentId, x => x.User);
            if (assignment == null)
                throw new Exception($"Không tìm thấy phân công giám khảo với id: {request.AssignmentId}");

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new Exception($"Không tìm thấy người dùng với id: {request.UserId}");

            if (user.Role != "Judge")
                throw new Exception("Chỉ người dùng có vai trò Giám khảo mới có thể được phân công làm giám khảo");

            if (!string.Equals(user.AccountStatus, "Active", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Không thể phân công giám khảo có trạng thái tài khoản không hoạt động");

            var round = await _roundRepository.FirstOrDefaultWithIncludeAsync(
                x => x.RoundId == request.RoundId, x => x.Event);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng thi với id: {request.RoundId}");

            if (round.EndDate < DateTime.UtcNow)
                throw new Exception("Không thể phân công giám khảo cho vòng thi đã kết thúc");

            if (round.Event != null && round.Event.EndDate < DateTime.UtcNow)
                throw new Exception($"Không thể phân công giám khảo: sự kiện '{round.Event.EventName}' đã kết thúc");

            if (round.Event != null && !string.Equals(round.Event.Status, "Active", StringComparison.OrdinalIgnoreCase) 
                && !string.Equals(round.Event.Status, "Ongoing", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(round.Event.Status, "Published", StringComparison.OrdinalIgnoreCase))
                throw new Exception($"Không thể phân công giám khảo: sự kiện '{round.Event.EventName}' không hoạt động");

            var existingAssignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.AssignmentId != request.AssignmentId &&
                x.UserId == request.UserId &&
                x.RoundId == request.RoundId);

            if (existingAssignment != null)
                throw new Exception("Giám khảo đã được phân công cho vòng thi này");

            assignment.UserId = request.UserId;
            assignment.RoundId = request.RoundId;

            _assignmentRepository.Update(assignment);
            await _unitOfWork.SaveChangesAsync();

            var message = $"[NOTIFICATION] Bạn đã được phân công chấm bài thi cho vòng {round.RoundName}.";
            await _notificationService.CreateNotificationAsync(request.UserId, message);

            var assignmentWithUser = await _assignmentRepository.FirstOrDefaultWithIncludeAsync(
                x => x.AssignmentId == assignment.AssignmentId, x => x.User);

            return MapToDto(assignmentWithUser!);
        }

        public async Task DeleteAsync(Guid assignmentId)
        {
            var assignment = await _assignmentRepository.FirstOrDefaultWithIncludeAsync(
                x => x.AssignmentId == assignmentId, x => x.User);
            if (assignment == null)
                throw new Exception($"Không tìm thấy phân công giám khảo với id: {assignmentId}");

            // Delete related Scores first
            var relatedScores = await _scoreRepository.GetAllAsync();
            var scoresToDelete = relatedScores.Where(s => s.AssignmentId == assignmentId).ToList();
            foreach (var score in scoresToDelete)
            {
                _scoreRepository.Delete(score);
            }

            _assignmentRepository.Delete(assignment);
            await _unitOfWork.SaveChangesAsync();
        }

        private static JudgeAssignmentDto MapToDto(JudgeAssignments assignment)
        {
            return new JudgeAssignmentDto
            {
                AssignmentId = assignment.AssignmentId,
                UserId = assignment.UserId,
                UserFullName = assignment.User?.FullName ?? string.Empty,
                UserEmail = assignment.User?.Email ?? string.Empty,
                RoundId = assignment.RoundId
            };
        }
    }
}
