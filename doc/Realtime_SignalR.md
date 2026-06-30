# Hướng dẫn kết nối Real-time & Nhận thông báo (SignalR)

Để hỗ trợ hiển thị popup thông báo, thông báo nổi (Toast) thời gian thực trên màn hình Client, Frontend cần thực hiện kết nối WebSocket tới Server thông qua thư viện ASP.NET Core SignalR Client.

---

## 1. Địa chỉ kết nối (Route Hub)

* **Hub URL**: `https://localhost:7086/notificationHub` (Hoặc địa chỉ cổng chạy của môi trường dev/staging).
* **Giao thức**: WebSockets (khuyên dùng) hoặc Server-Sent Events / Long Polling.

---

## 2. Cách đính kèm Token xác thực JWT

Do môi trường WebSocket trên trình duyệt gặp hạn chế trong việc thêm Custom Headers khi bắt đầu handshake, Server đã cấu hình tự động phân tích JWT Token từ **Query String** có tên tham số là `access_token`.

Frontend cần truyền Token vào cấu hình khởi tạo của SignalR Hub Connection.

---

## 3. Mã nguồn mẫu kết nối trên Frontend (JavaScript / TypeScript)

Cài đặt thư viện: `npm install @microsoft/signalr`

```javascript
import * as signalR from "@microsoft/signalr";

// 1. Cấu hình Connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5279/notificationHub", {
        // Tự động đính kèm Token qua query string ?access_token=...
        accessTokenFactory: () => "MÃ_JWT_TOKEN_CỦA_USER_ĐANG_ĐĂNG_NHẬP",
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect() // Tự động kết nối lại khi mất mạng
    .configureLogging(signalR.LogLevel.Information)
    .build();

// 2. Đăng ký Lắng nghe Sự kiện từ Server gửi xuống
// Sự kiện nhận thông báo có tên là: "ReceiveNotification"
connection.on("ReceiveNotification", (message) => {
    console.log("Thông báo Real-time nhận được từ server: ", message);
    
    // Thực hiện hiển thị UI Toast hoặc Popup thông báo
    showNotificationToast(message);
});

// 3. Bắt đầu kết nối
connection.start()
    .then(() => {
        console.log("Kết nối tới Hub thông báo thành công!");
    })
    .catch((err) => {
        console.error("Lỗi kết nối tới Hub: ", err);
    });
```

---

## 4. API Lấy lại lịch sử thông báo khi tải trang (Load Notification History)

Khi sinh viên hoặc giám khảo tải lại trang, họ cần gọi API HTTP này để lấy danh sách các thông báo cũ và hiển thị trạng thái chưa đọc.

### A. Lấy tất cả thông báo của mình
* **Endpoint**: `GET /api/Notification`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response (200 OK)**:
  ```json
  [
    {
      "notificationId": "fb18d988-0d69-41ae-a5fa-83dc3ec630f8",
      "userId": "00000000-0000-0000-0000-000000000001",
      "message": "[NOTIFICATION] Bạn đã được thêm vào đội Team Phoenix bởi Trần Minh Đức.",
      "isRead": false,
      "createdAt": "2026-06-30T14:29:26.28Z"
    }
  ]
  ```

### B. Đánh dấu một thông báo đã đọc
* **Endpoint**: `PUT /api/Notification/{notificationId}/read`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response**: `204 NoContent` hoặc `200 OK`

### C. Đánh dấu tất cả thông báo đã đọc
* **Endpoint**: `PUT /api/Notification/read-all`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response**: `200 OK`
