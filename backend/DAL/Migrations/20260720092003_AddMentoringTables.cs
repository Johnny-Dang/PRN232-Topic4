using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddMentoringTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HealthStatus",
                table: "Teams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "MentorSchedules",
                columns: table => new
                {
                    ScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MentorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MeetingLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsBooked = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MentorSchedules", x => x.ScheduleId);
                    table.ForeignKey(
                        name: "FK_MentorSchedules_Users_MentorUserId",
                        column: x => x.MentorUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MentorBookings",
                columns: table => new
                {
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MentorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Objective = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MeetingLink = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MentorBookings", x => x.BookingId);
                    table.ForeignKey(
                        name: "FK_MentorBookings_MentorSchedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "MentorSchedules",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MentorBookings_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MentorBookings_Users_MentorUserId",
                        column: x => x.MentorUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MentoringFeedbacks",
                columns: table => new
                {
                    FeedbackId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MentorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HealthStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MentoringFeedbacks", x => x.FeedbackId);
                    table.ForeignKey(
                        name: "FK_MentoringFeedbacks_MentorBookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "MentorBookings",
                        principalColumn: "BookingId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MentoringFeedbacks_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MentoringFeedbacks_Users_MentorUserId",
                        column: x => x.MentorUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MentorBookings_MentorUserId",
                table: "MentorBookings",
                column: "MentorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorBookings_ScheduleId",
                table: "MentorBookings",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorBookings_TeamId",
                table: "MentorBookings",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_MentoringFeedbacks_BookingId",
                table: "MentoringFeedbacks",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_MentoringFeedbacks_MentorUserId",
                table: "MentoringFeedbacks",
                column: "MentorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MentoringFeedbacks_TeamId",
                table: "MentoringFeedbacks",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorSchedules_MentorUserId",
                table: "MentorSchedules",
                column: "MentorUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MentoringFeedbacks");

            migrationBuilder.DropTable(
                name: "MentorBookings");

            migrationBuilder.DropTable(
                name: "MentorSchedules");

            migrationBuilder.DropColumn(
                name: "HealthStatus",
                table: "Teams");
        }
    }
}
