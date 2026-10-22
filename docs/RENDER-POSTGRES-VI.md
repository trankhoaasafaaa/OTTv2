# OTTv2: chuyển backend JSON sang Render PostgreSQL Free

## 1. Bản source đã kiểm tra và kết quả bàn giao

Nguồn là OTTv2-render-postgres-source.zip bạn gửi (64 file). Không thấy AGENTS.md trong ZIP. Node trên máy bạn v22.22.1, package engines >=20, CommonJS, Prisma/@prisma/client cùng 6.19.3. Giữ nguyên dependency và lockfile.

Render hiện chạy server/index-json.js. server/index-postgres.js cũ chạy Docker trên backend, liệt kê submission theo cơ chế cũ và lưu file local; không đổi sang entry đó. Entry mới là server/index-render-pg.js, giữ API JSON hiện tại và worker protocol /api/worker/poll, heartbeat, result. Worker vẫn ở máy nhóm, frontend Vercel và proxy /api giữ nguyên. Không sửa public, engine, compose hoặc worker trong việc này.

Giữ ba migration có sẵn. Thêm migration thứ tư tạo SubmissionSource (text), MatchReplay (JSONB), WorkerLease và JsonImportReceipt. Accounts/sessions/submissions/matches/settings/audit dùng bảng có cấu trúc hiện có, không nhét database JSON vào một hàng. Giữ nguyên các bảng Tournament/TournamentStaff và quan hệ, không xây thêm tính năng giải.

Giới hạn: source 1–500000 byte UTF-8, không NUL hoặc Unicode lỗi; tối đa 50 submissions/tài khoản; replay tối đa 8 MiB. Challenge vẫn tối đa 200 lượt, một trận worker chạy một lúc; hàng đợi 20 trận, mỗi tài khoản tối đa hai trận chờ/chạy. Không thêm Elo. Tất cả submission của tài khoản khác đang active, có source và không rejected có thể được ghép luyện tập, giống chính sách backend JSON; chưa có opt-in riêng. API tạo demo giữ tương thích nhưng frontend tiếp tục ẩn demo.

Source/replay nằm hoàn toàn trong database; worker chỉ giữ file tạm và dọn sau trận. Render không cần Docker hoặc thư mục bots/replays. API GET /api/submissions/:id/source mới chỉ cho chủ sở hữu; Admin/Judge cũng không được đọc code riêng của người khác qua API này.

## 2. Bảo toàn dữ liệu TRƯỚC KHI deploy

Chưa Save-and-deploy biến môi trường, chưa đổi Start Command và chưa push khi Auto Deploy có thể bật, cho tới khi đã xử lý dữ liệu nguồn.

Sao lưu repo/dữ liệu local bằng subshell để umask không ảnh hưởng các lệnh Docker sau đó:

```bash
cd ~/proj
(
  umask 077
  tar --exclude='OTTv2/node_modules' --exclude='OTTv2/.git' \
    -czf "OTTv2-before-postgres-$(date +%Y%m%d-%H%M%S).tar.gz" OTTv2
)
```

Tar có thể chứa secret và dữ liệu riêng; giữ local, không upload hoặc Git. Bản local không phải snapshot dữ liệu đang chạy trên Render.

Snapshot nhập cần có:

```text
snapshot/
  arena.json
  bots/SUB-XXXXXXXX/<filename>
  replays/M-XXXXXXXX.json
```

Backend cũ không có API xuất đầy đủ password hash + source + session, Render Free không có Shell/SSH. ZIP source bạn gửi không có dữ liệu thật, nên không thể khôi phục tài khoản từ ZIP code. Chỉ dùng snapshot đã lấy được từ trước hoặc bản sao dữ liệu thật đang có. Không deploy endpoint export mới rồi mới sao lưu: lần deploy đó có thể xóa JSON. Những API xem users/matches hiện có không phải full backup.

- Có snapshot đầy đủ: thực hiện nhập ở bước 6 trước deploy.
- Không có snapshot nhưng cần giữ tài khoản hiện tại: DỪNG bước deploy, cần tìm backup trước. Code mới không tự đọc lại dữ liệu Render đã mất.
- Nếu bạn chủ động dùng bộ dữ liệu mới cho tuần thử nghiệm: bỏ qua nhập JSON, tạo Admin bằng CLI và đăng ký/nộp lại bot. Đây là khởi tạo mới, không phải migration dữ liệu cũ.

Không xóa database Render vừa tạo. Tắt Auto Deploy ở backend nếu cần kiểm soát lần chuyển đổi; tài liệu Render cho phép Off. Đừng coi việc tắt Auto Deploy là bảo đảm JSON sống qua các lần restart khác.

