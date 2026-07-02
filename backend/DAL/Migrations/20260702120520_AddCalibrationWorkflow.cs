using Microsoft.EntityFrameworkCore.Migrations;

using System;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddCalibrationWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CalibrationScores_SubmissionId",
                table: "CalibrationScores");

            migrationBuilder.AddColumn<string>(
                name: "CalibrationTitle",
                table: "Submissions",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsCalibrationSample",
                table: "Submissions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "CalibrationScores",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ScoredAt",
                table: "CalibrationScores",
                type: "datetime",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.Sql(
                @"WITH DuplicateCalibrationScores AS (
                    SELECT CalibrationId,
                           ROW_NUMBER() OVER (
                               PARTITION BY SubmissionId, JudgeId, CriteriaId
                               ORDER BY CalibrationId
                           ) AS RowNumber
                    FROM CalibrationScores
                )
                DELETE FROM CalibrationScores
                WHERE CalibrationId IN (
                    SELECT CalibrationId FROM DuplicateCalibrationScores WHERE RowNumber > 1
                )");

            migrationBuilder.CreateIndex(
                name: "IX_CalibrationScores_SubmissionId_JudgeId_CriteriaId",
                table: "CalibrationScores",
                columns: new[] { "SubmissionId", "JudgeId", "CriteriaId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CalibrationScores_SubmissionId_JudgeId_CriteriaId",
                table: "CalibrationScores");

            migrationBuilder.DropColumn(
                name: "CalibrationTitle",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "IsCalibrationSample",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "CalibrationScores");

            migrationBuilder.DropColumn(
                name: "ScoredAt",
                table: "CalibrationScores");

            migrationBuilder.CreateIndex(
                name: "IX_CalibrationScores_SubmissionId",
                table: "CalibrationScores",
                column: "SubmissionId");
        }
    }
}
