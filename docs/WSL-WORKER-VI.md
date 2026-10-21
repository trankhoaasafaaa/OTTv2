# OTTv2: worker WSL + backend Render JSON + frontend Vercel

Bản này được viết từ ZIP OTTv2-worker-source.zip bạn gửi, không dựa vào nhánh của dự án khác. Render giữ Start Command `node server/index-json.js`. Không sửa package.json, frontend, luật game, PostgreSQL hoặc cấu hình online/offline của bạn.

## 0. Phạm vi và giới hạn cần đọc trước

- Worker nhận trận bằng HTTPS polling, không cần IP tĩnh, ngrok, mở cổng router hoặc server HTTP trên WSL.
- Một worker, một trận tại một thời điểm. Hàng đợi tối đa 20 trận, mỗi người tối đa 2 trận chờ/chạy; giới hạn 10 yêu cầu trận/10 phút/tài khoản.
- Student chọn bot của mình trong Đấu bot. Backend chọn ngẫu nhiên một submission của tài khoản khác đang hoạt động, rồi hoán đổi hai bên ngẫu nhiên. Tất cả submission trong bản luyện tập này được xem là có thể ghép đối thủ; chưa có cơ chế opt-in/public bot hoặc giải đấu chính thức.
- Giới hạn thử nghiệm 200 lượt/trận và 15 phút thực thi. UI hiện cho nhập tới 1000; nếu nhập >200 backend sẽ báo rõ giới hạn. Giữ nguyên UI trong gói này.
- Mã nguồn đối thủ chỉ trả cho worker có khóa. API danh sách bài nộp vẫn chỉ trả bài của người đăng nhập. Judge/Admin không được giả danh chủ bot qua Challenge.
- Không cập nhật Elo/leaderboard trong việc này. Không triển khai tổ chức giải/TournamentStaff.
- Replay được backend tái dựng từ các hành động theo engine hiện có và đối chiếu board/kết quả; không lưu bot stderr hoặc trường tùy ý do worker gửi. Backend vẫn tin worker về việc bot có thực sự phản hồi/thất bại; người giữ khóa worker là người vận hành đáng tin cậy.
- Worker không chạy bot trực tiếp trên WSL. Container không có mạng, không mount Docker socket/secret, có giới hạn CPU/RAM/PIDs/thời gian. Docker không phải ranh giới bảo đảm tuyệt đối cho mã không tin cậy; chỉ mở thử nghiệm cho nhóm trước.

QUAN TRỌNG: gói này KHÔNG chuyển nơi lưu dữ liệu. JSON, source bot, replay vẫn nằm trên ổ tạm Render. Deploy/restart/spin-down có thể làm mất chúng. Worker chỉ dùng file tạm và xóa sau trận, không phải bản sao lưu. Không tự động deploy trước khi chấp nhận được rủi ro này.

## 1. Bảo toàn trước khi thay đổi

Trên máy bạn, lưu bản sao source và dữ liệu local nếu có. Bản local KHÔNG phải bản sao dữ liệu đang ở Render.

```bash
cd ~/proj
umask 077
tar --exclude='OTTv2/node_modules' --exclude='OTTv2/.git' -czf "OTTv2-before-worker-$(date +%Y%m%d-%H%M%S).tar.gz" OTTv2
cd ~/proj/OTTv2
```

File tar có thể chứa .env và dữ liệu riêng; giữ riêng trên máy, không upload/chat/commit.

Nếu dữ liệu Render hiện tại cần giữ: chỉ dùng backup/export ĐÃ CÓ từ trước hoặc bản sao nguồn đang nắm giữ. Backend gốc này không có API xuất đầy đủ password hash, source và session, Render Free không có Shell. Không deploy endpoint export mới để rồi mới sao lưu: chính lần deploy đó có thể xóa dữ liệu. Nếu không có cách lấy bản sao, dừng bước deploy; chỉ chạy smoke WSL. Nếu dữ liệu đã mất và không có backup thì không thể khôi phục từ gói code.

## 2. Chép đúng các file thay đổi

Giải nén ZIP bàn giao vào một thư mục tạm rồi chép nội dung thư mục `ottv2-wsl-worker-changed-files/` vào gốc `~/proj/OTTv2`, giữ nguyên đường dẫn. Có thể dùng Files của Windows qua `explorer.exe .` chạy trong WSL.

