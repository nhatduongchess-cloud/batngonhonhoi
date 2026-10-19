# Liber · 20/10

Website chúc mừng 20/10 dành cho các bạn nữ CLB Liber: mở thiệp theo tên, vẽ trái tim 3D, nhạc, video lời chúc, thiệp cá nhân và khảo sát mèo.

## Sử dụng

Mở website qua GitHub Pages. Điền tên hoặc biệt danh, chọn đúng người nếu có tên trùng, rồi làm theo các bước trên trang.

Khảo sát cuối thiệp có hai câu hỏi và thanh điểm 0–100. Khi có Internet, câu trả lời được gửi tới Google Sheets của ban tổ chức. Trang chỉ báo thành công khi nhận xác nhận từ Google; mỗi người có thể sửa câu trả lời của mình.

## Cấu trúc

- `index.html`: giao diện và chức năng website.
- `assets/`: ảnh, video và font phục vụ trang.
- `.nojekyll`: phục vụ các tệp tĩnh trực tiếp trên GitHub Pages.

Tên được dùng để cá nhân hóa thiệp, không phải tài khoản có mật khẩu. Dữ liệu phản hồi được lưu trên Google Sheets, không nằm trong repository này.

Website tự động xuất bản khi cập nhật nhánh `main` bằng workflow **Publish Liber website**. Trong **Settings → Pages**, nguồn xuất bản là **GitHub Actions**. Có thể chạy lại tại **Actions → Publish Liber website → Run workflow**.