## 3. Chép gói thay đổi vào đúng repo

Chép nội dung ottv2-render-postgres-changed-files vào ~/proj/OTTv2, giữ đúng đường dẫn. Không chép vào OTTv2-worker-host: gói này dành cho API trên Render, không cần build lại worker Compose.

Script start mặc định npm start vẫn giữ entry cũ để tránh đổi ngoài ý muốn. Khi deploy dùng entry mới ghi rõ ở bước 8.

Thêm loại trừ secret/backup trên máy local:

```bash
cd ~/proj/OTTv2
cat >> .git/info/exclude <<'EXCLUDE'
/.env.render-pg
/.env.render-restore
/backups/
/snapshot/
EXCLUDE
```

Các mục mới chỉ loại trừ file chưa được Git theo dõi. Kiểm tra git status trước mỗi commit, không dùng git add . hoặc đưa snapshot vào Git.

## 4. Cấu hình kết nối WSL

Bạn đã kiểm tra psql thành công, không cần tạo lại database.

QUYẾT ĐỊNH TLS: dùng External Database URL cho cả API và migration trong gói này. Hướng dẫn trước ưu tiên Internal URL, nhưng Render dùng chứng chỉ tự ký ở kết nối nội bộ. Để giữ xác minh chứng chỉ mà không thiết lập thêm CA/proxy, bản này dùng endpoint public với sslmode=require&sslaccept=strict. Không dùng Internal URL với cấu hình strict này, không dùng accept_invalid_certs để vượt lỗi. Public URL có thể có độ trễ/mức sử dụng mạng cao hơn internal.

Database → Connect → copy External Database URL đầy đủ, không thay hostname bằng IP. Nếu đã giới hạn IP ở database Networking, cần cho phép cả máy WSL và địa chỉ outbound của backend Render kết nối; không tắt external access. Không gửi URL thật vào chat.

```bash
cd ~/proj/OTTv2
cp -n .env.render-pg.example .env.render-pg
chmod 600 .env.render-pg
nano .env.render-pg
```

Trong file:
- DATABASE_URL: dán External URL thật từ Render. Có thể dán URL gốc trước; script sau sẽ thêm query TLS/pool.
- FRONTEND_ORIGIN: URL Vercel production thật, không slash cuối.
- WORKER_TOKEN: giữ đúng khóa worker hiện tại. Nếu .env.worker ở repo chính còn khóa đúng, script tự lấy khi trường này đang là placeholder. Nếu khóa chỉ ở OTTv2-worker-host, copy giá trị riêng qua editor.
- NODE_ENV=production.
- ALLOW_SELF_REGISTER=true hoặc false theo thiết lập hiện tại.

```bash
npm ci --include=dev --ignore-scripts
node scripts/configure-render-pg.cjs
```

Script chuẩn hóa file mà không in secret, không ghi đè .env.worker. Không nâng Prisma khi CLI gợi ý cập nhật.

Biến môi trường shell cũ có thể ưu tiên hơn --env-file. Trong terminal dùng cho migration:

```bash
unset DATABASE_URL NODE_ENV FRONTEND_ORIGIN WORKER_TOKEN ALLOW_SELF_REGISTER
```

Đừng source .env.render-pg như shell. Mọi lệnh dưới đọc file bằng Node --env-file, giữ URL chứa ký tự đặc biệt như dữ liệu.

## 5. Tạo bảng bằng migration

Chạy trên WSL tại repo chính, KHÔNG cần Render Shell/pre-deploy:

```bash
node --env-file=.env.render-pg node_modules/prisma/build/index.js validate
node --env-file=.env.render-pg node_modules/prisma/build/index.js generate
node --env-file=.env.render-pg scripts/render-pg-tools.cjs deploy
node --env-file=.env.render-pg scripts/render-pg-tools.cjs status
```

deploy gọi prisma migrate deploy bằng phiên bản đã khóa, áp dụng đủ lịch sử bốn migration. Chỉ tiếp tục nếu deploy exit 0 và status báo up to date. Không chạy migrate dev/reset, db push --accept-data-loss hoặc seed vào database online.

```bash
node --env-file=.env.render-pg scripts/render-pg-tools.cjs check
```

Ban đầu counts có thể bằng 0 nếu database mới; tls phải true, missingSources và missingReplays phải 0. Nếu chưa deploy schema, app dừng rõ ràng, không quay về JSON.