Gói chỉ sửa hai file cũ: server/index-json.js và server/bot-runner.js. Các file còn lại là mới. Không xóa/chép lại toàn bộ server hoặc public. File server/storage-paths.js đã có trong ZIP của bạn và được giữ nguyên.

Đăng ký loại trừ secret/cache CHỈ ở máy local, không sửa .gitignore hiện có:

```bash
cd ~/proj/OTTv2
cat >> .git/info/exclude <<'EXCLUDE'
.env.worker
data-worker/
EXCLUDE
```

## 3. Kiểm tra Docker và image (trong WSL)

```bash
docker info --format 'Docker server: {{.ServerVersion}}'
docker pull python:3.12-alpine
docker pull eclipse-temurin:21-jdk
docker pull eclipse-temurin:21-jre
docker pull gcc:13-bookworm
docker pull debian:bookworm-slim
```

Worker chỉ báo sẵn sàng khi Docker hoạt động và đủ 5 image. Không tự tải image giữa trận. Docker Desktop phải bật WSL Integration cho distro này. Không dùng Docker remote daemon trên máy khác vì bind mount cần nhìn thấy file WSL.

## 4. Kiểm tra runner trước khi deploy

Dùng Node 22 của bạn. Worker không cần DATABASE_URL và không dùng Prisma.

```bash
cd ~/proj/OTTv2
node --version
node --check server/index-json.js
node --check server/external-worker.js
node --check worker/worker.cjs
node --check worker/execute-job.cjs
node worker/smoke.cjs
```

Lệnh smoke chạy hai bot Python mẫu trong hai container, tạo trận cục bộ 20 lượt, in `Docker smoke PASS: ...`, sau đó dọn container/file tạm. Đây là smoke runner, không phải hai tài khoản online. Nếu FAIL thì chưa deploy/bật thi đấu. Worker thật hỗ trợ Python/Java/C theo runner gốc; cần kiểm tra thêm Java/C trên máy bạn.

Không dùng `npm start` để chạy worker: lệnh đó vẫn khởi động backend PostgreSQL.

## 5. Tạo khóa worker trên WSL

```bash
cd ~/proj/OTTv2
cp -n .env.worker.example .env.worker
chmod 600 .env.worker
node - <<'NODE'
const fs=require('node:fs'),crypto=require('node:crypto');
const p='.env.worker';
let s=fs.readFileSync(p,'utf8');
if(!s.includes('REPLACE_WITH_64_LOWERCASE_HEX_CHARACTERS'))throw Error('File đã có khóa: giữ khóa hiện tại, không tạo lại.');
s=s.replace('REPLACE_WITH_64_LOWERCASE_HEX_CHARACTERS',crypto.randomBytes(32).toString('hex'));
fs.writeFileSync(p,s,{mode:0o600});
console.log('Đã lưu khóa trong .env.worker; không đưa file lên Git.');
NODE
```

Mở `.env.worker` bằng trình soạn thảo local. Copy GIÁ TRỊ của WORKER_TOKEN vào Render; không gửi khóa vào chat, ảnh chụp hoặc frontend. WORKER_API_URL là origin của backend Render, không phải Vercel, không có /api ở cuối. Giá trị mặc định là https://ottv2-api.onrender.com.

## 6. Kiểm thử code tại WSL

```bash
cd ~/proj/OTTv2
npm ci --ignore-scripts
node --test tests/external-worker.test.js tests/cloud-json.test.js tests/engine.test.js tests/runtime-modes.test.js tests/frontend.test.js
```

`npm ci` thay node_modules, không xóa dữ liệu. Không cần migrate/seed cho backend JSON hoặc worker.

## 7. Cập nhật Render (chỉ sau bước bảo toàn dữ liệu)

Render → service backend → Environment:

