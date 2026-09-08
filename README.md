# Office Bluff Online

Bản tự host: React + Three.js + TypeScript + Vite ở trình duyệt, Node.js trên máy chủ. Không cần tài khoản Sites, khóa API hoặc dịch vụ bên ngoài.

## Tính năng

- Tạo phòng bằng mã 6 ký tự và sao chép link mời.
- 2–4 người thật, tự chọn tên và nhân vật mẫu. Chủ phòng bắt đầu / chuyển vòng / chơi lại.
- Máy chủ chia bài, giữ bài bí mật, xác thực lượt, số lá và kết quả tố nói dối.
- Client chỉ nhận bài của chính mình, số bài đối thủ và trạng thái công khai.
- Cập nhật trạng thái khoảng mỗi giây bằng HTTP polling.
- Tải lại cùng tab để nối lại phiên, token được giữ trong sessionStorage của tab.
- Mất kết nối quá 90 giây sẽ bị rời phòng. Khi một người rời giữa ván, người đó bị loại và chia lại bài cho người còn lại. Chủ phòng được chuyển cho người tiếp theo.
- Chế độ chơi thử với 3 máy vẫn có ở màn hình đầu.

## Chạy để phát triển

Yêu cầu Node.js >=22.13 (khuyến nghị Node.js 24) và npm.

```sh
npm ci
npm run dev
```

Nếu dùng nvm, chạy `nvm use` trước (file `.nvmrc` chọn Node 26).

Lệnh này chạy API ở cổng 3001 (tự chọn cổng trống nếu 3001 đang bận) và Vite ở địa chỉ in trong terminal (thường là 5173). Mở địa chỉ của **Vite**, không phải cổng API. Vite chuyển tiếp `/api` tới máy chủ local.

Để thử hai người trên một máy: dùng hai trình duyệt hoặc một cửa sổ thường và một cửa sổ ẩn danh, vì nhân bản tab có thể sao chép phiên sessionStorage.

## Tự host trên VPS / máy chủ Node.js

```sh
npm ci
npm run build
npm start
```

Mở `http://localhost:3001`. Máy chủ Node.js phục vụ cả giao diện trong `dist/` và API `/api` cùng nguồn. Có thể đổi cổng:

```sh
PORT=8080 npm start
```

Để đồng nghiệp truy cập từ Internet, chạy trên VPS hoặc dịch vụ cho phép một tiến trình Node.js chạy liên tục; cấu hình tên miền HTTPS trỏ qua reverse proxy tới cổng trên. Không upload riêng `dist/` lên static hosting: bản online cần máy chủ Node.js.

Ví dụ Nginx bên trong server block của tên miền đã cấu hình HTTPS:

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Giữ một tiến trình / một replica cho bản này. Phòng nằm trong RAM; khởi động lại máy chủ sẽ xóa tất cả phòng. Chưa hỗ trợ nhiều replica, lưu trận hoặc khôi phục sau khi server bị tắt. Rate limit đơn giản theo địa chỉ kết nối; nếu dùng reverse proxy chung, giới hạn này được chia sẻ giữa các người chơi (phù hợp nhóm nhỏ).

## Docker

```sh
docker build -t office-bluff .
docker run --restart unless-stopped -p 3001:3001 office-bluff
```

Dockerfile được cung cấp để tự host; môi trường tạo bản này chưa chạy thử Docker.

## Cấu trúc

- `app/online.tsx`: tạo/join phòng, lobby, giao diện online, polling và session.
- `app/online.css`: giao diện phòng online.
- `app/page.tsx`: cảnh Three.js (`Room`), dữ liệu nhân vật (`people`), bản chơi với máy.
- `app/globals.css`: giao diện chung.
- `server/game.mjs`: phòng, chia bài, luật, xác thực hành động, lọc trạng thái riêng tư và xử lý rời phòng.
- `server/index.mjs`: HTTP API và phục vụ bản build.
- `server/dev.mjs`: chạy API và Vite cùng nhau.
- `server/game.test.mjs`: kiểm tra luật, bảo mật dữ liệu bài, mất kết nối và HTTP nhiều người.
- `public/`: thêm ảnh, âm thanh hoặc model .glb ở đây.

Các file `app/layout.tsx`, `next.config.ts` và một số dependency của bộ khung trước được giữ để tham khảo; bản tự host chạy bằng Vite, không dùng Sites / Cloudflare.

## Kiểm tra

```sh
npm test
npm run build
```

Đã kiểm tra 100 ván mô phỏng hoàn chỉnh, chuyển chủ phòng, giới hạn 4 người, token phiên, chặn sai lượt / sai chỉ số / lặp lá / trạng thái cũ, không gửi bài đối thủ, và luồng HTTP tạo phòng → tham gia → bắt đầu → đánh → tố → nối lại. TypeScript check và production build cũng đã chạy thành công. Chưa kiểm tra bằng thao tác trên nhiều trình duyệt thật.

## Giới hạn bản đầu

- Đây là phòng chơi bằng mã, chưa có đăng nhập nhân viên, danh sách cho phép hoặc mật khẩu phòng. Người biết mã có thể tham gia trước khi bắt đầu.
- Không có voice chat, tài khoản, lịch sử hoặc upload khuôn mặt.
- Độ trễ đồng bộ tối đa khoảng một giây trong mạng bình thường.
- Chưa tự động đưa bản này lên dịch vụ hosting của bạn. URL Sites bản trước vẫn là bản chơi với máy.