Nếu migrate deploy lỗi: dừng, giữ nguyên database; lấy lỗi đã che hostname/secret để kiểm tra. Không xóa bảng hoặc sửa migration đã áp dụng. Status có thể trả exit khác 0 khi còn migration pending. migrate resolve chỉ dùng sau khi biết rõ bước nào đã commit, không dùng để bỏ qua lỗi tùy tiện.

## 6. Nhập dữ liệu cũ nếu có snapshot thật

Đặt snapshot tại ~/ottv2-snapshot (ngoài repo, không upload/chat). Giữ bản gốc không sửa.

Kiểm tra file trước, chưa cần kết nối DB:

```bash
node scripts/import-render-json.cjs ~/ottv2-snapshot --check-files
```

Dry-run với DB:

```bash
node --env-file=.env.render-pg scripts/import-render-json.cjs ~/ottv2-snapshot --dry-run
```

Nhập sau khi dry-run không báo xung đột:

```bash
node --env-file=.env.render-pg scripts/import-render-json.cjs ~/ottv2-snapshot --write
```

Chạy lại để kiểm tra idempotency:

```bash
node --env-file=.env.render-pg scripts/import-render-json.cjs ~/ottv2-snapshot --write
node --env-file=.env.render-pg scripts/render-pg-tools.cjs check
```

Lần hai created phải 0, unchanged tăng tương ứng. Đối chiếu users/submissions/matches/audit trong summary với counts DB. Source/Replays có bảng riêng; count source bằng số bài và replay bằng số trận completed trong snapshot.

Importer giữ ID/password hash/ownership; không xóa nguồn, không ghi đè dữ liệu khác, không ghi passwords plaintext. Phát hiện trùng username/email/ID, hash sai, file thiếu, quan hệ sai trước khi nhập. Toàn bộ import nằm trong một transaction; lỗi rollback toàn bộ lần nhập. Sửa/xác minh bản sao nguồn hoặc dùng DB đích đúng, không tự đổi ID cho migration chạy qua.

Session cũ không nhập: yêu cầu mọi người đăng nhập lại. Session mới ở PostgreSQL và có thể thu hồi. Trận queued/running trong snapshot chuyển FAILED với reason json-migration-interrupted, không tự chạy lại. Trận completed giữ replay và kiểm tra hash bytes gốc, sau đó lưu JSONB và hash canonical để thứ tự key của JSONB không làm báo lỗi giả.

Sau import nếu tài khoản đã thay đổi email/role/status hoặc dữ liệu khác, rerun sẽ báo xung đột thay vì ghi đè. Không dùng import như công cụ đồng bộ hai hệ thống đang cùng ghi.

Giới hạn mỗi lần snapshot: metadata 50 MiB, tổng source/replay 64 MiB. File UTF-8 lỗi bị từ chối, không âm thầm thay ký tự. Schema AppSetting chỉ lưu settings; dữ liệu tài khoản/submission/match không gom vào một JSON.

## 7. Tạo Admin có kiểm soát

Chỉ cần nếu chưa nhập Admin từ snapshot hoặc muốn tạo tài khoản quản trị mới bằng công cụ nội bộ. Không có endpoint công khai tạo Admin, không chạy bootstrap mỗi lần backend start.

```bash
read -r -p "Admin username: " OTT_ADMIN_USERNAME
read -r -s -p "Admin password (>=12 ký tự, có chữ và số): " OTT_ADMIN_PASSWORD
printf '\n'
export OTT_ADMIN_USERNAME OTT_ADMIN_PASSWORD
node --env-file=.env.render-pg scripts/render-pg-tools.cjs bootstrap
unset OTT_ADMIN_USERNAME OTT_ADMIN_PASSWORD
```

Username dùng chữ thường/số/_, 2–32 ký tự. Password tối đa 72 byte. Nếu username đã là active Admin, CLI giữ nguyên password/role. Nếu username là Student/Judge hoặc Admin bị khóa, CLI từ chối, không tự nâng quyền hoặc mở khóa. Ghi audit khi tạo mới.

## 8. Chuẩn bị Render và triển khai

Hoàn tất backup/import/check trước lần deploy chuyển đổi. Trong backend Render Environment đặt:

| Biến | Giá trị/thao tác |
|---|---|
| DATABASE_URL | External URL đã chuẩn hóa trong .env.render-pg, có sslmode=require&sslaccept=strict và pool=3 |
| NODE_ENV | production |
| FRONTEND_ORIGIN | Giữ chính xác URL Vercel, không slash cuối |
| WORKER_TOKEN | Giữ khóa đang dùng trên worker |
| ALLOW_SELF_REGISTER | Giữ true/false theo nhu cầu |
| PORT | Render cấp; không đặt cứng |
| CLOUD_DATA_DIR | Bản PG không dùng, có thể bỏ |
| BOOTSTRAP_ADMIN_USERNAME/PASSWORD | Bỏ sau khi đã tạo/nhập Admin; entry mới không tự tạo Admin từ env |
| JWT_SECRET | Entry PG dùng session, không cần; không bỏ nếu service khác còn dùng chung |
| PUBLIC_ORIGIN/OTT_MODE/OTT_DATA_DIR | Không được entry online mới dùng; không sửa file offline local |

