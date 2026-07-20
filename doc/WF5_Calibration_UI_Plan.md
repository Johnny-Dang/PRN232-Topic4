# Workflow 5: Research RBL & Judge Calibration - UI Implementation Plan

## Table of Contents

1. [Overview](#overview)
2. [Backend Status](#backend-status)
3. [Frontend UI Status](#frontend-ui-status)
4. [Checklist Implementation](#checklist-implementation)
5. [File Structure](#file-structure)
6. [API References](#api-references)
7. [Validation Rules](#validation-rules)
8. [Priority Order](#priority-order)

---

## Overview

**Workflow 5** is used for Inter-rater Reliability (RBL) research to evaluate fairness and consistency among Judges. Calibration scores are stored separately in `CalibrationScores` and do NOT affect real `Scores` or Rankings.

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Coordinator | Create samples, view analysis, export CSV |
| Judge | View samples, submit/update calibration scores |
| Researcher | View analysis, export CSV |

### Data Flow

```
Coordinator creates calibration sample
         ↓
All Judges score the sample (blind)
         ↓
System calculates statistics (mean, variance, std dev)
         ↓
Coordinator/Researcher reviews inconsistency flags
         ↓
Export CSV for research
```

---

## Backend Status

| # | API | Method | Endpoint | Permission | Status |
|---|-----|--------|----------|------------|--------|
| 1 | Create Calibration Submission | POST | `/api/Calibration/submissions` | Coordinator | ⚠️ Verify |
| 2 | Get Calibration Submissions | GET | `/api/Calibration/submissions` | Judge/Coordinator/Researcher | ⚠️ Verify |
| 3 | Submit Calibration Scores | POST | `/api/Calibration/submissions/{submissionId}/scores` | Judge | ⚠️ Verify |
| 4 | Update Calibration Scores | PUT | `/api/Calibration/submissions/{submissionId}/scores` | Judge | ⚠️ Verify |
| 5 | Get Calibration Analysis | GET | `/api/Calibration/submissions/{submissionId}/analysis` | Coordinator/Researcher | ⚠️ Verify |
| 6 | Export Calibration CSV | GET | `/api/Calibration/submissions/{submissionId}/export` | Coordinator/Researcher | ⚠️ Verify |

### Required Backend Files

```
backend/SEAL Hackathon/
├── Controllers/
│   └── CalibrationController.cs        [NEED TO VERIFY]
├── BLL/
│   └── Services/
│       └── CalibrationService.cs       [NEED TO VERIFY]
├── DAL/
│   ├── Models/
│   │   ├── CalibrationSubmission.cs    [NEED TO VERIFY]
│   │   └── CalibrationScore.cs         [NEED TO VERIFY]
│   └── Database/
│       └── Configurations/
│           ├── CalibrationSubmissionConfiguration.cs
│           └── CalibrationScoreConfiguration.cs
└── DTOs/
    ├── Requests/
    │   ├── CreateCalibrationRequest.cs
    │   └── SubmitCalibrationScoresRequest.cs
    └── Responses/
        ├── CalibrationSubmissionDto.cs
        └── CalibrationAnalysisDto.cs
```

---

## Frontend UI Status

### Coordinator Panel (Role: Coordinator)

| Screen | Status | Component Needed |
|--------|--------|------------------|
| Create Calibration Sample | ❌ Not implemented | `CalibrationSampleCreator.tsx` |
| View Calibration Samples | ❌ Not implemented | `CalibrationSampleList.tsx` |
| View Calibration Analysis | ❌ Not implemented | `CalibrationAnalysis.tsx` |
| Export CSV | ❌ Not implemented | (in `CalibrationAnalysis.tsx`) |

### Judge Panel (Role: Judge)

| Screen | Status | Component Needed |
|--------|--------|------------------|
| View Calibration Samples | ❌ Not implemented | `CalibrationSampleList.tsx` |
| Submit Calibration Scores | ❌ Not implemented | `CalibrationScoringForm.tsx` |
| Update Calibration Scores | ❌ Not implemented | (in `CalibrationScoringForm.tsx`) |

### Researcher Panel (Role: Researcher)

| Screen | Status | Component Needed |
|--------|--------|------------------|
| View Calibration Samples | ❌ Not implemented | `CalibrationSampleList.tsx` |
| View Calibration Analysis | ❌ Not implemented | `CalibrationAnalysis.tsx` |
| Export CSV | ❌ Not implemented | (in `CalibrationAnalysis.tsx`) |

---

## Checklist Implementation

### Phase 1: API Functions (Priority: Critical)

- [ ] **A1. Add Calibration API Functions to `frontend/src/lib/api.ts`**

  ```typescript
  // Interfaces needed
  export interface CalibrationSubmission {
    SubmissionID: string;
    TeamID: string;
    RoundID: string;
    CalibrationTitle: string;
    RepositoryURL: string;
    DemoURL: string;
    SlideURL: string;
    SubmittedAt: string;
    Status: "CalibrationSample";
    IsCalibrationSample: boolean;
  }

  export interface CalibrationScore {
    CalibrationId: string;
    JudgeID: string;
    CriteriaID: string;
    SubmissionID: string;
    ScoreValue: number;
  }

  export interface CalibrationAnalysis {
    submissionId: string;
    calibrationTitle: string;
    judgeCount: number;
    criteriaCount: number;
    overallMean: number;
    criteriaVariance: CriteriaVariance[];
    judgeSummaries: JudgeSummary[];
    inconsistencyFlags: string[];
  }
  ```

  Add functions:
  - `createCalibrationSubmission(data)`
  - `getCalibrationSubmissions()`
  - `submitCalibrationScores(submissionId, scores)`
  - `updateCalibrationScores(submissionId, scores)`
  - `getCalibrationAnalysis(submissionId)`
  - `exportCalibrationCSV(submissionId)`

### Phase 2: Coordinator UI Components (Priority: High)

- [ ] **C1. Create Calibration Sample Creator**
  - File: `frontend/src/app/(coordinator)/coordinator/components/CalibrationSampleCreator.tsx`
  - Features:
    - Select Team dropdown
    - Select Round dropdown
    - Title input field
    - Repository URL input
    - Demo URL input
    - Slide URL input
    - Submit button with loading state
    - Success/error toast notifications
  - API: `POST /api/Calibration/submissions`

- [ ] **C2. Create Calibration Sample List**
  - File: `frontend/src/app/(coordinator)/coordinator/components/CalibrationSampleList.tsx`
  - Features:
    - Table/card view of calibration samples
    - Show: Title, Team, Round, Created Date, Score Count
    - Status badge (Pending/Completed)
    - Click to view details/analysis
    - Delete sample option (if no scores)
  - API: `GET /api/Calibration/submissions`

- [ ] **C3. Create Calibration Analysis Dashboard**
  - File: `frontend/src/app/(coordinator)/coordinator/components/CalibrationAnalysis.tsx`
  - Features:
    - Sample selector dropdown
    - Overall statistics card (judge count, criteria count, mean)
    - Criteria variance table:
      - Criteria Name
      - Mean Score
      - Variance
      - Standard Deviation
      - Min/Max/Range
    - Judge summaries table:
      - Judge Code (anonymized: Judge A, B, C...)
      - Average Score
      - Deviation from Group Mean
      - Consistency Label (Harsher/Moderate/Lenient)
    - Inconsistency flags list
    - Export CSV button
  - API: `GET /api/Calibration/submissions/{submissionId}/analysis`
  - API: `GET /api/Calibration/submissions/{submissionId}/export`

- [ ] **C4. Add Calibration Tab to Coordinator Navigation**
  - Update: `frontend/src/app/(coordinator)/layout.tsx`
  - Add tab: `calibration`
  - Update: `frontend/src/app/(coordinator)/coordinator/page.tsx`
  - Add tab content rendering for calibration components

### Phase 3: Judge UI Components (Priority: High)

- [ ] **J1. Create Calibration Sample List for Judge**
  - File: `frontend/src/app/(judge)/judge/components/CalibrationSampleList.tsx`
  - Features:
    - View only calibration samples assigned to this judge
    - Show: Title, Status (Pending/Completed)
    - Badge for completed samples
    - Click to score
  - API: `GET /api/Calibration/submissions`

- [ ] **J2. Create Calibration Scoring Form**
  - File: `frontend/src/app/(judge)/judge/components/CalibrationScoringForm.tsx`
  - Features:
    - Display submission links (Repo, Demo, Slides)
    - Criteria list with score inputs (0-100)
    - Comment textarea for each criteria
    - Weighted total calculator
    - Submit button (new submission)
    - Update button (if already scored)
    - Validation: all criteria required
  - API: `POST /api/Calibration/submissions/{submissionId}/scores`
  - API: `PUT /api/Calibration/submissions/{submissionId}/scores`

- [ ] **J3. Add Calibration Tab to Judge Navigation**
  - Update: `frontend/src/app/(judge)/judge/page.tsx`
  - Add tab: `calibration` alongside existing `scoring` and `ranking`
  - Integrate CalibrationSampleList and CalibrationScoringForm

### Phase 4: Researcher Panel (Priority: Medium)

- [ ] **R1. Create Researcher View**
  - File: `frontend/src/app/(researcher)/researcher/page.tsx`
  - Features:
    - Reuse CalibrationSampleList component
    - Reuse CalibrationAnalysis component
    - Read-only view (no create/edit)
  - Permissions: Coordinator, Researcher roles

### Phase 5: Testing & Integration (Priority: Medium)

- [ ] **T1. End-to-End Testing Scenarios**

  Test cases to implement:
  1. Coordinator creates calibration sample → Verify appears in list
  2. Judge scores calibration → Verify save success
  3. Judge updates calibration score → Verify update works
  4. Multiple judges score same sample → Verify analysis updates
  5. Export CSV → Verify file downloads correctly
  6. Edge cases:
     - Judge tries to submit without all criteria
     - Duplicate score submission (should update, not create)
     - Non-Judge tries to access calibration endpoints

- [ ] **T2. Add Audit Logging**
  - Verify backend logs `CALIBRATION_DATASET_EXPORT` action
  - Add to AuditLogMonitor component if needed

---

## File Structure (After Implementation)

```
frontend/src/
├── app/
│   ├── (coordinator)/coordinator/
│   │   ├── page.tsx                    [UPDATE - add calibration tab]
│   │   └── components/
│   │       ├── CalibrationSampleCreator.tsx    [NEW]
│   │       ├── CalibrationSampleList.tsx        [NEW]
│   │       ├── CalibrationAnalysis.tsx         [NEW]
│   │       ├── EventCriteriaConfig.tsx
│   │       ├── AdvancementRuleConfig.tsx
│   │       ├── JudgeAssignmentPanel.tsx
│   │       ├── RankingBoard.tsx
│   │       └── ...
│   ├── (judge)/judge/
│   │   ├── page.tsx                    [UPDATE - add calibration tab]
│   │   └── components/
│   │       ├── CalibrationSampleList.tsx      [NEW]
│   │       └── CalibrationScoringForm.tsx       [NEW]
│   └── (researcher)/researcher/       [NEW]
│       └── page.tsx                    [NEW]
├── lib/
│   └── api.ts                          [UPDATE - add calibration APIs]
└── components/
    └── ui/                             [shadcn/ui components]
```

---

## API References

### 1. Create Calibration Submission

```http
POST /api/Calibration/submissions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "teamId": "uuid",
  "roundId": "uuid",
  "calibrationTitle": "Sample AI Project",
  "repositoryURL": "https://github.com/sample/ai-project",
  "demoURL": "https://sample-demo.example.com",
  "slideURL": "https://slides.example.com/sample"
}
```

Response (200 OK):
```json
{
  "submissionId": "uuid",
  "teamId": "uuid",
  "roundId": "uuid",
  "calibrationTitle": "Sample AI Project",
  "repositoryURL": "https://github.com/sample/ai-project",
  "demoURL": "https://sample-demo.example.com",
  "slideURL": "https://slides.example.com/sample",
  "submittedAt": "2026-07-02T10:00:00Z",
  "status": "CalibrationSample"
}
```

### 2. Get Calibration Submissions

```http
GET /api/Calibration/submissions
Authorization: Bearer <JWT_TOKEN>
```

Response (200 OK):
```json
[
  {
    "submissionId": "uuid",
    "teamId": "uuid",
    "roundId": "uuid",
    "calibrationTitle": "Sample AI Project",
    "repositoryURL": "https://github.com/sample/ai-project",
    "demoURL": "https://sample-demo.example.com",
    "slideURL": "https://slides.example.com/sample",
    "submittedAt": "2026-07-02T10:00:00Z",
    "status": "CalibrationSample",
    "scoreCount": 3
  }
]
```

### 3. Submit Calibration Scores

```http
POST /api/Calibration/submissions/{submissionId}/scores
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "scores": [
    {
      "criteriaId": "CC000000-0000-0000-0000-000000000001",
      "scoreValue": 9,
      "comment": "Strong innovation."
    },
    {
      "criteriaId": "CC000000-0000-0000-0000-000000000002",
      "scoreValue": 8,
      "comment": "Good technical execution."
    }
  ]
}
```

Validation Rules:
- Submission must be calibration sample
- User must have Judge role
- Must submit ALL criteria (no missing, no extra)
- No duplicate criteriaId
- Each Judge scores only once per Submission + Criteria

### 4. Update Calibration Scores

```http
PUT /api/Calibration/submissions/{submissionId}/scores
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "scores": [
    {
      "criteriaId": "CC000000-0000-0000-0000-000000000001",
      "scoreValue": 10,
      "comment": "Updated: Even stronger innovation."
    },
    {
      "criteriaId": "CC000000-0000-0000-0000-000000000002",
      "scoreValue": 9,
      "comment": "Updated: Improved technical execution."
    }
  ]
}
```

### 5. Get Calibration Analysis

```http
GET /api/Calibration/submissions/{submissionId}/analysis
Authorization: Bearer <JWT_TOKEN>
```

Response (200 OK):
```json
{
  "submissionId": "uuid",
  "calibrationTitle": "Sample AI Project",
  "judgeCount": 3,
  "criteriaCount": 2,
  "overallMean": 7.67,
  "criteriaVariance": [
    {
      "criteriaId": "uuid",
      "criteriaName": "Innovation",
      "meanScore": 7,
      "variance": 4.67,
      "standardDeviation": 2.16,
      "minScore": 4,
      "maxScore": 9,
      "scoreRange": 5
    }
  ],
  "judgeSummaries": [
    {
      "judgeId": "uuid",
      "judgeCode": "Judge B",
      "averageScore": 5.5,
      "deviationFromGroupMean": -2.17,
      "consistencyLabel": "Harsher"
    }
  ],
  "inconsistencyFlags": [
    "Judge B is significantly harsher."
  ]
}
```

### 6. Export Calibration CSV

```http
GET /api/Calibration/submissions/{submissionId}/export
Authorization: Bearer <JWT_TOKEN>
```

Response: CSV file download

CSV Format:
```csv
SubmissionId,CriteriaId,CriteriaName,JudgeCode,ScoreValue,CriteriaMean,CriteriaVariance,CriteriaStdDev,JudgeDeviation
```

Note: Each export creates an `AuditLogs` entry with action `CALIBRATION_DATASET_EXPORT`

---

## Validation Rules

### Create Calibration Submission

- Team must exist
- Round must exist
- CalibrationTitle is required (max 200 chars)
- URLs must be valid format (optional)
- Only Coordinator role can create

### Submit Calibration Scores

- Submission must be a calibration sample (`IsCalibrationSample = true`)
- User must have Judge role
- Must submit ALL criteria (complete set)
- No duplicate criteriaId in request
- Each Judge can only score once per Submission + Criteria (use PUT to update)

### Analysis Calculation

1. **Per Criteria Statistics:**
   - Mean = average of all judge scores
   - Variance = Σ(score - mean)² / n
   - Standard Deviation = √variance
   - Min/Max = lowest/highest score
   - Range = Max - Min

2. **Per Judge Statistics:**
   - Average Score = mean of judge's all criteria scores
   - Deviation = Judge Average - Overall Mean
   - Label:
     - "Harsher" if deviation < -1.5
     - "Lenient" if deviation > +1.5
     - "Moderate" otherwise

3. **Inconsistency Flags:**
   - Flag if any judge's deviation > 2.0
   - Flag if criteria variance > 4.0

---

## Priority Order

| Priority | Task ID | Task Name | Estimated Effort |
|----------|---------|-----------|------------------|
| 1 | A1 | Add Calibration API Functions | 2 hours |
| 2 | C1 | Calibration Sample Creator | 3 hours |
| 3 | C2 | Calibration Sample List | 2 hours |
| 4 | C4 | Add Coordinator Tab | 1 hour |
| 5 | J1 | Judge Calibration Sample List | 2 hours |
| 6 | J2 | Judge Calibration Scoring Form | 4 hours |
| 7 | J3 | Add Judge Tab | 1 hour |
| 8 | C3 | Calibration Analysis Dashboard | 4 hours |
| 9 | R1 | Researcher Panel | 2 hours |
| 10 | T1 | End-to-End Testing | 3 hours |

---

## Notes

- **Calibration scores are isolated** - they do NOT affect real rankings
- **Judge anonymity** - when exporting, judges are identified as "Judge A", "Judge B", etc.
- **Real-time updates** - consider using WebSocket for live analysis updates (optional enhancement)
- **Offline handling** - calibration scoring should work offline with sync when back online (future enhancement)

---

## Implementation Status

### Backend (To Verify)
- [ ] CalibrationController exists and all endpoints work
- [ ] CalibrationSubmission model has IsCalibrationSample flag
- [ ] CalibrationScore model links to Judge
- [ ] Analysis calculation service works correctly

### Frontend
- [ ] API functions implemented (A1)
- [ ] Coordinator components (C1, C2, C3)
- [ ] Coordinator tab integrated (C4)
- [ ] Judge components (J1, J2)
- [ ] Judge tab integrated (J3)
- [ ] Researcher panel (R1)
- [ ] E2E testing (T1)
