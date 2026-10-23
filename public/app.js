/* OTT Arena • Tactile Fantasy Card Game / Storybook UI Edition (v3.1) */
const ICONS={overview:'▦',arena:'⚔',submit:'⇧',leaderboard:'▥',tournaments:'♜',admin:'⚙',play:'⚔',history:'◷'};
const saved=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};

const I18N={
  vi:{
    brandSub:'Nền tảng Đấu Bot',navGroupArena:'SÀN ĐẤU · ARENA',navGroupWorkspace:'QUẢN LÝ · WORKSPACE',
    navOverview:'Tổng quan',navPlay:'Đấu bot',navArena:'Sàn đấu chính',navLeaderboard:'Bảng xếp hạng',navTournaments:'Giải đấu',navSubmit:'Bot của tôi',navAdmin:'Quản lý giải',crumbPlatform:'Nền tảng',
    engineStatus:'Engine v2.0 • 8×8',toggleTheme:'Chuyển giao diện',toggleLang:'Chuyển đổi ngôn ngữ (VI / EN)',signIn:'Đăng nhập',signOut:'Đăng xuất',guest:'Khách',signedIn:'Đã đăng nhập',guestHint:'Đăng nhập để quản lý bot',guestFightHint:'Đăng nhập để thi đấu',footer:'OTTARENA · Nền tảng Đấu Bot Chiến Thuật • Engine v2.0',dataError:'Chưa tải được dữ liệu mới. Vui lòng thử lại sau ít phút.',retry:'Thử lại',
    heroEyebrow:'ĐẤU TRƯỜNG BOT BATTLE',heroTitle1:'Lập trình chiến thuật.',heroTitle2:'Làm chủ sàn đấu.',heroDesc:'Tải bot lên, tham gia xếp hạng ELO và theo dõi kết quả các trận đấu của cộng đồng. Sàn đấu thuộc về bạn.',heroPlay:'Đấu thử ngay (Sandbox)',heroUpload:'Tải lên Bot',miniArenaTitle:'SÀN ĐẤU CHIẾN THUẬT 8×8',
    statYourBots:'Bot của bạn',statYourBotsFoot:'Các phiên bản đã nộp',statRankedBots:'Bot được xếp hạng',statRankedBotsFoot:'Trong bảng xếp hạng hiện tại',statMatches:'Trận đã ghi nhận',statMatchesFoot:'Trong danh sách trận hiện tại',statCompleted:'Trận hoàn tất',statCompletedFoot:'Có kết quả được ghi nhận',
    card1BackTitle:'QUẢN LÝ BÀI NỘP',card1BackDesc:'Xem, kiểm tra mã nguồn và quản lý các phiên bản bot bạn đã nộp lên nền tảng.',card1BackBtn:'QUẢN LÝ BOT',
    card2BackTitle:'BẢNG XẾP HẠNG ELO',card2BackDesc:'Thứ hạng được tính toán và cập nhật tự động sau mỗi ván đấu chiến thuật.',card2BackBtn:'XEM BẢNG XẾP HẠNG',
    card3BackTitle:'SÀN ĐẤU CHÍNH',card3BackDesc:'Theo dõi toàn bộ các trận đấu đối kháng Rock-Paper-Scissors 8x8 trực tiếp.',card3BackBtn:'VÀO SÀN ĐẤU',
    card4BackTitle:'LỊCH SỬ & REPLAY',card4BackDesc:'Xem lại từng nước đi, lượt bắt quân và kết quả chung cuộc của các trận đấu.',card4BackBtn:'XEM LỊCH SỬ',
    flipHint:'↻ Chạm/Hover lật thẻ',
    dividerStats:'THÔNG SỐ & TIẾN TRÌNH THI ĐẤU',dividerActivity:'SÀN ĐẤU & HOẠT ĐỘNG GẦN ĐÂY',
    badgeYourBots:'KHO BOT',badgeRanked:'BẢNG ĐẤU',badgeMatches:'ĐỐI ĐẦU',badgeCompleted:'KẾT QUẢ',
    fanRockTitle:'BÚA ✊',fanRockWin:'THẮNG KÉO',fanRockDesc:'Khắc chế Kéo • Thua Bao',
    fanPaperTitle:'BAO 🖐️',fanPaperWin:'THẮNG BÚA',fanPaperDesc:'Khắc chế Búa • Thua Kéo',
    fanArenaTitle:'SÀN ĐẤU ⚔️',fanArenaBadge:'8×8 ARENA',fanArenaDesc:'Mục tiêu: Ô h8 / a1',
    fanScissorsTitle:'KÉO ✌️',fanScissorsWin:'THẮNG BAO',fanScissorsDesc:'Khắc chế Bao • Thua Búa',
    fanChampionTitle:'QUÁN QUÂN 🏆',fanChampionBadge:'TOP ELO',fanChampionDesc:'Dẫn đầu Bảng xếp hạng',
    liveMatchLabel:'Trận gần nhất:',turnsLabel:'Lượt:',
    coreRulesLabel:'⚡ Quy tắc cốt lõi: BÚA thắng KÉO · KÉO thắng BAO · BAO thắng BÚA. Vàng về ô h8, Xanh về ô a1 hoặc diệt hết đối phương để thắng.',
    enterArenaReplayBtn:'VÀO SÀN ĐẤU XEM REPLAY',watchBtn:'Xem',
    quickStartTitle:'Hướng dẫn nhanh',quickStartChip:'BẮT ĐẦU NHANH',step1Title:'Viết thuật toán Bot',step1Desc:'Lập trình bot bằng Python, Java hoặc C theo luật chơi OTT 8×8 Rock-Paper-Scissors. Tham khảo <button type="button" class="api-doc-inline-btn" onclick="openApiDocsModal(event)">tài liệu API</button> để hiểu cấu trúc di chuyển.',apiDocsEyebrow:'HƯỚNG DẪN LẬP TRÌNH',apiDocsTitle:'Quy chuẩn Lập trình & Nộp Bot Thi đấu',apiDocsTabRules:'Quy chuẩn I/O & Luật',apiDocsTabPython:'Code mẫu Python',apiDocsTabJava:'Code mẫu Java',apiDocsTabC:'Code mẫu C / C++',step2Title:'Tải code lên hệ thống',step2Desc:'Tải file mã nguồn (.py, .java, .c) lên nền tảng. Bot sẽ được lưu vào thư viện và sẵn sàng cho bước tiếp theo.',step3Title:'Tham gia xếp hạng ELO',step3Desc:'Vào khu vực Đấu bot, chọn bot của bạn và gửi yêu cầu ghép trận. Hệ thống tự động tìm đối thủ và cập nhật điểm ELO sau mỗi trận.',
    recentTitle:'Lịch sử đấu gần đây',viewAll:'Xem tất cả →',turnsUnit:'lượt',matchCompleted:'Hoàn tất',matchPending:'Đang diễn ra',replayTitle:'Xem lại trận',noMatches:'Chưa có trận đấu',noMatchesDesc:'Các trận sẽ xuất hiện tại đây sau khi hoàn tất.',findMatchNow:'Tìm trận ngay',
    leaderboardTitle:'Top Bot dẫn đầu',fullBoard:'Bảng đầy đủ →',noRankData:'Chưa có dữ liệu xếp hạng.',
    subHeroEyebrow:'KHU VỰC LẬP TRÌNH',subHeroTitle:'Bot của tôi',subHeroDesc:'Quản lý các phiên bản bot thuộc tài khoản của bạn.',subUploadBtn:'Tải lên bot',subLibraryChip:'KHO BOT',subLibraryTitle:'Danh sách bot của bạn',subLibraryDesc:'Chấp nhận một file .py, .java hoặc .c · Tối đa 500 KB',subHistory:'Lịch sử bài nộp',thSubId:'Mã bài nộp',thSource:'File nguồn',thLang:'Ngôn ngữ',thDate:'Thời gian nộp',thVersion:'Phiên bản',thStatus:'Trạng thái',noSubmissions:'Chưa có bài nộp. Đăng nhập và tải bot lên để bắt đầu.',subBox1Title:'Nộp bot',subBox1Desc:'Chọn ngôn ngữ, phiên bản và file mã nguồn. Sau khi tải lên thành công, bot sẽ xuất hiện trong lịch sử bài nộp của bạn.',subBox1Notice:'Bot đã lưu chưa đồng nghĩa với đã được kiểm tra hoặc sẵn sàng thi đấu.',subBox2Title:'Thi đấu',subBox2Desc:'Chọn bot của bạn và tìm đối thủ tại khu vực Đấu bot.',goToPlay:'Đến Đấu bot',statusStoredWaiting:'Đã lưu · Chờ thi đấu',statusStored:'Đã lưu',statusActive:'Đang hoạt động',
    lbHeroEyebrow:'XẾP HẠNG THI ĐẤU',lbHeroTitle:'Bảng xếp hạng',lbHeroDesc:'Thứ hạng được cập nhật tự động sau mỗi trận đấu tính điểm ELO.',lbStatRanked:'Bot được xếp hạng',lbStatRankedFoot:'Trong bảng xếp hạng hiện tại',lbStatTopElo:'Điểm cao nhất',lbStatLangs:'Ngôn ngữ',lbStatLangsFoot:'Có bot được xếp hạng',searchPlaceholder:'Tìm kiếm bot thi đấu...',allLangs:'Tất cả ngôn ngữ',thRank:'Thứ hạng',thCompetitor:'Đội thi / Bot',thElo:'Điểm ELO',thChange:'Biến động',noMatchingBots:'Chưa có bot phù hợp để hiển thị.',
    playHeroEyebrow:'THI ĐẤU',playHeroTitle:'Đấu bot',playHeroDesc:'Chọn bot của bạn, tìm đối thủ và theo dõi kết quả.',loginToPlay:'Đăng nhập để đấu bot',loginToPlayDesc:'Chọn bot thuộc tài khoản của bạn để tìm đối thủ.',challengeArenaTitle:'⚔ Đấu trường Thách đấu',challengeArenaDesc:'Chọn bot của bạn để tham gia trận đấu với bot khác.',myBotLabel:'Bot của tôi',opponentLabel:'Đối thủ',opponentAutoVal:'Hệ thống tự động ghép đối thủ',maxMovesLabel:'Giới hạn lượt',findMatch:'Tìm trận',findingMatch:'Đang tìm trận…',contestClosed:'Thi đấu chưa mở',uploadNewBot:'Upload bot mới',reload:'Tải lại',needBotFirst:'Bạn cần tải lên ít nhất một bot trước khi tìm trận.',challengeNotice:'Chọn bot của bạn để gửi yêu cầu tìm đối thủ. Kết quả ghép trận do hệ thống quyết định.',noBotAvailable:'Chưa có bot',
    arenaHeroEyebrow:'TRẬN ĐẤU · KÉO BÚA BAO',arenaHeroDesc:'Xem lại diễn biến và kết quả của trận đấu đã ghi nhận.',replayBtn:'Xem lại',noReplay:'Chưa có replay',noReplayDesc:'Replay sẽ xuất hiện sau khi có trận đấu hoàn tất.',replayNotLoaded:'Replay chưa được tải',replayNotLoadedDesc:'Chọn tải lại để xem diễn biến trận đấu.',loadReplay:'Tải replay',matchReplayChip:'XEM LẠI TRẬN',subChipRPS:'OTT Kéo–Búa–Bao · 8×8',goldPlayer:'🟡 Vàng',bluePlayer:'🔵 Xanh',goldGoalDesc:'🟡 Vàng đến ô → h8',blueGoalDesc:'🔵 Xanh đến ô → a1',turnActive:'Đến lượt',turnWaiting:'Đang đợi',turnWord:'Lượt',readyToStart:'Sẵn sàng bắt đầu',rulesTitle:'Luật chơi OTT',rulesRPS:'BÚA thắng KÉO · KÉO thắng BAO · BAO thắng BÚA',rulesBody1:'Mỗi quân cờ di chuyển 1 ô theo chiều ngang, dọc hoặc chéo. Bạn chỉ có thể bắt quân đối phương nếu quân của bạn thắng loại quân đó theo luật Oẳn Tù Tì. Không thể bắt quân cùng phe hoặc quân cùng loại.',rulesBody2:'Phe Vàng thắng khi đưa quân về ô h8, phe Xanh thắng khi đưa quân về ô a1, hoặc khi tiêu diệt toàn bộ quân cờ của đối phương.',rulesBody3:'Các quân cờ được sắp xếp đối xứng qua đường chéo chính, mỗi bên 6 quân mặc định.',matchInfoTitle:'Thông tin trận',gameLabel:'Thể thức',limitLabel:'Giới hạn',turnsPlayedLabel:'Số lượt đã đấu',matchResultLabel:'Kết quả trận',inProgressVal:'Đang diễn ra',goldWinsVal:'Phe Vàng thắng',blueWinsVal:'Phe Xanh thắng',drawVal:'Hòa / hết nước đi',turnLogTitle:'Nhật ký nước đi',pressPlayToWatch:'Nhấn ▶ để theo dõi diễn biến trận.',captureWord:' · BẮT QUÂN',capturesWord:'bắt quân',prevTurn:'Nước trước',nextTurn:'Nước sau',playPause:'Phát / Tạm dừng',restart:'Bắt đầu lại',
    tournamentsEyebrow:'GIẢI ĐẤU',tournamentsTitle:'Giải đấu',tournamentsDesc:'Thông tin giải đấu, lịch thi đấu và kết quả.',tournamentNotOpen:'Giải đấu chưa mở',tournamentNotOpenDesc:'Các giải đấu sẽ xuất hiện tại đây khi tính năng được mở và có thông tin được công bố.',adminEyebrow:'QUẢN LÝ HỆ THỐNG',adminTitle:'Quản lý giải',adminDesc:'Dành cho Ban tổ chức.',needLogin:'Cần đăng nhập',needLoginDesc:'Vui lòng đăng nhập bằng tài khoản được cấp quyền.',noPermission:'Không có quyền truy cập',noPermissionDesc:'Tài khoản của bạn không có quyền quản lý giải.',adminWipTitle:'Chức năng đang được chuẩn bị',adminWipDesc:'Các công cụ quản lý giải sẽ xuất hiện khi tính năng được mở.',
    modalEyebrow:'NỘP BÀI THI ĐẤU',modalTitle:'Tải lên bot mới',modalBotName:'Tên bot',modalBotNamePlaceholder:'Ví dụ: Chiến Binh Rồng, AlphaBot...',modalBotNameHelp:'Tên hiển thị của bot trong các trận đấu và bảng xếp hạng',thBotName:'Tên bot',thActions:'Thao tác',renameBotBtn:'Đổi tên',deleteBotBtn:'Xóa',renameModalTitle:'Đổi tên bot',renameModalDesc:'Nhập tên mới cho bot của bạn:',renameSaveBtn:'Lưu thay đổi',deleteConfirmTitle:'Xác nhận xóa bot',deleteConfirmDesc:'Bạn có chắc chắn muốn xóa bot "{name}" ({id})? Hành động này sẽ xóa vĩnh viễn bot khỏi hệ thống.',deleteConfirmBtn:'Xóa vĩnh viễn',renameSuccess:'Đã đổi tên bot thành công.',renameFail:'Đổi tên thất bại: ',deleteSuccess:'Đã xóa bot thành công.',deleteFail:'Xóa bot thất bại: ',botNameEmptyNotice:'Vui lòng nhập tên bot.',modalLang:'Ngôn ngữ lập trình',modalVersion:'Phiên bản bot',modalSource:'File mã nguồn',modalChooseFile:'Chọn file mã nguồn',modalFileHelp:'File đơn .py, .java, hoặc .c (tối đa 500 KB). Tên file không dấu, không khoảng trắng.',modalNotice:'File tải lên sẽ được lưu vào tài khoản của bạn. Tính năng thi đấu hiện chưa mở.',modalCancel:'Hủy',modalSubmit:'Tải lên mã nguồn',
    closeNotice:'Đóng',liveEngine:'ĐỘNG CƠ TRỰC TIẾP',selectSourceNotice:'Vui lòng chọn một file mã nguồn.',singleExtNotice:'Chỉ chấp nhận file .py, .java hoặc .c đơn.',langMismatchNotice:'Ngôn ngữ đã chọn không khớp với phần mở rộng file.',uploadSuccessNotice:'Đã tải mã nguồn lên hệ thống thành công.',uploadFailNotice:'Tải lên thất bại: ',
    playerMatchesTitle:'Lịch sử đấu của Bot',playerMatchesDesc:'Tổng hợp toàn bộ các trận đấu của các bot thuộc tài khoản bạn',
    adminMatchesTitle:'Tổng hợp & Giám sát trận đấu',adminMatchesDesc:'Bảng điều khiển toàn diện tất cả các trận đấu trên sàn đấu OTT',
    statTotalMatches:'Tổng trận',statCompletedMatches:'Đã hoàn tất',statQueuedMatches:'Đang chờ / Đấu',statFailedMatches:'Lỗi',
    searchMatchPlaceholder:'Tìm mã trận (VD: M-7042)...',searchMatchBtn:'Tìm trận',
    matchDetailModalTitle:'Chi tiết trận đấu',matchDetailEyebrow:'THÔNG TIN TRẬN ĐẤU',
    goldSide:'🟡 Phe Vàng (P1)',blueSide:'🔵 Phe Xanh (P2)',
    matchIdLabel:'Mã trận',statusLabel:'Trạng thái',winnerLabel:'Thắng cuộc',turnsLabel:'Số lượt đấu',maxMovesLabel:'Giới hạn lượt',
    modeLabel:'Chế độ',seedLabel:'Hạt giống (Seed)',createdTimeLabel:'Thời gian đấu',endReasonLabel:'Lý do kết thúc',
    watchReplayBtn:'Xem Replay trên sàn đấu',copyMatchId:'Sao chép mã trận',copied:'Đã sao chép mã trận!',
    noPlayerMatches:'Chưa có trận đấu nào của bot bạn.',noPlayerMatchesDesc:'Hãy vào mục "Đấu bot" để gửi bot tham gia thi đấu đối kháng.',
    matchNotFound:'Không tìm thấy trận đấu với mã: ',filterAll:'Tất cả',filterCompleted:'Hoàn tất',filterQueued:'Đang diễn ra / chờ',filterFailed:'Lỗi',
    opponentBot:'Đối thủ',myBotSide:'Bot của bạn',thResult:'Kết quả',thScore:'Tỉ số',thTurns:'Lượt',thTime:'Thời gian',thP1:'Phe Vàng (P1)',thP2:'Phe Xanh (P2)',thCreator:'Người tạo',viewDetailBtn:'Chi tiết'
  },
  en:{
    brandSub:'Bot Battle Platform',navGroupArena:'ARENA',navGroupWorkspace:'WORKSPACE',
    navOverview:'Overview',navPlay:'Bot Duel',navArena:'Match Arena',navLeaderboard:'Leaderboard',navTournaments:'Tournaments',navSubmit:'My Bots',navAdmin:'Tournament Admin',crumbPlatform:'Platform',
    engineStatus:'Engine v2.0 • 8×8',toggleTheme:'Toggle theme',toggleLang:'Switch language (VI / EN)',signIn:'Sign In',signOut:'Sign Out',guest:'Guest',signedIn:'Signed in',guestHint:'Sign in to manage bots',guestFightHint:'Sign in to compete',footer:'OTTARENA · Bot Battle Platform • Engine v2.0',dataError:'Failed to fetch latest data. Please try again shortly.',retry:'Retry',
    heroEyebrow:'BOT BATTLE ARENA',heroTitle1:'Code your strategy.',heroTitle2:'Enter the arena.',heroDesc:'Upload your bot, climb the ELO leaderboard, and watch community battles in real-time. The arena is yours.',heroPlay:'Play Sandbox',heroUpload:'Upload Bot',miniArenaTitle:'8×8 TACTICAL ARENA',
    statYourBots:'Your Bots',statYourBotsFoot:'Versions submitted',statRankedBots:'Ranked Bots',statRankedBotsFoot:'In active leaderboard',statMatches:'Recorded Matches',statMatchesFoot:'Total matches on record',statCompleted:'Completed Matches',statCompletedFoot:'Matches with final result',
    card1BackTitle:'SUBMISSION VAULT',card1BackDesc:'Inspect source code, manage uploaded versions, and prep your bot algorithms.',card1BackBtn:'MANAGE BOTS',
    card2BackTitle:'ELO LEADERBOARD',card2BackDesc:'Dynamic rankings calculated automatically following every competitive duel.',card2BackBtn:'VIEW LEADERBOARD',
    card3BackTitle:'MATCH ARENA',card3BackDesc:'Watch all recorded turn-based 8x8 Rock-Paper-Scissors skirmishes.',card3BackBtn:'ENTER ARENA',
    card4BackTitle:'REPLAYS & LOGS',card4BackDesc:'Inspect tactical maneuvers, piece captures, and final match results.',card4BackBtn:'VIEW REPLAYS',
    flipHint:'↻ Tap/Hover to flip',
    dividerStats:'STATISTICS & PROGRESS',dividerActivity:'ARENA & RECENT ACTIVITY',
    badgeYourBots:'BOT VAULT',badgeRanked:'RANKINGS',badgeMatches:'MATCHES',badgeCompleted:'COMPLETED',
    fanRockTitle:'ROCK ✊',fanRockWin:'BEATS SCISSORS',fanRockDesc:'Beats Scissors • Loses to Paper',
    fanPaperTitle:'PAPER 🖐️',fanPaperWin:'BEATS ROCK',fanPaperDesc:'Beats Rock • Loses to Scissors',
    fanArenaTitle:'ARENA ⚔️',fanArenaBadge:'8×8 ARENA',fanArenaDesc:'Goal: Square h8 / a1',
    fanScissorsTitle:'SCISSORS ✌️',fanScissorsWin:'BEATS PAPER',fanScissorsDesc:'Beats Paper • Loses to Rock',
    fanChampionTitle:'CHAMPION 🏆',fanChampionBadge:'TOP ELO',fanChampionDesc:'Rank #1 on Leaderboard',
    liveMatchLabel:'Latest match:',turnsLabel:'Turns:',
    coreRulesLabel:'⚡ Core rules: ROCK beats SCISSORS · SCISSORS beats PAPER · PAPER beats ROCK. Gold goals at h8, Blue goals at a1 or eliminate all opponents to win.',
    enterArenaReplayBtn:'WATCH REPLAY IN ARENA',watchBtn:'Watch',
    quickStartTitle:'Quick Start',quickStartChip:'GET STARTED',step1Title:'Code your Bot Algorithm',step1Desc:'Program your bot in Python, Java, or C following the 8×8 Rock-Paper-Scissors rules. Refer to <button type="button" class="api-doc-inline-btn" onclick="openApiDocsModal(event)">API docs</button> for move formatting.',apiDocsEyebrow:'DEVELOPER SPECIFICATION',apiDocsTitle:'Bot Programming & Submission Standards',apiDocsTabRules:'I/O Specs & Rules',apiDocsTabPython:'Python Starter',apiDocsTabJava:'Java Starter',apiDocsTabC:'C / C++ Starter',step2Title:'Upload code to platform',step2Desc:'Upload your source code file (.py, .java, .c). Your bot is saved to your library and ready for action.',step3Title:'Climb the ELO rankings',step3Desc:'Head to the Bot Duel arena, select your bot, and challenge opponents. System updates your ELO rating after each battle.',
    recentTitle:'Recent Battles',viewAll:'View all →',turnsUnit:'turns',matchCompleted:'Completed',matchPending:'In progress',replayTitle:'Watch replay',noMatches:'No matches yet',noMatchesDesc:'Matches will appear here once played.',findMatchNow:'Find a match now',
    leaderboardTitle:'Top Leaderboard',fullBoard:'Full leaderboard →',noRankData:'No ranking data yet.',
    subHeroEyebrow:'DEVELOPER WORKSPACE',subHeroTitle:'My Submissions',subHeroDesc:'Manage bot versions uploaded to your account.',subUploadBtn:'Upload bot',subLibraryChip:'BOT LIBRARY',subLibraryTitle:'Your bots',subLibraryDesc:'Accepts single .py, .java, or .c file · Max 500 KB',subHistory:'Submission history',thSubId:'Submission',thSource:'Source file',thLang:'Language',thDate:'Submitted',thVersion:'Version',thStatus:'Status',noSubmissions:'No submissions yet. Sign in and upload a bot to get started.',subBox1Title:'Submit a Bot',subBox1Desc:'Choose language, version, and source file. Once uploaded, your bot appears in your submission history.',subBox1Notice:'Saved bots are not automatically verified or approved for competitive matches.',subBox2Title:'Compete',subBox2Desc:'Select your bot and find opponents in the Bot Duel arena.',goToPlay:'Go to Bot Duel',statusStoredWaiting:'Saved · Waiting for match',statusStored:'Saved',statusActive:'Active',
    lbHeroEyebrow:'COMPETITIVE RANKINGS',lbHeroTitle:'The Leaderboard',lbHeroDesc:'Rankings updated dynamically based on ELO match results.',lbStatRanked:'Ranked Bots',lbStatRankedFoot:'In active leaderboard',lbStatTopElo:'Highest ELO',lbStatLangs:'Languages',lbStatLangsFoot:'Active languages',searchPlaceholder:'Search competitors...',allLangs:'All languages',thRank:'Rank',thCompetitor:'Competitor',thElo:'ELO Rating',thChange:'Change',noMatchingBots:'No matching bots found.',
    playHeroEyebrow:'COMPETE',playHeroTitle:'Bot Duel',playHeroDesc:'Select your bot, challenge opponents, and track results.',loginToPlay:'Sign in to duel',loginToPlayDesc:'Select a bot associated with your account to find opponents.',challengeArenaTitle:'⚔ Challenge Arena',challengeArenaDesc:'Select your bot to battle against other competitors.',myBotLabel:'My bot',opponentLabel:'Opponent',opponentAutoVal:'Auto matchmaking by system',maxMovesLabel:'Turn limit',findMatch:'Find Match',findingMatch:'Searching for match…',contestClosed:'Competition closed',uploadNewBot:'Upload new bot',reload:'Reload',needBotFirst:'You need to upload at least one bot before finding a match.',challengeNotice:'Choose your bot to request a match. Pairing is handled automatically.',noBotAvailable:'No bots available',
    arenaHeroEyebrow:'MATCHES · ROCK PAPER SCISSORS',arenaHeroDesc:'Watch turn-by-turn playback of recorded matches.',replayBtn:'Replay',noReplay:'No replay available',noReplayDesc:'Replays will appear here once a match is completed.',replayNotLoaded:'Replay not loaded',replayNotLoadedDesc:'Click reload to load match events.',loadReplay:'Load replay',matchReplayChip:'MATCH REPLAY',subChipRPS:'OTT Rock–Paper–Scissors · 8×8',goldPlayer:'🟡 Gold',bluePlayer:'🔵 Blue',goldGoalDesc:'🟡 Gold goal → h8',blueGoalDesc:'🔵 Blue goal → a1',turnActive:'Turn active',turnWaiting:'Waiting',turnWord:'Turn',readyToStart:'Ready to start',rulesTitle:'OTT Rules',rulesRPS:'ROCK beats SCISSORS · SCISSORS beats PAPER · PAPER beats ROCK',rulesBody1:'Each piece moves one square horizontally, vertically, or diagonally. You may capture an opponent only if your piece beats the target piece type. You cannot capture friendly pieces or pieces of the same type.',rulesBody2:'Gold wins by reaching h8, Blue wins by reaching a1, or by eliminating all opposing pieces.',rulesBody3:'Pieces are placed symmetrically across the main diagonal, with 6 pieces per side by default.',matchInfoTitle:'Match Info',gameLabel:'Game',limitLabel:'Limit',turnsPlayedLabel:'Turns played',matchResultLabel:'Match result',inProgressVal:'In progress',goldWinsVal:'Gold wins',blueWinsVal:'Blue wins',drawVal:'Draw / no moves left',turnLogTitle:'Turn Log',pressPlayToWatch:'Press ▶ to watch the replay.',captureWord:' · CAPTURE',capturesWord:'captures',prevTurn:'Previous turn',nextTurn:'Next turn',playPause:'Play / Pause',restart:'Restart',
    tournamentsEyebrow:'COMPETITIONS',tournamentsTitle:'Tournaments',tournamentsDesc:'Tournament info, schedules, and official brackets.',tournamentNotOpen:'Tournaments not open',tournamentNotOpenDesc:'Official tournament brackets will appear here when announced.',adminEyebrow:'ADMINISTRATION',adminTitle:'Tournament Management',adminDesc:'For tournament organizers.',needLogin:'Login required',needLoginDesc:'Please sign in with an authorized organizer account.',noPermission:'Access restricted',noPermissionDesc:'Your account does not have permission to manage tournaments.',adminWipTitle:'Feature in preparation',adminWipDesc:'Tournament administration tools will be available when enabled.',
    modalEyebrow:'BOT SUBMISSION',modalTitle:'Upload a new bot',modalBotName:'Bot name',modalBotNamePlaceholder:'e.g. DragonWarrior, AlphaBot...',modalBotNameHelp:'Display name for the bot in battles and leaderboard',thBotName:'Bot Name',thActions:'Actions',renameBotBtn:'Rename',deleteBotBtn:'Delete',renameModalTitle:'Rename Bot',renameModalDesc:'Enter a new name for your bot:',renameSaveBtn:'Save changes',deleteConfirmTitle:'Confirm delete bot',deleteConfirmDesc:'Are you sure you want to delete bot "{name}" ({id})? This will permanently remove the bot.',deleteConfirmBtn:'Delete permanently',renameSuccess:'Bot renamed successfully.',renameFail:'Rename failed: ',deleteSuccess:'Bot deleted successfully.',deleteFail:'Delete failed: ',botNameEmptyNotice:'Please enter a bot name.',modalLang:'Programming language',modalVersion:'Bot version',modalSource:'Source code file',modalChooseFile:'Choose a source file',modalFileHelp:'Single .py, .java, or .c file (max 500 KB). ASCII filename, no spaces.',modalNotice:'Uploaded file will be saved to your account. Matchmaking is currently in development.',modalCancel:'Cancel',modalSubmit:'Upload source',
    closeNotice:'Close',liveEngine:'LIVE ENGINE',selectSourceNotice:'Please select a source file.',singleExtNotice:'Use a single .py, .java, or .c file.',langMismatchNotice:'The selected language does not match the source file.',uploadSuccessNotice:'Source uploaded to the server.',uploadFailNotice:'Upload failed: ',
    playerMatchesTitle:'My Bot Match History',playerMatchesDesc:'Summary of all battles fought by your bots',
    adminMatchesTitle:'All Matches Monitor',adminMatchesDesc:'Comprehensive dashboard of all matches across OTT Arena',
    statTotalMatches:'Total Matches',statCompletedMatches:'Completed',statQueuedMatches:'In Progress / Queued',statFailedMatches:'Failed',
    searchMatchPlaceholder:'Search match ID (e.g. M-7042)...',searchMatchBtn:'Search',
    matchDetailModalTitle:'Match Details',matchDetailEyebrow:'MATCH INFORMATION',
    goldSide:'🟡 Gold Side (P1)',blueSide:'🔵 Blue Side (P2)',
    matchIdLabel:'Match ID',statusLabel:'Status',winnerLabel:'Winner',turnsLabel:'Turns',maxMovesLabel:'Turn Limit',
    modeLabel:'Mode',seedLabel:'Seed',createdTimeLabel:'Created At',endReasonLabel:'End Reason',
    watchReplayBtn:'Watch Replay in Arena',copyMatchId:'Copy Match ID',copied:'Match ID copied!',
    noPlayerMatches:'No matches recorded for your bots yet.',noPlayerMatchesDesc:'Go to "Bot Duel" to enter your bot into battles.',
    matchNotFound:'No match found with ID: ',filterAll:'All',filterCompleted:'Completed',filterQueued:'Active / Queued',filterFailed:'Failed',
    opponentBot:'Opponent',myBotSide:'Your Bot',thResult:'Result',thScore:'Score',thTurns:'Turns',thTime:'Time',thP1:'Gold Side (P1)',thP2:'Blue Side (P2)',thCreator:'Created By',viewDetailBtn:'Details'
  }
};