Không thêm DATABASE_URL hoặc worker token vào Vercel. Không thay proxy /api. Không copy .env.render-pg vào repo công khai.

Environment có tùy chọn Save only: lưu nhưng chưa deploy. Dùng Save only để chuẩn bị các biến, sau đó đổi Build/Start dưới đây khi code mới đã sẵn sàng. Không chọn Save and deploy khi entry cũ vẫn đang được cấu hình với DATABASE_URL mới.

Đưa đúng file code lên Git. File CHANGED-FILES.txt trong gói liệt kê danh sách. Stage thủ công theo danh sách, kiểm tra git diff --cached --stat và git diff --cached --name-only. Không stage .env, snapshot, backup, node_modules hoặc các thay đổi frontend khác không thuộc việc này.

```bash
git status --short
```

Stage toàn bộ file trong danh sách đã kiểm tra (không gồm secret):

```bash
git add -f .env.render-pg.example
git add --pathspec-from-file=CHANGED-FILES.txt
git diff --cached --stat
git commit -m "Persist online accounts bots and worker results in PostgreSQL"
git push
```

Auto Deploy nên Off trong lúc chuẩn bị. Đổi cấu hình backend:

Build Command:

```text
npm ci --include=dev --ignore-scripts && npm run db:generate
```

Start Command:

```text
node server/index-render-pg.js
```

Health Check Path:

```text
/api/health
```

Giữ một instance. Không đổi sang server/index-postgres.js cũ hoặc npm start. Không chạy seed, migration trong mỗi lần start. Migration đã chạy từ WSL ở bước 5; không mặc định có pre-deploy trên Free. Nếu muốn thêm migration sau này, commit file migration rồi chạy migrate deploy trước khi deploy code cần schema mới.

Chọn Manual Deploy → Deploy latest commit sau khi env/build/start đúng. Save Settings có thể kích hoạt deploy; chỉ thực hiện khi đã hoàn tất mọi bước chuẩn bị dữ liệu.

Nếu vô tình chạy entry JSON trong production với DATABASE_URL đã đặt, guard mới từ chối startup thay vì tạo arena.json rỗng. Không gỡ guard để vượt lỗi; sửa Start Command.

## 9. Xác nhận online và worker

```bash
curl --fail --show-error --max-time 120 https://ottv2-api.onrender.com/api/health
```

Phải có persistence:PostgreSQL. Nếu vẫn JSON file thì Render đang chạy code/entry cũ.

Worker giữ URL và khóa hiện tại; không cần cấp DATABASE_URL cho máy worker. Nếu worker Compose đã smoke thành công:

```bash
cd ~/proj/OTTv2-worker-host
docker compose up -d
docker compose logs --tail=50 -f worker
```

Nếu Compose còn lỗi smoke từ phần trước, xử lý smoke trước, không kết luận database sẽ tự sửa runner. Chỉ chạy một worker. Kiểm tra:

```bash
curl --fail --show-error --max-time 120 https://ottv2-api.onrender.com/api/judge/status
```

Khi worker poll thành công challengeReady:true. Lease và receipt kết quả nằm trong PostgreSQL, không chỉ RAM. Sau API restart worker có thể tiếp tục heartbeat/result trong thời hạn lease; challengeReady chỉ bật lại khi nhận được poll/heartbeat mới. Kết quả lặp đúng digest được chấp nhận idempotent. Kết quả đến muộn sau lease bị từ chối. Không tự chạy lại trận timeout.

