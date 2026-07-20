# Workflow 4: Chấm điểm & Xếp hạng bài thi - UI Implementation Plan

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Backend Status](#backend-status)
3. [Frontend UI Status](#frontend-ui-status)
4. [Checklist Implementation](#checklist-implementation)
5. [File Structure](#file-structure)
6. [API References](#api-references)

---

## Tổng quan

**Workflow 4** mô tả quy trình:

1. Coordinator cấu hình tiêu chí chấm điểm (Criteria)
2. Coordinator cấu hình rule đi tiếp (Advancement Rule)
3. Coordinator phân công Giám khảo (Judge Assignment)
4. Judge xem danh sách bài được phân công
5. Judge chấm điểm bài thi
6. Judge cập nhật điểm đã chấm
7. Xem bảng xếp hạng (Ranking)

**Tech Stack:**

- Frontend: Next.js 16 + React 19 + TypeScript + TailwindCSS 4 + shadcn/ui
- Backend: .NET 8 ASP.NET Core + EF Core + JWT
- Data: TanStack React Query + Axios + Zod

---

## Backend Status

| #   | API                      | Method | Endpoint                                 | Quyền             | Status  |
| --- | ------------------------ | ------ | ---------------------------------------- | ----------------- | ------- |
| 1   | Set Event Criteria       | POST   | `/api/events/{eventId}/criteria`         | Coordinator       | ✅ Done |
| 2   | Get Event Criteria       | GET    | `/api/events/{eventId}/criteria`         | Authenticated     | ✅ Done |
| 3   | Create Advancement Rule  | POST   | `/api/AdvancementRule`                   | Coordinator       | ✅ Done |
| 4   | Assign Judge             | POST   | `/api/JudgeAssignment`                   | Coordinator       | ✅ Done |
| 5   | Get Assigned Submissions | GET    | `/api/Scores/assigned-submissions`       | Judge             | ✅ Done |
| 6   | Submit Scores            | POST   | `/api/Scores/submissions/{submissionId}` | Judge             | ✅ Done |
| 7   | Update Scores            | PUT    | `/api/Scores/submissions/{submissionId}` | Judge             | ✅ Done |
| 8   | Get Rankings             | GET    | `/api/Rankings`                          | Judge/Coordinator | ✅ Done |

### Backend Files

```
backend/
├── SEAL Hackathon/Controllers/
│   ├── EventCriteriaController.cs
│   ├── AdvancementRuleController.cs
│   ├── JudgeAssignmentController.cs
│   ├── ScoresController.cs
│   └── RankingsController.cs
├── BLL/
│   ├── Services/Implements/
│   │   ├── EventCriteriaService.cs
│   │   ├── AdvancementRuleService.cs
│   │   ├── JudgeAssignmentService.cs
│   │   ├── ScoresService.cs
│   │   └── RankingService.cs
│   └── DTOs/
│       ├── Requests/
│       │   ├── SetEventCriteriaRequest.cs
│       │   ├── AddAdvancementRuleRequest.cs
│       │   ├── AddJudgeAssignmentRequest.cs
│       │   └── SubmitScoresRequest.cs
│       └── Responses/
│           ├── EventCriteriaDto.cs
│           ├── AdvancementRuleDto.cs
│           ├── JudgeAssignmentDto.cs
│           ├── JudgeSubmissionDto.cs
│           ├── ScoreDto.cs
│           └── RankingDto.cs
└── DAL/Database/Configurations/
    ├── EventCriteriaConfiguration.cs
    ├── AdvancementRulesConfiguration.cs
    ├── JudgeAssignmentsConfiguration.cs
    ├── ScoresConfiguration.cs
    └── RankingsConfiguration.cs
```

---

## Frontend UI Status

### Coordinator Panel (Role: Coordinator)

| Screen                     | Status        | File    |
| -------------------------- | ------------- | ------- |
| Configure Event Criteria   | ❌ Chưa có UI | Cần tạo |
| Configure Advancement Rule | ❌ Chưa có UI | Cần tạo |
| Assign Judge to Round      | ❌ Chưa có UI | Cần tạo |
| View Rankings              | ❌ Chưa có UI | Cần tạo |

### Judge Panel (Role: Judge)

| Screen                    | Status        | Issue        |
| ------------------------- | ------------- | ------------ |
| View Assigned Submissions | ⚠️ Cần fix    | Dùng sai API |
| Submit Scores             | ✅            | Đã implement |
| Update Scores             | ❌ Chưa có    | Cần thêm PUT |
| View Rankings             | ❌ Chưa có UI | Cần tạo      |

### Current Frontend Files

```
frontend/src/
├── app/
│   ├── (coordinator)/coordinator/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── EventHomeManager.tsx
│   │       ├── IrrMonitor.tsx
│   │       ├── DisqualifyPanel.tsx
│   │       ├── MentorAssignmentPanel.tsx
│   │       └── AuditLogMonitor.tsx
│   └── (judge)/judge/
│       └── page.tsx
├── services/
│   ├── api/
│   │   ├── judge.ts
│   │   └── coordinator.ts
│   ├── hooks/
│   │   ├── judge.ts
│   │   └── coordinator.ts
│   ├── types/
│   │   ├── judge.ts
│   │   └── coordinator.ts
│   └── types/
│       └── index.ts
└── lib/
    └── api.ts
```

---

## Checklist Implementation

### Phase 1: Fix Judge Panel (Priority cao - 3 tasks)

- [ ] **J1. Fix Judge Assigned Submissions**
  - Update `frontend/src/app/(judge)/judge/page.tsx`
  - Sử dụng API `GET /api/Scores/assigned-submissions` thay vì `getSubmissions`
  - File: `frontend/src/services/api/judge.ts`
  - Hook: `frontend/src/services/hooks/judge.ts`

- [ ] **J2. Add Update Scores UI**
  - Thêm form/UI để Judge cập nhật điểm đã chấm
  - Implement `PUT /api/Scores/submissions/{submissionId}`
  - Thêm loading state, validation, error handling

- [ ] **J3. Add Ranking View for Judge**
  - Tạo component `RankingView.tsx` trong Judge panel
  - Sử dụng API `GET /api/Rankings?roundId={roundId}&categoryId={categoryId}`
  - Hiển thị: rankPosition, teamName, totalScore, isAdvanced

### Phase 2: Coordinator Scoring Management (4 tasks)

- [ ] **C1. Event Criteria Config UI**
  - Tạo: `frontend/src/app/(coordinator)/coordinator/components/EventCriteriaConfig.tsx`
  - API: `POST /api/events/{eventId}/criteria` (set), `GET /api/events/{eventId}/criteria` (get)
  - Features:
    - Select event dropdown
    - List available criteria với weights
    - Drag-drop hoặc input để set weights
    - Validation: tổng weights = 100%

- [ ] **C2. Advancement Rule Config UI**
  - Tạo: `frontend/src/app/(coordinator)/coordinator/components/AdvancementRuleConfig.tsx`
  - API: `POST /api/AdvancementRule` (upsert), `GET /api/Rankings` (view)
  - Features:
    - Select Round + Category
    - Input Top N number
    - Preview advancement based on current scores

- [ ] **C3. Judge Assignment Panel**
  - Tạo: `frontend/src/app/(coordinator)/coordinator/components/JudgeAssignmentPanel.tsx`
  - API: `POST /api/JudgeAssignment`
  - Features:
    - Select Judge (filter by Judge role)
    - Select Round
    - List current assignments
    - Remove assignment option

- [ ] **C4. Ranking Board for Coordinator**
  - Tạo: `frontend/src/app/(coordinator)/coordinator/components/RankingBoard.tsx`
  - API: `GET /api/Rankings?roundId={roundId}&categoryId={categoryId}`
  - Features:
    - Select Round/Category filter
    - Table view: Rank, Team, Score, Advanced Status
    - Export functionality (optional)

### Phase 3: Integration & Testing (3 tasks)

- [ ] **T1. Add Coordinator Tabs**
  - Thêm tabs vào Coordinator layout: `scoring-config`, `judge-assignment`, `rankings`
  - Update: `frontend/src/app/(coordinator)/layout.tsx`
  - Update: `frontend/src/app/(coordinator)/coordinator/page.tsx`

- [ ] **T2. Connect API Functions**
  - Update: `frontend/src/services/api/coordinator.ts`
  - Add missing API functions:
    - `setEventCriteria(eventId, criteria[])`
    - `getAdvancementRules(roundId)`
    - `createAdvancementRule(data)`
    - `getJudgeAssignments(roundId)`
    - `assignJudge(userId, roundId)`
    - `getRankings(roundId, categoryId)`

- [ ] **T3. End-to-End Testing**
  - Test flow: Coordinator config criteria → Assign Judge → Judge scores → View Ranking
  - Test edge cases:
    - Duplicate criteria IDs
    - Invalid weights
    - Duplicate judge assignment
    - Score update after initial submission
    - Ranking auto-update

---

## File Structure (After Implementation)

```
frontend/src/
├── app/
│   ├── (coordinator)/coordinator/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── EventCriteriaConfig.tsx      [NEW]
│   │       ├── AdvancementRuleConfig.tsx     [NEW]
│   │       ├── JudgeAssignmentPanel.tsx     [NEW]
│   │       ├── RankingBoard.tsx             [NEW]
│   │       ├── EventHomeManager.tsx
│   │       ├── IrrMonitor.tsx
│   │       ├── DisqualifyPanel.tsx
│   │       ├── MentorAssignmentPanel.tsx
│   │       └── AuditLogMonitor.tsx
│   └── (judge)/judge/
│       └── page.tsx                         [UPDATE - J1, J2, J3]
├── services/
│   ├── api/
│   │   ├── judge.ts                          [UPDATE - J1]
│   │   └── coordinator.ts                    [UPDATE - T2]
│   ├── hooks/
│   │   ├── judge.ts                          [UPDATE]
│   │   └── coordinator.ts                    [UPDATE]
│   └── types/
│       ├── judge.ts                          [UPDATE]
│       └── coordinator.ts                    [UPDATE]
└── lib/
    └── api.ts                                [CHECK existing APIs]
```

---

## API References

### 1. Set Event Criteria

```
POST /api/events/{eventId}/criteria
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "criteria": [
    { "criteriaId": "uuid", "weight": 40 },
    { "criteriaId": "uuid", "weight": 35 },
    { "criteriaId": "uuid", "weight": 25 }
  ]
}
```

### 2. Get Event Criteria

```
GET /api/events/{eventId}/criteria
Authorization: Bearer <JWT_TOKEN>
```

### 3. Create Advancement Rule

```
POST /api/AdvancementRule
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "roundId": "uuid",
  "categoryId": "uuid",
  "topN": 2
}
```

### 4. Assign Judge

```
POST /api/JudgeAssignment
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "userId": "uuid",
  "roundId": "uuid"
}
```

### 5. Get Assigned Submissions (Judge)

```
GET /api/Scores/assigned-submissions
Authorization: Bearer <JWT_TOKEN>
```

### 6. Submit Scores (Judge)

```
POST /api/Scores/submissions/{submissionId}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "scores": [
    { "criteriaId": "uuid", "scoreValue": 92, "comment": "..." },
    { "criteriaId": "uuid", "scoreValue": 85, "comment": "..." },
    { "criteriaId": "uuid", "scoreValue": 88, "comment": "..." }
  ]
}
```

### 7. Update Scores (Judge)

```
PUT /api/Scores/submissions/{submissionId}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "scores": [
    { "criteriaId": "uuid", "scoreValue": 95, "comment": "..." },
    { "criteriaId": "uuid", "scoreValue": 87, "comment": "..." },
    { "criteriaId": "uuid", "scoreValue": 90, "comment": "..." }
  ]
}
```

### 8. Get Rankings

```
GET /api/Rankings?roundId={roundId}&categoryId={categoryId}
Authorization: Bearer <JWT_TOKEN>
```

---

## Validation Rules

### Event Criteria

- Event phải tồn tại
- Criteria phải tồn tại
- Không gửi trùng `criteriaId`
- Tổng weights nên = 100% (hoặc hệ thống tự chuẩn hóa)
- Khi cập nhật, criteria cũ không trong request sẽ bị xóa

### Advancement Rule

- Round phải tồn tại
- Category phải tồn tại
- Category phải thuộc cùng Event với Round
- Upsert: cùng RoundId + CategoryId chỉ có 1 rule

### Judge Assignment

- User phải tồn tại và có role `Judge`
- Round phải tồn tại
- Mỗi Judge chỉ được phân công 1 lần cho cùng Round

### Submit Scores

- Submission phải tồn tại và ở trạng thái `Submitted` hoặc `Updated`
- Judge phải được phân công vào Round của Submission
- Thời gian phải trong khoảng chấm điểm của Round
- Phải gửi đúng toàn bộ Criteria (không thiếu, không thừa)
- Không gửi trùng `criteriaId`
- Mỗi Judge chỉ tạo 1 score cho cùng Submission + Assignment + Criteria

### Ranking Calculation

1. Mỗi score × weight của Criteria
2. Cộng điểm theo Criteria cho từng Judge
3. Tổng điểm = trung bình điểm các Judge
4. Ranking chia theo CategoryId
5. Sắp xếp theo totalScore giảm dần, bằng điểm thì sắp theo teamName
6. isAdvanced = true nếu trong Top N theo Advancement Rule

---

## Priority Order

1. **J1** - Fix Judge Assigned Submissions (Bug fix)
2. **J2** - Add Update Scores UI (Feature)
3. **C1** - Event Criteria Config (Core feature)
4. **C2** - Advancement Rule Config (Core feature)
5. **C3** - Judge Assignment Panel (Core feature)
6. **J3** - Ranking View for Judge (Feature)
7. **C4** - Ranking Board for Coordinator (Feature)
8. **T1** - Add Coordinator Tabs (Integration)
9. **T2** - Connect API Functions (Integration)
10. **T3** - E2E Testing (Testing)

---

## Notes

- Ranking được tự động tính sau khi Judge submit/update scores
- Không cần gọi API trigger ranking thủ công
- Judge được phân công sẽ nhận notification realtime
