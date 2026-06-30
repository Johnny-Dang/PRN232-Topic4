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
    public class ScoresService : IScoresService
    {
        private readonly IGenericRepository<Scores> _scoreRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<JudgeAssignments> _assignmentRepository;
        private readonly IGenericRepository<Criteria> _criteriaRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public ScoresService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _scoreRepository = _unitOfWork.GetRepository<Scores>();
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            _criteriaRepository = _unitOfWork.GetRepository<Criteria>();
        }

        public async Task<ScoreDto> CreateAsync(AddScoreRequest request)
        {
            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId);
            if (submission == null)
                throw new Exception($"Submission with id {request.SubmissionId} not found");

            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Judge Assignment with id {request.AssignmentId} not found");

            var criteria = await _criteriaRepository.GetByIdAsync(request.CriteriaId);
            if (criteria == null)
                throw new Exception($"Criteria with id {request.CriteriaId} not found");

            var score = new Scores
            {
                ScoreId = Guid.NewGuid(),
                SubmissionId = request.SubmissionId,
                AssignmentId = request.AssignmentId,
                CriteriaId = request.CriteriaId,
                ScoreValue = request.ScoreValue,
                Comment = request.Comment,
                ScoredAt = DateTime.UtcNow
            };

            var created = await _scoreRepository.AddAsync(score);
            await _unitOfWork.SaveChangesAsync();

            var teamRepository = _unitOfWork.GetRepository<Teams>();
            var team = await teamRepository.GetByIdAsync(submission.TeamId);
            if (team != null)
            {
                var roundRepository = _unitOfWork.GetRepository<Rounds>();
                var round = await roundRepository.GetByIdAsync(submission.RoundId);
                var roundName = round?.RoundName ?? "Unknown Round";
                var message = $"[NOTIFICATION] Bài thi của đội {team.TeamName} tại vòng {roundName} đã được chấm điểm cho tiêu chí {criteria.CriteriaName} bởi Giám khảo.";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, message);
            }

            return MapToDto(created);
        }

        public async Task<ScoreDto?> GetByIdAsync(Guid scoreId)
        {
            var score = await _scoreRepository.GetByIdAsync(scoreId);
            if (score == null) return null;
            return MapToDto(score);
        }

        public async Task<IEnumerable<ScoreDto>> GetAllAsync()
        {
            var scores = await _scoreRepository.GetAllAsync();
            return scores.Select(MapToDto);
        }

        public async Task<ScoreDto> UpdateAsync(UpdateScoreRequest request)
        {
            var score = await _scoreRepository.GetByIdAsync(request.ScoreId);
            if (score == null)
                throw new Exception($"Score with id {request.ScoreId} not found");

            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId);
            if (submission == null)
                throw new Exception($"Submission with id {request.SubmissionId} not found");

            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Judge Assignment with id {request.AssignmentId} not found");

            var criteria = await _criteriaRepository.GetByIdAsync(request.CriteriaId);
            if (criteria == null)
                throw new Exception($"Criteria with id {request.CriteriaId} not found");

            score.SubmissionId = request.SubmissionId;
            score.AssignmentId = request.AssignmentId;
            score.CriteriaId = request.CriteriaId;
            score.ScoreValue = request.ScoreValue;
            score.Comment = request.Comment;
            score.ScoredAt = DateTime.UtcNow;

            _scoreRepository.Update(score);
            await _unitOfWork.SaveChangesAsync();

            var teamRepository = _unitOfWork.GetRepository<Teams>();
            var team = await teamRepository.GetByIdAsync(submission.TeamId);
            if (team != null)
            {
                var roundRepository = _unitOfWork.GetRepository<Rounds>();
                var round = await roundRepository.GetByIdAsync(submission.RoundId);
                var roundName = round?.RoundName ?? "Unknown Round";
                var message = $"[NOTIFICATION] Bài thi của đội {team.TeamName} tại vòng {roundName} đã được cập nhật điểm cho tiêu chí {criteria.CriteriaName} bởi Giám khảo.";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, message);
            }

            return MapToDto(score);
        }

        public async Task DeleteAsync(Guid scoreId)
        {
            var score = await _scoreRepository.GetByIdAsync(scoreId);
            if (score == null)
                throw new Exception($"Score with id {scoreId} not found");

            _scoreRepository.Delete(score);
            await _unitOfWork.SaveChangesAsync();
        }

        private static ScoreDto MapToDto(Scores score)
        {
            return new ScoreDto
            {
                ScoreId = score.ScoreId,
                SubmissionId = score.SubmissionId,
                AssignmentId = score.AssignmentId,
                CriteriaId = score.CriteriaId,
                ScoreValue = score.ScoreValue,
                Comment = score.Comment,
                ScoredAt = score.ScoredAt
            };
        }
    }
}
