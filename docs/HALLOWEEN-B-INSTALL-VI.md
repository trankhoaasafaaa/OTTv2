# Cập nhật Halloween B — Ma nhỏ

Baseline: main `8bf176625b6d5d2181b114266d3d7cf57f68163d`, sau PR #16 sửa PostgreSQL. Gói chỉ thay public/ và hướng dẫn này; không sửa backend, schema, Prisma, worker hoặc API. Không mang app.js/api.js/dữ liệu giả lập từ ZIP preview cũ vào dự án.

## Phạm vi

- Dùng lại artwork Ma nhỏ B đã chọn, theme tím/cam, light/dark, nút và font từ preview B. Giữ cấu trúc trang, vị trí chức năng và điều khiển replay.
- Kéo/búa/bao trên bàn đổi hình, vẫn có màu đội vàng/xanh và nhãn R/P/S. Luật và nước đi không đổi.
- Chọn 6 nhân vật, 4 màu nền trong menu tài khoản hoặc trang Tài khoản & phiên đăng nhập. Có Lưu/Hủy và Escape. Chỉ tài khoản đã đăng nhập mở được.
- Nhân vật lưu riêng theo ID tài khoản trong localStorage trên trình duyệt hiện tại. Không lưu vào PostgreSQL, chưa đồng bộ thiết bị, không công khai nhân vật cho người chơi khác. Xóa dữ liệu trình duyệt sẽ mất lựa chọn. Đây là giới hạn có chủ ý để không thay backend. Không lưu token, mật khẩu, bot, giải hay Elo trong phần cosmetics.

## 1. Lấy main mới trong thư mục riêng

Chạy WSL; chọn tên thư mục mới nếu tên này đã tồn tại. Không xóa thư mục làm việc cũ.

```bash
cd ~/proj
git clone https://github.com/trankhoaasafaaa/OTTv2.git OTTv2-halloween-b
cd ~/proj/OTTv2-halloween-b
git switch main
git pull --ff-only origin main
git rev-parse HEAD
git switch -c feat/halloween-little-ghost-b
```

Nếu HEAD khác baseline phía trên, có commit mới của nhóm. Đối chiếu public/app.js và public/index.html trước khi chép đè. Bản app.js trong gói là file đầy đủ từ baseline + một dòng render hình; không nên chép nó đè các sửa frontend mới mà chưa so sánh.

## 2. Giải nén gói và chép file

Giải nén ottv2-halloween-B-changed-files.zip ra thư mục riêng. Bên trong changed-files/ là đúng đường dẫn repo.

Ví dụ bạn giải nén vào ~/Downloads/ottv2-halloween-B:

```bash
cd ~/proj/OTTv2-halloween-b
cp -a ~/Downloads/ottv2-halloween-B/changed-files/. ./
```

Đích đúng: public/halloween-skin.css nằm ngay trong repo, không phải repo/changed-files/public/.

Nếu ZIP nằm trong thư mục Downloads của Windows, dùng đường dẫn /mnt/c/Users/TEN_WINDOWS/Downloads/... tương ứng hoặc kéo bản giải nén sang WSL trước. Không dùng ZIP preview cũ để thay app.js/api.js: preview có API giả.

## 3. Kiểm tra trước khi push

Không cần cài database để kiểm tra các file frontend này.

```bash
cd ~/proj/OTTv2-halloween-b
node --check public/app.js
node --check public/halloween-characters.js
node --test tests/frontend.test.js
git diff --check
git diff --stat
git status --short
git diff -- public/app.js
```

Diff app.js chỉ thêm một dòng ở đầu pieceSVG để render ảnh Ma nhỏ. api.js, server/, prisma/ và worker/ không được thay đổi trong gói.

Có thể xem giao diện tĩnh bằng:

```bash
python3 -m http.server 8080 --directory public
```

Mở http://localhost:8080. API trên server tĩnh sẽ không hoạt động, nên không dùng cách này để kết luận đăng nhập/Challenge lỗi. Muốn kiểm tra kết nối thật, dùng Vercel Preview ở bước 5; không cấu hình lại database chỉ để xem theme.

## 4. Commit và push nhánh