const DEFAULT_SUBMISSIONS=[
  {id:'SUB-101',name:'TacticalDruid.py',botName:'Tactical Druid',lang:'Python',version:'v3.2',date:'Oct 20, 2026',status:'Active'},
  {id:'SUB-102',name:'RpsSentinel.c',botName:'RPS Sentinel',lang:'C',version:'v2.1',date:'Oct 18, 2026',status:'Stored'},
  {id:'SUB-103',name:'AncientWillow.java',botName:'Ancient Willow',lang:'Java',version:'v1.0',date:'Oct 15, 2026',status:'Stored'}
];
const DEFAULT_PLAYERS=[
  ['01','ForestTitan_v4','FT','Python',1845,'+18','purple'],
  ['02','MossGolem_C','MG','C',1792,'+12','blue'],
  ['03','ChumbiKnight','CK','Java',1740,'-8','orange'],
  ['04','EmeraldBlade','EB','Python',1685,'+24','pink'],
  ['05','DeepWoods_AI','DW','C',1620,'+5','purple']
];
const DEFAULT_MATCHES=[
  {id:'M-7042',a:'ForestTitan_v4',b:'MossGolem_C',turns:42,status:'completed',winner:'p1',time:'10m ago',maxMoves:200},
  {id:'M-7041',a:'ChumbiKnight',b:'EmeraldBlade',turns:58,status:'completed',winner:'p2',time:'25m ago',maxMoves:200},
  {id:'M-7040',a:'DeepWoods_AI',b:'ForestTitan_v4',turns:36,status:'completed',winner:'p1',time:'1h ago',maxMoves:200},
  {id:'M-7039',a:'ShadowFox',b:'ChumbiKnight',turns:64,status:'completed',winner:'p1',time:'2h ago',maxMoves:200},
  {id:'M-7038',a:'MossGolem_C',b:'EmeraldBlade',turns:80,status:'pending',winner:null,time:'Live',maxMoves:200}
];

const state={
  page:location.hash.replace('#','')||'overview',
  theme:saved('ott-theme','dark'),
  lang:saved('ott-lang','vi'),
  submissions:[...DEFAULT_SUBMISSIONS],
  play:0,playing:false,speed:1,selectedMatch:'M-7042',
  filter:'all',search:'',rankTab:'Global',round:'Round of 16',
  adminLive:true,serverOnline:false,dataStatus:'ready',
  challengeReady:false,challengePending:false,challengeBotId:'',
  modal:null,editingBot:null,deletingBot:null,viewingMatch:null,apiDocsTab:'rules',mobile:false,selectedFile:null,matchMap:'Arena Classic',
  adminMatchSearch:'',adminMatchStatusFilter:'all',playerMatchSearch:'',
  maxMoves:200,firstMove:'Random',noticeDismissed:false
};

const players=[...DEFAULT_PLAYERS];
const matches=[...DEFAULT_MATCHES];

const t=k=>I18N[state.lang]?.[k]??I18N.vi[k]??k;
function toggleLang(){
  state.lang=state.lang==='vi'?'en':'vi';
  localStorage.setItem('ott-lang',JSON.stringify(state.lang));
  if(document.documentElement)document.documentElement.lang=state.lang;
  render();
  if(typeof updateSidebarProfile==='function')updateSidebarProfile();
  if(typeof injectTopNavAuth==='function')injectTopNavAuth();
}

