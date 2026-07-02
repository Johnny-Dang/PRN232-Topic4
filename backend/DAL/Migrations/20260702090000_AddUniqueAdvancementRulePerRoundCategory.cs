using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueAdvancementRulePerRoundCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"WITH DuplicateRules AS (
                    SELECT RuleId,
                           ROW_NUMBER() OVER (PARTITION BY RoundId, CategoryId ORDER BY RuleId) AS RowNumber
                    FROM AdvancementRules
                )
                DELETE FROM AdvancementRules
                WHERE RuleId IN (
                    SELECT RuleId FROM DuplicateRules WHERE RowNumber > 1
                )");

            migrationBuilder.Sql(
                @"WITH DuplicateEventCriteria AS (
                    SELECT EventCriteriaId,
                           ROW_NUMBER() OVER (PARTITION BY EventId, CriteriaId ORDER BY EventCriteriaId) AS RowNumber
                    FROM EventCriteria
                )
                DELETE FROM EventCriteria
                WHERE EventCriteriaId IN (
                    SELECT EventCriteriaId FROM DuplicateEventCriteria WHERE RowNumber > 1
                )");

            migrationBuilder.DropIndex(
                name: "IX_AdvancementRules_RoundId",
                table: "AdvancementRules");

            migrationBuilder.DropIndex(
                name: "IX_EventCriteria_EventId",
                table: "EventCriteria");

            migrationBuilder.CreateIndex(
                name: "IX_EventCriteria_EventId_CriteriaId",
                table: "EventCriteria",
                columns: new[] { "EventId", "CriteriaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdvancementRules_RoundId_CategoryId",
                table: "AdvancementRules",
                columns: new[] { "RoundId", "CategoryId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdvancementRules_RoundId_CategoryId",
                table: "AdvancementRules");

            migrationBuilder.DropIndex(
                name: "IX_EventCriteria_EventId_CriteriaId",
                table: "EventCriteria");

            migrationBuilder.CreateIndex(
                name: "IX_EventCriteria_EventId",
                table: "EventCriteria",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancementRules_RoundId",
                table: "AdvancementRules",
                column: "RoundId");
        }
    }
}
