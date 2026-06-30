# Luồng 2: Thành lập đội & Đăng ký tham gia Category

Luồng này cho phép sinh viên (Team Leader) tạo đội thi đấu mới, thêm các thành viên (đáp ứng điều kiện), và chọn Category thi đấu sau khi đủ số lượng thành viên tối thiểu.

---

## 1. Tạo đội thi đấu (Team Leader)

Tạo đội thi mới. Đội mới tạo chỉ chứa duy nhất 1 thành viên là người tạo (Team Leader).

* **Endpoint**: `POST /api/Teams`
* **Quyền truy cập**: Đã đăng nhập (Vai trò `TeamLeader` hoặc Sinh viên bất kỳ)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "teamName": "Team Phoenix",
    "teamStatus": "Active"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
    "teamName": "Team Phoenix",
    "teamLeaderId": "00000000-0000-0000-0000-000000000001",
    "categoryId": null,
    "teamStatus": "Active"
  }
  ```

> [!WARNING]
> Không gán tham số `categoryId` ở bước tạo đội. API sẽ ném lỗi nếu bạn truyền `categoryId` ngay tại đây vì chưa đủ số lượng thành viên tối thiểu.

---

## 2. Thêm thành viên vào đội (Team Leader)

Thêm sinh viên khác vào đội thi (tối đa 5 người).

* **Endpoint**: `POST /api/Teams/{teamId}/members`
* **Quyền truy cập**: Đã đăng nhập (Chỉ `TeamLeader` của đội này được gọi)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "userId": "00000000-0000-0000-0000-000000000002" // ID của sinh viên muốn thêm
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
    "teamName": "Team Phoenix",
    "teamLeaderId": "00000000-0000-0000-0000-000000000001",
    "categoryId": null,
    "teamStatus": "Active"
  }
  ```

### Các điều kiện kiểm tra (Hệ thống tự động Validate):
1. Số lượng thành viên đội tối đa là 5 người. Nếu quá 5 người sẽ báo lỗi.
2. Tài khoản sinh viên được thêm phải có `AccountStatus` là `"Approved"`.
3. Sinh viên được thêm không được thuộc bất kỳ đội thi nào khác (kể cả đội cũ của mình).
4. Sinh viên được thêm không được trùng lặp với người đã có sẵn trong đội.

> [!NOTE]
> Sinh viên được thêm sẽ nhận được thông báo Real-time và DB báo rằng họ đã được thêm vào đội thi.

---

## 3. Đăng ký chọn Category thi đấu (Team Leader)

Chọn Category thi đấu cho đội sau khi đã gom đủ người.

* **Endpoint**: `PUT /api/Teams/{teamId}/category`
* **Quyền truy cập**: Đã đăng nhập (Chỉ `TeamLeader` của đội này được gọi)
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "categoryId": "C0000000-0000-0000-0000-000000000001" // ID của Category muốn thi đấu
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "teamId": "0e8adbb1-1227-4fe2-8009-c62113f28cc7",
    "teamName": "Team Phoenix",
    "teamLeaderId": "00000000-0000-0000-0000-000000000001",
    "categoryId": "C0000000-0000-0000-0000-000000000001",
    "teamStatus": "Active"
  }
  ```

### Các điều kiện kiểm tra (Hệ thống tự động Validate):
1. **Số lượng thành viên**: Đội thi phải có từ **3 đến 5 thành viên** (kể cả Leader) mới được phép đăng ký Category. Nếu ít hơn 3 người sẽ bị từ chối.
2. **Thời hạn đăng ký**: Sự kiện gắn liền với Category đó phải đang trong thời gian mở đăng ký (chưa tới ngày bắt đầu sự kiện `StartDate`).

> [!NOTE]
> Khi đăng ký Category thành công, **tất cả thành viên trong đội** sẽ nhận được thông báo thời gian thực về thông tin đăng ký Category thi đấu của đội mình.
