# Sửa mất leaderboard và tournament — OTTv2

Gói dành cho main `5546be502c7145e9e72c93a0bb8647e3f1ed39b2` (24/10/2026). Không đổi frontend, backend entry point, cookie hay worker token. Không deploy trước khi xuất dữ liệu còn tồn tại.

## 1. Clone riêng, giữ nguyên thư mục đang làm

Chạy trong WSL. Nếu thư mục đích đã tồn tại, chọn một tên mới; không xóa thư mục cũ.

```bash
cd ~/proj
git clone https://github.com/trankhoaasafaaa/OTTv2.git OTTv2-pg-durable
cd ~/proj/OTTv2-pg-durable
git switch main
git pull --ff-only origin main
git rev-parse HEAD
git switch -c fix/postgres-tournaments-elo
```

Nếu HEAD khác commit phía trên, GitHub đã có cập nhật: so sánh các file trong gói với cập nhật mới trước khi chép đè, đặc biệt schema và entry point. Không force push hoặc reset main.

Tải ZIP, giải nén vào một thư mục riêng. Trong đó `changed-files/` chứa đúng đường dẫn repo. Chép **nội dung** thư mục đó vào repo: ví dụ `changed-files/server/durable/postgres.js` thành `~/proj/OTTv2-pg-durable/server/durable/postgres.js`. Không chép toàn bộ ZIP thành thư mục con của repo.

Ví dụ đặt bản giải nén tại `~/Downloads/ottv2-persistence-fix`:

```bash
cd ~/proj/OTTv2-pg-durable
cp -a ~/Downloads/ottv2-persistence-fix/changed-files/. ./
npm ci --include=dev --ignore-scripts
```

## 2. Sao lưu TRƯỚC redeploy

Nhờ nhóm tạm ngừng upload, tạo trận và sửa giải trong lúc chuyển dữ liệu. Giữ backend cũ đang chạy để xuất qua các API sẵn có; không suspend/restart/deploy nó trước khi xuất.

```bash
cd ~/proj/OTTv2-pg-durable
node scripts/export-online-state.cjs https://ottv2-api.onrender.com "$HOME/ottv2-state-before-pg"
cat ~/ottv2-state-before-pg/export-report.json
```

