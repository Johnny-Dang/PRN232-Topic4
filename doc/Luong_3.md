# Luồng 3: Nộp bài dự thi & Bảo mật

Luồng này cho phép Trưởng nhóm (Team Leader) nộp bài thi cho đội theo từng Vòng đấu trước thời hạn Deadline quy định.

---

## 1. Nộp bài thi mới (Team Leader)

Nộp liên kết bài thi cho vòng thi cụ thể.

* **Endpoint**: `POST /api/Submissions`
* **Quyền truy cập**: Đã đăng nhập (Chỉ `TeamLeader` của đội thi mới được gọi)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "teamId": "70000000-0000-0000-0000-000000000001",
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "repositoryURL": "https://github.com/teamphoenix",
    "demoURL": "https://youtube.com/demo",
    "slideURL": "https://drive.google.com/slide"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "submissionId": "c0756f61-8ee3-46ce-942a-8daf63e1c5c7",
    "teamId": "70000000-0000-0000-0000-000000000001",
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "repositoryURL": "https://github.com/teamphoenix",
    "demoURL": "https://youtube.com/demo",
    "slideURL": "https://drive.google.com/slide",
    "submittedAt": "2026-06-30T14:21:52Z",
    "status": "Submitted"
  }
  ```

### Các điều kiện kiểm tra (Hệ thống tự động Validate):
1. **Quyền hạn**: Phải là Trưởng nhóm của đội này. Thành viên hoặc người ngoài đội nộp sẽ bị từ chối (`Only the team leader can submit the project.`).
2. **Hạn nộp (Deadline)**: Thời gian gọi API hiện tại phải nhỏ hơn hoặc bằng hạn nộp bài `SubmissionDeadline` của Vòng đó. Quá hạn sẽ bị từ chối.
3. **Độ hợp lệ URL**: Các đường link nộp bài phải là URL hợp lệ (bắt đầu bằng `http://` hoặc `https://`) và bắt buộc phải điền tối thiểu 1 trong 3 URL.
4. **Kiểm tra trùng**: Nếu đội đã nộp bài rồi, hệ thống yêu cầu sử dụng API **Update** (không cho phép tạo mới bản ghi trùng).

> [!NOTE]
> Khi tạo mới thành công, hệ thống tự động lưu vết Audit Log hành động `SUBMISSION_CREATE`.
> Đồng thời, các Giám khảo được phân công cho vòng thi này sẽ nhận được thông báo: `"Đội thi [Tên đội] đã nộp bài dự thi cho vòng [Tên vòng]. Vui lòng truy cập để chấm điểm."`

---

## 2. Cập nhật bài thi trước Deadline (Team Leader)

Trưởng nhóm chỉnh sửa các liên kết bài thi trước khi tới giờ khóa nộp bài.

* **Endpoint**: `PUT /api/Submissions`
* **Quyền truy cập**: Đã đăng nhập (Chỉ `TeamLeader` của đội thi này được gọi)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "submissionId": "c0756f61-8ee3-46ce-942a-8daf63e1c5c7",
    "repositoryURL": "https://github.com/teamphoenix-updated",
    "demoURL": "https://youtube.com/demo-updated",
    "slideURL": "https://drive.google.com/slide-updated"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "submissionId": "c0756f61-8ee3-46ce-942a-8daf63e1c5c7",
    "teamId": "70000000-0000-0000-0000-000000000001",
    "roundId": "A0000000-0000-0000-0000-000000000001",
    "repositoryURL": "https://github.com/teamphoenix-updated",
    "demoURL": "https://youtube.com/demo-updated",
    "slideURL": "https://drive.google.com/slide-updated",
    "submittedAt": "2026-06-30T14:23:00Z",
    "status": "Updated"
  }
  ```

> [!NOTE]
> Khi cập nhật thành công, hệ thống tự động lưu vết Audit Log hành động `SUBMISSION_UPDATE`.
> Đồng thời, các Giám khảo được phân công cho vòng thi này sẽ nhận được thông báo cập nhật tình hình: `"Đội thi [Tên đội] đã cập nhật bài dự thi cho vòng [Tên vòng]. Vui lòng kiểm tra lại."`
