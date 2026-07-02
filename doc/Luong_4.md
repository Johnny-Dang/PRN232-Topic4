# Luồng 4: Chấm điểm & Xếp hạng bài thi

Luồng này mô tả quy trình Điều phối viên (Coordinator) cấu hình tiêu chí chấm điểm, phân công Giám khảo (Judge), Giám khảo chấm điểm bài nộp, và hệ thống tự động tính bảng xếp hạng (Ranking).

---

## 1. Cấu hình tiêu chí chấm điểm cho Event (Coordinator)

Điều phối viên chọn bộ tiêu chí (Criteria) và trọng số dùng để chấm các bài nộp thuộc Event.

* **Endpoint**: `POST /api/events/{eventId}/criteria`
* **Quyền truy cập**: Quyền `Coordinator` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "criteria": [
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000001",
        "weight": 40
      },
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000002",
        "weight": 35
      },
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000003",
        "weight": 25
      }
    ]
  }
  ```
* **Response (200 OK)**:
  ```json
  [
    {
      "eventCriteriaId": "d3a9e7c2-d7b1-4b1e-9f4b-7e57cc9fd113",
      "eventId": "E0000000-0000-0000-0000-000000000001",
      "criteriaId": "CC000000-0000-0000-0000-000000000001",
      "criteriaName": "Innovation",
      "weight": 40
    }
  ]
  ```

### Các điều kiện kiểm tra
1. Event phải tồn tại.
2. Criteria trong request phải tồn tại.
3. Không được gửi trùng `criteriaId`.
4. Khi cập nhật lại danh sách criteria, criteria cũ không còn trong request sẽ bị gỡ khỏi bộ tiêu chí của Event.

> [!NOTE]
> Trọng số có thể nhập theo dạng phần trăm, ví dụ `40`, `35`, `25`. Khi tính ranking, hệ thống sẽ tự chuẩn hóa nếu tổng trọng số lớn hơn `1`.

---

## 2. Cấu hình rule chọn đội đi tiếp (Coordinator)

Điều phối viên cấu hình số đội top đầu được đi tiếp theo từng cặp `Round` + `Category`.

* **Endpoint**: `POST /api/AdvancementRule`
* **Quyền truy cập**: Quyền `Coordinator` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "topN": 2
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "ruleId": "33c5b7a4-5b65-4ef0-8de1-f0492e48180e",
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "topN": 2
  }
  ```

### Các điều kiện kiểm tra
1. Round phải tồn tại.
2. Category phải tồn tại.
3. Category phải thuộc cùng Event với Round.
4. Mỗi cặp `RoundId + CategoryId` chỉ có một rule. Nếu tạo lại rule cho cùng cặp này, hệ thống cập nhật `topN` thay vì tạo rule trùng.

---

## 3. Phân công Giám khảo chấm thi (Coordinator)

Điều phối viên phân công Giám khảo phụ trách chấm thi cho một Round cụ thể.

* **Endpoint**: `POST /api/JudgeAssignment`
* **Quyền truy cập**: Quyền `Coordinator` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "userId": "00000000-0000-0000-0000-000000000011",
    "roundId": "A0000000-0000-0000-0000-000000000001"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "assignmentId": "6d347a1e-b768-4edb-8476-a69aa97d9d45",
    "userId": "00000000-0000-0000-0000-000000000011",
    "roundId": "A0000000-0000-0000-0000-000000000001"
  }
  ```

### Các điều kiện kiểm tra
1. User được phân công phải tồn tại.
2. User được phân công phải có role `Judge`.
3. Round phải tồn tại.
4. Một Judge chỉ được phân công một lần cho cùng Round.

> [!NOTE]
> Giám khảo được chỉ định sẽ nhận được thông báo thời gian thực: `"Bạn đã được phân công chấm bài thi cho vòng [Tên vòng]."`

---

## 4. Giám khảo xem danh sách bài được phân công (Judge)

Giám khảo lấy danh sách bài nộp thuộc các Round mà mình được phân công, kèm điểm đã chấm nếu có.

* **Endpoint**: `GET /api/Scores/assigned-submissions`
* **Quyền truy cập**: Quyền `Judge` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response (200 OK)**:
  ```json
  [
    {
      "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f",
      "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
      "teamName": "Team Phoenix",
      "roundId": "A0000000-0000-0000-0000-000000000001",
      "assignmentId": "6d347a1e-b768-4edb-8476-a69aa97d9d45",
      "categoryId": "C0000000-0000-0000-0000-000000000001",
      "repositoryURL": "https://github.com/team/project",
      "demoURL": "https://demo.example.com",
      "slideURL": "https://slides.example.com",
      "submittedAt": "2026-06-30T14:27:00Z",
      "status": "Submitted",
      "scores": []
    }
  ]
  ```

---

## 5. Giám khảo chấm điểm bài thi (Judge)

Giám khảo gửi điểm cho bài nộp theo toàn bộ bộ tiêu chí đã cấu hình cho Event.

* **Endpoint**: `POST /api/Scores/submissions/{submissionId}`
* **Quyền truy cập**: Quyền `Judge` (Đính kèm JWT Token)
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
        "scoreValue": 92,
        "comment": "Ý tưởng tốt, demo rõ ràng."
      },
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000002",
        "scoreValue": 85,
        "comment": "Kỹ thuật ổn, cần tối ưu thêm."
      },
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000003",
        "scoreValue": 88,
        "comment": "Trình bày mạch lạc."
      }
    ]
  }
  ```