| Biến | Thao tác |
|---|---|
| WORKER_TOKEN | Thêm cùng giá trị trong .env.worker trên WSL |
| FRONTEND_ORIGIN | Giữ URL Vercel chính xác đang dùng, không slash cuối |
| NODE_ENV | Giữ production |
| CLOUD_DATA_DIR | Giữ giá trị hiện có; đường dẫn này vẫn tạm trên Free |
| ALLOW_SELF_REGISTER | Giữ thiết lập hiện có |
| BOOTSTRAP_ADMIN_USERNAME / PASSWORD | Không tạo lại/đổi ngẫu nhiên; giữ chính sách khởi tạo hiện có. Nếu dữ liệu rỗng và cần Admin đầu tiên, dùng cặp đã cấu hình theo hướng dẫn trước. Không công khai mật khẩu. |
| DATABASE_URL | Không cần thêm cho bản JSON; không áp dụng gói Railway trong bước này |

Render không cần WORKER_API_URL, WORKER_DATA_DIR hoặc Docker. Không thêm WORKER_TOKEN vào Vercel.

Start Command: `node server/index-json.js`
Health Check Path: `/api/health`
Giữ Build Command hiện tại nếu đang cài dependencies thành công. Backend cần bcryptjs trong dependencies; không cần thêm dependency mới. Nếu cần một build command đơn giản cho entry JSON: `npm ci --ignore-scripts`.

Nếu Auto Deploy đang bật, một lần push có thể deploy ngay. Lưu Environment cũng có thể gây deploy/restart theo lựa chọn Save của Render. Chỉ làm các thao tác này sau bước bảo toàn.

Bạn tự commit/push. Stage đúng các file dưới đây; storage-paths.js là file bạn đã thêm từ trước, cần được Git theo dõi vì bot-runner.js dùng nó. KHÔNG dùng git add . để tránh đưa .env/data lên Git hoặc gom các thay đổi PostgreSQL chưa muốn triển khai.

```bash
git add server/index-json.js server/bot-runner.js server/external-worker.js server/storage-paths.js worker/worker.cjs worker/execute-job.cjs worker/smoke.cjs examples/bots/worker_demo.py tests/external-worker.test.js .env.worker.example docs/WSL-WORKER-VI.md docs/WSL-WORKER-VERIFICATION.md
git diff --cached --stat
```

Kiểm tra danh sách stage không có secret/dữ liệu. Sau đó:

```bash
git commit -m "Connect JSON backend to external WSL bot worker"
git push
```

Nếu đã có file khác được stage từ trước, rà soát trước khi commit. Render dùng Start Command explicit nên không đổi npm start.

## 8. Khởi động worker trên WSL

Đảm bảo .env.worker chứa đúng khóa và URL. Biến môi trường shell có sẵn sẽ ưu tiên hơn --env-file, nên bỏ các giá trị cũ trong shell trước:

```bash
cd ~/proj/OTTv2
unset WORKER_TOKEN WORKER_API_URL WORKER_DATA_DIR
node --env-file=.env.worker worker/worker.cjs
```

Giữ terminal này mở trong buổi thử nghiệm. Đây là cách chạy ban đầu, chưa tự khởi động cùng Windows. Không cần cài PM2/systemd để kiểm thử.

Mở terminal WSL khác:

```bash
curl --fail --show-error --max-time 120 https://ottv2-api.onrender.com/api/judge/status
```

Chờ khoảng 5–30 giây sau khi worker bắt đầu. Kết quả mong đợi có:

```json
{"challengeReady":true,"dockerReady":false,"botExecution":"external-worker","activeJobs":0,"pendingJobs":0,"maxConcurrent":1}
```

`dockerReady:false` là đúng: Docker không nằm trên Render. Frontend sử dụng challengeReady. Nếu endpoint vẫn trả external-worker-required thì Render đang chạy code cũ.

## 9. Cho hai tài khoản đấu online

1. Mở Vercel bằng cửa sổ thường, đăng nhập Student A.
2. Tải examples/bots/worker_demo.py lên tài khoản A.
3. Mở cửa sổ ẩn danh hoặc browser khác, đăng nhập Student B và tải bot Python hợp lệ lên. Có thể dùng cùng worker_demo.py cho lần kiểm tra đầu.
4. Kiểm tra mỗi tài khoản chỉ thấy bài của mình trong My Bots.
5. Quay lại A → Đấu bot → Tải lại. Chọn bot của A, số lượt <=200 → Tìm trận.
6. Backend tự ghép với bot của tài khoản khác. Với đúng 2 tài khoản đã nộp bot, đó sẽ là bot của B. Nếu có nhiều tài khoản, đối thủ được chọn ngẫu nhiên.
7. Terminal worker hiện `[worker] Running M-...`, rồi completed/failed.
8. Website dùng polling hiện có để cập nhật trận/replay. Nếu frontend hết thời gian chờ trong khi trận còn chạy, tải lại trang để xem kết quả; không bấm liên tục tạo thêm trận.
9. Kiểm tra replay thực tế, không dùng các trận built-in demo để kết luận worker đã chạy bot.

