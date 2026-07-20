# Luồng 5: Research RBL & Judge Calibration - UI Implementation Checklist

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Backend API (đã có/chưa có)](#backend-api)
3. [Frontend - Coordinator Role](#frontend---coordinator-role)
4. [Frontend - Judge Role](#frontend---judge-role)
5. [Frontend - Researcher Role](#frontend---researcher-role)
6. [Shared Components & Types](#shared-components--types)
7. [Testing Checklist](#testing-checklist)

---

## Tổng quan

Luồng Calibration phục vụ nghiên cứu **Inter-rater Reliability (IRR)** để đánh giá mức độ công bằng và nhất quán giữa các Judge. Điểm calibration được lưu riêng trong `CalibrationScores` và **không ảnh hưởng** đến `Scores` hoặc Ranking thật.

### User Flows chính:
```
Coordinator
├── Tạo bài mẫu calibration
├── Xem danh sách bài mẫu
├── Xem phân tích inconsistency
└── Export CSV research dataset

Judge
├── Xem bài mẫu calibration
├── Chấm bài mẫu (theo đầy đủ criteria)
└── Cập nhật điểm đã chấm

Researcher
├── Xem phân tích inconsistency
└── Export CSV research dataset
```

---

## Backend API

### API Endpoints cần thiết:

| # | Endpoint | Method | Mục đích | Status | Ghi chú |
|---|----------|--------|----------|--------|---------|
| 1 | `/api/Calibration/submissions` | POST | Tạo bài mẫu calibration | ⬜ Cần tạo | Cần auth Coordinator |
| 2 | `/api/Calibration/submissions` | GET | Lấy danh sách bài mẫu | ⬜ Cần tạo | Filter: `?roundId=&eventId=` |
| 3 | `/api/Calibration/submissions/{id}` | GET | Lấy chi tiết 1 bài mẫu | ⬜ Cần tạo | |
| 4 | `/api/Calibration/submissions/{id}/scores` | POST | Judge chấm bài mẫu | ⬜ Cần tạo | Auth: Judge only |
| 5 | `/api/Calibration/submissions/{id}/scores` | PUT | Judge cập nhật điểm | ⬜ Cần tạo | Auth: Judge only |
| 6 | `/api/Calibration/submissions/{id}/scores` | GET | Lấy điểm đã chấm | ⬜ Cần tạo | Include anonymized judge info |
| 7 | `/api/Calibration/submissions/{id}/analysis` | GET | Phân tích inconsistency | ⬜ Cần tạo | Auth: Coordinator, Researcher |
| 8 | `/api/Calibration/submissions/{id}/export` | GET | Export CSV | ⬜ Cần tạo | Auth: Coordinator, Researcher + AuditLog |
| 9 | `/api/Calibration/submissions/{id}/my-score` | GET | Lấy điểm của current user | ⬜ Cần tạo | Dùng cho Judge xem mình đã chấm chưa |

### Request/Response Models

#### POST /api/Calibration/submissions
```json
// Request
{
  "roundId": "uuid",        // Required - lấy eventId từ đây
  "calibrationTitle": "Sample AI Project",
  "repositoryURL": "https://...",
  "demoURL": "https://...",
  "slideURL": "https://..."
}

// Response
{
  "calibrationId": "uuid",
  "eventId": "uuid",        // Derived từ Round
  "roundId": "uuid",
  "calibrationTitle": "...",
  "repositoryURL": "...",
  "demoURL": "...",
  "slideURL": "...",
  "submittedAt": "ISO8601",
  "status": "Pending",
  "judgeCount": 0
}
```

#### GET /api/Calibration/submissions/{id}/scores
```json
// Response
{
  "scores": [
    {
      "calibrationScoreId": "uuid",
      "judgeId": "uuid",
      "judgeCode": "Judge A",      // Anonymized!
      "criteriaId": "uuid",
      "criteriaName": "Innovation",
      "scoreValue": 9,
      "comment": "Strong innovation.",
      "scoredAt": "ISO8601"
    }
  ],
  "myScore": {                    // Điểm của current user (nếu là Judge)
    "calibrationScoreId": "uuid",
    "hasScored": true,
    "scoresPerCriteria": [...]
  }
}
```

### Database Entities cần thiết:

- [ ] **CalibrationSubmission** - Lưu bài mẫu calibration
  - `CalibrationId` (PK)
  - `TeamId` (FK - có thể null hoặc tạo team dummy)
  - `RoundId` (FK)
  - `CalibrationTitle` (string)
  - `RepositoryURL`, `DemoURL`, `SlideURL`
  - `IsCalibrationSample` = true
  - `SubmittedAt`, `Status`

- [ ] **CalibrationScore** - Lưu điểm calibration của Judge
  - `CalibrationScoreId` (PK)
  - `CalibrationId` (FK)
  - `JudgeId` (FK - User)
  - `CriteriaId` (FK)
  - `ScoreValue` (decimal)
  - `Comment` (string)
  - `ScoredAt` (datetime)

---

## Frontend - Coordinator Role

### Tab mới: `calibration` (thêm vào Coordinator page)

#### 1. Calibration Dashboard Header
- [ ] Tên tab: "Calibration Samples"
- [ ] Icon: `<Scale />` hoặc `<Target />`
- [ ] Badge hiển thị số lượng samples

#### 2. Component: `CreateCalibrationDialog.tsx`
- [ ] Button "Tạo bài mẫu mới"
- [ ] Dialog/Modal với form fields:
  - [ ] `calibrationTitle` (text input, required, max 200 chars)
  - [ ] `eventId` hoặc `roundId` (select dropdown, **required**)
    - [ ] Load events/rounds từ API
    - [ ] Hiển thị event name khi chọn round
  - [ ] `repositoryURL` (url input, optional, validated)
  - [ ] `demoURL` (url input, optional, validated)
  - [ ] `slideURL` (url input, optional, validated)
- [ ] **Pre-populated URLs** (optional): Cho phép copy từ submission thật làm mẫu
- [ ] Submit: `POST /api/Calibration/submissions`
- [ ] Validation feedback (inline errors)
- [ ] Success toast + close dialog + refresh list
- [ ] Error handling với retry option
- [ ] **Permission**: Chỉ Coordinator mới thấy button này

#### 3. Component: `CalibrationSampleList.tsx`
- [ ] Table/List view các calibration samples
- [ ] **Header Actions**:
  - [ ] Button "Tạo bài mẫu mới" (Coordinator only)
  - [ ] Filter dropdown: Round, Event, Status
- [ ] Columns:
  - [ ] `CalibrationTitle`
  - [ ] `EventName` (from Round → Event)
  - [ ] `RoundName` (from RoundId)
  - [ ] `JudgeCount` (số judge đã chấm / tổng số judge)
  - [ ] `Status` (Pending/InProgress/Completed)
    - [ ] `Pending`: Chưa có judge nào chấm
    - [ ] `InProgress`: Đang có judge chấm
    - [ ] `Completed`: Đủ judge chấm (configurable threshold)
  - [ ] `SubmittedAt` (formatted date)
  - [ ] `Actions` (View, Analyze, Export)
- [ ] **Empty State**: "Chưa có bài mẫu calibration nào"
- [ ] Sort by date (mới nhất / cũ nhất)
- [ ] Pagination (nếu > 10 items)

#### 4. Component: `CalibrationAnalysisPanel.tsx`
- [ ] Hiển thị khi click "Analyze" trên 1 sample
- [ ] Sections:
  - [ ] **Overall Stats**: `judgeCount`, `criteriaCount`, `overallMean`
  - [ ] **Criteria Variance Table**:
    - CriteriaName, MeanScore, Variance, StdDev, MinScore, MaxScore, ScoreRange
  - [ ] **Judge Summary Table**:
    - JudgeCode (anonymized: Judge A, B, C...)
    - AverageScore
    - DeviationFromGroupMean
    - ConsistencyLabel (Harsher/Neutral/Lenient)
  - [ ] **Inconsistency Flags**:
    - List các cảnh báo: "Judge B is significantly harsher."
- [ ] Chart visualization (optional):
  - [ ] Bar chart: scores per criteria per judge
  - [ ] Box plot: score distribution per criteria

#### 5. Component: `CalibrationExportButton.tsx`
- [ ] Button "Export CSV"
- [ ] Download file CSV từ `GET /api/Calibration/submissions/{id}/export`
- [ ] CSV format:
  ```
  SubmissionId,CriteriaId,CriteriaName,JudgeCode,ScoreValue,CriteriaMean,CriteriaVariance,CriteriaStdDev,JudgeDeviation
  ```
- [ ] Loading state
- [ ] Success toast với file name

#### 6. Component: `CalibrationDetailView.tsx`
- [ ] Modal/Slide-over khi click vào 1 sample
- [ ] Hiển thị chi tiết:
  - [ ] Title, URLs
  - [ ] Điểm của từng Judge (anonymized)
  - [ ] Progress indicator (X/Y judges scored)

---

## Frontend - Judge Role

### Tab mới: `calibration` (thêm vào Judge page)

#### 1. Component: `JudgeCalibrationList.tsx`
- [ ] Header: "Calibration Samples" với icon `<Target />`
- [ ] Hiển thị danh sách calibration samples cho current user
- [ ] **Per-item badges**:
  - [ ] `"Đã chấm"` - Current user đã submit điểm
  - [ ] `"Chưa chấm"` - Current user chưa chấm
  - [ ] `"Cần cập nhật"` - Đã chấm nhưng muốn sửa
  - [ ] `"Hoàn thành"` - Tất cả judges đã chấm
- [ ] **Filter tabs**: Tất cả | Đã chấm | Chưa chấm
- [ ] **Per-item info**:
  - [ ] Calibration title
  - [ ] Event/Round name
  - [ ] Số judges đã chấm
  - [ ] Điểm của current user (nếu đã chấm)
- [ ] Click → Navigate to scoring form
- [ ] **Empty State**: "Không có bài mẫu calibration nào cần chấm"
- [ ] Loading skeleton

#### 2. Component: `JudgeCalibrationScoringForm.tsx`
- [ ] **Loading state**: Hiển thị skeleton trong khi load data
- [ ] **Warning banner**: "Bài mẫu Calibration - Điểm không ảnh hưởng ranking thật"
- [ ] **Sample Info Card**:
  - Title, URLs (Repository, Demo, Slide) với clickable links
  - Event name và Round name
- [ ] **Criteria Section** (bắt buộc):
  - [ ] Load criteria từ Event của calibration sample
  - [ ] Validate: Tất cả criteria phải được chấm
  - [ ] Mỗi criteria row:
    - Criteria name + Weight
    - Input number (0-100 hoặc configurable max)
    - Textarea cho comment
- [ ] **Pre-populate**: Nếu đã có điểm của current user
- [ ] **Submit flow**:
  - [ ] Button "Nộp điểm" (nếu chưa có)
  - [ ] Button "Cập nhật điểm" (nếu đã có)
  - [ ] `POST /api/Calibration/submissions/{id}/scores`
  - [ ] `PUT /api/Calibration/submissions/{id}/scores`
- [ ] **Validation errors**:
  - [ ] Thiếu criteria → Error message
  - [ ] Trùng criteriaId → Error message
  - [ ] Invalid score value → Inline error
- [ ] **Success**: Toast + redirect về list
- [ ] **Cancel**: Discard changes + go back

#### 3. Component: `JudgeCalibrationHistory.tsx`
- [ ] Lịch sử các lần chấm calibration
- [ ] So sánh điểm với các judge khác (anonymized)
- [ ] Feedback về consistency của mình

---

## Frontend - Researcher Role

> **Note**: Researcher có thể là 1 role riêng hoặc Coordinator có quyền thêm. Nếu là role riêng, cần tạo page mới.

### Page: `/researcher/calibration`

- [ ] Giống Coordinator's Calibration Analysis
- [ ] Thêm filter: Date range, Event, Round
- [ ] Bulk export multiple samples
- [ ] Statistical charts:
  - [ ] Inter-rater reliability coefficient (Krippendorff's alpha hoặc ICC)
  - [ ] Score distribution histograms

---

## Shared Components & Types

### 1. Type Definitions (thêm vào `api.ts`)

```typescript
// Calibration Submission
export interface CalibrationSubmission {
  CalibrationId: string;
  TeamId?: string;
  RoundId: string;
  CalibrationTitle: string;
  RepositoryURL?: string;
  DemoURL?: string;
  SlideURL?: string;
  SubmittedAt: string;
  Status: "Pending" | "InProgress" | "Completed";
  JudgeCount?: number;
}

// Calibration Score (input)
export interface CalibrationScoreInput {
  CriteriaId: string;
  ScoreValue: number;
  Comment?: string;
}

// Calibration Score (output - với Judge info)
export interface CalibrationScoreOutput {
  CalibrationScoreId: string;
  CalibrationId: string;
  JudgeId: string;
  JudgeCode: string; // "Judge A", "Judge B"...
  CriteriaId: string;
  CriteriaName: string;
  ScoreValue: number;
  Comment?: string;
  ScoredAt: string;
}

// Analysis Response
export interface CalibrationAnalysis {
  SubmissionId: string;
  CalibrationTitle: string;
  JudgeCount: number;
  CriteriaCount: number;
  OverallMean: number;
  CriteriaVariance: {
    CriteriaId: string;
    CriteriaName: string;
    MeanScore: number;
    Variance: number;
    StandardDeviation: number;
    MinScore: number;
    MaxScore: number;
    ScoreRange: number;
  }[];
  JudgeSummaries: {
    JudgeId: string;
    JudgeCode: string;
    AverageScore: number;
    DeviationFromGroupMean: number;
    ConsistencyLabel: "Harsher" | "Neutral" | "Lenient";
  }[];
  InconsistencyFlags: string[];
}
```

### 2. API Functions (thêm vào `api.ts`)

```typescript
// Calibration Submissions
export async function getCalibrationSubmissions(filters?: {
  roundId?: string;
  eventId?: string;
  status?: string;
}): Promise<CalibrationSubmission[]>

export async function createCalibrationSubmission(data: {
  roundId: string;
  calibrationTitle: string;
  repositoryURL?: string;
  demoURL?: string;
  slideURL?: string;
}): Promise<CalibrationSubmission>

export async function getCalibrationSubmission(id: string): Promise<CalibrationSubmission>

// Calibration Scores
export async function getCalibrationScores(
  calibrationId: string
): Promise<{
  scores: CalibrationScoreOutput[];
  myScore?: CalibrationScoreOutput[]; // Current user's score if Judge
}>

export async function getMyCalibrationScore(
  calibrationId: string
): Promise<{ hasScored: boolean; scores: CalibrationScoreOutput[] }>

export async function submitCalibrationScore(
  calibrationId: string,
  scores: CalibrationScoreInput[]
): Promise<CalibrationScoreOutput[]>

export async function updateCalibrationScore(
  calibrationId: string,
  scores: CalibrationScoreInput[]
): Promise<CalibrationScoreOutput[]>

// Analysis & Export
export async function getCalibrationAnalysis(
  calibrationId: string
): Promise<CalibrationAnalysis>

export async function exportCalibrationCSV(calibrationId: string): Promise<Blob>
```

### 3. Shared UI Components

- [ ] `ScoreDistributionChart.tsx` - Histogram/Box plot
- [ ] `JudgeComparisonTable.tsx` - So sánh điểm giữa các judge
- [ ] `ConsistencyBadge.tsx` - Badge cho Harsher/Neutral/Lenient
- [ ] `CalibrationProgress.tsx` - Progress bar (X/Y judges)

---

## Testing Checklist

### Unit Tests

- [ ] Test `createCalibrationSubmission` API function
- [ ] Test `getCalibrationSubmissions` API function
- [ ] Test `submitCalibrationScore` với đầy đủ criteria
- [ ] Test `submitCalibrationScore` thiếu criteria (should fail)
- [ ] Test `updateCalibrationScore`
- [ ] Test `getCalibrationAnalysis` calculation
- [ ] Test `calculateMean`, `calculateVariance`, `calculateStdDev`

### Integration Tests

- [ ] Coordinator tạo calibration sample thành công
- [ ] Judge chấm calibration sample thành công
- [ ] Judge cập nhật điểm calibration
- [ ] Coordinator xem analysis sau khi có điểm
- [ ] Coordinator export CSV
- [ ] Researcher xem analysis (nếu có role riêng)

### E2E Tests (Playwright/Cypress)

- [ ] Full flow: Coordinator tạo → Judge chấm → Coordinator phân tích → Export
- [ ] Validation: Không cho chấm thiếu criteria
- [ ] Validation: Không cho chấm 2 lần (hoặc cho update)
- [ ] Anonymization: Judge code luôn là A, B, C... không reveal tên

### Edge Cases

- [ ] Không có judge nào chấm → Hiển thị empty state
- [ ] Chỉ 1 judge chấm → Không tính variance được
- [ ] Tất cả judge chấm giống nhau → Variance = 0
- [ ] Export khi chưa có dữ liệu → Error handling

---

## File Structure mới

```
frontend/src/
├── app/
│   ├── (coordinator)/coordinator/
│   │   └── components/
│   │       ├── Calibration/
│   │       │   ├── CreateCalibrationDialog.tsx
│   │       │   ├── CalibrationSampleList.tsx
│   │       │   ├── CalibrationDetailView.tsx
│   │       │   ├── CalibrationAnalysisPanel.tsx
│   │       │   ├── CalibrationExportButton.tsx
│   │       │   └── index.ts
│   ├── (judge)/judge/
│   │   └── components/
│   │       ├── JudgeCalibrationList.tsx
│   │       ├── JudgeCalibrationScoringForm.tsx
│   │       ├── JudgeCalibrationHistory.tsx
│   │       └── index.ts
│   └── (researcher)/researcher/
│       └── page.tsx (optional - nếu có role riêng)
├── components/
│   └── ui/
│       ├── score-distribution-chart.tsx (new)
│       ├── judge-comparison-table.tsx (new)
│       ├── consistency-badge.tsx (new)
│       └── calibration-progress.tsx (new)
└── lib/
    └── api.ts (update - thêm calibration functions)
```

---

## Priority Order

### Phase 1: Core Infrastructure (Tuần 1)
1. [ ] Backend: Tạo endpoints cơ bản (CRUD submissions, scores)
2. [ ] Backend: Analysis endpoint
3. [ ] Backend: Export CSV endpoint
4. [ ] Frontend: Types và API functions
5. [ ] Frontend: Basic UI components (shell)

### Phase 2: Coordinator UI (Tuần 2)
1. [ ] Create calibration sample dialog
2. [ ] List view với filter
3. [ ] Detail view (modal/slide-over)
4. [ ] Analysis panel
5. [ ] Export functionality

### Phase 3: Judge UI (Tuần 2-3)
1. [ ] Calibration list view
2. [ ] Scoring form
3. [ ] History view (optional)
4. [ ] My score indicator

### Phase 4: Polish & Research (Tuần 3-4)
1. [ ] Charts và visualizations
2. [ ] Researcher page (nếu cần role riêng)
3. [ ] E2E tests
4. [ ] Documentation

---

## UI/UX Considerations

### Responsive Design
- [ ] Desktop: Full table view với all columns
- [ ] Tablet: Collapsible columns, horizontal scroll
- [ ] Mobile: Card-based list view, bottom sheet cho detail

### Loading States
- [ ] Skeleton loaders cho tất cả async data
- [ ] Inline loading indicators cho buttons
- [ ] Progress bar cho export (nếu file lớn)

### Accessibility (A11y)
- [ ] ARIA labels cho interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus management (trap focus trong modals)
- [ ] Color contrast đạt WCAG AA
- [ ] Screen reader friendly error messages

### Performance
- [ ] Lazy load analysis data (chỉ load khi click Analyze)
- [ ] Debounce search/filter inputs
- [ ] Cache calibration list (revalidate on focus)
- [ ] Pagination cho large datasets

---

## Dependencies

### Backend
- Entity Framework Core (nếu chưa có)
- Statistical libraries cho calculation (hoặc tự implement)

### Frontend
- `recharts` hoặc `chart.js` cho visualizations
- `react-hook-form` cho forms
- `sonner` hoặc `react-toast` cho notifications
- `date-fns` cho date formatting

---

## Notes

1. **Anonymization**: Judge names phải được ẩn trong response, chỉ hiển thị "Judge A", "Judge B", etc.

2. **Separation**: Calibration scores KHÔNG bao giờ gọi RankingService hoặc ảnh hưởng ranking thật.

3. **Audit**: Mỗi lần export phải ghi AuditLog với action `CALIBRATION_DATASET_EXPORT`.

4. **Validation**: Frontend validation phải khớp với backend validation (đầy đủ criteria).

5. **Real-time Updates**: Sau khi submit, cần refresh list hoặc optimistic update UI.

---

## Permission Matrix

| Action | Coordinator | Judge | Researcher |
|--------|:-----------:|:-----:|:----------:|
| Tạo calibration sample | ✅ | ❌ | ❌ |
| Xem danh sách samples | ✅ | ✅ | ✅ |
| Chấm điểm calibration | ❌ | ✅ | ❌ |
| Cập nhật điểm đã chấm | ❌ | ✅ | ❌ |
| Xem chi tiết scores | ✅ | ✅ (own) | ✅ |
| Xem analysis | ✅ | ❌ | ✅ |
| Export CSV | ✅ | ❌ | ✅ |
| Xóa calibration sample | ✅ | ❌ | ❌ |

---

## Edge Cases & Error Handling

### Empty States
- [ ] **Không có sample nào**: Hiển thị message + button tạo mới
- [ ] **Chưa có judge chấm**: Hiển thị "Chưa có điểm" + list judges
- [ ] **Chỉ 1 judge chấm**: Warning "Cần ít nhất 2 judges để phân tích"
- [ ] **Không đủ data phân tích**: Disable analyze button + tooltip

### Validation Errors
- [ ] **Thiếu criteria**: "Vui lòng chấm đầy đủ tất cả criteria"
- [ ] **Trùng criteria**: "Không được chấm trùng criteria"
- [ ] **Invalid URL**: "URL không hợp lệ"
- [ ] **Network error**: "Không thể kết nối server" + Retry button

### API Errors
- [ ] **401 Unauthorized**: Redirect to login
- [ ] **403 Forbidden**: Show "Bạn không có quyền thực hiện thao tác này"
- [ ] **404 Not Found**: "Không tìm thấy calibration sample này"
- [ ] **500 Server Error**: "Đã xảy ra lỗi server" + Retry

---

## Data Flow Diagrams

### Coordinator Flow
```
┌─────────────────┐
│  Dashboard       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────┐
│ Create Sample   │────▶│ POST /submissions    │
└─────────────────┘     └─────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────────┐
│ Sample List     │◀────│ GET /submissions     │
└────────┬────────┘     └─────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────┐
│ Click "Analyze" │────▶│ GET /{id}/analysis   │
└────────┬────────┘     └─────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────┐
│ View Analysis   │────▶│ GET /{id}/scores    │
└────────┬────────┘     └─────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────┐
│ Click "Export"  │────▶│ GET /{id}/export    │
└─────────────────┘     └─────────────────────┘
```

### Judge Flow
```
┌─────────────────┐
│  Calibration    │
│  List           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────┐
│ Select Sample   │────▶│ GET /{id}/my-score        │
└────────┬────────┘     └──────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────┐
│ Load Criteria   │────▶│ GET /events/{eventId}/criteria │
└────────┬────────┘     └──────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────┐
│ Fill Scores     │────▶│ POST /{id}/scores        │
└────────┬────────┘     │ (hoặc PUT nếu đã có)    │
         │              └──────────────────────────┘
         ▼
┌─────────────────┐
│ Success Toast   │
│ Refresh List   │
└─────────────────┘
```

---

*Document created: 2026-07-07*
*Last updated: 2026-07-07*
*Based on: Luong_5.md*