```bash
git add public/index.html public/app.js
git add public/halloween-skin.css public/little-ghost.css
git add public/halloween-characters.css public/halloween-characters.js
git add public/assets/halloween public/assets/fonts
git add docs/HALLOWEEN-B-INSTALL-VI.md
git diff --cached --stat
git commit -m "Apply Halloween B theme and browser-local account characters"
git push -u origin feat/halloween-little-ghost-b
```

Không git add .env hay backup. Không force push. Không thay Start Command Render. Không chạy migrate/seed. Không chép file vào thư mục worker-host.

## 5. Xem Vercel Preview rồi merge

1. GitHub → Compare & pull request → base main, compare feat/halloween-little-ghost-b.
2. Đợi Vercel Preview deployment; mở URL deployment được Vercel tạo. Giữ Root Directory/proxy/build đang hoạt động của project, không tự chuyển sang React hay sửa proxy.
3. Kiểm tra theme và layout trên desktop/mobile. Preview origin khác production có thể bị backend từ chối Origin/CSRF khi đăng nhập hoặc ghi dữ liệu. Không nới Origin thành wildcard để thử; việc này không đồng nghĩa CSS hỏng. Kiểm tra đầy đủ với backend staging cho phép đúng preview origin hoặc trên production sau merge.
4. Khi chấp nhận giao diện, merge PR vào main. Vercel triển khai production như hiện tại. Nếu không có auto deployment, vào project Vercel và deploy commit vừa merge theo cấu hình cũ.
5. Mở trang production bằng Ctrl+Shift+R. Kiểm tra Network: halloween-skin.css, little-ghost.css, halloween-characters.js và ảnh ghost-*.png phải trả200. Không thêm DATABASE_URL vào Vercel.

Render có thể tự deploy khi main đổi dù chỉ sửa frontend; dữ liệu leaderboard/tournament đã chuyển PostgreSQL nên vẫn phải còn nguyên. Không cần đổi biến môi trường, script database hoặc cấu hình worker.

## 6. Checklist sau deploy

- Light/dark: chữ rõ, nút đủ tương phản, input và thông báo đọc được.
- Trang chủ/Đấu bot/Bot của tôi/Leaderboard/Tournament/Arena: cùng bố cục cũ; Challenge vẫn dành cho Student.
- Replay: Ma nhỏ R/P/S đúng loại, vàng/xanh rõ, không tự cuộn trang theo nước đi.
- Đăng nhập → menu tài khoản → Chọn nhân vật → Lưu. Reload: giữ lựa chọn trên trình duyệt đó.
- Đổi nhân vật rồi Hủy/Escape: không thay lựa chọn đã lưu.
- Đăng xuất: không còn nút chọn nhân vật. Đăng nhập tài khoản khác: không nhận lựa chọn của tài khoản cũ.
- Bàn phím Tab/Enter/Escape; cửa sổ chọn trả focus sau khi đóng.
- Kiểm tra điện thoại320–390px: modal cuộn được, menu/board không bị che.
- Tài khoản, bot, giải và điểm vẫn đọc qua API thật. Không có toolbar preview, tài khoản giả hoặc kết quả trận mẫu do gói này thêm.

## Rollback theme

Gói không thay database. Nếu cần trở về giao diện trước, revert commit frontend trên GitHub hoặc bằng git revert COMMIT_FRONTEND rồi push một nhánh/PR mới. Nếu rollback một merge commit, dùng nút Revert của PR để tránh chọn nhầm parent. Không revert PR sửa PostgreSQL. Dữ liệu và lựa chọn local cosmetics không bị dùng để sửa account/điểm.

## Kiểm thử đã thực hiện

14 test frontend hiện có qua, JavaScript syntax và git diff --check qua. Kiểm tra DOM bằng jsdom: Lưu/Hủy, tách hai tài khoản, render lại, guest/logout gating, các trang, light mode và markup quân B qua. Không thêm jsdom vào dependencies của dự án. Chưa kiểm tra hình học/motion trong browser thật, chưa push GitHub hoặc deploy Vercel thay bạn; checklist trên cần được thực hiện trên web thật.
