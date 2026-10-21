# Verification

## Đã thực hiện trong môi trường chuẩn bị gói

- Giải nén ZIP người dùng gửi (107 mục), kiểm tra index-json.js, cloud-json-store.js, bot-runner.js, engine.js, runtime-config.js, storage-paths.js, frontend Challenge và các test liên quan. Không thấy AGENTS.md trong ZIP; chỉ kết luận trong phạm vi ZIP.
- Không có worker nhận việc từ Render trong bản gốc. Challenge JSON gốc trả 503. Backend PostgreSQL khác entry point đang triển khai.
- Cài dependencies bằng npm ci --ignore-scripts (55 packages), không nâng dependency hoặc thay lockfile.
- Kiểm tra cú pháp Node cho các file mới/sửa.
- Suite JSON auth/ownership + external worker + engine + runtime modes + frontend: 38/38 PASS.
- Chạy thêm 4 test submitted-bots: PASS. Test external worker chạy lại sau khi thêm kiểm tra bot-timeout replay: PASS.
- External-worker test dùng HTTP thật với createJsonApp và engine thật, hai tài khoản, upload riêng, token hợp lệ/sai, lease đúng/sai, chỉ một job running, không rò source/lease trong API công khai, chống giả ownership, manual opponent bị từ chối, giới hạn lượt, đối chiếu replay, từ chối replay sai, retry idempotent, replay bot-timeout, hết hạn worker và kết quả đến muộn bị từ chối.
- Môi trường test Node v24.19.0. Máy người dùng dự kiến Node v22.22.1; chưa chạy riêng binary Node 22 ở môi trường này.
- Không thay đổi public/, engine, package.json/lockfile, index-postgres.js, pg/jobs.js hoặc các file cấu hình online/offline người dùng đã thêm.

## Chưa thực hiện

- Không có Docker trong môi trường chuẩn bị gói: chưa chạy container Python/Java/C thật. HTTP test mô phỏng worker tin cậy trả kết quả từ engine, không chứng minh sandbox đã chạy source.
- Chưa thực hiện node worker/smoke.cjs trên WSL/Docker Desktop của người dùng. Đây là bước bắt buộc người dùng tự kiểm tra trước deploy.
- Chưa deploy Render/Vercel, chưa push Git, chưa thay Environment, chưa chạy với Railway.
- Chưa kiểm tra độ bền dữ liệu qua Render restart: JSON vẫn nằm trên filesystem tạm, không có cam kết persistence.
- Chưa load test, không cam kết 2000 sinh viên đồng thời.
- Chưa tự khởi động worker cùng Windows. Lần đầu chạy foreground; sau khi xác nhận hoạt động mới cấu hình service theo cách vận hành máy nhóm.

## Hành vi khi gián đoạn

- Worker poll mỗi 5 giây khi rảnh, heartbeat mỗi 20 giây khi bận.
- Không heartbeat/poll trong 60 giây: challengeReady=false ở lần truy vấn tiếp theo.
- Lease 90 giây, tổng deadline backend 20 phút. Executor timeout 15 phút. Lease hết hạn được dọn khi truy vấn status hoặc worker request, không dùng timer ngầm.
- Trận lỗi không tự retry vì có thể thực thi lại ngoài ý muốn. Người chơi tạo trận mới sau khi sửa worker.
- Result retry idempotent giữ receipt trong RAM, tối đa 500 trận. Backend restart đánh dấu queued/running failed theo hành vi gốc; không hứa exactly-once qua restart hoặc mất ổ đĩa.
- Nếu SIGKILL/WSL shutdown, có thể còn worker.lock/container/cache. Hướng dẫn dọn có trong WSL-WORKER-VI.md.
- Tất cả source/replay online vẫn phụ thuộc Render JSON storage; worker không giữ bản lưu lâu dài.
