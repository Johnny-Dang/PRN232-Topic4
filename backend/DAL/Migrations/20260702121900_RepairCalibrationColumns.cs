using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class RepairCalibrationColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('dbo.Submissions', 'CalibrationTitle') IS NULL
BEGIN
    ALTER TABLE dbo.Submissions
    ADD CalibrationTitle nvarchar(255) NOT NULL
        CONSTRAINT DF_Submissions_CalibrationTitle DEFAULT('');
END

IF COL_LENGTH('dbo.Submissions', 'IsCalibrationSample') IS NULL
BEGIN
    ALTER TABLE dbo.Submissions
    ADD IsCalibrationSample bit NOT NULL
        CONSTRAINT DF_Submissions_IsCalibrationSample DEFAULT(0);
END

IF COL_LENGTH('dbo.CalibrationScores', 'Comment') IS NULL
BEGIN
    ALTER TABLE dbo.CalibrationScores
    ADD Comment nvarchar(1000) NOT NULL
        CONSTRAINT DF_CalibrationScores_Comment DEFAULT('');
END

IF COL_LENGTH('dbo.CalibrationScores', 'ScoredAt') IS NULL
BEGIN
    ALTER TABLE dbo.CalibrationScores
    ADD ScoredAt datetime NOT NULL
        CONSTRAINT DF_CalibrationScores_ScoredAt DEFAULT(GETUTCDATE());
END
");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('dbo.CalibrationScores', 'ScoredAt') IS NOT NULL
BEGIN
    DECLARE @dfScoredAt nvarchar(128);
    SELECT @dfScoredAt = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.default_object_id = dc.object_id
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'CalibrationScores' AND c.name = 'ScoredAt';
    IF @dfScoredAt IS NOT NULL EXEC('ALTER TABLE dbo.CalibrationScores DROP CONSTRAINT ' + @dfScoredAt);
    ALTER TABLE dbo.CalibrationScores DROP COLUMN ScoredAt;
END

IF COL_LENGTH('dbo.CalibrationScores', 'Comment') IS NOT NULL
BEGIN
    DECLARE @dfComment nvarchar(128);
    SELECT @dfComment = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.default_object_id = dc.object_id
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'CalibrationScores' AND c.name = 'Comment';
    IF @dfComment IS NOT NULL EXEC('ALTER TABLE dbo.CalibrationScores DROP CONSTRAINT ' + @dfComment);
    ALTER TABLE dbo.CalibrationScores DROP COLUMN Comment;
END

IF COL_LENGTH('dbo.Submissions', 'IsCalibrationSample') IS NOT NULL
BEGIN
    DECLARE @dfIsCalibrationSample nvarchar(128);
    SELECT @dfIsCalibrationSample = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.default_object_id = dc.object_id
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'Submissions' AND c.name = 'IsCalibrationSample';
    IF @dfIsCalibrationSample IS NOT NULL EXEC('ALTER TABLE dbo.Submissions DROP CONSTRAINT ' + @dfIsCalibrationSample);
    ALTER TABLE dbo.Submissions DROP COLUMN IsCalibrationSample;
END

IF COL_LENGTH('dbo.Submissions', 'CalibrationTitle') IS NOT NULL
BEGIN
    DECLARE @dfCalibrationTitle nvarchar(128);
    SELECT @dfCalibrationTitle = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.default_object_id = dc.object_id
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'Submissions' AND c.name = 'CalibrationTitle';
    IF @dfCalibrationTitle IS NOT NULL EXEC('ALTER TABLE dbo.Submissions DROP CONSTRAINT ' + @dfCalibrationTitle);
    ALTER TABLE dbo.Submissions DROP COLUMN CalibrationTitle;
END
");

        }
    }
}