* **Response (200 OK)**:
  ```json
  [
    {
      "scoreId": "2c84f163-75ff-40c1-81b5-bc1a6c0e28ce",
      "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f",
      "assignmentId": "6d347a1e-b768-4edb-8476-a69aa97d9d45",
      "criteriaId": "CC000000-0000-0000-0000-000000000001",
      "scoreValue": 92,
      "comment": "Ý tưởng tốt, demo rõ ràng.",
      "scoredAt": "2026-06-30T15:10:00Z"
    }
  ]
  ```

### Các điều kiện kiểm tra
1. Submission phải tồn tại.
2. Submission phải ở trạng thái `Submitted` hoặc `Updated`.
3. Judge hiện tại phải được phân công vào Round của Submission.
4. Thời gian hiện tại phải nằm trong khoảng chấm điểm của Round: `StartDate <= now <= EndDate`.
5. Request phải gửi đúng toàn bộ Criteria đã cấu hình cho Event, không thiếu và không thừa.
6. Không được gửi trùng `criteriaId`.
7. Mỗi Judge chỉ được tạo một score cho cùng `Submission + Assignment + Criteria`.

> [!NOTE]
> Sau khi chấm điểm thành công, hệ thống tự động tạo/cập nhật Ranking cho Round tương ứng. Không cần gọi API trigger Ranking thủ công.

---

## 6. Giám khảo cập nhật điểm đã chấm (Judge)

Nếu Judge đã chấm trước đó và cần điều chỉnh điểm hoặc nhận xét, dùng API cập nhật.

* **Endpoint**: `PUT /api/Scores/submissions/{submissionId}`
* **Quyền truy cập**: Quyền `Judge` (Đính kèm JWT Token)
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
        "scoreValue": 95,
        "comment": "Cập nhật điểm sau khi review lại demo."
      },
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000002",
        "scoreValue": 87,
        "comment": "Cải thiện đánh giá kỹ thuật."
      },
      {
        "criteriaId": "CC000000-0000-0000-0000-000000000003",
        "scoreValue": 90,
        "comment": "Trình bày tốt."
      }
    ]
  }
  ```
* **Response (200 OK)**:
  ```json
  [
    {
      "scoreId": "2c84f163-75ff-40c1-81b5-bc1a6c0e28ce",
      "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f",
      "assignmentId": "6d347a1e-b768-4edb-8476-a69aa97d9d45",
      "criteriaId": "CC000000-0000-0000-0000-000000000001",
      "scoreValue": 95,
      "comment": "Cập nhật điểm sau khi review lại demo.",
      "scoredAt": "2026-06-30T15:35:00Z"
    }
  ]
  ```

> [!NOTE]
> Sau khi cập nhật điểm, Ranking của Round cũng được tự động tính lại.

---

## 7. Xem bảng xếp hạng (Judge / Coordinator)

Judge hoặc Coordinator xem Ranking đã được hệ thống tính tự động.

* **Endpoint**: `GET /api/Rankings?roundId={roundId}&categoryId={categoryId}`
* **Quyền truy cập**: Quyền `Judge` hoặc `Coordinator`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Query Parameters**:
  * `roundId` (bắt buộc): ID của Round cần xem Ranking.
  * `categoryId` (tùy chọn): Nếu truyền vào, chỉ xem Ranking của Category đó.
* **Response (200 OK)**:
  ```json
  [
    {
      "rankingId": "e2d0d5bc-7fd2-42f5-9ddc-f46c37c72951",
      "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
      "teamName": "Team Phoenix",
      "roundId": "A0000000-0000-0000-0000-000000000001",
      "categoryId": "C0000000-0000-0000-0000-000000000001",
      "rankPosition": 1,
      "totalScore": 90.75,
      "generatedAt": "2026-06-30T15:35:05Z",
      "isAdvanced": true
    }
  ]
  ```

### Cách hệ thống tính Ranking
1. Mỗi score được nhân với trọng số của Criteria tương ứng.
2. Điểm của từng Judge được cộng theo Criteria.
3. Tổng điểm cuối cùng của Submission là trung bình điểm của các Judge đã chấm.
4. Ranking được chia theo `CategoryId`.
5. Sắp xếp theo `totalScore` giảm dần, nếu bằng điểm thì sắp theo `teamName`.
6. `isAdvanced = true` khi đội nằm trong Top N theo Advancement Rule của `Round + Category`.

> [!IMPORTANT]
> Các API trigger thủ công như `POST /api/Rankings/generate/{roundId}` hoặc `POST /api/Rankings/apply-advancement/{roundId}` không còn nằm trong workflow. Ranking được tự động tạo/cập nhật sau khi Judge chấm hoặc cập nhật điểm.

---

## 8. Tóm tắt API trong luồng

| Mục đích | Method | Endpoint | Quyền |
| --- | --- | --- | --- |
| Cấu hình Criteria cho Event | `POST` | `/api/events/{eventId}/criteria` | Coordinator |
| Xem Criteria của Event | `GET` | `/api/events/{eventId}/criteria` | Đã đăng nhập |
| Cấu hình rule đi tiếp | `POST` | `/api/AdvancementRule` | Coordinator |
| Phân công Judge | `POST` | `/api/JudgeAssignment` | Coordinator |
| Judge xem bài được giao | `GET` | `/api/Scores/assigned-submissions` | Judge |
| Judge chấm điểm | `POST` | `/api/Scores/submissions/{submissionId}` | Judge |
| Judge cập nhật điểm | `PUT` | `/api/Scores/submissions/{submissionId}` | Judge |
| Xem Ranking | `GET` | `/api/Rankings?roundId={roundId}&categoryId={categoryId}` | Judge / Coordinator |
