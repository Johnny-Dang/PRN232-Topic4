# Luồng 4: Chấm điểm & Thông báo chấm thi

Luồng này mô tả quy trình Điều phối viên (Coordinator) phân công Giám khảo (Judge), Giám khảo chấm điểm bài thi, và cách các bên nhận thông báo tự động.

---

## 1. Phân công Giám khảo chấm thi (Coordinator)

Điều phối viên phân công Giám khảo phụ trách chấm thi cho một Vòng đấu cụ thể.

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
    "userId": "00000000-0000-0000-0000-000000000011", // ID của Giám khảo
    "roundId": "A0000000-0000-0000-0000-000000000001" // ID của Vòng thi
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

> [!NOTE]
> Giám khảo được chỉ định sẽ nhận được thông báo thời gian thực: `"Bạn đã được phân công chấm bài thi cho vòng [Tên vòng]."`

---

## 2. Giám khảo chấm điểm bài thi (Judge)

Giám khảo cho điểm và đưa ra nhận xét cho bài nộp của đội thi theo các tiêu chí (Criteria).

* **Endpoint**: `POST /api/Scores`
* **Quyền truy cập**: Quyền `Judge` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f", // ID bài nộp
    "assignmentId": "6d347a1e-b768-4edb-8476-a69aa97d9d45", // ID phân công giám khảo ở bước 1
    "criteriaId": "CC000000-0000-0000-0000-000000000001", // ID tiêu chí chấm điểm
    "scoreValue": 9.5, // Điểm số (0 đến 10)
    "comment": "Outstanding submission!" // Nhận xét
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "scoreId": "2c84f163-75ff-40c1-81b5-bc1a6c0e28ce",
    "submissionId": "60c18596-de7b-43d8-8314-3e7f1422045f",
    "assignmentId": "6d347a1e-b768-4edb-8476-a69aa97d9d45",
    "criteriaId": "CC000000-0000-0000-0000-000000000001",
    "scoreValue": 9.5,
    "comment": "Outstanding submission!",
    "scoredAt": "2026-06-30T14:27:00Z"
  }
  ```

> [!NOTE]
> Khi điểm số được tạo hoặc cập nhật thành công, **Trưởng nhóm (Team Leader)** của đội thi đó sẽ nhận được thông báo thời gian thực: 
> `"Bài thi của đội [Tên đội] tại vòng [Tên vòng] đã được chấm điểm cho tiêu chí [Tên tiêu chí] bởi Giám khảo."`
