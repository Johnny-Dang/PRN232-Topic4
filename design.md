Bạn là UI/UX Designer kiêm Frontend Developer. Hãy thiết kế và xây dựng một trang **Home Page** cho website chuyên **thông báo và đăng các cuộc thi** dành cho học sinh, sinh viên hoặc cộng đồng học thuật.

Mục tiêu của Home Page là giúp người dùng nhanh chóng biết được:

* Có cuộc thi nào mới?
* Cuộc thi nào đang mở đăng ký?
* Cuộc thi nào sắp hết hạn?
* Có thông báo quan trọng nào?
* Người dùng có thể tìm kiếm, lọc và xem chi tiết cuộc thi như thế nào?

Yêu cầu giao diện cần **trực quan, hiện đại, dễ đọc, rõ thông tin, có bố cục đẹp**, phù hợp với một website thông báo/cuộc thi chuyên nghiệp.

---

## 1. Phong cách giao diện tổng thể

Thiết kế theo phong cách:

* Modern Education Portal
* Clean Competition Platform
* Card-based Layout
* Friendly Academic
* Trực quan, sáng sủa, dễ sử dụng

Màu sắc gợi ý:

* Primary: xanh dương hoặc tím xanh
* Secondary: cam/vàng dùng cho deadline hoặc cuộc thi sắp hết hạn
* Success: xanh lá cho trạng thái đang mở
* Danger: đỏ cho thông báo quan trọng
* Background: trắng hoặc xám rất nhạt
* Card: trắng, bo góc mềm, shadow nhẹ
* Text chính: đen/xám đậm
* Text phụ: xám trung tính

Giao diện cần có khoảng trắng hợp lý, không nhồi quá nhiều nội dung vào một khối.

---

## 2. Cấu trúc tổng thể của Home Page

Hãy xây dựng Home Page theo bố cục từ trên xuống như sau:

1. Header / Navbar
2. Hero Section
3. Search & Quick Filter
4. Featured Competitions
5. Deadline / Sắp hết hạn
6. Latest Announcements
7. Competition Categories
8. Statistics / Highlights
9. Call To Action
10. Footer

Mỗi section cần có tiêu đề rõ ràng, mô tả ngắn nếu cần, và bố cục item hợp lý.

---

## 3. Header / Navbar

Tạo thanh điều hướng trên cùng, có thể sticky khi scroll.

Thành phần gồm:

* Logo hoặc tên website
* Menu điều hướng:

  * Trang chủ
  * Cuộc thi
  * Thông báo
  * Lịch thi
  * Kết quả
  * Hướng dẫn
  * Liên hệ
* Nút hành động bên phải:

  * Đăng nhập
  * Đăng cuộc thi hoặc Đăng ký

Yêu cầu:

* Header gọn, hiện đại
* Có hover effect cho menu
* Responsive tốt trên mobile
* Mobile nên chuyển thành hamburger menu

---

## 4. Hero Section

Hero Section là phần đầu tiên người dùng nhìn thấy. Cần làm nổi bật mục đích website.

Bố cục đề xuất:

* Bên trái:

  * Tiêu đề lớn
  * Mô tả ngắn
  * Ô tìm kiếm nhanh
  * 2 nút CTA
* Bên phải:

  * Illustration hoặc mockup dashboard
  * Card nổi bật hiển thị một cuộc thi đang mở
  * Countdown hoặc badge “Sắp hết hạn”

Nội dung mẫu:

Tiêu đề:
“Khám phá các cuộc thi mới nhất dành cho học sinh, sinh viên”

Mô tả:
“Cập nhật nhanh thông báo, thể lệ, thời hạn đăng ký và kết quả các cuộc thi học thuật, sáng tạo, công nghệ và kỹ năng.”

CTA:

* Xem cuộc thi đang mở
* Xem thông báo mới nhất

Hero cần tạo cảm giác chuyên nghiệp, đáng tin cậy và có điểm nhấn rõ ràng.

---

## 5. Search & Quick Filter

Tạo một khu vực tìm kiếm nổi bật để người dùng tìm nhanh cuộc thi.

Thành phần:

* Search input:

  * Placeholder: “Tìm kiếm cuộc thi theo tên, lĩnh vực, đơn vị tổ chức...”
* Button tìm kiếm
* Bộ lọc nhanh dạng chip:

  * Tất cả
  * Đang mở đăng ký
  * Sắp hết hạn
  * Sắp diễn ra
  * Online
  * Offline
  * Miễn phí
  * Có giải thưởng

Yêu cầu:

* Chip filter có trạng thái active
* Khi hover chip đổi màu nhẹ
* Search box có focus animation
* Trên mobile, filter chip có thể scroll ngang

---

## 6. Featured Competitions

Tạo section “Cuộc thi nổi bật”.

Hiển thị 3–6 card cuộc thi nổi bật.

Mỗi card cần có:

* Ảnh/banner cuộc thi
* Tên cuộc thi
* Mô tả ngắn 1–2 dòng
* Badge trạng thái:

  * Đang mở
  * Sắp hết hạn
  * Sắp diễn ra
  * Đã kết thúc
* Hạn đăng ký
* Hình thức:

  * Online / Offline / Hybrid
* Đối tượng:

  * Học sinh / Sinh viên / Tất cả
* Đơn vị tổ chức
* Nút “Xem chi tiết”

Gợi ý card:

* Card có bo góc 16px
* Shadow nhẹ
* Hover nâng card lên 4px
* Ảnh zoom nhẹ khi hover
* Badge màu rõ ràng theo trạng thái

Bố cục desktop:

* Grid 3 cột

Bố cục tablet:

* Grid 2 cột

Bố cục mobile:

* 1 cột

---

## 7. Deadline / Sắp hết hạn

Tạo section “Sắp hết hạn đăng ký”.

Mục tiêu: giúp người dùng thấy nhanh các cuộc thi cần đăng ký sớm.

Có thể dùng dạng:

* Timeline
* List card ngang
* Countdown cards

Mỗi item gồm:

* Tên cuộc thi
* Hạn cuối đăng ký
* Số ngày còn lại
* Badge “Còn 2 ngày”, “Còn 5 ngày”
* Nút xem chi tiết

Ưu tiên hiển thị các cuộc thi gần hết hạn nhất.

Thiết kế nên dùng màu cam/vàng để tạo cảm giác chú ý nhưng không quá gắt.

---

## 8. Latest Announcements

Tạo section “Thông báo mới nhất”.

Hiển thị danh sách thông báo mới, ví dụ 5–6 item.

Mỗi item gồm:

* Tiêu đề thông báo
* Ngày đăng
* Loại thông báo:

  * Mới
  * Quan trọng
  * Cập nhật
  * Kết quả
  * Gia hạn
* Tóm tắt ngắn
* Link “Xem thêm”

Bố cục đề xuất:

* Bên trái: danh sách thông báo
* Bên phải: khối “Thông báo quan trọng” hoặc “Tin nổi bật”

Yêu cầu:

* Thông báo quan trọng cần có badge nổi bật
* Danh sách dễ đọc
* Có phân tách rõ ràng giữa các item
* Không dùng quá nhiều màu gây rối

---

## 9. Competition Categories

Tạo section “Khám phá theo lĩnh vực”.

Hiển thị các danh mục cuộc thi dạng card hoặc icon grid.

Danh mục gợi ý:

* Công nghệ
* Thiết kế
* Học thuật
* Khởi nghiệp
* Ngoại ngữ
* Khoa học
* Môi trường
* Kỹ năng mềm
* Tình nguyện
* Nghệ thuật

Mỗi category card gồm:

* Icon
* Tên lĩnh vực
* Số lượng cuộc thi đang mở
* Mô tả ngắn nếu cần

Ví dụ:

“Công nghệ”
“12 cuộc thi đang mở”

Yêu cầu:

* Icon đồng bộ phong cách
* Card nhỏ gọn
* Hover effect nhẹ
* Có thể click để lọc cuộc thi theo danh mục

---

## 10. Statistics / Highlights

Tạo section thống kê ngắn để tăng độ tin cậy.

Ví dụ:

* 120+ cuộc thi đã đăng
* 35 cuộc thi đang mở
* 80+ đơn vị tổ chức
* 10K+ lượt tham gia

Lưu ý:

* Nếu chưa có dữ liệu thật, dùng mock data rõ ràng
* Thiết kế dạng 4 ô thống kê ngang trên desktop
* Trên mobile chuyển thành 2 cột hoặc 1 cột
* Có thể thêm hiệu ứng count-up nhẹ

---

## 11. Call To Action Section

Tạo section CTA gần cuối trang.

Mục tiêu: kêu gọi người dùng đăng cuộc thi hoặc tham gia cộng đồng.

Nội dung mẫu:

Tiêu đề:
“Bạn có cuộc thi muốn chia sẻ?”

Mô tả:
“Đăng tải cuộc thi, thông báo hoặc sự kiện học thuật để tiếp cận nhiều học sinh, sinh viên và người quan tâm hơn.”

Button:

* Đăng cuộc thi
* Liên hệ ban quản trị

Thiết kế:

* Nền gradient nhẹ
* Text rõ ràng
* Button nổi bật
* Không quá nhiều thông tin

---

## 12. Footer

Footer gồm:

* Logo / tên website
* Mô tả ngắn
* Link nhanh:

  * Cuộc thi
  * Thông báo
  * Lịch thi
  * Kết quả
  * Hướng dẫn
* Chính sách:

  * Điều khoản sử dụng
  * Chính sách bảo mật
* Liên hệ:

  * Email
  * Facebook
  * GitHub hoặc fanpage nếu có

Footer cần gọn, dễ đọc, không quá nặng.

---

## 13. Hiệu ứng cần thêm

Thêm hiệu ứng nhẹ để giao diện sinh động nhưng vẫn chuyên nghiệp.

Hiệu ứng nên có:

* Navbar sticky khi scroll
* Button hover đổi màu
* Card hover nâng nhẹ lên
* Ảnh trong card zoom nhẹ khi hover
* Fade-in khi section xuất hiện trong viewport
* Filter chip active animation
* Search input focus glow nhẹ
* Countdown deadline
* Skeleton loading cho danh sách cuộc thi/thông báo nếu đang tải dữ liệu

Không dùng:

* Animation xoay 3D quá mạnh
* Chữ nhấp nháy
* Màu neon
* Carousel chạy quá nhanh
* Popup xuất hiện liên tục
* Quá nhiều motion gây rối mắt

---

## 14. Responsive Design

Trang cần responsive tốt trên:

* Desktop
* Tablet
* Mobile

Yêu cầu:

Desktop:

* Hero chia 2 cột
* Competition card 3 cột
* Category card 4–5 cột
* Navbar đầy đủ

Tablet:

* Hero có thể vẫn 2 cột hoặc chuyển xuống 1 cột
* Competition card 2 cột
* Category card 3 cột

Mobile:

* Hero 1 cột
* Search input full width
* Filter chip scroll ngang
* Competition card 1 cột
* Navbar chuyển hamburger menu
* CTA button full width nếu cần

---

## 15. Dữ liệu mẫu cần tạo

Hãy tạo mock data cho:

* Danh sách cuộc thi nổi bật
* Danh sách cuộc thi sắp hết hạn
* Danh sách thông báo mới
* Danh mục cuộc thi
* Thống kê tổng quan

Ví dụ cuộc thi:

1. Cuộc thi Sáng tạo Công nghệ 2026
2. Olympic Tin học Sinh viên
3. Ý tưởng Khởi nghiệp Trẻ
4. Thiết kế Poster Truyền thông
5. Cuộc thi Hùng biện Tiếng Anh
6. Nghiên cứu Khoa học Sinh viên

Ví dụ thông báo:

1. Mở đăng ký cuộc thi Sáng tạo Công nghệ 2026
2. Gia hạn thời gian nộp bài vòng sơ khảo
3. Công bố kết quả vòng loại cuộc thi Hùng biện
4. Cập nhật thể lệ cuộc thi Thiết kế Poster
5. Thông báo lịch phỏng vấn đội thi vòng chung kết

---

## 16. Yêu cầu UI chi tiết

Các thành phần cần có thiết kế nhất quán:

* Button primary
* Button secondary
* Competition card
* Announcement item
* Category card
* Badge status
* Search input
* Filter chip
* Statistic card
* Deadline card
* Section header

Badge màu gợi ý:

* Đang mở: xanh lá
* Sắp hết hạn: cam
* Quan trọng: đỏ
* Sắp diễn ra: xanh dương
* Đã kết thúc: xám
* Cập nhật: tím

---

## 17. Kết quả mong muốn

Sau khi hoàn thành, Home Page cần đạt các tiêu chí:

* Người dùng nhìn vào biết ngay website dùng để làm gì
* Cuộc thi đang mở được hiển thị nổi bật
* Thông báo mới dễ tìm
* Deadline dễ nhận biết
* Có tìm kiếm và lọc nhanh
* Giao diện đẹp, hiện đại, dễ đọc
* Bố cục rõ ràng, không rối
* Có hiệu ứng nhẹ nhưng không lạm dụng
* Responsive tốt trên mọi thiết bị
* Code/component được tổ chức rõ ràng, dễ mở rộng

Hãy triển khai giao diện hoàn chỉnh dựa trên các yêu cầu trên. Nếu đang dùng React/Next.js hoặc Flutter Web, hãy tách các section thành component riêng để dễ bảo trì và tái sử dụng.