Kiểm tra thủ công bằng browser thường + ẩn danh:
1. Đăng ký Student, gửi role ADMIN vẫn chỉ tạo STUDENT.
2. Đăng nhập/đăng xuất, logout rồi không dùng lại session cũ.
3. Hai tài khoản chỉ có danh sách submission riêng; chọn bot A bằng session B bị 404. Đổi userId/ownedBy khi upload không đổi owner.
4. Đổi role/khóa tài khoản bằng Admin yêu cầu tài khoản đó đăng nhập lại hoặc từ chối đăng nhập khi bị khóa. Thu hồi một session làm cookie đó hết hiệu lực.
5. Nộp bot mỗi tài khoản. Vào Đấu bot, Tải lại, chạy thử 20 lượt và xem replay.
6. Nếu có snapshot đã import, login tài khoản cũ bằng mật khẩu cũ, đọc trận/replay đã chuyển.
7. Chạy check trên WSL và ghi lại counts. Restart/redeploy backend sau khi đã chạy trên PG; login lại khi cần và kiểm tra bot/source/replay còn nguyên, chạy check đối chiếu counts.
8. Lỗi kết nối database phải trả 503; không tạo JSON hoặc bộ user mới. Trong môi trường thử riêng có thể dùng URL không kết nối được để kiểm tra startup fail; không phá database đang dùng để test outage.

Bản này không load-test 2000 người và không cam kết gói Free phục vụ giải chính thức. 1 GB dùng chung cho tài khoản, source, replay và index. Theo dõi Metrics và giới hạn dung lượng; không tự xóa replay/user khi đầy.

## 10. Backup sau khi chuyển đổi và trước khi hết hạn

Render Free PostgreSQL không có backup tự động; database hết hạn sau 30 ngày. Không chờ tới lúc database đã inaccessible mới backup.

Trên WSL (Docker đã hoạt động), tại repo chính:

```bash
cd ~/proj/OTTv2
node --env-file=.env.render-pg scripts/backup-render-pg.cjs ~/ottv2-pg-backups
```

Helper chọn image postgres cùng major với server, gọi pg_dump custom format, truyền credentials qua env chứ không command arguments, dùng TLS verify-full và CA hệ thống WSL, tạo dump 0600 trong thư mục riêng. Dump bao gồm accounts/session, source, replay và Prisma migration history. Nếu lỗi, file dở được đánh dấu .incomplete, không coi đó là backup.

Lần đầu Docker có thể tải image pg_dump. Không upload dump lên Git/chat. Giữ ít nhất hai bản ở nơi riêng. Backup helper chưa chạy trên dịch vụ thật trong môi trường tạo gói; phải kiểm tra kết quả và thử restore.

## 11. Thử restore an toàn và rollback

Ví dụ server Render là PostgreSQL 17 (nếu major khác, thay image tương ứng), tạo PostgreSQL LOCAL tạm để thử dump. Không dùng database online làm đích thử:

```bash
docker run -d --name ottv2-restore-check \
  -e POSTGRES_PASSWORD=LocalRestoreTest123 \
  -p 127.0.0.1:55434:5432 \
  postgres:17-bookworm
```

Chờ sẵn sàng bằng `docker exec ottv2-restore-check pg_isready -U postgres`. Sau đó thay đường dẫn dump thật:

```bash
docker exec -i ottv2-restore-check \
  pg_restore -U postgres -d postgres --exit-on-error --no-owner --no-acl \
  < ~/ottv2-pg-backups/THAY_TEN_FILE.dump
```

Kiểm tra:

```bash
docker exec ottv2-restore-check psql -U postgres -d postgres \
  -c 'SELECT count(*) AS users FROM "User";' \
  -c 'SELECT count(*) AS sources FROM "SubmissionSource";' \
  -c 'SELECT count(*) AS replays FROM "MatchReplay";'
```

Đối chiếu counts của bản backup. Sau khi thử xong, có thể dọn đúng container local này bằng docker rm -f ottv2-restore-check. Đó không phải container worker hoặc database Render.

Rollback code sau chuyển đổi phải dùng bản backend tương thích PostgreSQL và cùng schema, hoặc sửa tiến lên từ entry mới. Giữ DATABASE_URL và các bảng/source/replay, không chạy seed/reset. Không dùng JSON đã mất làm phương án rollback. Không chạy server/index-postgres.js cũ nếu chưa bổ sung source/replay trong DB và external worker. Nếu cần phục hồi dữ liệu, kiểm chứng dump vào database đích riêng trước; không restore đè database đang dùng hoặc xóa nó để thử. Free chỉ cho một database service hoạt động mỗi workspace nên không mặc định có thể tạo thêm một service Free song song.

## 12. Giới hạn kiểm thử và nguồn chính thức

Xem RENDER-POSTGRES-VERIFICATION.md để phân biệt đã chạy và chưa chạy. Chưa push/deploy, chưa truy cập database thật của bạn, không yêu cầu bạn gửi secret.

- https://render.com/docs/postgresql-creating-connecting
- https://render.com/docs/free
- https://render.com/docs/configure-environment-variables
- https://www.prisma.io/docs/orm/v6/overview/databases/postgresql
- https://www.prisma.io/docs/orm/v6/reference/prisma-cli-reference