Thông tin trận/replay là công khai theo API cũ. Nội dung mã nguồn bot không được trả ra danh sách trận.

## 10. Dừng và chạy lại

Ctrl+C trong terminal worker để dừng. Worker dọn container của phiên đang chạy; nếu trận bị dừng, backend đánh dấu failed khi lease hết hạn (~90 giây, vào lần kiểm tra trạng thái/worker tiếp theo). Sau ~60 giây không heartbeat/poll, Challenge bị tắt. Khi worker chạy lại, frontend cần Tải lại để nhận trạng thái mới.

Khởi động lại bằng lệnh bước 8. Không chạy hai worker cùng data-worker. Nếu process bị kill cưỡng bức hoặc WSL tắt, có thể còn worker.lock. Kiểm tra trước:

```bash
pgrep -af 'worker/worker.cjs|worker/execute-job.cjs'
docker ps -a --filter name=ottw-
```

Chỉ khi chắc chắn không còn worker/executor đang chạy, dọn container ottw còn sót của dự án và xóa khóa:

```bash
docker ps -aq --filter name=ottw- | xargs -r docker rm -f
rm -f ~/proj/OTTv2/data-worker/worker.lock
```

Không chạy lệnh dọn này khi một worker khác của nhóm đang thi đấu trên cùng Docker daemon. File tạm của lần mất điện có thể còn trong data-worker/job-*; chỉ xóa sau khi đã dừng toàn bộ worker của thư mục này. Không dùng docker system prune -a để sửa lỗi.

Giữ Windows không Sleep và Docker Desktop không Quit trong thời gian thi đấu. WSL không biến laptop thành máy chủ hoạt động khi máy đã tắt.

## 11. Lỗi thường gặp

- API HTTP 401: WORKER_TOKEN hai bên khác nhau hoặc Render chưa nhận env mới. Không in token ra log để kiểm tra; sửa qua file/env UI.
- API HTTP 404: backend chưa có /api/worker/* hoặc URL dùng nhầm Vercel/đường dẫn.
- Docker/images not ready: docker info trong đúng WSL terminal; tải đủ 5 image bước 3.
- Source-unavailable: file bot trên Render thiếu hoặc checksum sai. Nộp lại bài từ bản gốc; worker không tự dựng lại source bị mất.
- Chưa có đối thủ: cần tài khoản khác có ít nhất một submission.
- Worker-error: xem smoke, tên class Java phải khớp file, bot dùng JSON lines đúng protocol và có flush. Backend không công khai stderr để tránh rò rỉ dữ liệu.
- Worker-disconnected: Windows sleep, Docker dừng hoặc kết nối quá lâu. Sửa môi trường rồi tạo trận mới; không tự ghi kết quả cho trận đã hết hạn.
- Sau redeploy mất tài khoản: giới hạn JSON/ổ tạm Render, không phải phân quyền hay worker. Quay lại phần database bền vững khi có thể.

## 12. Rollback

Dừng worker. Thu hồi WORKER_TOKEN trên Render để chặn worker cũ (thay env có thể restart). Khôi phục index-json.js/bot-runner.js từ bản backup source nếu cần quay về bản không hỗ trợ Challenge; giữ nguyên các thay đổi online/offline khác.

Không thay arena.json đang có bằng file rỗng/seed. Code cũ đọc được metadata v1 đã thêm, và backend cũ đánh dấu queued/running là failed khi khởi động. Tuy nhiên rollback/redeploy không bảo toàn ổ tạm Render. Dữ liệu đã mất không phục hồi bằng rollback code.

Tài liệu chính thức đã đối chiếu: https://render.com/docs/free . Render Free không có Shell/persistent disk và có thể mất file khi restart/redeploy/spin-down.
