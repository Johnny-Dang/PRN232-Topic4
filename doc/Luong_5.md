# Luồng 5: Research RBL & Judge Calibration

Luồng này phục vụ nghiên cứu Inter-rater Reliability để đánh giá mức độ công bằng và nhất quán giữa các Judge. Điểm calibration được lưu riêng trong `CalibrationScores` và không ảnh hưởng đến `Scores` hoặc Ranking thật.

---

## 1. Coordinator tạo bài mẫu Calibration

Coordinator tạo một sample submission để tất cả Judge cùng chấm như bài thật.

* **Endpoint**: `POST /api/Calibration/submissions`
* **Quyền truy cập**: Quyền `Coordinator` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "calibrationTitle": "Sample AI Project",
    "repositoryURL": "https://github.com/sample/ai-project",
    "demoURL": "https://sample-demo.example.com",
    "slideURL": "https://slides.example.com/sample"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f",
    "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "calibrationTitle": "Sample AI Project",
    "repositoryURL": "https://github.com/sample/ai-project",
    "demoURL": "https://sample-demo.example.com",
    "slideURL": "https://slides.example.com/sample",
    "submittedAt": "2026-07-02T10:00:00Z",
    "status": "CalibrationSample"
  }
  ```

> [!NOTE]
> Sample submission được đánh dấu `IsCalibrationSample = true`, nên không được chấm bằng workflow score thật.

---

## 2. Judge xem danh sách bài mẫu

Judge, Coordinator hoặc Researcher xem danh sách sample submissions dùng cho calibration.

* **Endpoint**: `GET /api/Calibration/submissions`
* **Quyền truy cập**: Quyền `Judge`, `Coordinator` hoặc `Researcher`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 3. Judge chấm bài mẫu Calibration

Judge nhập điểm theo toàn bộ Criteria của Event như đang chấm thật. Điểm được lưu vào `CalibrationScores`.

* **Endpoint**: `POST /api/Calibration/submissions/{submissionId}/scores`
* **Quyền truy cập**: Quyền `Judge`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
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

### Các điều kiện kiểm tra
1. Submission phải là sample calibration.
2. User gọi API phải có role `Judge`.
3. Request phải gửi đúng toàn bộ Criteria đã cấu hình cho Event, không thiếu và không thừa.
4. Không được gửi trùng `criteriaId`.
5. Một Judge chỉ được chấm một lần cho cùng `Submission + Criteria`. Muốn sửa điểm thì dùng `PUT`.

> [!IMPORTANT]
> Điểm calibration không gọi `RankingService` và không ảnh hưởng bảng xếp hạng thật.

---

## 4. Judge cập nhật điểm Calibration

Nếu Judge cần chỉnh lại điểm calibration đã nộp, dùng API cập nhật.

* **Endpoint**: `PUT /api/Calibration/submissions/{submissionId}/scores`
* **Quyền truy cập**: Quyền `Judge`
* **Request Body**: giống bước 3.

---

## 5. Coordinator / Researcher xem phân tích inconsistency

Hệ thống tính mean, variance, standard deviation theo từng Criteria và đánh dấu Judge có xu hướng chấm quá gắt hoặc quá dễ.

* **Endpoint**: `GET /api/Calibration/submissions/{submissionId}/analysis`
* **Quyền truy cập**: Quyền `Coordinator` hoặc `Researcher`
* **Response (200 OK)**:
  ```json
  {
    "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f",
    "calibrationTitle": "Sample AI Project",
    "judgeCount": 3,
    "criteriaCount": 2,
    "overallMean": 7.67,
    "criteriaVariance": [
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000001",
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
        "judgeId": "00000000-0000-0000-0000-000000000011",
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

---

## 6. Export dataset nghiên cứu

Coordinator hoặc Researcher export CSV để phục vụ nghiên cứu. Judge được anonymized bằng mã `Judge A`, `Judge B`, ...

* **Endpoint**: `GET /api/Calibration/submissions/{submissionId}/export`
* **Quyền truy cập**: Quyền `Coordinator` hoặc `Researcher`
* **Response**: file CSV

CSV bao gồm:

```csv
SubmissionId,CriteriaId,CriteriaName,JudgeCode,ScoreValue,CriteriaMean,CriteriaVariance,CriteriaStdDev,JudgeDeviation
```

> [!NOTE]
> Mỗi lần export sẽ ghi `AuditLogs` với action `CALIBRATION_DATASET_EXPORT`.

---

## 7. Tóm tắt API trong luồng

| Mục đích | Method | Endpoint | Quyền |
| --- | --- | --- | --- |
| Tạo bài mẫu calibration | `POST` | `/api/Calibration/submissions` | Coordinator |
| Xem bài mẫu calibration | `GET` | `/api/Calibration/submissions` | Judge / Coordinator / Researcher |
| Judge chấm bài mẫu | `POST` | `/api/Calibration/submissions/{submissionId}/scores` | Judge |
| Judge cập nhật điểm mẫu | `PUT` | `/api/Calibration/submissions/{submissionId}/scores` | Judge |
| Xem phân tích reliability | `GET` | `/api/Calibration/submissions/{submissionId}/analysis` | Coordinator / Researcher |
| Export CSV research dataset | `GET` | `/api/Calibration/submissions/{submissionId}/export` | Coordinator / Researcher |
