# Liber · 20/10

Website chúc mừng 20/10 dành cho các bạn nữ CLB Liber: mở thiệp theo tên, vẽ trái tim 3D, nhạc, video lời chúc, thiệp cá nhân và khảo sát mèo.

## Sử dụng

Mở website qua GitHub Pages. Điền tên hoặc biệt danh, chọn đúng người nếu có tên trùng, rồi làm theo các bước trên trang.

Khảo sát cuối thiệp có hai câu hỏi và thanh điểm 0–100. Khi có Internet, câu trả lời được gửi tới Google Sheets của ban tổ chức. Trang chỉ báo thành công khi nhận xác nhận từ Google; mỗi người có thể sửa câu trả lời của mình.

## Cấu trúc

- `index.html`: khung giao diện (HTML) của website.
- `css/styles.css`: toàn bộ định dạng giao diện.
- `js/`: chức năng website, chia thành các module ES (không cần bước build):
  - `main.js`: khởi động từng tính năng riêng biệt. Nếu một tính năng lỗi (ví dụ nhạc), các phần còn lại vẫn hoạt động và Console ghi `[liber] <tên> failed to start`.
  - `config.js`: địa chỉ Google Apps Script, video lời chúc, lời chúc mặc định.
  - `data/recipients.js`: danh sách người nhận (tên, ảnh, lời chúc, giao diện thiệp). Sửa tên hoặc lời chúc tại đây.
  - `data/card-themes.js`: bảng màu của ba kiểu thiệp.
  - `core/`: phần dùng chung: tìm phần tử, chuyển trang, hộp thoại, hiệu ứng, và `bus.js` (danh sách sự kiện giữa các tính năng).
  - `session/`: người nhận đang mở thiệp và kiểu thiệp đã chọn.
  - `drawing/`: các hình vẽ canvas/SVG (hoa, mèo, thỏ, sao…).
  - `features/`: từng tính năng: `entry/` (nhập tên), `heart.js`, `audio.js`, `letter.js`, `celebration/` (pháo hoa, video, thiệp cuối), `keepsake.js` (tải thiệp PNG), `feedback/` (khảo sát).
- `assets/`: ảnh, video và font phục vụ trang; giấy phép font ở `assets/fonts/OFL.txt`.
- `tests/unit/`: kiểm thử tìm tên người nhận, dữ liệu người nhận và danh sách module.
- `.nojekyll`: phục vụ các tệp tĩnh trực tiếp trên GitHub Pages.

Các tính năng không gọi trực tiếp lẫn nhau; khi cần phối hợp (ví dụ mở video thì tạm dừng nhạc), chúng gửi sự kiện qua `js/core/bus.js`.

## Đổi nhạc nền

1. Chép file nhạc vào `assets/music/`. Đặt tên chữ thường, không dấu, không khoảng trắng, ví dụ `bai-1.mp3` (GitHub Pages phân biệt chữ hoa và chữ thường).
2. Khai báo danh sách trong `js/config.js`, theo thứ tự muốn phát:

   ```js
   export const MUSIC_PLAYLIST = [
     { src: 'assets/music/bai-1.mp3', title: 'Tên bài hát 1' },
     { src: 'assets/music/bai-2.mp3', title: 'Tên bài hát 2' },
   ];
   ```

3. Chạy `npm test`: kiểm thử sẽ báo nếu thiếu file, sai tên hoặc thiếu tiêu đề.

Các bài phát lần lượt; hết bài cuối thì quay lại bài đầu. File nào không tải được sẽ bị bỏ qua; nếu không bài nào tải được (hoặc danh sách trống), trang dùng giai điệu tổng hợp có sẵn. Nên dùng MP3 khoảng 128 kbps để tải nhanh trên điện thoại.

Tên được dùng để cá nhân hóa thiệp, không phải tài khoản có mật khẩu. Dữ liệu phản hồi được lưu trên Google Sheets, không nằm trong repository này.

## Phát triển

Cần Node.js 22.

```sh
npm install
npm run serve      # xem thử tại http://localhost:8000
npm run lint       # kiểm tra lỗi JavaScript
npm run format     # định dạng lại mã
npm test           # chạy kiểm thử
```

Trang dùng module ES nên phải mở qua máy chủ (`npm run serve`), không mở trực tiếp file `index.html`. Khi thêm file `.js` mới, thêm dòng `<link rel="modulepreload">` tương ứng trong `index.html`; `npm test` sẽ báo nếu thiếu.

Website tự động xuất bản khi cập nhật nhánh `main` bằng workflow **Publish Liber website**, chỉ sau khi kiểm tra (lint, định dạng, kiểm thử) thành công. Các nhánh khác và pull request chỉ được kiểm tra, không xuất bản. Trong **Settings → Pages**, nguồn xuất bản là **GitHub Actions**. Có thể chạy lại tại **Actions → Publish Liber website → Run workflow**.