function applyTheme(theme = state.theme){
  state.theme = theme;
  const isLight = theme === 'light';
  if(document.documentElement){
    if(isLight){
      if(document.documentElement.classList) document.documentElement.classList.add('light');
      if(document.documentElement.setAttribute) document.documentElement.setAttribute('data-theme','light');
    } else {
      if(document.documentElement.classList) document.documentElement.classList.remove('light');
      if(document.documentElement.setAttribute) document.documentElement.setAttribute('data-theme','dark');
    }
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if(metaTheme) metaTheme.setAttribute('content', isLight ? '#F5EFE6' : '#0B130E');
}

function toggleTheme(){
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('ott-theme', JSON.stringify(state.theme));
  applyTheme(state.theme);
  render();
}
window.toggleLang=toggleLang;window.t=t;
window.applyTheme=applyTheme;window.toggleTheme=toggleTheme;
applyTheme(state.theme);

const icons={
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  play:'<path d="m8 5 12 7-12 7z"/>',
  pause:'<path d="M7 5v14M17 5v14"/>',
  reset:'<path d="M3 11a9 9 0 1 1 3 7M3 4v7h7"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  chevronLeft:'<path d="m15 18-6-6 6-6"/>',
  chevronRight:'<path d="m9 18 6-6-6-6"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  cup:'<path d="M8 21h8M12 17v4M6 3h12v8a6 6 0 0 1-12 0V3ZM6 6H3v3a4 4 0 0 0 4 4m11-7h3v3a4 4 0 0 1-4 4"/>',
  server:'<rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-10a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',
  chart:'<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>',
  code:'<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-12-2 16"/>',
  overview:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  swords:'<path d="m14.5 17.5 6.5-6.5a2.12 2.12 0 0 0 0-3l-2-2a2.12 2.12 0 0 0-3 0L9.5 12.5"/><path d="m16 8 3 3"/><path d="m2 22 5.5-5.5"/><path d="m9.5 17.5-6.5-6.5a2.12 2.12 0 0 1 0-3l2-2a2.12 2.12 0 0 1 3 0l6.5 6.5"/><path d="m8 8-3 3"/><path d="m22 22-5.5-5.5"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  barchart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>',
  trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34M6 4h12a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z"/>',
  bot:'<rect width="18" height="12" x="3" y="6" rx="2"/><path d="M9 11v2M15 11v2M9 2v4M15 2v4M2 12h1M21 12h1"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
};
const svg=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.plus}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const go=p=>{state.page=p;state.mobile=false;location.hash=p;state.playing=false;render();window.scrollTo(0,0)};
const notice=s=>{document.querySelector('.toast')?.remove();let n=document.createElement('div');n.className='toast';n.textContent=s;document.body.append(n);setTimeout(()=>n.remove(),3400)};
const avatar=(initials,color='purple')=>`<span class="avatar" style="background:${({purple:'#322744',blue:'#1A323D',orange:'#3D2B1D',pink:'#3B2034'})[color]};color:${({purple:'#D8B4FE',blue:'#7DD3FC',orange:'#FDBA74',pink:'#F9A8D4'})[color]}">${esc(initials)}</span>`;

/* TCG Frame Ornament Helpers */
function tcgFrameHTML(){
  return `<div class="tcg-frame" aria-hidden="true">
    <svg class="tcg-corner tl" viewBox="0 0 20 20" fill="none"><path d="M3 17 V6 C3 4.3 4.3 3 6 3 H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="currentColor"/></svg>
    <svg class="tcg-corner tr" viewBox="0 0 20 20" fill="none"><path d="M3 17 V6 C3 4.3 4.3 3 6 3 H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="currentColor"/></svg>
    <svg class="tcg-corner bl" viewBox="0 0 20 20" fill="none"><path d="M3 17 V6 C3 4.3 4.3 3 6 3 H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="currentColor"/></svg>
    <svg class="tcg-corner br" viewBox="0 0 20 20" fill="none"><path d="M3 17 V6 C3 4.3 4.3 3 6 3 H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="currentColor"/></svg>
  </div>`;
}

function ornateDividerHTML(title){
  return `<div class="ornate-divider">
    <div class="ornate-line left"><div class="ornate-dot"></div></div>
    <div class="ornate-title">•───• ${esc(title)} •───•</div>
    <div class="ornate-line right"><div class="ornate-dot"></div></div>
  </div>`;
}

const header=(eyebrow,title,desc,button='')=>`
<div class="page-heading" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px">
  <div>
    <div class="hero-eyebrow-chip" style="margin-bottom:8px">${svg('trophy',12)} ${esc(eyebrow)}</div>
    <h1 style="margin:4px 0 6px">${esc(title)}</h1>
    <p style="color:var(--text-muted);font-size:13.5px;max-width:560px;margin:0">${esc(desc)}</p>
  </div>
  ${button}
</div>`;

/* Pieces SVG */
const OTT_TYPES=['rock','paper','scissors'];
const OTT_SIGNS={rock:'R',paper:'P',scissors:'S'};
function pieceSVG(type,owner){
  const gold = owner==='p1';
  const palette = gold
    ? {rock:['#ffef86','#ffc933','#ef8f1e','#6f3d0d'], paper:['#fff6cb','#f0b342','#c46a16','#6f3d0d'], sc:['#ffd84f','#f39a1f','#b14e14','#6f2b0c'], eye:'#2b1a12'}
    : {rock:['#9aecff','#42c8ff','#2c79eb','#0e3873'], paper:['#eafaff','#8fdcff','#2d84ea','#1a4e9b'], sc:['#aef3ff','#57cdf7','#2077eb','#0d3e81'], eye:'#132146'};
  if(type==='rock') return `<svg class="piece-svg set-b rock ${owner}" viewBox="0 0 42 42" aria-hidden="true">
    <ellipse cx="21" cy="34.5" rx="13" ry="3.2" fill="#000" opacity=".2"/>
    <path d="M12 30 L8 24 L9 17 L14 11 L22 8 L29 10 L33 16 L34 23 L31 29 L24 33 L17 33 Z" fill="${palette.rock[1]}" stroke="${palette.rock[3]}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M13 18 L18 12 L22 17 L18 23 Z" fill="${palette.rock[0]}" opacity=".95"/>
    <path d="M22 17 L27 12 L31 17 L27 23 Z" fill="#fff7cd" opacity=".95"/>
    <path d="M17 23 L22 17 L27 23 L21 29 Z" fill="${palette.rock[2]}" opacity=".65"/>
    <rect x="16" y="20" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <rect x="23" y="20" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <circle cx="8" cy="17" r="2.1" fill="${palette.rock[1]}" stroke="${palette.rock[3]}" stroke-width="1.5"/>
    <circle cx="34" cy="25" r="2.1" fill="${palette.rock[1]}" stroke="${palette.rock[3]}" stroke-width="1.5"/>
  </svg>`;
  if(type==='paper') return `<svg class="piece-svg set-b paper ${owner}" viewBox="0 0 42 42" aria-hidden="true">
    <ellipse cx="21" cy="34.5" rx="12" ry="3.1" fill="#000" opacity=".2"/>
    <path d="M14 10 H28 C30 10 31 11 31 13 V28 C31 30 30 31 28 31 H15 C13 31 12 30 12 28 V13 C12 11 13 10 14 10 Z" fill="${palette.paper[0]}" stroke="${palette.paper[3]}" stroke-width="2"/>
    <rect x="11" y="10" width="4" height="5" rx="1" fill="${palette.paper[2]}" stroke="${palette.paper[3]}" stroke-width="1.4"/>
    <rect x="27" y="10" width="4" height="5" rx="1" fill="${palette.paper[2]}" stroke="${palette.paper[3]}" stroke-width="1.4"/>
    <rect x="17" y="18" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <rect x="23" y="18" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <path d="M21 14 L25 16 L24 21 H18 L17 16 Z" fill="${gold?'#f0ac1d':'#4a9fff'}" opacity=".95"/>
  </svg>`;
  return `<svg class="piece-svg set-b scissors ${owner}" viewBox="0 0 42 42" aria-hidden="true">
    <ellipse cx="21" cy="34.5" rx="12" ry="3.1" fill="#000" opacity=".2"/>
    <path d="M20 20 L12 11 L15 9 L23 17 Z" fill="${palette.sc[0]}" stroke="${palette.sc[3]}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 20 L30 11 L27 9 L19 17 Z" fill="${palette.sc[0]}" stroke="${palette.sc[3]}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M19 19 L11 26 L14 28 L22 21 Z" fill="${palette.sc[1]}" stroke="${palette.sc[3]}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M23 19 L31 26 L28 28 L20 21 Z" fill="${palette.sc[1]}" stroke="${palette.sc[3]}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="17" cy="28.5" r="4.6" fill="none" stroke="${palette.sc[2]}" stroke-width="3"/>
    <circle cx="25" cy="28.5" r="4.6" fill="none" stroke="${palette.sc[2]}" stroke-width="3"/>
    <circle cx="21" cy="20" r="4.2" fill="${gold?'#ffe688':'#d8f6ff'}" stroke="${palette.sc[3]}" stroke-width="2"/>
    <rect x="18.5" y="18" width="2.4" height="5.5" rx="1" fill="${palette.eye}"/>
    <rect x="21.5" y="18" width="2.4" height="5.5" rx="1" fill="${palette.eye}"/>
  </svg>`;
}

const OTT_BEATS={rock:'scissors',scissors:'paper',paper:'rock'};
const OTT_GOAL={p1:[0,7],p2:[7,0]};
let replayCache={};

function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}};
function initialOTT(seed,count=6){
  const rng=seeded(seed),b=Array.from({length:8},()=>Array(8).fill(null)),cells=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(r>c)cells.push([r,c]);
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]]}
  for(let i=0;i<Math.min(count,cells.length);i++){
    let [r,c]=cells[i],t=OTT_TYPES[Math.floor(rng()*3)];
    b[r][c]={owner:'p1',type:t,id:'a'+i};
    b[c][r]={owner:'p2',type:t,id:'b'+i};
  }
  return b;
}
function legalOTT(b,owner){
  const out=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    let piece=b[r][c];
    if(!piece||piece.owner!==owner)continue;
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>7||nc<0||nc>7)continue;
      const target=b[nr][nc];
      if(!target||(target.owner!==owner&&OTT_BEATS[piece.type]===target.type)){
        out.push({from:[r,c],to:[nr,nc],capture:!!target,unit:piece.type,owner});
      }
    }
  }
  return out;
}

function generateDemoReplay(seed=42){
  const b=initialOTT(seed,6);
  const snapshots=[JSON.parse(JSON.stringify(b))];
  const events=[];
  let turnOwner='p1';
  let cur=b;
  for(let i=0;i<34;i++){
    const moves=legalOTT(cur,turnOwner);
    if(!moves.length)break;
    const m=moves[(i*13+5)%moves.length];
    const piece=cur[m.from[0]][m.from[1]];
    const target=cur[m.to[0]][m.to[1]];
    cur[m.from[0]][m.from[1]]=null;
    cur[m.to[0]][m.to[1]]=piece;
    events.push({
      owner:turnOwner,
      from:m.from,
      to:m.to,
      unit:piece.type,
      capture:!!target,
      captured:target?target.type:null
    });
    snapshots.push(JSON.parse(JSON.stringify(cur)));
    if(turnOwner==='p1'&&m.to[0]===0&&m.to[1]===7)break;
    if(turnOwner==='p2'&&m.to[0]===7&&m.to[1]===0)break;
    turnOwner=turnOwner==='p1'?'p2':'p1';
  }
  return {id:'M-7042',snapshots,events,maxMoves:200,winner:'p1'};
}
replayCache['M-7042']=generateDemoReplay();

function buildReplay(id){return replayCache[id]||replayCache['M-7042']||null;}
const ottCoord=([r,c])=>'abcdefgh'[c]+(8-r);

function board(){
  const rep=buildReplay(state.selectedMatch);
  if(!rep)return '';
  const b=rep.snapshots[Math.min(state.play,rep.events.length)];
  return `<div class="ott-board-shell">
    <div class="ott-files">${'abcdefgh'.split('').map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="gameboard ott-board" role="grid" aria-label="OTT 8 by 8 board">
      ${b.flatMap((row,r)=>row.map((p,c)=>`
        <div role="gridcell" class="square ${(r+c)%2?'alt':''} ${(r===0&&c===7)?'goal-blue':''} ${(r===7&&c===0)?'goal-gold':''}" data-square="${r}-${c}" title="${ottCoord([r,c])}${p?' · '+(p.owner==='p1'?t('goldPlayer'):t('bluePlayer'))+' '+p.type:''}">
          ${c===0?`<span class="rank-label">${8-r}</span>`:''}
          ${(r===0&&c===7||r===7&&c===0)?'<span class="goal-marker">⚑</span>':''}
          ${p?`<span class="ott-piece ${p.owner} ${p.type}" data-piece-id="${p.id}" aria-label="${p.owner==='p1'?t('goldPlayer'):t('bluePlayer')} ${p.type}">${pieceSVG(p.type,p.owner)}</span>`:''}
        </div>`)).join('')}
    </div>
    <div class="board-caption">
      <span>${t('goldGoalDesc')}</span>
      <span>${t('blueGoalDesc')}</span>
    </div>
  </div>`;
}

function requestSubmissionUpload(){
  if(typeof authState==='undefined'||!authState.authenticated){
    if(typeof openLoginPage==='function'){openLoginPage();return;}
  }
  state.modal='upload';render();
}
function submissionStatusLabel(value){
  if(/awaiting external worker|stored|sandbox|docker/i.test(value||''))return t('statusStoredWaiting');
  return value||t('statusStored');
}
function countLabel(value){return String(value??0);}
function retryArenaData(){state.dataStatus='loading';render();if(typeof loadBackend==='function')void loadBackend();}
function emptyCard(title,description){
  return `<div class="card" style="padding:32px;text-align:center" role="status">
    ${tcgFrameHTML()}
    <h2 style="margin-bottom:8px">${esc(title)}</h2>
    <p style="color:var(--text-muted)">${esc(description)}</p>
  </div>`;
}

/* =====================================================
   DASHBOARD / OVERVIEW
   ===================================================== */
