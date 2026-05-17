# Hệ thống Quản lý Hackathon (SEAL Hackathon)

Chào mừng đến với **Hệ thống Quản lý Hackathon (SEAL Hackathon)**. Đây là một nền tảng toàn diện được thiết kế để tự động hóa và tối ưu hóa quy trình tổ chức, quản lý và đánh giá các cuộc thi Hackathon. Hệ thống hỗ trợ Ban tổ chức, Giám khảo, Mentor và các Đội thi tương tác một cách hiệu quả xuyên suốt sự kiện.

---

## 🌟 Các chức năng chính

### 1. Quản lý Sự kiện & Vòng thi
- **Tạo và quản lý sự kiện:** Quản lý thông tin tổng quan của các sự kiện hackathon.
- **Cấu hình đa vòng thi:** Hỗ trợ thiết lập nhiều vòng cho mỗi sự kiện (ví dụ: Vòng sơ loại, Vòng chung kết).
- **Thiết lập vòng thi chi tiết:** Tùy chỉnh hạn nộp bài, phân công giám khảo và cấu hình tiêu chí chấm điểm cho từng vòng.
- **Quy tắc thăng hạng (Advancement Rules):** Định nghĩa cấu hình tự động chọn Top `N` đội từ mỗi Hạng mục để đi tiếp vào vòng sau.

### 2. Quản lý Tiêu chí Chấm điểm
- **Mẫu tiêu chí (Templates):** Duy trì các bộ mẫu tiêu chí mặc định để có thể tái sử dụng qua nhiều sự kiện khác nhau.
- **Tùy biến linh hoạt:** Mỗi sự kiện có thể kế thừa từ mẫu, đồng thời cho phép Ban tổ chức thêm, bớt hoặc điều chỉnh trọng số của từng tiêu chí sao cho phù hợp với tính chất cuộc thi.

### 3. Quản lý Hạng mục (Categories)
- **Tạo Hạng mục thi đấu:** Chia nhỏ sự kiện thành nhiều mảng thi đấu khác nhau (VD: Web, AI, Blockchain, Mobile).
- **Phân công Mentor:** Một giảng viên/chuyên gia có thể đóng vai trò Mentor ở một hạng mục, đồng thời có thể là Giám khảo ở một hạng mục khác trong cùng một sự kiện.

### 4. Quản lý Đội thi
- **Thành lập đội:** Cho phép sinh viên tạo nhóm từ 3–5 thành viên.
- **Đăng ký thi đấu:** Các đội chọn và đăng ký tham gia vào một Hạng mục cụ thể của sự kiện.

### 5. Đăng ký & Xác thực Người dùng
- **Bảo mật JWT:** Hệ thống sử dụng Email/Mật khẩu kết hợp với JSON Web Token (JWT) cho tất cả người dùng.
- **Phân loại Sinh viên:** 
  - Sinh viên nội bộ (FPT): Cung cấp mã số sinh viên FPT.
  - Sinh viên trường khác: Cung cấp mã số sinh viên kèm tên trường đang theo học.
- **Quy trình Phê duyệt:** Tất cả tài khoản đăng ký mới đều cần được Ban tổ chức phê duyệt (Approve) trước khi chính thức tham gia thi.
- **Giám khảo Khách mời:** Tài khoản cấp tạm thời do Ban tổ chức khởi tạo, chỉ có quyền truy cập để chấm điểm các bài thi/vòng thi được phân công cụ thể.

### 6. Nộp bài (Submissions)
- **Cổng nộp bài theo vòng:** Các đội tiến hành nộp bài cho từng vòng thi bằng cách cung cấp các URL: Repository dự án, Video Demo, Link Báo cáo/Slide.
- **Tích hợp API (Optional):** Hỗ trợ tích hợp GitHub/GitLab API để tự động fetch các thông tin metadata từ repository của đội thi.

### 7. Đánh giá & Chấm điểm
- **Chấm điểm độc lập:** Giám khảo đánh giá dựa trên tiêu chí của sự kiện. Điểm số cho từng tiêu chí của từng giám khảo được ghi nhận và lưu trữ độc lập.
- **Phân công Giám khảo:** Ban tổ chức linh hoạt trong việc phân công Giám khảo nội bộ và Giám khảo khách mời cho các vòng thi khác nhau.

### 8. Xếp hạng, Thăng vòng & Loại (Elimination)
- **Xếp hạng tự động (Auto-ranking):** Tự động tính toán điểm và xếp hạng các đội theo từng Vòng, từng Hạng mục và toàn Sự kiện.
- **Thăng vòng tự động:** Hệ thống tự động xét duyệt các đội đủ điều kiện đi tiếp dựa trên Rule đã thiết lập.
- **Chức năng Loại (Disqualify):** Ban tổ chức có quyền loại bỏ đội thi/bài nộp vi phạm quy chế. Kết quả bị hủy và lý do vi phạm sẽ được ghi log lại.
- **Nhật ký (Audit Logs):** Mọi hành động chấm điểm, thay đổi trạng thái và loại bài thi đều được lưu trữ phục vụ cho mục đích đối soát.

### 9. Thu thập Dữ liệu Nghiên cứu (RBL - Research-Based Learning)
> Dành cho nhóm sinh viên nghiên cứu khoa học / phát triển tính năng nâng cao.
- **Lưu trữ dữ liệu thô:** Lưu trữ điểm số chi tiết của từng giám khảo ở từng tiêu chí (không gộp chung điểm trung bình ngay lập tức).
- **Vòng hiệu chuẩn (Calibration Round):** Giám khảo sẽ chấm thử một bài mẫu. Hệ thống trực quan hóa sự phân bố điểm để giúp các giám khảo thảo luận và đồng thuận về thang đo chuẩn.
- **Xuất dữ liệu ẩn danh:** Cho phép xuất bộ dữ liệu chấm điểm dưới định dạng CSV (đã ẩn danh thông tin cá nhân) để phục vụ cho việc phân tích độ tin cậy liên đánh giá viên (Inter-rater reliability).
- **Dashboard Phân tích:** Hiển thị biểu đồ phân tích phương sai điểm số giữa các giám khảo theo từng tiêu chí cụ thể.

### 10. Giải thưởng & Báo cáo
- **Hệ thống Giải thưởng:** Hỗ trợ quy trình trao giải dựa trên kết quả xếp hạng cuối cùng.
- **Thông báo:** Tự động thông báo và công bố kết quả đến tất cả các thành viên tham gia.
- **Xuất Báo cáo:** Xuất bảng xếp hạng và toàn bộ bảng điểm chi tiết ra định dạng CSV/Excel.

---

## 🚀 Công nghệ sử dụng
*(Dự kiến)*
- **Backend:** .NET 8 (C#), Entity Framework Core, SQL Server, JWT Authentication.
- **Frontend:** React.js / Next.js, TailwindCSS.

## 📄 Hướng dẫn cài đặt & Khởi chạy
*(Sẽ được cập nhật chi tiết sau)*

1. Clone repository.
2. Cấu hình chuỗi kết nối Database tại `appsettings.json`.
3. Chạy lệnh Update Database / Migration.
4. Chạy dự án Backend (`dotnet run`) và Frontend (`npm run dev`).
