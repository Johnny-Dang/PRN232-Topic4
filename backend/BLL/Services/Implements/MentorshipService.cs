using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class MentorshipService : IMentorshipService
    {
        private readonly IGenericRepository<MentorSchedules> _scheduleRepository;
        private readonly IGenericRepository<MentorBookings> _bookingRepository;
        private readonly IGenericRepository<MentoringFeedbacks> _feedbackRepository;
        private readonly IGenericRepository<CategoryMentors> _categoryMentorRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public MentorshipService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _scheduleRepository = _unitOfWork.GetRepository<MentorSchedules>();
            _bookingRepository = _unitOfWork.GetRepository<MentorBookings>();
            _feedbackRepository = _unitOfWork.GetRepository<MentoringFeedbacks>();
            _categoryMentorRepository = _unitOfWork.GetRepository<CategoryMentors>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
            _eventRepository = _unitOfWork.GetRepository<Events>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<MentorScheduleDto> CreateScheduleAsync(Guid mentorUserId, CreateScheduleDto dto)
        {
            if (dto.StartTime >= dto.EndTime)
                throw new Exception("StartTime must be earlier than EndTime");

            if (dto.StartTime < DateTime.UtcNow)
                throw new Exception("Cannot create schedule slot in the past");

            var mentorUser = await _userRepository.GetByIdAsync(mentorUserId);
            if (mentorUser == null)
                throw new Exception("Mentor user not found");

            var schedule = new MentorSchedules
            {
                ScheduleId = Guid.NewGuid(),
                MentorUserId = mentorUserId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                MeetingLocation = dto.MeetingLocation,
                IsBooked = false
            };

            await _scheduleRepository.AddAsync(schedule);

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "MENTOR_SCHEDULE_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(dto),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            return new MentorScheduleDto
            {
                ScheduleId = schedule.ScheduleId,
                MentorUserId = schedule.MentorUserId,
                MentorName = mentorUser.FullName,
                MentorEmail = mentorUser.Email,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                MeetingLocation = schedule.MeetingLocation,
                IsBooked = schedule.IsBooked
            };
        }

        public async Task<List<MentorScheduleDto>> GetMentorSchedulesAsync(Guid mentorUserId)
        {
            var schedules = await _scheduleRepository.FindAsync(s => s.MentorUserId == mentorUserId);
            var mentorUser = await _userRepository.GetByIdAsync(mentorUserId);
            var mentorName = mentorUser?.FullName ?? string.Empty;
            var mentorEmail = mentorUser?.Email ?? string.Empty;

            return schedules
                .OrderBy(s => s.StartTime)
                .Select(s => new MentorScheduleDto
                {
                    ScheduleId = s.ScheduleId,
                    MentorUserId = s.MentorUserId,
                    MentorName = mentorName,
                    MentorEmail = mentorEmail,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    MeetingLocation = s.MeetingLocation,
                    IsBooked = s.IsBooked
                })
                .ToList();
        }

        public async Task<bool> DeleteScheduleAsync(Guid mentorUserId, Guid scheduleId)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
            if (schedule == null)
                throw new Exception("Schedule slot not found");

            if (schedule.MentorUserId != mentorUserId)
                throw new Exception("You are not authorized to delete this schedule slot");

            if (schedule.IsBooked)
                throw new Exception("Cannot delete a schedule slot that has already been booked");

            _scheduleRepository.Delete(schedule);

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "MENTOR_SCHEDULE_DELETE",
                OldValue = JsonSerializer.Serialize(schedule),
                NewValue = null!,
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<List<MentorScheduleDto>> GetAvailableSchedulesForCategoryAsync(Guid categoryId)
        {
            var categoryMentors = await _categoryMentorRepository.FindAsync(cm => cm.CategoryId == categoryId && cm.Status == "Approved");
            var mentorUserIds = categoryMentors.Select(cm => cm.UserId).ToHashSet();

            if (!mentorUserIds.Any())
                return new List<MentorScheduleDto>();

            var schedules = await _scheduleRepository.FindAsync(s => mentorUserIds.Contains(s.MentorUserId) && !s.IsBooked && s.StartTime > DateTime.UtcNow);
            var users = await _userRepository.FindAsync(u => mentorUserIds.Contains(u.UserId));
            var userDict = users.ToDictionary(u => u.UserId, u => u);

            return schedules
                .OrderBy(s => s.StartTime)
                .Select(s =>
                {
                    userDict.TryGetValue(s.MentorUserId, out var mentorUser);
                    return new MentorScheduleDto
                    {
                        ScheduleId = s.ScheduleId,
                        MentorUserId = s.MentorUserId,
                        MentorName = mentorUser?.FullName ?? string.Empty,
                        MentorEmail = mentorUser?.Email ?? string.Empty,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime,
                        MeetingLocation = s.MeetingLocation,
                        IsBooked = s.IsBooked
                    };
                })
                .ToList();
        }

        public async Task<MentorBookingDto> BookMentoringAsync(Guid teamLeaderUserId, CreateBookingDto dto)
        {
            var leaderTeams = await _teamRepository.FindAsync(t => t.TeamLeaderId == teamLeaderUserId);
            var team = leaderTeams.FirstOrDefault();
            if (team == null)
                throw new Exception("You are not the leader of any team");

            var schedule = await _scheduleRepository.GetByIdAsync(dto.ScheduleId);
            if (schedule == null)
                throw new Exception("Schedule slot not found");

            if (schedule.IsBooked)
                throw new Exception("This schedule slot has already been booked");

            if (schedule.StartTime < DateTime.UtcNow)
                throw new Exception("Cannot book a schedule slot in the past");

            schedule.IsBooked = true;
            _scheduleRepository.Update(schedule);

            var booking = new MentorBookings
            {
                BookingId = Guid.NewGuid(),
                ScheduleId = schedule.ScheduleId,
                TeamId = team.TeamId,
                MentorUserId = schedule.MentorUserId,
                Objective = dto.Objective.Trim(),
                Status = "PENDING",
                MeetingLink = schedule.MeetingLocation,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddAsync(booking);

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = teamLeaderUserId,
                ActionType = "MENTOR_BOOKING_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(dto),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            // Notify Mentor about new booking
            var mentorUser = await _userRepository.GetByIdAsync(schedule.MentorUserId);
            if (mentorUser != null)
            {
                var mentorMessage = $"[YÊU CẦU MENTORING] Đội {team.TeamName} đã đặt lịch mentoring với bạn vào lúc {schedule.StartTime:HH:mm dd/MM/yyyy}. Mục tiêu: {booking.Objective}";
                await _notificationService.CreateNotificationAsync(schedule.MentorUserId, mentorMessage);
            }

            return new MentorBookingDto
            {
                BookingId = booking.BookingId,
                ScheduleId = schedule.ScheduleId,
                TeamId = team.TeamId,
                TeamName = team.TeamName,
                MentorUserId = schedule.MentorUserId,
                MentorName = mentorUser?.FullName ?? string.Empty,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                Objective = booking.Objective,
                Status = booking.Status,
                MeetingLink = booking.MeetingLink,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt
            };
        }

        public async Task<List<MentorBookingDto>> GetMyBookingsAsync(Guid userId, string userRole)
        {
            List<MentorBookings> bookings;

            if (userRole.Equals("Mentor", StringComparison.OrdinalIgnoreCase))
            {
                bookings = (await _bookingRepository.FindAsync(b => b.MentorUserId == userId)).ToList();
            }
            else if (userRole.Equals("Student", StringComparison.OrdinalIgnoreCase) || userRole.Equals("Leader", StringComparison.OrdinalIgnoreCase))
            {
                var myTeams = await _teamRepository.FindAsync(t => t.TeamLeaderId == userId);
                var myTeamIds = myTeams.Select(t => t.TeamId).ToHashSet();
                bookings = (await _bookingRepository.FindAsync(b => myTeamIds.Contains(b.TeamId))).ToList();
            }
            else
            {
                bookings = (await _bookingRepository.GetAllAsync()).ToList();
            }

            if (!bookings.Any())
                return new List<MentorBookingDto>();

            var scheduleIds = bookings.Select(b => b.ScheduleId).ToHashSet();
            var teamIds = bookings.Select(b => b.TeamId).ToHashSet();
            var mentorUserIds = bookings.Select(b => b.MentorUserId).ToHashSet();

            var schedules = (await _scheduleRepository.FindAsync(s => scheduleIds.Contains(s.ScheduleId))).ToDictionary(s => s.ScheduleId, s => s);
            var teams = (await _teamRepository.FindAsync(t => teamIds.Contains(t.TeamId))).ToDictionary(t => t.TeamId, t => t);
            var mentors = (await _userRepository.FindAsync(u => mentorUserIds.Contains(u.UserId))).ToDictionary(u => u.UserId, u => u);

            return bookings
                .OrderByDescending(b => b.CreatedAt)
                .Select(b =>
                {
                    schedules.TryGetValue(b.ScheduleId, out var sch);
                    teams.TryGetValue(b.TeamId, out var tm);
                    mentors.TryGetValue(b.MentorUserId, out var mtr);

                    return new MentorBookingDto
                    {
                        BookingId = b.BookingId,
                        ScheduleId = b.ScheduleId,
                        TeamId = b.TeamId,
                        TeamName = tm?.TeamName ?? string.Empty,
                        MentorUserId = b.MentorUserId,
                        MentorName = mtr?.FullName ?? string.Empty,
                        StartTime = sch?.StartTime ?? DateTime.MinValue,
                        EndTime = sch?.EndTime ?? DateTime.MinValue,
                        Objective = b.Objective,
                        Status = b.Status,
                        MeetingLink = b.MeetingLink,
                        Notes = b.Notes,
                        CreatedAt = b.CreatedAt
                    };
                })
                .ToList();
        }

        public async Task<MentorBookingDto> UpdateBookingStatusAsync(Guid mentorUserId, Guid bookingId, UpdateBookingStatusDto dto)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                throw new Exception("Booking not found");

            if (booking.MentorUserId != mentorUserId)
                throw new Exception("You are not authorized to update this booking");

            var oldStatus = booking.Status;
            booking.Status = dto.Status.ToUpper();
            if (!string.IsNullOrWhiteSpace(dto.MeetingLink))
                booking.MeetingLink = dto.MeetingLink.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Notes))
                booking.Notes = dto.Notes.Trim();

            _bookingRepository.Update(booking);

            // If REJECTED or CANCELLED, free up the schedule slot
            if (booking.Status == "REJECTED" || booking.Status == "CANCELLED")
            {
                var schedule = await _scheduleRepository.GetByIdAsync(booking.ScheduleId);
                if (schedule != null)
                {
                    schedule.IsBooked = false;
                    _scheduleRepository.Update(schedule);
                }
            }

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "MENTOR_BOOKING_UPDATE_STATUS",
                OldValue = oldStatus,
                NewValue = JsonSerializer.Serialize(dto),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            // Notify Team Leader about booking status update
            var team = await _teamRepository.GetByIdAsync(booking.TeamId);
            var mentorUser = await _userRepository.GetByIdAsync(booking.MentorUserId);
            var scheduleEntity = await _scheduleRepository.GetByIdAsync(booking.ScheduleId);

            if (team != null && mentorUser != null)
            {
                var statusMessage = booking.Status switch
                {
                    "CONFIRMED" => $"[MENTORING XÁC NHẬN] Lịch mentoring với Mentor {mentorUser.FullName} vào {scheduleEntity?.StartTime:HH:mm dd/MM/yyyy} đã được xác nhận. Link: {booking.MeetingLink}",
                    "REJECTED" => $"[MENTORING BỊ TỪ CHỐI] Rất tiếc, Mentor {mentorUser.FullName} đã từ chối lịch mentoring của đội bạn.",
                    "CANCELLED" => $"[MENTORING BỊ HỦY] Lịch mentoring với Mentor {mentorUser.FullName} đã bị hủy.",
                    _ => $"[MENTORING UPDATE] Trạng thái booking với Mentor {mentorUser.FullName}: {booking.Status}"
                };
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, statusMessage);
            }

            return new MentorBookingDto
            {
                BookingId = booking.BookingId,
                ScheduleId = booking.ScheduleId,
                TeamId = booking.TeamId,
                TeamName = team?.TeamName ?? string.Empty,
                MentorUserId = booking.MentorUserId,
                MentorName = mentorUser?.FullName ?? string.Empty,
                StartTime = scheduleEntity?.StartTime ?? DateTime.MinValue,
                EndTime = scheduleEntity?.EndTime ?? DateTime.MinValue,
                Objective = booking.Objective,
                Status = booking.Status,
                MeetingLink = booking.MeetingLink,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt
            };
        }

        public async Task<MentoringFeedbackDto> CreateFeedbackAsync(Guid mentorUserId, CreateFeedbackDto dto)
        {
            var booking = await _bookingRepository.GetByIdAsync(dto.BookingId);
            if (booking == null)
                throw new Exception("Booking not found");

            if (booking.MentorUserId != mentorUserId)
                throw new Exception("Only the assigned Mentor can provide feedback for this session");

            var team = await _teamRepository.GetByIdAsync(booking.TeamId);
            if (team == null)
                throw new Exception("Team not found");

            var feedback = new MentoringFeedbacks
            {
                FeedbackId = Guid.NewGuid(),
                BookingId = dto.BookingId,
                TeamId = booking.TeamId,
                MentorUserId = mentorUserId,
                HealthStatus = dto.HealthStatus.Trim(),
                Content = dto.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _feedbackRepository.AddAsync(feedback);

            // Update Team's HealthStatus
            team.HealthStatus = dto.HealthStatus.Trim();
            _teamRepository.Update(team);

            // Mark booking completed
            booking.Status = "COMPLETED";
            _bookingRepository.Update(booking);

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = mentorUserId,
                ActionType = "MENTOR_FEEDBACK_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(new { dto.HealthStatus, dto.Content, teamId = team.TeamId }),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            var mentorUser = await _userRepository.GetByIdAsync(mentorUserId);

            // Notify Team Leader about feedback

            if (team != null)
            {
                var feedbackMessage = $"[FEEDBACK TỪ MENTOR] Mentor {mentorUser?.FullName ?? "Unknown"} đã gửi feedback cho đội {team.TeamName}. Health Status: {feedback.HealthStatus}";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, feedbackMessage);
            }

            return new MentoringFeedbackDto
            {
                FeedbackId = feedback.FeedbackId,
                BookingId = feedback.BookingId,
                TeamId = feedback.TeamId,
                TeamName = team.TeamName,
                MentorUserId = feedback.MentorUserId,
                MentorName = mentorUser?.FullName ?? string.Empty,
                HealthStatus = feedback.HealthStatus,
                Content = feedback.Content,
                CreatedAt = feedback.CreatedAt
            };
        }

        public async Task<List<MentoringFeedbackDto>> GetTeamFeedbacksAsync(Guid teamId)
        {
            var feedbacks = await _feedbackRepository.FindAsync(f => f.TeamId == teamId);
            if (!feedbacks.Any())
                return new List<MentoringFeedbackDto>();

            var mentorUserIds = feedbacks.Select(f => f.MentorUserId).ToHashSet();
            var mentors = (await _userRepository.FindAsync(u => mentorUserIds.Contains(u.UserId))).ToDictionary(u => u.UserId, u => u);
            var team = await _teamRepository.GetByIdAsync(teamId);

            return feedbacks
                .OrderByDescending(f => f.CreatedAt)
                .Select(f =>
                {
                    mentors.TryGetValue(f.MentorUserId, out var mtr);
                    return new MentoringFeedbackDto
                    {
                        FeedbackId = f.FeedbackId,
                        BookingId = f.BookingId,
                        TeamId = f.TeamId,
                        TeamName = team?.TeamName ?? string.Empty,
                        MentorUserId = f.MentorUserId,
                        MentorName = mtr?.FullName ?? string.Empty,
                        HealthStatus = f.HealthStatus,
                        Content = f.Content,
                        CreatedAt = f.CreatedAt
                    };
                })
                .ToList();
        }

        public async Task<CoordinatorHealthOverviewDto> GetCoordinatorHealthOverviewAsync(Guid? eventId = null)
        {
            var teams = eventId.HasValue
                ? (await _teamRepository.FindAsync(t => t.EventId == eventId.Value)).ToList()
                : (await _teamRepository.GetAllAsync()).ToList();

            if (!teams.Any())
            {
                return new CoordinatorHealthOverviewDto();
            }

            var teamIds = teams.Select(t => t.TeamId).ToHashSet();
            var bookings = (await _bookingRepository.FindAsync(b => teamIds.Contains(b.TeamId))).ToList();
            var feedbacks = (await _feedbackRepository.FindAsync(f => teamIds.Contains(f.TeamId))).ToList();

            var leaderUserIds = teams.Select(t => t.TeamLeaderId).ToHashSet();
            var leaders = (await _userRepository.FindAsync(u => leaderUserIds.Contains(u.UserId))).ToDictionary(u => u.UserId, u => u);

            var categoryIds = teams.Where(t => t.CategoryId.HasValue).Select(t => t.CategoryId!.Value).ToHashSet();
            var categories = (await _categoryRepository.FindAsync(c => categoryIds.Contains(c.CategoryId))).ToDictionary(c => c.CategoryId, c => c);

            var eventIds = teams.Where(t => t.EventId.HasValue).Select(t => t.EventId!.Value).ToHashSet();
            var events = (await _eventRepository.FindAsync(e => eventIds.Contains(e.EventId))).ToDictionary(e => e.EventId, e => e);

            var teamSummaries = new List<TeamHealthSummaryDto>();

            foreach (var team in teams)
            {
                var teamBookings = bookings.Where(b => b.TeamId == team.TeamId).ToList();
                var teamFeedbacks = feedbacks.Where(f => f.TeamId == team.TeamId).OrderByDescending(f => f.CreatedAt).ToList();

                leaders.TryGetValue(team.TeamLeaderId, out var leader);
                Categories? cat = null;
                if (team.CategoryId.HasValue) categories.TryGetValue(team.CategoryId.Value, out cat);
                Events? evt = null;
                if (team.EventId.HasValue) events.TryGetValue(team.EventId.Value, out evt);

                var lastFeedback = teamFeedbacks.FirstOrDefault();

                teamSummaries.Add(new TeamHealthSummaryDto
                {
                    TeamId = team.TeamId,
                    TeamName = team.TeamName,
                    EventId = team.EventId,
                    EventName = evt?.EventName ?? string.Empty,
                    CategoryId = team.CategoryId,
                    CategoryName = cat?.CategoryName ?? string.Empty,
                    TeamLeaderName = leader?.FullName ?? string.Empty,
                    HealthStatus = string.IsNullOrWhiteSpace(team.HealthStatus) ? "Green" : team.HealthStatus,
                    TotalBookings = teamBookings.Count,
                    LastMentoredAt = lastFeedback?.CreatedAt,
                    LastFeedbackContent = lastFeedback?.Content
                });
            }

            return new CoordinatorHealthOverviewDto
            {
                TotalTeams = teams.Count,
                GreenTeamsCount = teamSummaries.Count(t => t.HealthStatus.Equals("Green", StringComparison.OrdinalIgnoreCase)),
                YellowTeamsCount = teamSummaries.Count(t => t.HealthStatus.Equals("Yellow", StringComparison.OrdinalIgnoreCase)),
                RedTeamsCount = teamSummaries.Count(t => t.HealthStatus.Equals("Red", StringComparison.OrdinalIgnoreCase)),
                ZeroBookingsCount = teamSummaries.Count(t => t.TotalBookings == 0),
                Teams = teamSummaries.OrderByDescending(t => t.HealthStatus == "Red").ThenBy(t => t.TotalBookings).ToList()
            };
        }
    }
}
