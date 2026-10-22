# Kết quả kiểm tra gói Render PostgreSQL

Ngày chuẩn bị: 22/10/2026.

## Đã kiểm tra

- Đọc ZIP source mới do người dùng gửi (64 file), package/lockfile, ba migration hiện có, schema, auth/service/routes, entry JSON đang chạy, entry PostgreSQL cũ, worker/external-worker, runner và frontend contract/proxy. Không có AGENTS.md trong ZIP. Không mặc định repo GitHub hoặc bản source cũ đã cập nhật giống ZIP này.
- Giữ Prisma/@prisma/client 6.19.3, không nâng dependency, không thay lockfile.
- npm ci --ignore-scripts thành công. Prisma validate với URL thử nghiệm hợp lệ thành công. Prisma generate thành công. Không dùng db push/reset/seed vào DB production.
- Kiểm tra cú pháp các file mới/sửa.
- 38 kiểm thử sẵn có liên quan auth policy, engine, frontend, runtime online/offline, runner và Compose: PASS.
- Hai kiểm thử mới về canonical JSON/hash, UTF-8/NUL/giới hạn payload, TLS bắt buộc và pool giới hạn: PASS. Bốn auth-policy test được chạy lại cùng unit test, PASS.
- Một integration test nhiều bước: PASS với PostgreSQL nhúng PGlite qua TCP, Prisma Client thật và HTTP thật. Runtime thử nghiệm nằm ngoài repo, không thêm PGlite vào dependency production.
- Tổng cộng 41 test riêng biệt trong các nhóm đã chọn PASS; không tuyên bố đã chạy toàn bộ npm test của repo.

Integration kiểm tra:
- Áp dụng SQL của đủ bốn migration vào schema thử nghiệm riêng; unique/FK/tables hoạt động qua Prisma.
- Dry-run không ghi, import giữ ID/hash/owner/source/replay, lần nhập thứ hai created=0, dữ liệu khác bị từ chối thay vì ghi đè.
- Admin bootstrap chạy lại không đổi password/role, từ chối username Student đã có.
- Login tài khoản đã import; register bỏ role ADMIN của client và tạo STUDENT.
- Cookie/session DB, logout, revoke session, đổi role và khóa tài khoản có hiệu lực.
- Hai tài khoản chỉ thấy bot riêng; private source bị chặn với người khác kể cả Judge; forged userId không đổi owner.
- CSRF/Origin không hợp lệ bị chặn, worker thiếu token bị 401.
- Ghép bot hai người khác nhau, claim duy nhất, replay sai bị từ chối, replay JSONB đọc lại đúng hash bất chấp thứ tự key.
- Đóng API/Prisma rồi tạo client/API mới trong khi lease còn hoạt động: heartbeat/result tiếp tục, result gửi lặp được nhận idempotent từ receipt DB.
- Hết hạn lease và heartbeat làm trạng thái worker false, trận failed; kết quả đến muộn bị từ chối.
- Source và replay cũ/mới vẫn đọc được sau khi tạo lại API/client.
- Tiêm lỗi P1001 vào truy vấn health trả 503; phục hồi kết nối không tạo users/database rỗng. Không phải kiểm tra ngắt mạng thật tới Render.

## Chưa kiểm tra trên dịch vụ thật

- Chưa kết nối vào database Render của người dùng, không nhận secret.
- prisma migrate deploy đã được thử trên PostgreSQL nhúng nhưng schema engine không hoàn tất và báo lỗi; KHÔNG ghi nhận CLI migration đó là PASS. Nhánh integration được chạy thành công bằng cách áp dụng trực tiếp SQL migration trong môi trường nhúng. Production vẫn bắt buộc chạy migrate deploy trên Render từ WSL và phải thành công trước deploy API.
- Chưa xác minh TLS/certificate của Render qua Prisma; chỉ người dùng báo psql kiểm tra đã thành công. Code yêu cầu endpoint External và sslmode=require&sslaccept=strict, không tự tắt xác minh chứng chỉ.
- Chưa push, deploy hoặc kiểm tra persistence sau restart service Render thật. Integration chỉ tạo lại API/Prisma, PostgreSQL nhúng vẫn chạy; không chứng minh ổ lưu trữ managed DB hay container worker trên máy thật.
- Chưa chạy Docker bot hoặc pg_dump/restore helper thật trong môi trường này. Worker/runner không đổi. Bước smoke Compose hiện tại và backup/restore trên WSL cần người dùng thực hiện.
- Testhost Node v24.19.0; người dùng dùng v22.22.1. Dùng các API có trên Node 22, chưa chạy test riêng với binary 22 trong môi trường chuẩn bị.
- Không load test 2000 sinh viên, không có SLA cho gói Free, 1 GB có thể đầy do replay/source/index.

## Phạm vi giữ nguyên

Frontend, thiết kế pixel, Challenge ở khu vực Student, proxy/cookie origin, engine/rules, worker Compose, chế độ offline hiện có được giữ nguyên. Không xây thêm tournament UI hoặc giải đấu. Tournaments/TournamentStaff và bảng liên quan không bị xóa.

Bản online dùng API/auth service hiện có với tùy chọn giới hạn đăng ký 500/giờ cho IP proxy và login 5000/10 phút cho IP proxy, đồng thời giữ 10 lần/10 phút theo tài khoản+IP, tránh chặn toàn bộ nhóm chỉ vì Vercel dùng chung địa chỉ proxy. Giới hạn này không phải cam kết tải.

Worker lease/receipt được chuyển sang DB. Nhịp polling và giao thức worker giữ nguyên; không cần thay khóa hoặc trao quyền truy cập database cho worker.