Thư mục xuất phải chưa tồn tại; chạy lại dùng tên mới. Kết quả gồm ratings.json, tournaments.json và replays/*.json. Chỉ dùng endpoint có sẵn, không cần Shell của Render hoặc deploy endpoint export. Script báo thiếu replay thì dừng để kiểm tra; dữ liệu đã tải vẫn được giữ.

Nếu danh sách hiện tại trống/điểm đã về 1200 thì bản export cũng chỉ chứa trạng thái đó. JSON cũ đã mất mà không có backup không thể được script này khôi phục. Không có dữ liệu giả hoặc tự tái dựng Elo từ lịch sử trong gói này.

Tạo `.env.render-pg` riêng trong repo mới. Có thể chép file đã dùng trước đây nếu đúng database:

```bash
cp ~/proj/OTTv2/.env.render-pg .env.render-pg
chmod 600 .env.render-pg
git check-ignore .env.render-pg
```

Nếu chưa có, tạo bằng `nano .env.render-pg`, điền trực tiếp trên máy:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@EXTERNAL_HOST:5432/DATABASE?sslmode=require&sslaccept=strict&connection_limit=3&connect_timeout=10&pool_timeout=10&socket_timeout=20"
NODE_ENV=production
```

Dùng External Database URL mà WSL truy cập được, giữ mật khẩu URL-encoded. Nếu URL đã có `?`, nối tham số bằng `&`. Không gửi URL thật lên chat/GitHub. Không thay bằng database trống khác.

```bash
node --env-file=.env.render-pg scripts/render-pg-tools.cjs status
npm run db:generate
node --env-file=.env.render-pg scripts/backup-render-pg.cjs "$HOME/ottv2-pg-backup-before-fix"
```

Backup dùng Docker và pg_dump cùng major với database; Docker phải đang chạy. Giữ file `.dump` bên ngoài repo, không commit snapshot hay backup. Lệnh backup không thay đổi database. Backup thất bại thì xử lý trước khi tiếp tục; không dùng file `.incomplete` làm backup hợp lệ. Bản dump giữ tài khoản, bot, phiên và dữ liệu PostgreSQL hiện có; snapshot API giữ phần JSON còn tồn tại.

## 3. Tạo bảng mới, không reset database

```bash
node --env-file=.env.render-pg scripts/render-pg-tools.cjs deploy
node --env-file=.env.render-pg scripts/render-pg-tools.cjs status
node --env-file=.env.render-pg scripts/render-pg-tools.cjs check
```

Lệnh deploy gọi `prisma migrate deploy`. Có migration thứ 5 `20261024000100_durable_tournaments_ratings`. Migration bổ sung bảng/cột, không xóa tài khoản/bot. Không dùng migrate dev/reset hoặc db push trên production. Không chạy seed. Bước này chạy từ WSL; không cần Render Shell/pre-deploy command.

## 4. Nhập snapshot — kiểm tra trước, ghi sau

```bash
node --env-file=.env.render-pg scripts/import-durable-state.cjs "$HOME/ottv2-state-before-pg"
```

Mặc định dry-run: kiểm tra cả constraint trong transaction rồi rollback, không lưu dữ liệu. Nếu kết quả phù hợp số giải và bot bạn thấy lúc xuất:

```bash
node --env-file=.env.render-pg scripts/import-durable-state.cjs "$HOME/ottv2-state-before-pg" --write
node --env-file=.env.render-pg scripts/import-durable-state.cjs "$HOME/ottv2-state-before-pg" --write
node --env-file=.env.render-pg scripts/render-pg-tools.cjs check
```

Lần chạy thứ hai phải báo `alreadyImported: true`. File nguồn không bị xóa hoặc sửa. Import giữ ID, kiểm tra chủ sở hữu và không ghi đè rating/giải đã tồn tại. Snapshot khác sau lần nhập thành công sẽ bị từ chối. Nếu chỉ thấy lỗi/transaction thất bại, sửa nguyên nhân và chạy lại cùng snapshot; không tự xóa bảng hay import receipt.

Thiếu submission/user: cần khôi phục đúng tài khoản/bot từ backup trước, không đổi ID tùy tiện. Rating đã tồn tại: dừng để đối chiếu dữ liệu PostgreSQL và snapshot; script cố ý không ghi đè. Nếu replay thực sự đã mất và chấp nhận chỉ giữ metadata, có thể thêm `--allow-missing-replays` cho CẢ dry-run và --write; báo cáo liệt kê replay thiếu, không tạo replay giả. Trận đang RUNNING được chuyển QUEUED để tránh treo vĩnh viễn.

Nếu không còn snapshot cũ, export trạng thái hiện tại vẫn nhập được nếu hợp lệ. Giải đã biến mất không tự xuất hiện lại. Các tài khoản/phiên/bot PostgreSQL không cần nhập lại.

## 5. Kiểm tra code và push nhánh sửa

```bash
node --check server/index-render-pg.js
node --check server/durable/postgres.js
node --check scripts/import-durable-state.cjs
node --test tests/frontend.test.js tests/render-pg-unit.test.js tests/tournaments.test.js
git diff --check
git diff --stat
git status --short
```

Không commit .env, snapshot, node_modules hoặc dump. Chỉ thêm các file sửa:

```bash
git add prisma/schema.prisma prisma/migrations/20261024000100_durable_tournaments_ratings
git add server/durable server/elo-service.js server/index-render-pg.js server/online-pg/worker.js
git add server/tournaments/tournament-service.js server/tournaments/tournament-routes.js
git add scripts/render-pg-tools.cjs scripts/export-online-state.cjs scripts/import-durable-state.cjs scripts/assign-tournament-judge.cjs
git add tests/durable-storage.test.js docs/FIX-PERSISTENCE-VI.md
git diff --cached --stat
git commit -m "Persist tournament state and Elo in PostgreSQL"
git push -u origin fix/postgres-tournaments-elo
```

Mở GitHub → Compare & pull request → base main → kiểm tra diff → merge khi migration và import đã thành công. Nếu nhánh tên này đã tồn tại, chọn tên nhánh mới ở bước 1. Push bị rejected thì fetch/kiểm tra thay đổi nhóm; không dùng --force. Dùng PR giúp tránh đè main và không đụng thư mục worker riêng.

## 6. Deploy Render, giữ frontend và worker

Backend Render vẫn nối đúng database cũ. Giữ DATABASE_URL, FRONTEND_ORIGIN, WORKER_TOKEN, ALLOW_SELF_REGISTER và các biến session/cookie hiện có. Không đổi token để sửa persistence; không đưa secret xuống Vercel. Không cần biến môi trường mới.

| Render | Giá trị |
| --- | --- |
| Branch | main |
| Build Command | `npm ci --include=dev --ignore-scripts && npm run db:generate` |
| Start Command | `node scripts/check-render-env.cjs && node server/index-render-pg.js` |
| Health Check Path | `/api/health` |

Sau khi merge, đợi auto deploy hoặc Manual Deploy → Deploy latest commit. Xác nhận log checkout đúng commit vừa merge. Không thay entry point bằng index-json.js/index-postgres.js. Backend mới sẽ báo lỗi nếu thiếu migration hoặc mất DB; không tự rơi về JSON. Vercel không cần đổi proxy, layout hoặc build.

```bash
curl --fail --show-error --max-time 120 https://ottv2-api.onrender.com/api/health
curl --fail --show-error --max-time 120 https://ottv2-api.onrender.com/api/leaderboard
curl --fail --show-error --max-time 120 https://ottv2-api.onrender.com/api/tournaments
```

Health phải có `leaderboardPersistence: "PostgreSQL"` và `tournamentPersistence: "PostgreSQL"`. Chụp/lưu số điểm, số trận và giải trước khi thử redeploy lần nữa.

## 7. Kiểm tra trên dịch vụ thật

1. Đăng nhập tài khoản cũ; bot vẫn thuộc đúng tài khoản. Kiểm tra đăng ký mặc định STUDENT, logout/thu hồi phiên và khóa tài khoản như trước.
2. Admin tạo giải thử, mở đăng ký; hai Student đăng ký bot của chính mình. Gửi ID bot tài khoản kia phải bị từ chối.
3. Duyệt đăng ký, khóa bot, tạo lịch. Đóng/mở trang: giải và lịch vẫn còn. Kiểm tra giải nhập và replay cũ nếu có.
4. Chạy một trận Challenge qua external worker, đợi kết quả; Elo/số trận thay đổi đúng. Không dùng tournament để kết luận bot thật đã thi đấu: xem giới hạn bên dưới.
5. Ghi lại leaderboard và tournament; Manual Deploy cùng commit một lần nữa. Kiểm tra tài khoản, bot, điểm, lịch và replay vẫn giữ nguyên. Chạy lại `render-pg-tools.cjs check` để đối chiếu số dòng trước/sau.
6. Mất DB: trên bản local/disposable, dùng URL sai tạm thời để kiểm tra lỗi; không ngắt DB thật đang dùng để thử. API không được trả bộ dữ liệu rỗng thay thế.

Judge giờ phải có TournamentStaff. Admin vẫn có quyền toàn hệ thống. Phân công qua CLI nội bộ (không đổi role/mật khẩu):

```bash
node --env-file=.env.render-pg scripts/assign-tournament-judge.cjs TOUR_ID judge_username
```

Thay TOUR_ID bằng ID giải thật. User phải là JUDGE đang hoạt động. CLI ghi audit và chạy lại không tạo trùng. Judge chưa được phân công nhận403; Admin tạo giải rồi phân công Judge.

## Kiến trúc, giới hạn và rollback

Online dùng các bảng Tournament/Entry/Round/Game/GameReplay/Standing/Log, PracticeRating và DurableRatingReceipt. JSONB chỉ lưu chi tiết từng thực thể/replay; không nhét cả database vào một hàng. Elo và hoàn tất trận worker được ghi cùng transaction, receipt ngăn cộng lại cùng match ID. Replay giải tối đa8MiB theo giới hạn payload hiện tại. Dữ liệu offline ở entry point khác vẫn có thể dùng JSON; không phải fallback của backend online.

Quan trọng: source gốc chạy trận tournament bằng engine bot mẫu greedy/random khi không truyền executeRunner. Gói này bảo toàn luồng đó, CHƯA nối tournament vào hàng đợi external worker chạy mã bot sinh viên. Challenge của Student vẫn dùng external worker như hiện tại. Không dùng kết quả bot mẫu để tổ chức cuộc thi chính thức. Việc chạy lại/phán quyết cùng match ID không cộng Elo lần hai; chưa triển khai đảo Elo hoặc tính lại Elo sau sửa kết quả.

Bản sửa dùng transaction + khóa tuần tự, tải snapshot các thực thể để giữ thuật toán cũ. Phù hợp bản thử nhỏ; chưa kiểm chứng2000 sinh viên. Khối lượng giải/replay lớn cần chuyển từng thao tác sang truy vấn cục bộ và tách job runner trước khi mở rộng. Không có nâng major dependency hay thay frontend trong gói.

Rollback: không quay lại backend JSON để tiếp tục nhận ghi. Nếu deploy lỗi, dừng thao tác quản trị, giữ nguyên DB, đọc lỗi và sửa tiến trên nhánh này; schema bổ sung vẫn giữ dữ liệu cũ. Có thể deploy lại một commit PostgreSQL đã sửa tương thích với schema mới. Trường hợp phải phục hồi, restore dump vào database RIÊNG, kiểm tra dữ liệu rồi quyết định cutover; dump trước migration không có thay đổi phát sinh sau đó. Không restore đè production một cách tự động, không xóa migration đã áp dụng. Backend cũ dùng JSON sẽ không nhìn thấy giải/Elo mới, nên không phải rollback tương thích.

Đã kiểm thử:24 test frontend/unit/tournament có sẵn;1 integration test với PostgreSQL nhúng (PGlite) bao gồm migration SQL, lưu giải/replay/Elo, quyền sở hữu, Judge chưa phân công, chống cộng lặp, rollback, tạo client mới đọc lại, import dry-run/chạy lại và lỗi DB. Chưa chạy migrate deploy hoặc kiểm tra redeploy trên Render thật; các bước trên dành cho bạn thực hiện. Integration test tùy chọn chỉ nhận TEST_DATABASE_URL của database local dùng thử, tạo/xóa schema riêng; không dùng URL production. Không chạy test này rồi hiểu rằng nó đã kiểm tra Render thật.