function dashboard(){
  const recent=matches.slice(0,5);

  // 1. HERO BANNER WITH JITTER-FREE TACTILE FAN DECK
  const heroBanner=`
  <div class="hero-fantasy-banner">
    ${tcgFrameHTML()}
    <div class="hero-left">
      <div class="hero-eyebrow-chip">
        ${svg('swords',12)} ${t('heroEyebrow')}
      </div>
      <div class="hero-title-main">
        ${t('heroTitle1')}<br><span class="accent">${t('heroTitle2')}</span>
      </div>
      <div class="hero-description">${t('heroDesc')}</div>
      <div class="hero-action-buttons">
        <button class="btn btn-accent" onclick="go('play')">${svg('swords')} ${t('heroPlay')}</button>
        <button class="btn secondary" onclick="requestSubmissionUpload()">${svg('upload')} ${t('heroUpload')}</button>
      </div>
    </div>

    <!-- Jitter-free Stable Fan Deck -->
    <div class="hero-right-fan">
      <div class="fan-deck" aria-label="OTT Cards">
        <!-- Card 1: Búa (Rock) - Thắng Kéo -->
        <div class="fan-card-item c-rock" onclick="go('arena')">
          ${tcgFrameHTML()}
          <div class="fan-card-icon">✊</div>
          <div class="fan-card-title">${t('fanRockTitle')}</div>
          <div class="fan-card-badge">${t('fanRockWin')}</div>
          <div class="fan-card-foot">${t('fanRockDesc')}</div>
        </div>

        <!-- Card 2: Bao (Paper) - Thắng Búa -->
        <div class="fan-card-item c-paper" onclick="go('arena')">
          ${tcgFrameHTML()}
          <div class="fan-card-icon">🖐️</div>
          <div class="fan-card-title">${t('fanPaperTitle')}</div>
          <div class="fan-card-badge">${t('fanPaperWin')}</div>
          <div class="fan-card-foot">${t('fanPaperDesc')}</div>
        </div>

        <!-- Card 3: Arena Center Crest -->
        <div class="fan-card-item c-arena" onclick="go('play')">
          ${tcgFrameHTML()}
          <div class="fan-card-icon">⚔️</div>
          <div class="fan-card-title">${t('fanArenaTitle')}</div>
          <div class="fan-card-badge" style="background:#193322;border-color:#4ADE80;color:#4ADE80">${t('fanArenaBadge')}</div>
          <div class="fan-card-foot" style="color:#A7F3D0">${t('fanArenaDesc')}</div>
        </div>

        <!-- Card 4: Kéo (Scissors) - Thắng Bao -->
        <div class="fan-card-item c-scissors" onclick="go('arena')">
          ${tcgFrameHTML()}
          <div class="fan-card-icon">✌️</div>
          <div class="fan-card-title">${t('fanScissorsTitle')}</div>
          <div class="fan-card-badge">${t('fanScissorsWin')}</div>
          <div class="fan-card-foot">${t('fanScissorsDesc')}</div>
        </div>

        <!-- Card 5: Champion -->
        <div class="fan-card-item c-champion" onclick="go('leaderboard')">
          ${tcgFrameHTML()}
          <div class="fan-card-icon">🏆</div>
          <div class="fan-card-title">${t('fanChampionTitle')}</div>
          <div class="fan-card-badge">${t('fanChampionBadge')}</div>
          <div class="fan-card-foot">${t('fanChampionDesc')}</div>
        </div>
      </div>
    </div>
  </div>`;

  // 2. 3D CARD FLIP FOR 4 STAT CARDS
  const userSubmissionsCount = state.submissions.length || 3;
  const statCardsRow=`
  <div class="stat-cards-row">
    <!-- Card 1: Bot của bạn (Đỏ trầm: #421E22 - viền #70353B) -->
    <div class="stat-flip-card card-your-bots" onclick="this.classList.toggle('is-flipped')" title="${t('flipHint')}">
      <div class="stat-flip-inner">
        <div class="stat-face front">
          ${tcgFrameHTML()}
          <div class="stat-card-top-row">
            <span class="stat-card-badge">${t('badgeYourBots')}</span>
            <span class="flip-hint-icon">${t('flipHint')}</span>
          </div>
          <div class="stat-center-visual">
            <div class="stat-icon-circle">${svg('bot', 28)}</div>
            <div class="stat-number-hero">${countLabel(userSubmissionsCount)}</div>
          </div>
          <div class="stat-card-bottom">
            <div class="stat-card-title">${t('statYourBots')}</div>
            <div class="stat-card-foot">${t('statYourBotsFoot')}</div>
          </div>
        </div>
        <div class="stat-face back">
          ${tcgFrameHTML()}
          <div class="back-title">${t('card1BackTitle')}</div>
          <div class="back-desc">${t('card1BackDesc')}</div>
          <button class="btn back-pill-btn" onclick="event.stopPropagation();go('submit')">${t('card1BackBtn')}</button>
        </div>
      </div>
    </div>

    <!-- Card 2: Bot được xếp hạng (Xanh biển trầm: #1B3B4B - viền #2F637D) -->
    <div class="stat-flip-card card-ranked-bots" onclick="this.classList.toggle('is-flipped')" title="${t('flipHint')}">
      <div class="stat-flip-inner">
        <div class="stat-face front">
          ${tcgFrameHTML()}
          <div class="stat-card-top-row">
            <span class="stat-card-badge">${t('badgeRanked')}</span>
            <span class="flip-hint-icon">${t('flipHint')}</span>
          </div>
          <div class="stat-center-visual">
            <div class="stat-icon-circle">${svg('cup', 28)}</div>
            <div class="stat-number-hero">${countLabel(players.length)}</div>
          </div>
          <div class="stat-card-bottom">
            <div class="stat-card-title">${t('statRankedBots')}</div>
            <div class="stat-card-foot">${t('statRankedBotsFoot')}</div>
          </div>
        </div>
        <div class="stat-face back">
          ${tcgFrameHTML()}
          <div class="back-title">${t('card2BackTitle')}</div>
          <div class="back-desc">${t('card2BackDesc')}</div>
          <button class="btn back-pill-btn" onclick="event.stopPropagation();go('leaderboard')">${t('card2BackBtn')}</button>
        </div>
      </div>
    </div>

    <!-- Card 3: Trận đã ghi nhận (Xanh lá rừng: #1F422B - viền #36704A) -->
    <div class="stat-flip-card card-matches" onclick="this.classList.toggle('is-flipped')" title="${t('flipHint')}">
      <div class="stat-flip-inner">
        <div class="stat-face front">
          ${tcgFrameHTML()}
          <div class="stat-card-top-row">
            <span class="stat-card-badge">${t('badgeMatches')}</span>
            <span class="flip-hint-icon">${t('flipHint')}</span>
          </div>
          <div class="stat-center-visual">
            <div class="stat-icon-circle">${svg('swords', 28)}</div>
            <div class="stat-number-hero">${countLabel(matches.length)}</div>
          </div>
          <div class="stat-card-bottom">
            <div class="stat-card-title">${t('statMatches')}</div>
            <div class="stat-card-foot">${t('statMatchesFoot')}</div>
          </div>
        </div>
        <div class="stat-face back">
          ${tcgFrameHTML()}
          <div class="back-title">${t('card3BackTitle')}</div>
          <div class="back-desc">${t('card3BackDesc')}</div>
          <button class="btn back-pill-btn" onclick="event.stopPropagation();go('arena')">${t('card3BackBtn')}</button>
        </div>
      </div>
    </div>

    <!-- Card 4: Trận hoàn tất (Vàng nâu cổ điển: #473C1E - viền #786634) -->
    <div class="stat-flip-card card-completed" onclick="this.classList.toggle('is-flipped')" title="${t('flipHint')}">
      <div class="stat-flip-inner">
        <div class="stat-face front">
          ${tcgFrameHTML()}
          <div class="stat-card-top-row">
            <span class="stat-card-badge">${t('badgeCompleted')}</span>
            <span class="flip-hint-icon">${t('flipHint')}</span>
          </div>
          <div class="stat-center-visual">
            <div class="stat-icon-circle">${svg('check', 28)}</div>
            <div class="stat-number-hero">${countLabel(matches.filter(m=>m.status==='completed').length)}</div>
          </div>
          <div class="stat-card-bottom">
            <div class="stat-card-title">${t('statCompleted')}</div>
            <div class="stat-card-foot">${t('statCompletedFoot')}</div>
          </div>
        </div>
        <div class="stat-face back">
          ${tcgFrameHTML()}
          <div class="back-title">${t('card4BackTitle')}</div>
          <div class="back-desc">${t('card4BackDesc')}</div>
          <button class="btn back-pill-btn" onclick="event.stopPropagation();go('arena')">${t('card4BackBtn')}</button>
        </div>
      </div>
    </div>
  </div>`;

  // 3. STICKY SPLIT-SCROLL SECTION
  function miniBoardInteractiveHTML(){
    const sp={'0,7':'goal-h8','7,0':'goal-a1','1,6':'gold-unit','2,4':'gold-unit','0,5':'gold-unit','6,1':'blue-unit','5,3':'blue-unit','7,2':'blue-unit','3,4':'clash-point'};
    const syms={'0,7':'⚑ h8','7,0':'⚑ a1','1,6':'✊','2,4':'✌️','0,5':'🖐️','6,1':'✊','5,3':'🖐️','7,2':'✌️','3,4':'⚡'};
    let cells='';
    for(let r=0;r<8;r++){
      for(let c=0;c<8;c++){
        const k=r+','+c;
        const isAlt=(r+c)%2===1;
        cells+=`<div class="tmb-cell ${isAlt?'alt':''} ${sp[k]||''}">${syms[k]||''}</div>`;
      }
    }
    return `
    <div class="mini-arena-widget">
      ${tcgFrameHTML()}
      <div class="arena-widget-head">
        <div class="arena-widget-title">${svg('flame',15)} ${t('miniArenaTitle')}</div>
        <div class="arena-live-chip"><div class="ping-dot"></div> ${t('liveEngine')}</div>
      </div>
      <div class="tactile-mini-board">
        ${cells}
      </div>
      <div class="mini-arena-status">
        <span>${t('liveMatchLabel')} <strong>ForestTitan vs MossGolem</strong></span>
        <span>${t('turnsLabel')} <strong>42 / 200</strong></span>
      </div>
      <div class="mini-rules-quick">
        ${t('coreRulesLabel')}
      </div>
      <button class="btn secondary sm" style="width:100%;margin-top:12px" onclick="go('arena')">${svg('play')} ${t('enterArenaReplayBtn')}</button>
    </div>`;
  }

  // Right Stack: Section 1 (Recent Matches)
  const recentMatchesSection=`
  <div class="card scroll-focus-section" id="sec-recent">
    ${tcgFrameHTML()}
    <div class="section-head">
      <h3>${t('recentTitle')}</h3>
      <a href="#arena" onclick="go('arena');return false">${t('viewAll')}</a>
    </div>
    <div>
      ${recent.length?recent.map(m=>`
        <div class="match-row">
          <div style="flex:1;min-width:0">
            <div class="match-title">${esc(m.a)} <span style="color:var(--text-muted);font-weight:400">vs</span> ${esc(m.b)}</div>
            <div class="match-meta">${esc(m.time)} &nbsp;•&nbsp; ${m.turns} ${t('turnsUnit')}</div>
          </div>
          ${m.status==='completed'?`<span class="match-status completed">${t('matchCompleted')}</span>`:`<span class="match-status pending">${t('matchPending')}</span>`}
          <button class="btn sm secondary" onclick="openMatch('${esc(m.id)}')" title="${t('replayTitle')}" style="padding:4px 12px">
            ${svg('play',13)} ${t('watchBtn')}
          </button>
        </div>`).join('')
      :`<div class="empty">
          <div style="font-size:32px;margin-bottom:10px">${svg('play',32)}</div>
          <div style="font-weight:700;margin-bottom:6px">${t('noMatches')}</div>
          <div style="font-size:12px">${t('noMatchesDesc')}</div>
          <button class="btn sm secondary" style="margin-top:14px" onclick="go('play')">${t('findMatchNow')}</button>
        </div>`}
    </div>
  </div>`;

  // Right Stack: Section 2 (Mini Leaderboard)
  const rankClasses=['gold','silver','bronze','plain','plain'];
  const miniLBSection=`
  <div class="card scroll-focus-section" id="sec-leaderboard">
    ${tcgFrameHTML()}
    <div class="section-head">
      <h3>${t('leaderboardTitle')}</h3>
      <a href="#leaderboard" onclick="go('leaderboard');return false">${t('fullBoard')}</a>
    </div>
    <div>
      ${players.slice(0,5).length?players.slice(0,5).map((p,i)=>`
        <div class="lb-item">
          <div class="lb-rank ${rankClasses[i]}">#${p[0]}</div>
          <div class="lb-bot">
            <div class="lb-bot-name">${esc(p[1])}</div>
            <div class="lb-bot-author">${esc(p[3])} &nbsp;•&nbsp; <span style="opacity:.8">${esc(p[1])}</span></div>
          </div>
          <div class="lb-elo">${Number(p[4]).toLocaleString()}</div>
        </div>`).join('')
      :`<div class="empty">${t('noRankData')}</div>`}
    </div>
  </div>`;

  // Right Stack: Section 3 (Quick Start)
  const quickStartSection=`
  <div class="card scroll-focus-section" id="sec-quickstart">
    ${tcgFrameHTML()}
    <div class="section-head">
      <h3>${t('quickStartTitle')}</h3>
      <span class="chip gray">${t('quickStartChip')}</span>
    </div>
    <div class="quickstart">
      <div class="qs-steps">
        <div class="qs-step">
          <div class="qs-num">01</div>
          <div class="qs-content">
            <div class="qs-title">${t('step1Title')}</div>
            <div class="qs-desc">${t('step1Desc')}</div>
          </div>
        </div>
        <div class="qs-step">
          <div class="qs-num">02</div>
          <div class="qs-content">
            <div class="qs-title">${t('step2Title')}</div>
            <div class="qs-desc">${t('step2Desc')}</div>
          </div>
        </div>
        <div class="qs-step">
          <div class="qs-num">03</div>
          <div class="qs-content">
            <div class="qs-title">${t('step3Title')}</div>
            <div class="qs-desc">${t('step3Desc')}</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  const splitScrollLayout=`
  <div class="sticky-split-container">
    <div class="sticky-arena-column">
      ${miniBoardInteractiveHTML()}
    </div>
    <div class="scroll-content-column" id="scrollContentColumn">
      ${recentMatchesSection}
      ${miniLBSection}
      ${quickStartSection}
    </div>
  </div>`;

  return heroBanner +
    ornateDividerHTML(t('dividerStats')) +
    statCardsRow +
    ornateDividerHTML(t('dividerActivity')) +
    splitScrollLayout;
}

function rankTable(rows,mini=false){
  return `<div class="tablewrap"><table class="table">
    <thead>
      <tr>
        <th>${t('thRank')}</th>
        <th>${t('thCompetitor')}</th>
        <th>${t('thLang')}</th>
        <th>${t('thElo')}</th>
        <th>${t('thChange')}</th>
        ${mini?'':`<th>${t('thStatus')}</th>`}
      </tr>
    </thead>
    <tbody>
      ${rows.length?rows.map(p=>`
        <tr>
          <td><span class="rank ${p[0]==='01'?'gold':p[0]==='02'?'silver':p[0]==='03'?'bronze':''}">#${p[0]}</span></td>
          <td><div class="player">${avatar(p[2],p[6])}<span>${esc(p[1])}</span></div></td>
          <td><span class="chip ${p[3]==='Python'?'purplechip':p[3]==='C'?'orangec':'gray'}">${esc(p[3])}</span></td>
          <td><strong style="font-family:var(--font-game);font-size:15px;color:var(--accent)">${Number(p[4]).toLocaleString()}</strong></td>
          <td>${esc(p[5])}</td>
          ${mini?'':`<td><span class="chip">● ${t('statusActive')}</span></td>`}
        </tr>`).join('')
      :`<tr><td colspan="${mini?5:6}" class="empty">${t('noMatchingBots')}</td></tr>`}
    </tbody>
  </table></div>`;
}

function leaderboard(){
  const rows=players.filter(p=>(state.filter==='all'||state.filter==='All languages'||state.filter==='Tất cả ngôn ngữ'||p[3]===state.filter)&&(`${p[1]} ${p[3]}`.toLowerCase().includes(state.search.toLowerCase())));
  return header(t('lbHeroEyebrow'),t('lbHeroTitle'),t('lbHeroDesc'))+
  `<div class="stat-cards-row" style="margin-bottom:20px">
    <div class="stat-flip-card card-ranked-bots" style="height:210px">
      <div class="stat-flip-inner">
        <div class="stat-face front" style="justify-content:center;gap:8px">
          ${tcgFrameHTML()}
          <div class="stat-card-badge" style="align-self:center">${t('badgeRanked')}</div>
          <div class="stat-number-hero" style="font-size:36px">${countLabel(players.length)}</div>
          <div class="stat-card-title">${t('lbStatRanked')}</div>
          <div class="stat-card-foot">${t('lbStatRankedFoot')}</div>
        </div>
      </div>
    </div>
    <div class="stat-flip-card card-completed" style="height:210px">
      <div class="stat-flip-inner">
        <div class="stat-face front" style="justify-content:center;gap:8px">
          ${tcgFrameHTML()}
          <div class="stat-card-badge" style="align-self:center">${t('fanChampionTitle')}</div>
          <div class="stat-number-hero" style="font-size:36px">${players.length?esc(players[0][4]):'—'}</div>
          <div class="stat-card-title">${t('lbStatTopElo')}</div>
          <div class="stat-card-foot">${players.length?esc(players[0][1]):'—'}</div>
        </div>
      </div>
    </div>
    <div class="stat-flip-card card-matches" style="height:210px">
      <div class="stat-flip-inner">
        <div class="stat-face front" style="justify-content:center;gap:8px">
          ${tcgFrameHTML()}
          <div class="stat-card-badge" style="align-self:center">${t('thLang')}</div>
          <div class="stat-number-hero" style="font-size:36px">${countLabel(new Set(players.map(p=>p[3])).size)}</div>
          <div class="stat-card-title">${t('lbStatLangs')}</div>
          <div class="stat-card-foot">${t('lbStatLangsFoot')}</div>
        </div>
      </div>
    </div>
    <div class="stat-flip-card card-your-bots" style="height:210px">
      <div class="stat-flip-inner">
        <div class="stat-face front" style="justify-content:center;gap:8px">
          ${tcgFrameHTML()}
          <div class="stat-card-badge" style="align-self:center">${t('badgeYourBots')}</div>
          <div class="stat-number-hero" style="font-size:36px">${countLabel(state.submissions.length||3)}</div>
          <div class="stat-card-title">${t('statYourBots')}</div>
          <div class="stat-card-foot">${t('statYourBotsFoot')}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    ${tcgFrameHTML()}
    <div class="section-head">
      <h3>${t('lbHeroTitle')}</h3>
    </div>
    <div class="toolbar" style="padding:16px 20px 0">
      <input class="search" aria-label="${t('searchPlaceholder')}" placeholder="${t('searchPlaceholder')}" value="${esc(state.search)}" oninput="state.search=this.value;updateRankingTable()">
      <select class="select" aria-label="Filter" onchange="state.filter=this.value;updateRankingTable()">
        <option value="all">${t('allLangs')}</option>
        ${['Python','Java','C'].map(v=>`<option value="${v}" ${v===state.filter?'selected':''}>${v}</option>`).join('')}
      </select>
    </div>
    <div id="rankings">${rankTable(rows)}</div>
  </div>`;
}

function updateRankingTable(){
  const el=document.getElementById('rankings');
  if(el)el.innerHTML=rankTable(players.filter(p=>(state.filter==='all'||state.filter==='All languages'||state.filter==='Tất cả ngôn ngữ'||p[3]===state.filter)&&(`${p[1]} ${p[3]}`.toLowerCase().includes(state.search.toLowerCase()))));
}

function submissions(){
  const own=state.submissions||[];
  return header(t('subHeroEyebrow'),t('subHeroTitle'),t('subHeroDesc'),`<button class="btn" onclick="requestSubmissionUpload()">${svg('upload')} ${t('subUploadBtn')}</button>`)+
  `<div class="card" style="padding:24px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
    ${tcgFrameHTML()}
    <div>
      <span class="chip">${t('subLibraryChip')}</span>
      <h2 style="margin:10px 0 4px">${t('subLibraryTitle')}</h2>
      <div style="color:var(--text-muted);font-size:13px">${t('subLibraryDesc')}</div>
    </div>
    <button class="btn" onclick="requestSubmissionUpload()">${t('subUploadBtn')} ${svg('arrow')}</button>
  </div>
  <div class="card">
    ${tcgFrameHTML()}
    <div class="section-head">
      <h3>${t('subHistory')}</h3>
    </div>
    <div class="tablewrap"><table class="table">
      <thead>
        <tr>
          <th>${t('thSubId')}</th>
          <th>${t('thBotName')}</th>
          <th>${t('thSource')}</th>
          <th>${t('thLang')}</th>
          <th>${t('thDate')}</th>
          <th>${t('thVersion')}</th>
          <th>${t('thStatus')}</th>
          <th style="text-align:right">${t('thActions')}</th>
        </tr>
      </thead>
      <tbody>
        ${own.length?own.map(b=>`
          <tr>
            <td class="strong" style="color:var(--accent)">${esc(b.id)}</td>
            <td>
              <strong style="color:var(--text-title);display:inline-flex;align-items:center;gap:6px">
                <span style="color:var(--accent)">🤖</span>
                <span>${esc(b.botName || b.name)}</span>
              </strong>
            </td>
            <td><code style="font-size:12px;color:var(--text-muted)">${esc(b.name)}</code></td>
            <td><span class="chip ${b.lang==='Python'?'purplechip':b.lang==='C'?'orangec':'gray'}">${esc(b.lang)}</span></td>
            <td>${esc(b.date)}</td>
            <td>${esc(b.version)}</td>
            <td><span class="chip">● ${esc(submissionStatusLabel(b.status))}</span></td>
            <td style="text-align:right">
              <div style="display:inline-flex;gap:6px;align-items:center;justify-content:flex-end">
                <button class="btn secondary" style="padding:4px 10px;font-size:12px;height:28px;gap:5px" onclick="openRenameModal('${esc(b.id)}', '${esc((b.botName||b.name).replace(/'/g, "\\'"))}')" title="${t('renameBotBtn')}">
                  ${svg('edit', 13)} <span>${t('renameBotBtn')}</span>
                </button>
                <button class="btn danger-outline" style="padding:4px 10px;font-size:12px;height:28px;gap:5px" onclick="confirmDeleteBot('${esc(b.id)}', '${esc((b.botName||b.name).replace(/'/g, "\\'"))}')" title="${t('deleteBotBtn')}">
                  ${svg('trash', 13)} <span>${t('deleteBotBtn')}</span>
                </button>
              </div>
            </td>
          </tr>`).join('')
        :`<tr><td colspan="8" class="empty">${t('noSubmissions')}</td></tr>`}
      </tbody>
    </table></div>
  </div>
  <div class="card" style="margin-top:20px" id="playerBotMatchesCard">
    ${tcgFrameHTML()}
    <div class="section-head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div>
        <h3>${t('playerMatchesTitle')}</h3>
        <p class="small muted" style="margin:4px 0 0">${t('playerMatchesDesc')}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="field" style="height:32px;font-size:12px;width:200px;padding:4px 10px;font-family:monospace" placeholder="${t('searchMatchPlaceholder')}" oninput="state.playerMatchSearch=this.value;render()" value="${esc(state.playerMatchSearch||'')}">
      </div>
    </div>
    <div class="tablewrap" id="playerMatchesTableWrap">
      ${renderPlayerMatchesTable()}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin-top:20px">
    <div class="card" style="padding:20px">
      ${tcgFrameHTML()}
      <h3>${t('subBox1Title')}</h3>
      <p style="color:var(--text-muted);font-size:13px;line-height:1.6;margin:10px 0">${t('subBox1Desc')}</p>
      <div class="notice">${t('subBox1Notice')}</div>
    </div>
    <div class="card" style="padding:20px">
      ${tcgFrameHTML()}
      <h3>${t('subBox2Title')}</h3>
      <p style="color:var(--text-muted);font-size:13px;line-height:1.6;margin:10px 0">${t('subBox2Desc')}</p>
      <button class="btn secondary" onclick="go('play')">${t('goToPlay')} ${svg('arrow')}</button>
    </div>
  </div>`;
}

function arena(){
  const completed=matches.filter(x=>x.status==='completed');
  let m=completed.find(x=>x.id===state.selectedMatch)||completed[0];
  if(!m)return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'))+emptyCard(t('noReplay'),t('noReplayDesc'));
  state.selectedMatch=m.id;
  let rep=buildReplay(m.id);
  if(!rep)return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'))+`<div class="card" style="padding:32px;text-align:center">${tcgFrameHTML()}<h2>${t('replayNotLoaded')}</h2><p style="color:var(--text-muted)">${t('replayNotLoadedDesc')}</p><button class="btn secondary" onclick="openServerMatch('${esc(m.id)}')">${t('loadReplay')}</button></div>`;
  state.play=Math.min(state.play,rep.events.length);
  const last=rep.events[state.play-1];
  return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'),`<button class="btn secondary" onclick="resetReplay()">${svg('reset')} ${t('replayBtn')}</button>`)+
  `<div class="toolbar" style="flex-wrap:wrap;gap:10px">
    <select class="select" onchange="openMatch(this.value)">
      ${completed.map(x=>`<option value="${x.id}" ${m.id===x.id?'selected':''}>${x.id} • ${x.a} vs ${x.b}</option>`).join('')}
    </select>
    <form class="row" style="gap:6px" onsubmit="searchAndOpenMatch(event, document.getElementById('arenaSearchMatchInput').value)">
      <input class="field" id="arenaSearchMatchInput" placeholder="${t('searchMatchPlaceholder')}" style="height:36px;padding:4px 10px;font-size:12px;width:180px;font-family:monospace">
      <button class="btn sm secondary" type="submit" style="height:36px">${svg('search',13)} ${t('searchMatchBtn')}</button>
    </form>
    <button class="btn sm secondary" onclick="openMatchDetailModal('${esc(m.id)}')" title="${t('viewDetailBtn')}">${svg('eye',13)} ${t('viewDetailBtn')}</button>
    <span class="chip purplechip">${t('matchReplayChip')}</span>
    <span class="chip gray">${t('subChipRPS')}</span>
  </div>
  <div class="arena-layout">
    <div class="card arena-stage">
      ${tcgFrameHTML()}
      <div class="fightbar">
        <div class="fighter">
          ${avatar(m.a.split(' ').map(x=>x[0]).join(''),'orange')}
          <b>${m.a}</b>
          <small>${t('goldPlayer')} • h8 • ${state.play%2===0?t('turnActive'):t('turnWaiting')}</small>
        </div>
        <div class="vs">VS</div>
        <div class="fighter">
          ${avatar(m.b.split(' ').map(x=>x[0]).join(''),'purple')}
          <b>${m.b}</b>
          <small>${t('bluePlayer')} • a1 • ${state.play%2===1?t('turnActive'):t('turnWaiting')}</small>
        </div>
      </div>
      <div class="boardwrap">${board()}</div>
      <div class="replay-controls">
        <div class="row between small">
          <span class="muted">${t('turnWord')} ${state.play} / ${rep.events.length}</span>
          <span class="muted">${last?`${last.owner==='p1'?t('goldPlayer'):t('bluePlayer')}: ${ottCoord(last.from)} → ${ottCoord(last.to)}${last.capture?t('captureWord'):''}`:t('readyToStart')}</span>
        </div>
        <div class="progress">
          <div style="width:${state.play/Math.max(1,rep.events.length)*100}%"></div>
        </div>
        <div class="controlbar">
          <button onclick="step(-1)" title="${t('prevTurn')}">◂◂</button>
          <button class="primary" onclick="togglePlay()" title="${t('playPause')}">${svg(state.playing?'pause':'play')}</button>
          <button onclick="step(1)" title="${t('nextTurn')}">▸▸</button>
          <button onclick="state.speed=state.speed===1?2:state.speed===2?4:1;render()">${state.speed}×</button>
          <button onclick="resetReplay()" title="${t('restart')}">${svg('reset',15)}</button>
        </div>
      </div>
    </div>
    <div>
      <div class="card" style="padding:18px;margin-bottom:18px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 10px">
          <h3>${t('rulesTitle')}</h3>
          <span class="chip">8 × 8</span>
        </div>
        <div class="ott-rules" style="padding:10px 0 0">
          <div class="notice" style="margin-bottom:10px">
            <strong>${t('rulesRPS')}</strong>
          </div>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.6">${t('rulesBody1')}</p>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.6">${t('rulesBody2')}</p>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.6;margin:0">${t('rulesBody3')}</p>
        </div>
      </div>
      <div class="card" style="padding:18px;margin-bottom:18px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 10px">
          <h3>${t('matchInfoTitle')}</h3>
          <span class="chip gray">REPLAY</span>
        </div>
        <div style="font-size:12px;font-family:var(--font-mono);color:var(--text-muted);line-height:2.1;padding-top:8px">
          <div class="row between"><span>${t('thSubId')}</span><strong style="color:var(--text-title)">${m.id}</strong></div>
          <div class="row between"><span>${t('gameLabel')}</span><strong style="color:var(--text-title)">OTT RPS 8×8</strong></div>
          <div class="row between"><span>${t('limitLabel')}</span><strong style="color:var(--text-title)">${esc(m.maxMoves||rep.maxMoves||200)} ${t('turnsUnit')}</strong></div>
          <div class="row between"><span>${t('turnsPlayedLabel')}</span><strong style="color:var(--text-title)">${state.play}</strong></div>
          <div class="row between"><span>${t('matchResultLabel')}</span><strong style="color:var(--accent)">${state.play<rep.events.length?t('inProgressVal'):rep.winner?(rep.winner==='p1'?t('goldWinsVal'):t('blueWinsVal')):t('drawVal')}</strong></div>
        </div>
      </div>
      <div class="card" style="padding:18px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 10px">
          <h3>${t('turnLogTitle')}</h3>
          <span class="small muted">${state.play} ${t('turnsUnit')}</span>
        </div>
        <div id="timeline" style="padding-top:8px">${eventLog()}</div>
      </div>
    </div>
  </div>`;
}

function eventLog(){
  const rep=buildReplay(state.selectedMatch);
  if(!rep)return `<div class="logline">${t('pressPlayToWatch')}</div>`;
  return rep.events.slice(Math.max(0,state.play-6),state.play).reverse().map((e,i)=>`
    <div class="logline">
      <span>#${String(state.play-i).padStart(3,'0')}</span>
      <strong>${e.owner==='p1'?t('goldPlayer'):t('bluePlayer')}</strong> ${OTT_SIGNS[e.unit]} ${ottCoord(e.from)} → ${ottCoord(e.to)} ${e.capture?` • ⚔ ${t('capturesWord')} `+OTT_SIGNS[e.captured]:''}
    </div>`).join('')||`<div class="logline">${t('pressPlayToWatch')}</div>`;
}

function resetReplay(){state.play=0;state.playing=false;clearInterval(timer);render()}
function step(delta){
  const rep=buildReplay(state.selectedMatch);
  if(!rep)return;
  let oldPositions={};
  document.querySelectorAll('[data-piece-id]').forEach(el=>{oldPositions[el.dataset.pieceId]=el.getBoundingClientRect()});
  state.play=Math.min(rep.events.length,Math.max(0,state.play+delta));
  if(state.play===rep.events.length)state.playing=false;
  render();
  if(delta===1){
    document.querySelectorAll('[data-piece-id]').forEach(el=>{
      const before=oldPositions[el.dataset.pieceId];
      if(!before)return;
      const after=el.getBoundingClientRect();
      const dx=before.left-after.left,dy=before.top-after.top;
      if((dx||dy)&&Math.abs(dx)<600&&Math.abs(dy)<600){
        el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:Math.max(170,420/state.speed),easing:'ease-in-out'});
      }
    });
  }
}

let timer;
function togglePlay(){
  const rep=buildReplay(state.selectedMatch);
  if(!rep)return;
  if(state.play>=rep.events.length)state.play=0;
  state.playing=!state.playing;
  render();
  clearInterval(timer);
  if(state.playing){
    timer=setInterval(()=>{
      if(!state.playing||state.page!=='arena'){clearInterval(timer);return}
      step(1);
    },650/state.speed);
  }
}
function openMatch(id){
  state.selectedMatch=id;state.play=0;state.playing=false;clearInterval(timer);go('arena');
}

function tournaments(){
  return header(t('tournamentsEyebrow'),t('tournamentsTitle'),t('tournamentsDesc'))+emptyCard(t('tournamentNotOpen'),t('tournamentNotOpenDesc'));
}

function submittedBotsPanel(){
  const loggedIn=typeof authState!=='undefined'&&authState.authenticated;
  if(!loggedIn)return `
  <div class="card" style="padding:32px;text-align:center">
    ${tcgFrameHTML()}
    <h2 style="margin-bottom:8px">${t('loginToPlay')}</h2>
    <p style="color:var(--text-muted);margin-bottom:20px">${t('loginToPlayDesc')}</p>
    <button class="btn" onclick="openLoginPage()">${t('signIn')}</button>
  </div>`;
  const own=(state.submissions||[]).filter(b=>b.userId===authState.id);
  const selected=own.some(b=>b.id===state.challengeBotId)?state.challengeBotId:own[0]?.id;
  const enabled=state.challengeReady&&state.dataStatus==='ready'&&own.length>0&&!state.challengePending;
  const message=state.challengePending?t('findingMatch'):state.dataStatus!=='ready'?t('dataError'):!state.challengeReady?t('contestClosed'):!own.length?t('needBotFirst'):t('challengeNotice');
  return `
  <div class="card" style="padding:24px">
    ${tcgFrameHTML()}
    <div class="section-head" style="padding:0 0 14px">
      <div>
        <h3>${t('challengeArenaTitle')}</h3>
        <p class="small muted" style="margin:6px 0 0">${t('challengeArenaDesc')}</p>
      </div>
    </div>
    <div class="notice" id="challengeStatus" style="margin:16px 0">${esc(message)}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:16px 0">
      <div class="form-group">
        <label class="form-label" for="challengeBot">${t('myBotLabel')}</label>
        <select id="challengeBot" class="field" onchange="state.challengeBotId=this.value" ${!own.length||state.challengePending?'disabled':''}>
          ${own.length?own.map(b=>`<option value="${esc(b.id)}" ${b.id===selected?'selected':''}>${esc(b.botName ? `${b.botName} (${b.name})` : b.name)} • ${esc(b.lang)} • ${esc(b.version)}</option>`).join(''):`<option value="">${t('noBotAvailable')}</option>`}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${t('opponentLabel')}</label>
        <div class="field" style="display:flex;align-items:center;color:var(--text-muted)">${t('opponentAutoVal')}</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="challengeMaxMoves">${t('maxMovesLabel')}</label>
        <input id="challengeMaxMoves" class="field" type="number" min="1" max="1000" value="${Number(state.maxMoves)||200}" onchange="state.maxMoves=Number(this.value)" ${!enabled?'disabled':''}>
      </div>
    </div>
    <div class="row" style="flex-wrap:wrap;gap:10px">
      <button class="btn btn-accent" id="challengeBtn" onclick="challengeMatch()" ${!enabled?'disabled':''}>${svg('play')} ${state.challengePending?t('findingMatch'):state.challengeReady?t('findMatch'):t('contestClosed')}</button>
      <button class="btn secondary" onclick="requestSubmissionUpload()">${svg('upload')} ${t('uploadNewBot')}</button>
      <button class="btn secondary" onclick="retryArenaData()" ${state.challengePending?'disabled':''}>${t('reload')}</button>
    </div>
  </div>`;
}

function play(){return header(t('playHeroEyebrow'),t('playHeroTitle'),t('playHeroDesc'))+submittedBotsPanel();}

function admin(){
  if(typeof authState==='undefined'||!authState.authenticated)return header(t('adminEyebrow'),t('adminTitle'),t('adminDesc'))+emptyCard(t('needLogin'),t('needLoginDesc'));
  if(!['JUDGE','ADMIN'].includes(authState.role))return header(t('adminEyebrow'),t('adminTitle'),t('adminDesc'))+emptyCard(t('noPermission'),t('noPermissionDesc'));
  return header(t('adminEyebrow'),t('adminMatchesTitle'),t('adminMatchesDesc'))+adminMatchesPanel();
}

function uploadModal(){
  return `<div class="modaloverlay" onclick="if(event.target===this){state.modal=null;render()}">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      ${tcgFrameHTML()}
      <div class="modal-head">
        <div>
          <div class="hero-eyebrow-chip">${t('modalEyebrow')}</div>
          <h2 id="modal-title" style="margin-top:6px">${t('modalTitle')}</h2>
        </div>
        <button class="iconbtn" onclick="state.modal=null;render()">${svg('close')}</button>
      </div>
      <form onsubmit="saveSubmission(event)">
        <div class="form-group" style="margin-bottom:14px">
          <label class="form-label" for="uploadBotName">${t('modalBotName')}</label>
          <input class="field" id="uploadBotName" placeholder="${t('modalBotNamePlaceholder')}" maxlength="50">
          <p class="small muted" style="margin:4px 0 0;font-size:11.5px">${t('modalBotNameHelp')}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">${t('modalLang')}</label>
            <select id="uploadLang" class="field" required>
              <option>Python</option>
              <option>Java</option>
              <option>C</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">${t('modalVersion')}</label>
            <input class="field" id="uploadVersion" value="v4.0" maxlength="25" required>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:14px">
          <label class="form-label">${t('modalSource')}</label>
          <div class="dropzone" onclick="document.getElementById('sourceFile').click()">
            <div class="big" style="color:var(--accent);font-size:24px;line-height:1">⇧</div>
            <strong id="fileLabel" style="color:var(--text-title);font-size:13.5px">${t('modalChooseFile')}</strong>
            <p style="color:var(--text-muted);font-size:11.5px;margin:2px 0 0">${t('modalFileHelp')}</p>
            <input id="sourceFile" type="file" accept=".py,.java,.c" style="display:none" onchange="onSourceFileSelected(this)" required>
          </div>
        </div>
        <div class="notice" style="margin-bottom:14px;font-size:12px;padding:8px 14px">${t('modalNotice')}</div>
        <div class="modal-actions-sticky row" style="justify-content:flex-end;gap:10px">
          <button class="btn secondary" type="button" onclick="state.modal=null;render()">${t('modalCancel')}</button>
          <button class="btn btn-accent" type="submit">${t('modalSubmit')} ${svg('arrow')}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function onSourceFileSelected(input){
  const file = input.files?.[0];
  state.selectedFile = file || null;
  const label = document.getElementById('fileLabel');
  if(label) label.textContent = file ? file.name : t('modalChooseFile');
  const nameInput = document.getElementById('uploadBotName');
  if(file && nameInput && !nameInput.value.trim()){
    const base = file.name.replace(/\.[^/.]+$/, '');
    nameInput.value = base;
  }
}
window.onSourceFileSelected = onSourceFileSelected;

async function saveSubmission(e){
  e.preventDefault();
  let f=document.getElementById('sourceFile').files[0];
  if(!f)return notice(t('selectSourceNotice'));
  let lang=document.getElementById('uploadLang').value;
  let ext=f.name.split('.').pop().toLowerCase();
  if(!['py','java','c'].includes(ext))return notice(t('singleExtNotice'));
  if((ext==='py'&&lang!=='Python')||(ext==='java'&&lang!=='Java')||(ext==='c'&&lang!=='C'))return notice(t('langMismatchNotice'));
  const botName = (document.getElementById('uploadBotName')?.value || '').trim() || f.name.replace(/\.[^/.]+$/, '');
  try{
    const content=await f.text();
    await api.post('/submissions',{name:f.name,botName,lang,version:document.getElementById('uploadVersion').value,content});
    state.modal=null;state.selectedFile=null;
    if(typeof loadBackend==='function')await loadBackend();
    notice(t('uploadSuccessNotice'));
    render();
  }catch(err){notice(t('uploadFailNotice')+err.message)}
}

function renameModal(){
  const bot = state.editingBot;
  if(!bot) return '';
  return `<div class="modaloverlay" onclick="if(event.target===this){state.modal=null;state.editingBot=null;render()}">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="rename-modal-title" style="max-width:440px">
      ${tcgFrameHTML()}
      <div class="modal-head">
        <div>
          <div class="hero-eyebrow-chip">${t('subLibraryChip')}</div>
          <h2 id="rename-modal-title" style="margin-top:6px">${t('renameModalTitle')}</h2>
        </div>
        <button class="iconbtn" onclick="state.modal=null;state.editingBot=null;render()">${svg('close')}</button>
      </div>
      <form onsubmit="submitRenameBot(event)">
        <p class="small muted" style="margin-bottom:14px">${t('renameModalDesc')}</p>
        <div class="form-group" style="margin-bottom:14px">
          <label class="form-label" for="renameBotNameInput">${t('modalBotName')}</label>
          <input class="field" id="renameBotNameInput" value="${esc(bot.name)}" maxlength="50" required autofocus>
          <p class="small muted" style="margin:4px 0 0;font-size:11.5px">${t('thSubId')}: <code>${esc(bot.id)}</code></p>
        </div>
        <div class="modal-actions-sticky row" style="justify-content:flex-end;gap:10px;margin-top:16px">
          <button class="btn secondary" type="button" onclick="state.modal=null;state.editingBot=null;render()">${t('modalCancel')}</button>
          <button class="btn btn-accent" type="submit">${svg('check',14)} ${t('renameSaveBtn')}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function deleteConfirmModal(){
  const bot = state.deletingBot;
  if(!bot) return '';
  const desc = t('deleteConfirmDesc').replace('{name}', esc(bot.name)).replace('{id}', esc(bot.id));
  return `<div class="modaloverlay" onclick="if(event.target===this){state.modal=null;state.deletingBot=null;render()}">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" style="max-width:440px">
      ${tcgFrameHTML()}
      <div class="modal-head">
        <div>
          <div class="hero-eyebrow-chip" style="color:#F87171;border-color:rgba(239,68,68,0.3)">${t('deleteBotBtn').toUpperCase()}</div>
          <h2 id="delete-modal-title" style="margin-top:6px">${t('deleteConfirmTitle')}</h2>
        </div>
        <button class="iconbtn" onclick="state.modal=null;state.deletingBot=null;render()">${svg('close')}</button>
      </div>
      <p style="color:var(--text-body);margin:14px 0 16px;line-height:1.6;font-size:13.5px">
        ${desc}
      </p>
      <div class="notice" style="border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.08);margin-bottom:18px;color:#FCA5A5;font-size:12px">
        ⚠ ${state.lang==='vi'?'Hành động này không thể hoàn tác. File mã nguồn của bot sẽ bị gỡ bỏ khỏi hệ thống.':'This action cannot be undone. Bot source code files will be permanently removed.'}
      </div>
      <div class="modal-actions-sticky row" style="justify-content:flex-end;gap:10px">
        <button class="btn secondary" type="button" onclick="state.modal=null;state.deletingBot=null;render()">${t('modalCancel')}</button>
        <button class="btn danger" type="button" onclick="submitDeleteBot('${esc(bot.id)}')">${svg('trash',14)} ${t('deleteConfirmBtn')}</button>
      </div>
    </div>
  </div>`;
}

function openRenameModal(id, currentName){
  state.editingBot = { id, name: currentName };
  state.modal = 'rename';
  render();
  setTimeout(()=>{
    const el = document.getElementById('renameBotNameInput');
    if(el){ el.focus(); el.select(); }
  }, 60);
}
window.openRenameModal = openRenameModal;

async function submitRenameBot(e){
  e.preventDefault();
  if(!state.editingBot) return;
  const newName = (document.getElementById('renameBotNameInput')?.value || '').trim();
  if(!newName) return notice(t('botNameEmptyNotice') || 'Vui lòng nhập tên bot.');
  const id = state.editingBot.id;
  try {
    if(typeof api !== 'undefined' && api.patch){
      await api.patch(`/submissions/${id}`, { botName: newName });
    }
    const target = (state.submissions||[]).find(b=>b.id === id);
    if(target) target.botName = newName;
    state.modal = null;
    state.editingBot = null;
    if(typeof loadBackend === 'function') await loadBackend();
    notice(t('renameSuccess'));
    render();
  } catch(err) {
    notice(t('renameFail') + (err.message || err));
  }
}
window.submitRenameBot = submitRenameBot;

function confirmDeleteBot(id, currentName){
  state.deletingBot = { id, name: currentName };
  state.modal = 'delete';
  render();
}
window.confirmDeleteBot = confirmDeleteBot;

async function submitDeleteBot(id){
  try {
    if(typeof api !== 'undefined' && api.delete){
      await api.delete(`/submissions/${id}`);
    }
    state.submissions = (state.submissions||[]).filter(b=>b.id !== id);
    state.modal = null;
    state.deletingBot = null;
    if(typeof loadBackend === 'function') await loadBackend();
    notice(t('deleteSuccess'));
    render();
  } catch(err) {
    notice(t('deleteFail') + (err.message || err));
  }
}
window.submitDeleteBot = submitDeleteBot;

/* =====================================================
   MATCH HISTORY & ADMIN DASHBOARD
   ===================================================== */
function getPlayerBotMatches(){
  const ownSubmissions = state.submissions || [];
  const ownSubIds = new Set(ownSubmissions.map(s => s.id));
  const ownNames = new Set(ownSubmissions.flatMap(s => [s.name, s.botName].filter(Boolean)));
  const username = typeof authState !== 'undefined' ? authState.username : null;
  const userId = typeof authState !== 'undefined' ? authState.id : null;

  return (matches || []).filter(m => {
    if (m.submissionA && ownSubIds.has(m.submissionA)) return true;
    if (m.submissionB && ownSubIds.has(m.submissionB)) return true;
    if (ownNames.has(m.a) || ownNames.has(m.b)) return true;
    if (username && m.ownedBy === username) return true;
    if (userId && m.createdById === userId) return true;
    return false;
  });
}
window.getPlayerBotMatches = getPlayerBotMatches;

function renderPlayerMatchesTable(){
  const ownMatches = getPlayerBotMatches();
  const searchQ = (state.playerMatchSearch || '').trim().toLowerCase();
  const ownSubmissions = state.submissions || [];
  const ownNames = new Set(ownSubmissions.flatMap(s => [s.name, s.botName].filter(Boolean)));

  const filtered = ownMatches.filter(m => {
    if (!searchQ) return true;
    const str = `${m.id} ${m.a} ${m.b} ${m.status}`.toLowerCase();
    return str.includes(searchQ);
  });

  if (!filtered.length) {
    return `<div style="padding:28px;text-align:center">
      <div style="color:var(--text-muted);margin-bottom:10px;font-size:13.5px">${t('noPlayerMatches')}</div>
      <p style="color:var(--text-dim);font-size:12.5px;margin-bottom:16px">${t('noPlayerMatchesDesc')}</p>
      <button class="btn secondary" onclick="go('play')">${t('goToPlay')} ${svg('arrow')}</button>
    </div>`;
  }

  return `<table class="table">
    <thead>
      <tr>
        <th>${t('matchIdLabel')}</th>
        <th>${t('myBotSide')}</th>
        <th>${t('opponentBot')}</th>
        <th>${t('thResult')}</th>
        <th>${t('thTurns')}</th>
        <th>${t('thTime')}</th>
        <th style="text-align:right">${t('thActions')}</th>
      </tr>
    </thead>
    <tbody>
      ${filtered.map(m => {
        const isP1 = ownNames.has(m.a) || (m.submissionA && ownSubmissions.some(s => s.id === m.submissionA));
        const myName = isP1 ? m.a : m.b;
        const mySide = isP1 ? '🟡 Vàng (P1)' : '🔵 Xanh (P2)';
        const oppName = isP1 ? m.b : m.a;
        const oppSide = isP1 ? '🔵 Xanh (P2)' : '🟡 Vàng (P1)';

        const isCompleted = m.status === 'completed';
        let outcomeBadge = `<span class="chip yellow">● ${esc(m.status)}</span>`;
        if (isCompleted) {
          if ((isP1 && m.winner === 'p1') || (!isP1 && m.winner === 'p2')) {
            outcomeBadge = `<span class="chip" style="color:#4ADE80;border-color:rgba(74,222,128,0.4)">🏆 ${t('fanChampionBadge') || 'Thắng'}</span>`;
          } else if (m.winner === 'draw' || !m.winner) {
            outcomeBadge = `<span class="chip gray">Hòa</span>`;
          } else {
            outcomeBadge = `<span class="chip red">Thua</span>`;
          }
        } else if (m.status === 'failed') {
          outcomeBadge = `<span class="chip red">Lỗi</span>`;
        }

        return `
        <tr>
          <td>
            <button class="btn sm secondary" style="padding:2px 8px;font-size:11.5px;font-family:monospace;height:26px" onclick="openMatchDetailModal('${esc(m.id)}')">
              ${esc(m.id)}
            </button>
          </td>
          <td>
            <strong style="color:var(--text-title)">${esc(myName)}</strong>
            <small class="muted" style="display:block;font-size:11px">${mySide}</small>
          </td>
          <td>
            <strong style="color:var(--text-muted)">${esc(oppName)}</strong>
            <small class="muted" style="display:block;font-size:11px">${oppSide}</small>
          </td>
          <td>${outcomeBadge}</td>
          <td><code>${m.turns || 0}</code></td>
          <td style="font-size:12px;color:var(--text-muted)">${esc(m.time || m.createdAt || '—')}</td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:6px;align-items:center;justify-content:flex-end">
              <button class="btn secondary" style="padding:4px 8px;font-size:11.5px;height:28px;gap:4px" onclick="openMatchDetailModal('${esc(m.id)}')" title="${t('viewDetailBtn')}">
                ${svg('eye', 13)} <span>${t('viewDetailBtn')}</span>
              </button>
              ${isCompleted ? `
                <button class="btn btn-accent" style="padding:4px 8px;font-size:11.5px;height:28px;gap:4px" onclick="openMatch('${esc(m.id)}')" title="${t('watchReplayBtn')}">
                  ${svg('play', 13)} <span>Replay</span>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}
window.renderPlayerMatchesTable = renderPlayerMatchesTable;

function adminMatchesPanel(){
  const all = matches || [];
  const searchQ = (state.adminMatchSearch || '').trim().toLowerCase();
  const filter = state.adminMatchStatusFilter || 'all';

  const completedCount = all.filter(m => m.status === 'completed').length;
  const queuedCount = all.filter(m => ['queued','running','pending'].includes(m.status)).length;
  const failedCount = all.filter(m => m.status === 'failed').length;

  const filtered = all.filter(m => {
    if (filter === 'completed' && m.status !== 'completed') return false;
    if (filter === 'queued' && !['queued','running','pending'].includes(m.status)) return false;
    if (filter === 'failed' && m.status !== 'failed') return false;
    if (searchQ) {
      const matchStr = `${m.id} ${m.a} ${m.b} ${m.ownedBy||''} ${m.mode||''}`.toLowerCase();
      if (!matchStr.includes(searchQ)) return false;
    }
    return true;
  });

  return `
  <!-- Stats Bar -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px">
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      ${tcgFrameHTML()}
      <div style="font-size:24px;color:var(--accent)">⚔</div>
      <div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${t('statTotalMatches')}</div>
        <div style="font-size:22px;font-weight:800;color:var(--text-title);font-family:var(--font-heading)">${all.length}</div>
      </div>
    </div>
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      ${tcgFrameHTML()}
      <div style="font-size:24px;color:#4ADE80">✓</div>
      <div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${t('statCompletedMatches')}</div>
        <div style="font-size:22px;font-weight:800;color:#4ADE80;font-family:var(--font-heading)">${completedCount}</div>
      </div>
    </div>
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      ${tcgFrameHTML()}
      <div style="font-size:24px;color:#FACC15">⏳</div>
      <div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${t('statQueuedMatches')}</div>
        <div style="font-size:22px;font-weight:800;color:#FACC15;font-family:var(--font-heading)">${queuedCount}</div>
      </div>
    </div>
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      ${tcgFrameHTML()}
      <div style="font-size:24px;color:#F87171">⚠</div>
      <div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${t('statFailedMatches')}</div>
        <div style="font-size:22px;font-weight:800;color:#F87171;font-family:var(--font-heading)">${failedCount}</div>
      </div>
    </div>
  </div>

  <!-- Admin Matches Table Card -->
  <div class="card">
    ${tcgFrameHTML()}
    <div class="section-head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
      <div>
        <span class="chip purplechip">ADMIN CONSOLE</span>
        <h3 style="margin:6px 0 0">${t('adminMatchesTitle')}</h3>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <!-- Search bar -->
        <div style="display:flex;align-items:center;position:relative">
          <input class="field" id="adminMatchSearchInput" style="height:34px;font-size:12.5px;width:220px;padding:4px 10px;font-family:monospace" placeholder="${t('searchMatchPlaceholder')}" value="${esc(state.adminMatchSearch||'')}" oninput="state.adminMatchSearch=this.value;render()">
        </div>
        <!-- Status Filter -->
        <select class="field" style="height:34px;font-size:12px;width:auto;padding:4px 10px" onchange="state.adminMatchStatusFilter=this.value;render()">
          <option value="all" ${filter==='all'?'selected':''}>${t('filterAll')}</option>
          <option value="completed" ${filter==='completed'?'selected':''}>${t('filterCompleted')}</option>
          <option value="queued" ${filter==='queued'?'selected':''}>${t('filterQueued')}</option>
          <option value="failed" ${filter==='failed'?'selected':''}>${t('filterFailed')}</option>
        </select>
        <button class="btn sm secondary" onclick="retryArenaData()" style="height:34px;font-size:12px">${t('reload')}</button>
      </div>
    </div>

    <div class="tablewrap"><table class="table">
      <thead>
        <tr>
          <th>${t('matchIdLabel')}</th>
          <th>${t('thP1')}</th>
          <th>${t('thP2')}</th>
          <th>${t('thCreator')}</th>
          <th>${t('statusLabel')} / ${t('thResult')}</th>
          <th>${t('thTurns')}</th>
          <th>${t('thTime')}</th>
          <th style="text-align:right">${t('thActions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.length ? filtered.map(m => {
          const isCompleted = m.status === 'completed';
          const isFailed = m.status === 'failed';
          const statusChip = isCompleted
            ? `<span class="chip ${m.winner==='p1'?'orangec':m.winner==='p2'?'blue':'gray'}">${m.winner==='p1'?'🟡 P1 Win':m.winner==='p2'?'🔵 P2 Win':'Draw'} (${m.score || '1-0'})</span>`
            : isFailed
            ? `<span class="chip red">Failed</span>`
            : `<span class="chip yellow">● ${esc(m.status)}</span>`;

          return `
          <tr>
            <td>
              <button class="btn sm secondary" style="padding:2px 8px;font-size:11.5px;font-family:monospace;height:26px" onclick="openMatchDetailModal('${esc(m.id)}')">
                ${esc(m.id)}
              </button>
            </td>
            <td>
              <strong style="color:#FDE047">🟡 ${esc(m.a)}</strong>
            </td>
            <td>
              <strong style="color:#7DD3FC">🔵 ${esc(m.b)}</strong>
            </td>
            <td><span class="muted" style="font-size:12px">${esc(m.ownedBy || '—')}</span></td>
            <td>${statusChip}</td>
            <td><code>${m.turns || 0} / ${m.maxMoves || 200}</code></td>
            <td style="font-size:12px;color:var(--text-muted)">${esc(m.time || m.createdAt || '—')}</td>
            <td style="text-align:right">
              <div style="display:inline-flex;gap:6px;align-items:center;justify-content:flex-end">
                <button class="btn secondary" style="padding:4px 8px;font-size:11.5px;height:28px;gap:4px" onclick="openMatchDetailModal('${esc(m.id)}')" title="${t('viewDetailBtn')}">
                  ${svg('eye', 13)} <span>${t('viewDetailBtn')}</span>
                </button>
                ${isCompleted ? `
                  <button class="btn secondary" style="padding:4px 8px;font-size:11.5px;height:28px;gap:4px" onclick="openMatch('${esc(m.id)}')" title="${t('watchReplayBtn')}">
                    ${svg('play', 13)} <span>Replay</span>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="8" class="empty">${t('noMatches')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
}
window.adminMatchesPanel = adminMatchesPanel;

function copyMatchIdToClipboard(id){
  if(typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(id).then(()=>notice(t('copied'))).catch(()=>notice(id));
  } else {
    notice(id);
  }
}
window.copyMatchIdToClipboard = copyMatchIdToClipboard;

function openMatchDetailModal(matchOrId){
  let m = typeof matchOrId === 'string' ? (matches||[]).find(x => x.id === matchOrId) : matchOrId;
  if(!m && typeof matchOrId === 'string'){
    m = { id: matchOrId, a: 'Player 1', b: 'Player 2', status: 'unknown' };
  }
  if(!m) return;
  state.viewingMatch = m;
  state.modal = 'matchDetail';
  render();
}
window.openMatchDetailModal = openMatchDetailModal;

async function searchAndOpenMatch(e, id){
  if(e && e.preventDefault) e.preventDefault();
  const rawId = String(id || '').trim().toUpperCase();
  if(!rawId) return notice(t('searchMatchPlaceholder'));

  let found = (matches || []).find(m => m.id.toUpperCase() === rawId || m.id.toUpperCase().includes(rawId));

  if(!found && typeof api !== 'undefined' && api.get){
    try {
      const serverRec = await api.get('/matches/' + encodeURIComponent(rawId));
      if(serverRec && serverRec.id){
        found = {
          ...serverRec,
          score: serverRec.status === 'completed' ? (serverRec.winner === 'p1' ? '1 – 0' : serverRec.winner === 'p2' ? '0 – 1' : '0.5 – 0.5') : serverRec.status,
          time: new Date(serverRec.createdAt).toLocaleString('en-US'),
          turns: serverRec.turns || 0
        };
      }
    } catch(err) {
      // not found on server
    }
  }

  if(!found){
    return notice(t('matchNotFound') + rawId);
  }

  openMatchDetailModal(found);
}
window.searchAndOpenMatch = searchAndOpenMatch;

function matchDetailModal(){
  const m = state.viewingMatch;
  if(!m) return '';

  const isCompleted = m.status === 'completed';
  const isP1Win = m.winner === 'p1';
  const isP2Win = m.winner === 'p2';

  const winnerText = !isCompleted 
    ? (m.status === 'failed' ? (m.error || m.reason || 'Lỗi thi đấu') : 'Đang xử lý / trong hàng đợi')
    : isP1Win 
    ? `🟡 Phe Vàng (${esc(m.a)}) thắng` 
    : isP2Win 
    ? `🔵 Phe Xanh (${esc(m.b)}) thắng` 
    : 'Hòa cờ';

  return `<div class="modaloverlay" onclick="if(event.target===this){state.modal=null;state.viewingMatch=null;render()}">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="match-detail-title" style="max-width:540px">
      ${tcgFrameHTML()}
      <div class="modal-head">
        <div>
          <div class="hero-eyebrow-chip">${t('matchDetailEyebrow')}</div>
          <h2 id="match-detail-title" style="margin-top:6px;display:flex;align-items:center;gap:8px">
            <span style="font-family:monospace">${esc(m.id)}</span>
            <button class="iconbtn" onclick="copyMatchIdToClipboard('${esc(m.id)}')" title="${t('copyMatchId')}" style="width:28px;height:28px">
              ${svg('copy',14)}
            </button>
          </h2>
        </div>
        <button class="iconbtn" onclick="state.modal=null;state.viewingMatch=null;render()">${svg('close')}</button>
      </div>

      <!-- Duel Versus Box -->
      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin:14px 0">
        <div style="flex:1;text-align:left">
          <small style="color:#FDE047;font-weight:700;font-size:11px">🟡 PHE VÀNG (P1)</small>
          <div style="font-size:15px;font-weight:800;color:var(--text-title);margin-top:2px">${esc(m.a)}</div>
          ${m.submissionA ? `<code style="font-size:11px;color:var(--text-muted)">${esc(m.submissionA)}</code>` : ''}
        </div>
        <div style="padding:0 12px;text-align:center">
          <div class="chip ${isCompleted?'orangec':'gray'}" style="font-size:12px;padding:4px 8px">
            ${isCompleted ? (m.score || (isP1Win?'1 – 0':isP2Win?'0 – 1':'0.5 – 0.5')) : 'VS'}
          </div>
        </div>
        <div style="flex:1;text-align:right">
          <small style="color:#7DD3FC;font-weight:700;font-size:11px">🔵 PHE XANH (P2)</small>
          <div style="font-size:15px;font-weight:800;color:var(--text-title);margin-top:2px">${esc(m.b)}</div>
          ${m.submissionB ? `<code style="font-size:11px;color:var(--text-muted)">${esc(m.submissionB)}</code>` : ''}
        </div>
      </div>

      <!-- Match Metadata Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="card" style="padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('statusLabel')}</div>
          <div style="font-weight:700;color:var(--text-title);margin-top:2px">
            ${isCompleted ? `<span style="color:#4ADE80">● Hoàn tất</span>` : `<span style="color:#FACC15">● ${esc(m.status)}</span>`}
          </div>
        </div>
        <div class="card" style="padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('winnerLabel')}</div>
          <div style="font-weight:700;color:var(--text-title);margin-top:2px">${winnerText}</div>
        </div>
        <div class="card" style="padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('turnsLabel')}</div>
          <div style="font-weight:700;color:var(--text-title);margin-top:2px">${m.turns || 0} / ${m.maxMoves || 200} lượt</div>
        </div>
        <div class="card" style="padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('modeLabel')}</div>
          <div style="font-weight:700;color:var(--text-title);margin-top:2px">${m.mode === 'submitted' ? 'Đối kháng (Bot)' : 'Demo'}</div>
        </div>
        ${m.reason ? `
        <div class="card" style="grid-column:1 / -1;padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('endReasonLabel')}</div>
          <div style="font-weight:700;color:var(--text-title);margin-top:2px">${esc(m.reason)}</div>
        </div>` : ''}
        ${m.seed != null ? `
        <div class="card" style="padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('seedLabel')}</div>
          <code style="font-size:12px;color:var(--accent)">${esc(m.seed)}</code>
        </div>` : ''}
        <div class="card" style="padding:10px 14px;background:rgba(255,255,255,0.02)">
          <div style="font-size:11px;color:var(--text-muted)">${t('createdTimeLabel')}</div>
          <div style="font-size:12px;color:var(--text-title);margin-top:2px">${esc(m.time || m.createdAt || '—')}</div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="modal-actions-sticky row" style="justify-content:flex-end;gap:10px">
        <button class="btn secondary" type="button" onclick="state.modal=null;state.viewingMatch=null;render()">${t('modalCancel')}</button>
        ${isCompleted ? `
          <button class="btn btn-accent" type="button" onclick="state.modal=null;state.viewingMatch=null;openMatch('${esc(m.id)}')">
            ${svg('play',14)} ${t('watchReplayBtn')}
          </button>
        ` : ''}
      </div>
    </div>
  </div>`;
}
window.matchDetailModal = matchDetailModal;

/* =====================================================
   RENDER & TOP NAVBAR
   ===================================================== */
function render(){
  document.getElementById('app').innerHTML=`
  <!-- TOP NAVBAR -->
  <header class="top-navbar">
    <div class="nav-brand" onclick="go('overview')">
      <div class="nav-emblem">◈</div>
      <div class="brand-titles">
        <div class="brand-name">OTT<span>ARENA</span></div>
        <div class="brand-sub">${t('brandSub')}</div>
      </div>
    </div>

    <!-- Center Navigation Links (Sliding Window) -->
    <div class="nav-slider-wrapper" id="navSliderWrapper">
      <button class="nav-slider-btn prev" id="navSliderPrev" type="button" onclick="slideNavMenu(-1)" aria-label="Trượt sang trái" title="Trượt sang trái">
        ${svg('chevronLeft', 14)}
      </button>

      <nav class="nav-menu" id="navMenuSlider" aria-label="Main Navigation">
        <button class="nav-item-btn ${state.page==='overview'?'active':''}" onclick="go('overview')">
          ${svg('overview', 15)} <span>${t('navOverview')}</span>
        </button>
        <button class="nav-item-btn ${state.page==='play'?'active':''}" onclick="go('play')">
          ${svg('swords', 15)} <span>${t('navPlay')}</span>
        </button>
        <button class="nav-item-btn ${state.page==='arena'?'active':''}" onclick="go('arena')">
          ${svg('flame', 15)} <span>${t('navArena')}</span>
        </button>
        <button class="nav-item-btn ${state.page==='leaderboard'?'active':''}" onclick="go('leaderboard')">
          ${svg('barchart', 15)} <span>${t('navLeaderboard')}</span>
        </button>
        <button class="nav-item-btn ${state.page==='tournaments'?'active':''}" onclick="go('tournaments')">
          ${svg('trophy', 15)} <span>${t('navTournaments')}</span>
        </button>
        <button class="nav-item-btn ${state.page==='submit'?'active':''}" onclick="go('submit')">
          ${svg('bot', 15)} <span>${t('navSubmit')}</span>
        </button>
        ${typeof authState!=='undefined'&&authState.authenticated&&['JUDGE','ADMIN'].includes(authState.role)?`
          <button class="nav-item-btn ${state.page==='admin'?'active':''}" onclick="go('admin')">
            ${svg('server', 15)} <span>${t('navAdmin')}</span>
          </button>`:''}
      </nav>

      <button class="nav-slider-btn next" id="navSliderNext" type="button" onclick="slideNavMenu(1)" aria-label="Trượt sang phải" title="Trượt sang phải">
        ${svg('chevronRight', 14)}
      </button>
    </div>

    <!-- Right Controls -->
    <div class="topactions">
      <div class="ping-badge">
        <div class="ping-dot"></div>
        <span>${t('engineStatus')}</span>
      </div>

      <button class="lang-toggle-btn" id="langToggleBtn" title="${t('toggleLang')}" onclick="toggleLang()" type="button" aria-label="Toggle language">
        <span class="lang-tag ${state.lang==='vi'?'active':''}">VI</span>
        <span style="opacity:0.35">/</span>
        <span class="lang-tag ${state.lang==='en'?'active':''}">EN</span>
      </button>

      <button class="iconbtn" id="themeToggleBtn" title="${t('toggleTheme')}" onclick="toggleTheme()" type="button" aria-label="Toggle theme">
        ${svg(state.theme==='dark'?'sun':'moon', 16)}
      </button>

      ${(typeof authState!=='undefined'&&authState.username)?'':`<button class="btn sm" onclick="openLoginPage?openLoginPage():null">${svg('users',13)} ${t('signIn')}</button>`}

      <button class="hamburger-btn" onclick="state.mobile=!state.mobile;render()" aria-label="Toggle Menu">
        ${svg('menu', 18)}
      </button>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div class="mobile-drawer ${state.mobile?'open':''}">
    <button class="nav-item-btn ${state.page==='overview'?'active':''}" onclick="go('overview')">${svg('overview', 16)} <span>${t('navOverview')}</span></button>
    <button class="nav-item-btn ${state.page==='play'?'active':''}" onclick="go('play')">${svg('swords', 16)} <span>${t('navPlay')}</span></button>
    <button class="nav-item-btn ${state.page==='arena'?'active':''}" onclick="go('arena')">${svg('flame', 16)} <span>${t('navArena')}</span></button>
    <button class="nav-item-btn ${state.page==='leaderboard'?'active':''}" onclick="go('leaderboard')">${svg('barchart', 16)} <span>${t('navLeaderboard')}</span></button>
    <button class="nav-item-btn ${state.page==='tournaments'?'active':''}" onclick="go('tournaments')">${svg('trophy', 16)} <span>${t('navTournaments')}</span></button>
    <button class="nav-item-btn ${state.page==='submit'?'active':''}" onclick="go('submit')">${svg('bot', 16)} <span>${t('navSubmit')}</span></button>
    ${typeof authState!=='undefined'&&authState.authenticated&&['JUDGE','ADMIN'].includes(authState.role)?`
      <button class="nav-item-btn ${state.page==='admin'?'active':''}" onclick="go('admin')">${svg('server', 16)} <span>${t('navAdmin')}</span></button>`:''}
  </div>

  <!-- MAIN WRAPPER -->
  <main class="main-wrapper">
    <div class="content-area">
      ${state.dataStatus==='error' && !state.noticeDismissed ? `
      <div class="notice" role="alert" style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#132219;border:1.5px solid #274735;border-radius:var(--radius-pill);padding:6px 18px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="color:var(--accent);font-size:10px">●</span>
          <span style="font-size:12.5px;color:var(--text-body)">${t('dataError')}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn sm secondary" onclick="retryArenaData()" style="padding:4px 12px;font-size:11px">${t('retry')}</button>
          <button class="iconbtn" onclick="state.noticeDismissed=true;render()" style="width:24px;height:24px;font-size:11px;border:none;background:transparent;color:var(--text-muted)" title="${t('closeNotice')}">✕</button>
        </div>
      </div>`:''}
      ${({overview:dashboard,play,arena,submit:submissions,leaderboard,tournaments,admin})[state.page]?.()||dashboard()}
      <div class="footer">${t('footer')}</div>
    </div>
  </main>

  ${state.modal==='upload'?uploadModal():state.modal==='apiDocs'?apiDocsModal():state.modal==='rename'?renameModal():state.modal==='delete'?deleteConfirmModal():state.modal==='matchDetail'?matchDetailModal():''}`;

  if(state.page==='overview'){
    setupSplitScrollObserver();
  }
  initNavSlider();
}

/* =====================================================
   NAV MENU HORIZONTAL SLIDER ("Cửa sổ trượt điều hướng")
   ===================================================== */
let _navSliderWindowBound = false;
let _navSliderIsDown = false;
let _navSliderHasDragged = false;
let _navSliderStartX = 0;
let _navSliderScrollStart = 0;

function slideNavMenu(dir) {
  const nav = document.getElementById('navMenuSlider');
  if (!nav) return;
  const step = Math.max(160, Math.floor(nav.clientWidth * 0.65));
  nav.scrollBy({ left: dir * step, behavior: 'smooth' });
  setTimeout(updateNavSliderState, 260);
}
window.slideNavMenu = slideNavMenu;

function updateNavSliderState() {
  const wrapper = document.getElementById('navSliderWrapper');
  const nav = document.getElementById('navMenuSlider');
  if (!wrapper || !nav) return;

  const maxScroll = nav.scrollWidth - nav.clientWidth;
  const hasOverflow = maxScroll > 4;

  if (!hasOverflow) {
    wrapper.classList.remove('can-scroll-left', 'can-scroll-right');
    return;
  }

  const scrollLeft = nav.scrollLeft;
  if (scrollLeft > 6) {
    wrapper.classList.add('can-scroll-left');
  } else {
    wrapper.classList.remove('can-scroll-left');
  }

  if (scrollLeft < maxScroll - 6) {
    wrapper.classList.add('can-scroll-right');
  } else {
    wrapper.classList.remove('can-scroll-right');
  }
}
window.updateNavSliderState = updateNavSliderState;

function _navSliderOnMouseUp() {
  if (_navSliderIsDown) {
    _navSliderIsDown = false;
    setTimeout(() => { _navSliderHasDragged = false; }, 60);
  }
}

function bindNavSliderGlobalEvents() {
  if (_navSliderWindowBound) return;
  _navSliderWindowBound = true;
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('resize', () => {
      if (typeof updateNavSliderState === 'function') updateNavSliderState();
    });
    window.addEventListener('mouseup', _navSliderOnMouseUp);
  }
}

function initNavSlider() {
  bindNavSliderGlobalEvents();
  const wrapper = document.getElementById('navSliderWrapper');
  const nav = document.getElementById('navMenuSlider');
  if (!wrapper || !nav) return;

  // Convert vertical mousewheel to horizontal scrolling
  nav.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && nav.scrollWidth > nav.clientWidth) {
      e.preventDefault();
      nav.scrollLeft += e.deltaY;
      updateNavSliderState();
    }
  }, { passive: false });

  // Mouse drag to scroll
  nav.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    _navSliderIsDown = true;
    _navSliderHasDragged = false;
    _navSliderStartX = e.pageX;
    _navSliderScrollStart = nav.scrollLeft;
  });

  nav.addEventListener('mousemove', (e) => {
    if (!_navSliderIsDown) return;
    const dx = e.pageX - _navSliderStartX;
    if (Math.abs(dx) > 5) {
      _navSliderHasDragged = true;
    }
    nav.scrollLeft = _navSliderScrollStart - dx;
    updateNavSliderState();
  });

  nav.addEventListener('click', (e) => {
    if (_navSliderHasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  nav.addEventListener('scroll', () => {
    updateNavSliderState();
  }, { passive: true });

  // Smoothly center active nav button in sliding window
  const activeBtn = nav.querySelector('.nav-item-btn.active');
  if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
    activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  setTimeout(updateNavSliderState, 50);
  setTimeout(updateNavSliderState, 250);
}

/* IntersectionObserver for Sticky Split-Scroll Focus */
function setupSplitScrollObserver(){
  setTimeout(()=>{
    const sections=document.querySelectorAll('.scroll-focus-section');
    if(!sections.length)return;
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            sections.forEach(s=>{
              if(s===entry.target){
                s.classList.remove('dimmed');
                s.classList.add('is-focused');
              } else {
                s.classList.add('dimmed');
                s.classList.remove('is-focused');
              }
            });
          }
        });
      },{
        rootMargin:'-10% 0px -30% 0px',
        threshold:0.12
      });
      sections.forEach(s=>observer.observe(s));
    }
  },60);
}

window.addEventListener('hashchange',()=>{
  const next=location.hash.replace('#','')||'overview';
  if(state.page!==next){
    state.page=next;
    state.playing=false;
    clearInterval(timer);
    render();
  }
});

render();


/* ============================================================
   API DOCUMENTATION MODAL (EN / VI)
   ============================================================ */
const escapeHTML = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function openApiDocsModal(e){
  if(e) e.stopPropagation();
  state.modal = 'apiDocs';
  if(!state.apiDocsTab) state.apiDocsTab = 'rules';
  render();
}
window.openApiDocsModal = openApiDocsModal;

function copyApiDocsCode(elemId, btn){
  const el = document.getElementById(elemId);
  if(!el) return;
  navigator.clipboard.writeText(el.innerText).then(()=>{
    const original = btn.textContent;
    btn.textContent = state.lang === 'vi' ? '✓ Đã sao chép!' : '✓ Copied!';
    setTimeout(()=>{ btn.textContent = original; }, 2000);
  }).catch(()=>{
    alert('Không thể tự động sao chép, vui lòng bôi đen code để copy.');
  });
}
window.copyApiDocsCode = copyApiDocsCode;

function apiDocsModal(){
  const isVi = state.lang === 'vi';
  const tab = state.apiDocsTab || 'rules';

  const pyCode = `import sys
import json

def main():
    # ⚠️ BẮT BUỘC: Dùng vòng lặp lắng nghe liên tục tất cả các lượt trong ván
    # Tuyệt đối KHÔNG thoát chương trình sau 1 lượt vì sẽ gây lỗi bot-crash!
    for line in sys.stdin:
        if not line.strip():
            continue
        data = json.loads(line)
        my_team = data.get("owner", "p1")  # "p1" hoặc "p2"
        board = data.get("board", [])      # Ma trận 8x8: [row][col]
        legal_moves = data.get("legalActions") or data.get("moves", [])
        goal = data.get("goal", [0, 7] if my_team == "p1" else [7, 0])

        if not legal_moves:
            continue

        # Chiến thuật cơ bản: ưu tiên nước bắt quân, sau đó nước gần goal nhất
        best_move = legal_moves[0]
        best_score = -999999
        for m in legal_moves:
            to_r, to_c = m["to"]
            dist_to_goal = max(abs(to_r - goal[0]), abs(to_c - goal[1]))
            score = (8 if m.get("capture") else 0) - dist_to_goal * 0.65
            if score > best_score:
                best_score = score
                best_move = m

        # Xuất đúng 1 dòng JSON biểu diễn nước đi và flush
        action = {"from": best_move["from"], "to": best_move["to"]}
        print(json.dumps(action), flush=True)

if __name__ == "__main__":
    main()`;

  const javaCode = `import java.util.Scanner;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

// Lưu ý: Tên class phải trùng với tên file (Ví dụ: Bot.java -> class Bot)
public class Bot {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine().trim();
            if (line.isEmpty()) continue;

            // Engine gửi JSON: {"owner":"p1","turn":1,"board":[...],"legalActions":[{"from":[r,c],"to":[nr,nc]}...]}
            // Trích xuất nước đi hợp lệ đầu tiên hoặc tự parse JSON
            int fromR = 6, fromC = 1, toR = 5, toC = 2;
            Matcher m = Pattern.compile("\\\"from\\\":\\s*\\[(\\d+),(\\d+)\\],\\\"to\\\":\\s*\\[(\\d+),(\\d+)\\]").matcher(line);
            if (m.find()) {
                fromR = Integer.parseInt(m.group(1));
                fromC = Integer.parseInt(m.group(2));
                toR = Integer.parseInt(m.group(3));
                toC = Integer.parseInt(m.group(4));
            }

            // In đúng 1 dòng JSON ra stdout và flush
            System.out.printf("{\\\"from\\\":[%d,%d],\\\"to\\\":[%d,%d]}\\n", fromR, fromC, toR, toC);
            System.out.flush();
        }
    }
}`;

  const cCode = `#include <stdio.h>
#include <string.h>

// Biên dịch môi trường: gcc -std=c11 -O2 -Wall -Wextra bot.c -o bot
int main() {
    char line[65536];
    while (fgets(line, sizeof(line), stdin)) {
        if (strlen(line) <= 2) continue;

        int fr = 6, fc = 1, tr = 5, tc = 2;
        // Tìm nhanh nước đi hợp lệ đầu tiên trong legalActions
        char *p = strstr(line, "\\\"from\\\":[");
        if (p) {
            sscanf(p, "\\\"from\\\":[%d,%d],\\\"to\\\":[%d,%d]", &fr, &fc, &tr, &tc);
        }

        // Xuất đúng 1 dòng JSON ra stdout và flush
        printf("{\\\"from\\\":[%d,%d],\\\"to\\\":[%d,%d]}\\n", fr, fc, tr, tc);
        fflush(stdout);
    }
    return 0;
}`;

  const rulesVi = `
    <div class="apidocs-section">
      <h4>⚡ 1. Môi trường Thực thi & Quy định File</h4>
      <ul>
        <li>Hệ thống chạy bot trong container Docker độc lập, an toàn:
          <br>• <strong>Python 3.12:</strong> File <code>.py</code> đơn lẻ, chạy lệnh <code>python3 -u &lt;file&gt;</code>
          <br>• <strong>Java 21:</strong> File <code>.java</code> đơn lẻ (tên class trùng tên file), biên dịch <code>javac</code> và chạy <code>java</code>
          <br>• <strong>C 11:</strong> File <code>.c</code> đơn lẻ, biên dịch <code>gcc -std=c11 -O2 -Wall -Wextra</code>
        </li>
        <li><strong>Tên file:</strong> Bắt đầu bằng chữ cái, chỉ chứa chữ cái tiếng Anh, số, dấu gạch dưới (VD: <code>MyBot.py</code>, <code>Bot.java</code>, <code>bot.c</code>). Dung lượng tối đa <strong>500 KB</strong>.</li>
        <li><strong>Thời gian tối đa (Timeout):</strong> <strong>5.000 ms</strong> (5 giây) cho mỗi lượt đi. Quá giờ sẽ bị xử thua (bot-timeout).</li>
        <li><strong>Tài nguyên:</strong> Tối đa 256MB RAM / 1 vCPU sandbox.</li>
      </ul>
    </div>

    <div class="apidocs-section">
      <h4>📥 2. Định dạng Đầu vào (Standard Input - stdin)</h4>
      <div class="apidocs-alert">
        <strong>⚠️ ĐẶC BIỆT QUAN TRỌNG: VÒNG LẶP TIẾN TRÌNH (TRÁNH LỖI BOT-CRASH)</strong>
        Tiến trình bot chạy <strong>1 lần duy nhất</strong> và duy trì liên tục suốt cả ván đấu (không khởi động lại sau mỗi lượt).
        <br>👉 Bắt buộc phải dùng <strong>vòng lặp</strong> (ví dụ <code>for line in sys.stdin:</code> trong Python, <code>while (scanner.hasNextLine())</code> trong Java).
        <br>👉 <strong>Tuyệt đối KHÔNG đọc 1 lượt rồi kết thúc chương trình!</strong> Nếu bot tự thoát (process exit) sau 1 lượt, hệ thống sẽ xử thua ngay lập tức vì lỗi <code>bot-crash</code>.
      </div>
      <p>Mỗi khi đến lượt đi của bot, hệ thống sẽ gửi <strong>duy nhất 1 dòng JSON</strong> qua <code>stdin</code>:</p>
      <div class="apidocs-code-block">
        <div class="apidocs-code-head"><span>JSON gửi vào stdin mỗi lượt</span></div>
        <pre><code>{
  "protocolVersion": "1.0",
  "game": "ott-rps",
  "owner": "p1",          // Phe của bạn: "p1" (Quân Vàng) hoặc "p2" (Quân Xanh)
  "turn": 3,              // Số thứ tự lượt đi
  "goal": [0, 7],         // Tọa độ ô đích chiến thắng: p1 là [0, 7] (ô h8), p2 là [7, 0] (ô a1)
  "board": [              // Ma trận 8x8 (hàng 0-7, cột 0-7)
    [{"id":"a0","type":"rock","owner":"p1"}, null, ...],
    ...
  ],
  "moves": [              // Danh sách TẤT CẢ các nước đi hợp lệ lượt này (engine tính sẵn)
    {"from":[6,1],"to":[5,2],"owner":"p1","unit":"rock","capture":false},
    {"from":[6,1],"to":[5,1],"owner":"p1","unit":"rock","capture":true}
  ],
  "legalActions": [...]   // Tương tự moves
}</code></pre>
      </div>
      <p>Loại quân: <code>"rock"</code> (Búa), <code>"paper"</code> (Bao), <code>"scissors"</code> (Kéo). Ô trống là <code>null</code>.</p>
    </div>

    <div class="apidocs-section">
      <h4>📤 3. Định dạng Đầu ra (Standard Output - stdout)</h4>
      <p>Bot của bạn phải in ra <strong>duy nhất 1 dòng JSON</strong> lên <code>stdout</code> và gọi <strong>FLUSH</strong> ngay lập tức:</p>
      <div class="apidocs-code-block">
        <div class="apidocs-code-head"><span>Cú pháp JSON trả về</span></div>
        <pre><code>{"from": [from_row, from_col], "to": [to_row, to_col]}</code></pre>
      </div>
      <p>Ví dụ: <code>{"from": [6, 1], "to": [5, 2]}</code></p>
      <p style="color:#fbbf24; font-size:12px">⚠️ <strong>Lưu ý bắt buộc:</strong> Phải flush output (<code>print(..., flush=True)</code> trong Python, <code>System.out.flush()</code> trong Java, <code>fflush(stdout)</code> trong C). Tuyệt đối không in log linh tinh ra stdout (nếu muốn debug hãy in ra <code>stderr</code>).</p>
    </div>

    <div class="apidocs-section">
      <h4>🎯 4. Quy tắc Ăn quân & Điều kiện Thắng</h4>
      <ul>
        <li>Mỗi quân di chuyển 1 ô theo 8 hướng (ngang, dọc, chéo).</li>
        <li><strong>Búa</strong> thắng <strong>Kéo</strong> · <strong>Kéo</strong> thắng <strong>Bao</strong> · <strong>Bao</strong> thắng <strong>Búa</strong>.</li>
        <li>Không thể di chuyển vào ô có quân cùng phe hoặc quân cùng loại (hòa không được ăn).</li>
        <li><strong>Chiến thắng:</strong> Đưa bất kỳ 1 quân nào vào ô đích <code>goal</code> HOẶC tiêu diệt toàn bộ quân đối phương.</li>
      </ul>
    </div>
  `;

  const rulesEn = `
    <div class="apidocs-section">
      <h4>⚡ 1. Execution Environment & File Rules</h4>
      <ul>
        <li>Bots execute in isolated, offline Docker containers:
          <br>• <strong>Python 3.12:</strong> Single <code>.py</code> file, invoked via <code>python3 -u &lt;file&gt;</code>
          <br>• <strong>Java 21:</strong> Single <code>.java</code> file (class name must match filename), built with <code>javac</code> and run via <code>java</code>
          <br>• <strong>C 11:</strong> Single <code>.c</code> file, compiled with <code>gcc -std=c11 -O2 -Wall -Wextra</code>
        </li>
        <li><strong>Filename:</strong> ASCII letters, numbers, underscores only; must begin with a letter (e.g. <code>MyBot.py</code>, <code>Bot.java</code>, <code>bot.c</code>). Max <strong>500 KB</strong>.</li>
        <li><strong>Per-turn Timeout:</strong> <strong>5,000 ms</strong> (5 seconds). Exceeding this triggers <code>bot-timeout</code> forfeit.</li>
        <li><strong>Resources:</strong> 256MB RAM / 1 vCPU sandbox.</li>
      </ul>
    </div>

    <div class="apidocs-section">
      <h4>📥 2. Input Specification (Standard Input - stdin)</h4>
      <div class="apidocs-alert">
        <strong>⚠️ CRITICAL: CONTINUOUS PROCESS LOOP (PREVENTS BOT-CRASH)</strong>
        The bot process is launched <strong>once</strong> and kept alive throughout the entire match (it is NOT restarted per turn).
        <br>👉 You <strong>MUST use a continuous loop</strong> (e.g. <code>for line in sys.stdin:</code> in Python, <code>while (scanner.hasNextLine())</code> in Java).
        <br>👉 <strong>DO NOT exit after processing one move!</strong> If your bot process terminates (exits), the referee immediately disqualifies it with a <code>bot-crash</code> error.
      </div>
      <p>Each turn, the referee engine writes <strong>a single line of JSON</strong> to your bot's <code>stdin</code>:</p>
      <div class="apidocs-code-block">
        <div class="apidocs-code-head"><span>JSON payload sent to stdin</span></div>
        <pre><code>{
  "protocolVersion": "1.0",
  "game": "ott-rps",
  "owner": "p1",          // Your bot: "p1" (Gold) or "p2" (Blue)
  "turn": 3,              // Turn counter
  "goal": [0, 7],         // Victory goal: p1 goals at [0, 7] (h8), p2 goals at [7, 0] (a1)
  "board": [              // 8x8 matrix (row 0-7, col 0-7)
    [{"id":"a0","type":"rock","owner":"p1"}, null, ...],
    ...
  ],
  "moves": [              // List of ALL legal moves computed by the referee for this turn
    {"from":[6,1],"to":[5,2],"owner":"p1","unit":"rock","capture":false},
    {"from":[6,1],"to":[5,1],"owner":"p1","unit":"rock","capture":true}
  ],
  "legalActions": [...]   // Same as moves
}</code></pre>
      </div>
      <p>Unit types: <code>"rock"</code>, <code>"paper"</code>, <code>"scissors"</code>. Empty cells are <code>null</code>.</p>
    </div>

    <div class="apidocs-section">
      <h4>📤 3. Output Specification (Standard Output - stdout)</h4>
      <p>Your bot must respond with <strong>exactly one line of JSON</strong> on <code>stdout</code>, then immediately <strong>FLUSH</strong>:</p>
      <div class="apidocs-code-block">
        <div class="apidocs-code-head"><span>Expected JSON Response</span></div>
        <pre><code>{"from": [from_row, from_col], "to": [to_row, to_col]}</code></pre>
      </div>
      <p>Example: <code>{"from": [6, 1], "to": [5, 2]}</code></p>
      <p style="color:#fbbf24; font-size:12px">⚠️ <strong>Critical:</strong> Always flush stdout (<code>print(..., flush=True)</code> in Python, <code>System.out.flush()</code> in Java, <code>fflush(stdout)</code> in C). Do not print debug logs to stdout — use <code>stderr</code> for debugging.</p>
    </div>

    <div class="apidocs-section">
      <h4>🎯 4. Combat Mechanics & Win Conditions</h4>
      <ul>
        <li>Each unit moves 1 square in 8 directions (King-style).</li>
        <li><strong>Rock</strong> beats <strong>Scissors</strong> · <strong>Scissors</strong> beats <strong>Paper</strong> · <strong>Paper</strong> beats <strong>Rock</strong>.</li>
        <li>Cannot move into ally tiles or tiles occupied by identical unit types (Draw).</li>
        <li><strong>Victory:</strong> Move any piece into your <code>goal</code> square OR capture all opposing units.</li>
      </ul>
    </div>
  `;

  return `
  <div class="modaloverlay" onclick="if(event.target===this){state.modal=null;render()}">
    <div class="modal modal-apidocs" role="dialog" aria-modal="true">
      ${tcgFrameHTML()}
      <div class="modal-head" style="margin-bottom:12px">
        <div>
          <div class="hero-eyebrow-chip">${t('apiDocsEyebrow')}</div>
          <h2 id="modal-title" style="margin-top:6px;font-size:1.35rem">${t('apiDocsTitle')}</h2>
        </div>
        <button class="iconbtn" onclick="state.modal=null;render()" title="${t('closeNotice')}">${svg('close')}</button>
      </div>

      <div class="apidocs-tabs">
        <button class="apidocs-tab ${tab==='rules'?'active':''}" onclick="state.apiDocsTab='rules';render()">${t('apiDocsTabRules')}</button>
        <button class="apidocs-tab ${tab==='python'?'active':''}" onclick="state.apiDocsTab='python';render()">${t('apiDocsTabPython')}</button>
        <button class="apidocs-tab ${tab==='java'?'active':''}" onclick="state.apiDocsTab='java';render()">${t('apiDocsTabJava')}</button>
        <button class="apidocs-tab ${tab==='c'?'active':''}" onclick="state.apiDocsTab='c';render()">${t('apiDocsTabC')}</button>
      </div>

      <div class="apidocs-body">
        ${tab==='rules' ? (isVi ? rulesVi : rulesEn) : ''}
        ${tab==='python' ? `
          <div class="apidocs-code-block">
            <div class="apidocs-code-head">
              <span>MyBot.py (Python 3.12)</span>
              <button class="apidocs-copy-btn" onclick="copyApiDocsCode('code-py-content', this)">${isVi?'Sao chép':'Copy Code'}</button>
            </div>
            <pre><code id="code-py-content">${escapeHTML(pyCode)}</code></pre>
          </div>
        ` : ''}
        ${tab==='java' ? `
          <div class="apidocs-code-block">
            <div class="apidocs-code-head">
              <span>Bot.java (Java 21)</span>
              <button class="apidocs-copy-btn" onclick="copyApiDocsCode('code-java-content', this)">${isVi?'Sao chép':'Copy Code'}</button>
            </div>
            <pre><code id="code-java-content">${escapeHTML(javaCode)}</code></pre>
          </div>
        ` : ''}
        ${tab==='c' ? `
          <div class="apidocs-code-block">
            <div class="apidocs-code-head">
              <span>bot.c (GCC 13 C11)</span>
              <button class="apidocs-copy-btn" onclick="copyApiDocsCode('code-c-content', this)">${isVi?'Sao chép':'Copy Code'}</button>
            </div>
            <pre><code id="code-c-content">${escapeHTML(cCode)}</code></pre>
          </div>
        ` : ''}
      </div>

      <div class="row" style="justify-content:flex-end;margin-top:14px;padding-top:10px;border-top:1px solid var(--line-strong)">
        <button class="btn btn-accent" type="button" onclick="state.modal=null;render()">${isVi?'Đã hiểu':'Got it'}</button>
      </div>
    </div>
  </div>`;
}
