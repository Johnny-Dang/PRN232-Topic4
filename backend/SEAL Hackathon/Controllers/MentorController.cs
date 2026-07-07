using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize(Policy = "MentorOnly")]
    [Route("api/[controller]")]
    public class MentorController : ControllerBase
    {
        private readonly ICategoryMentorService _categoryMentorService;
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;

        public MentorController(ICategoryMentorService categoryMentorService, IUnitOfWork unitOfWork)
        {
            _categoryMentorService = categoryMentorService;
            _categoryRepository = unitOfWork.GetRepository<Categories>();
            _eventRepository = unitOfWork.GetRepository<Events>();
            _teamRepository = unitOfWork.GetRepository<Teams>();
            _submissionRepository = unitOfWork.GetRepository<Submissions>();
            _roundRepository = unitOfWork.GetRepository<Rounds>();
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetAssignments()
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                var assignments = await _categoryMentorService.GetByMentorUserIdAsync(mentorUserId);
                var result = new List<CategoryMentorDetailDto>();

                foreach (var assignment in assignments)
                {
                    var category = await _categoryRepository.GetByIdAsync(assignment.CategoryId);
                    result.Add(new CategoryMentorDetailDto
                    {
                        CategoryMentorId = assignment.CategoryMentorId,
                        CategoryId = assignment.CategoryId,
                        CategoryName = category?.CategoryName ?? string.Empty,
                        UserId = assignment.UserId,
                        Status = assignment.Status
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetApprovedCategories()
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                var assignments = await _categoryMentorService.GetByMentorUserIdAsync(mentorUserId);
                var approvedAssignments = assignments.Where(assignment => assignment.Status == "Approved").ToList();
                var result = new List<MentorCategoryDto>();

                foreach (var assignment in approvedAssignments)
                {
                    var category = await _categoryRepository.GetByIdAsync(assignment.CategoryId);
                    if (category == null) continue;

                    var eventEntity = await _eventRepository.GetByIdAsync(category.EventId);
                    result.Add(new MentorCategoryDto
                    {
                        CategoryId = category.CategoryId,
                        EventId = category.EventId,
                        CategoryName = category.CategoryName,
                        Description = category.Description,
                        EventName = eventEntity?.EventName ?? string.Empty,
                        AssignmentStatus = assignment.Status
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("teams")]
        public async Task<IActionResult> GetTeams()
        {
            try
            {
                var categories = await GetApprovedCategoryLookupAsync();
                var categoryIds = categories.Keys.ToHashSet();
                var teams = await _teamRepository.FindAsync(team =>
                    team.CategoryId.HasValue && categoryIds.Contains(team.CategoryId.Value)
                );

                var result = teams.Select(team =>
                {
                    var category = categories[team.CategoryId!.Value];
                    return new MentorTeamDto
                    {
                        TeamId = team.TeamId,
                        TeamName = team.TeamName,
                        TeamLeaderId = team.TeamLeaderId,
                        CategoryId = category.CategoryId,
                        CategoryName = category.CategoryName,
                        TeamStatus = team.TeamStatus
                    };
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("submissions")]
        public async Task<IActionResult> GetSubmissions()
        {
            try
            {
                var categories = await GetApprovedCategoryLookupAsync();
                var categoryIds = categories.Keys.ToHashSet();
                var teams = await _teamRepository.FindAsync(team =>
                    team.CategoryId.HasValue && categoryIds.Contains(team.CategoryId.Value)
                );
                var teamLookup = teams.ToDictionary(team => team.TeamId, team => team);
                var teamIds = teamLookup.Keys.ToHashSet();
                var submissions = await _submissionRepository.FindAsync(submission => submission.TeamId.HasValue && teamIds.Contains(submission.TeamId.Value));
                var result = new List<MentorSubmissionDto>();

                foreach (var submission in submissions)
                {
                    var team = teamLookup[submission.TeamId!.Value];
                    if (!team.CategoryId.HasValue) continue;

                    var category = categories[team.CategoryId.Value];
                    var round = await _roundRepository.GetByIdAsync(submission.RoundId);

                    result.Add(new MentorSubmissionDto
                    {
                        SubmissionId = submission.SubmissionId,
                        TeamId = submission.TeamId,
                        TeamName = team.TeamName,
                        CategoryId = category.CategoryId,
                        CategoryName = category.CategoryName,
                        RoundId = submission.RoundId,
                        RoundName = round?.RoundName ?? string.Empty,
                        RepositoryURL = submission.RepositoryURL,
                        DemoURL = submission.DemoURL,
                        SlideURL = submission.SlideURL,
                        SubmittedAt = submission.SubmittedAt,
                        Status = submission.Status
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task<Dictionary<Guid, Categories>> GetApprovedCategoryLookupAsync()
        {
            var mentorUserId = GetCurrentUserId();
            var assignments = await _categoryMentorService.GetByMentorUserIdAsync(mentorUserId);
            var approvedCategoryIds = assignments
                .Where(assignment => assignment.Status == "Approved")
                .Select(assignment => assignment.CategoryId)
                .ToHashSet();
            var categories = await _categoryRepository.FindAsync(category => approvedCategoryIds.Contains(category.CategoryId));
            return categories.ToDictionary(category => category.CategoryId, category => category);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new Exception("Invalid user token");

            return userId;
        }
    }
}
