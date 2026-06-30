# Luồng 1: Phân công Mentor & Phản hồi xác nhận

Luồng này cho phép Điều phối viên (Coordinator) phân công Mentor quản lý các Category thi đấu và yêu cầu Mentor xác nhận (Approve/Reject) phân công đó.

---

## 1. Phân công Mentor (Coordinator)

Gửi đề xuất phân công Mentor cho Category cụ thể. Phân công tạo ra sẽ ở trạng thái mặc định là `Pending`.

* **Endpoint**: `POST /api/CategoryMentor`
* **Quyền truy cập**: Quyền `Coordinator` (Đính kèm JWT Token)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "userId": "00000000-0000-0000-0000-000000000009" // ID của Mentor
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "categoryMentorId": "fb18d988-0d69-41ae-a5fa-83dc3ec630f8",
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "userId": "00000000-0000-0000-0000-000000000009",
    "status": "Pending"
  }
  ```

> [!NOTE]
> Sau khi gọi API này, một thông báo DB và thông báo Real-time qua SignalR sẽ được gửi đến Mentor đích.

---

## 2. Mentor Đồng ý phân công (Approve)

Mentor được phân công gọi API này để chấp thuận đề xuất gán category thi đấu.

* **Endpoint**: `PUT /api/CategoryMentor/{categoryMentorId}/approve`
* **Quyền truy cập**: Quyền `Mentor` (Đính kèm JWT Token của Mentor được phân công)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response (200 OK)**:
  ```json
  {
    "categoryMentorId": "fb18d988-0d69-41ae-a5fa-83dc3ec630f8",
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "userId": "00000000-0000-0000-0000-000000000009",
    "status": "Approved"
  }
  ```

> [!NOTE]
> Sau khi duyệt, thông báo Real-time sẽ gửi ngược lại cho Coordinator đề xuất.

---

## 3. Mentor Từ chối phân công (Reject)

Mentor được phân công gọi API này để từ chối đề xuất gán category thi đấu.

* **Endpoint**: `PUT /api/CategoryMentor/{categoryMentorId}/reject`
* **Quyền truy cập**: Quyền `Mentor` (Đính kèm JWT Token của Mentor được phân công)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response (200 OK)**:
  ```json
  {
    "categoryMentorId": "fb18d988-0d69-41ae-a5fa-83dc3ec630f8",
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "userId": "00000000-0000-0000-0000-000000000009",
    "status": "Rejected"
  }
  ```

---

## 4. Danh sách API bổ sung hỗ trợ

### A. Lấy danh sách phân công Mentor của mình (Mentor)
* **Endpoint**: `GET /api/CategoryMentor`
* **Quyền truy cập**: Quyền `Mentor` hoặc `Coordinator`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response (200 OK)**:
  ```json
  [
    {
      "categoryMentorId": "fb18d988-0d69-41ae-a5fa-83dc3ec630f8",
      "categoryId": "C0000000-0000-0000-0000-000000000001",
      "userId": "00000000-0000-0000-0000-000000000009",
      "status": "Pending"
    }
  ]
  ```
