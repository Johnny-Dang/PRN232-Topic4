using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddScoringRankingWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scores_SubmissionId",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Rankings_RoundId",
                table: "Rankings");

            migrationBuilder.DropIndex(
                name: "IX_JudgeAssignments_UserId",
                table: "JudgeAssignments");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Rankings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "GeneratedAt",
                table: "Rankings",
                type: "datetime",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.Sql(
                "UPDATE r SET CategoryId = t.CategoryId FROM Rankings r INNER JOIN Teams t ON r.TeamId = t.TeamId WHERE r.CategoryId IS NULL");

            migrationBuilder.Sql(
                "DELETE FROM Rankings WHERE CategoryId IS NULL");

            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryId",
                table: "Rankings",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Scores_SubmissionId_AssignmentId_CriteriaId",
                table: "Scores",
                columns: new[] { "SubmissionId", "AssignmentId", "CriteriaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_CategoryId",
                table: "Rankings",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_RoundId_CategoryId_TeamId",
                table: "Rankings",
                columns: new[] { "RoundId", "CategoryId", "TeamId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JudgeAssignments_UserId_RoundId",
                table: "JudgeAssignments",
                columns: new[] { "UserId", "RoundId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Rankings_Categories_CategoryId",
                table: "Rankings",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rankings_Categories_CategoryId",
                table: "Rankings");

            migrationBuilder.DropIndex(
                name: "IX_Scores_SubmissionId_AssignmentId_CriteriaId",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Rankings_CategoryId",
                table: "Rankings");

            migrationBuilder.DropIndex(
                name: "IX_Rankings_RoundId_CategoryId_TeamId",
                table: "Rankings");

            migrationBuilder.DropIndex(
                name: "IX_JudgeAssignments_UserId_RoundId",
                table: "JudgeAssignments");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Rankings");

            migrationBuilder.DropColumn(
                name: "GeneratedAt",
                table: "Rankings");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_SubmissionId",
                table: "Scores",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_RoundId",
                table: "Rankings",
                column: "RoundId");

            migrationBuilder.CreateIndex(
                name: "IX_JudgeAssignments_UserId",
                table: "JudgeAssignments",
                column: "UserId");
        }
    }
}
