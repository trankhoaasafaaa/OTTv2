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
    modalEyebrow:'NỘP BÀI THI ĐẤU',modalTitle:'Tải lên bot mới',modalLang:'Ngôn ngữ lập trình',modalVersion:'Phiên bản bot',modalSource:'File mã nguồn',modalChooseFile:'Chọn file mã nguồn',modalFileHelp:'File đơn .py, .java, hoặc .c (tối đa 500 KB). Tên file không dấu, không khoảng trắng.',modalNotice:'File tải lên sẽ được lưu vào tài khoản của bạn. Tính năng thi đấu hiện chưa mở.',modalCancel:'Hủy',modalSubmit:'Tải lên mã nguồn',
    closeNotice:'Đóng',liveEngine:'ĐỘNG CƠ TRỰC TIẾP',selectSourceNotice:'Vui lòng chọn một file mã nguồn.',singleExtNotice:'Chỉ chấp nhận file .py, .java hoặc .c đơn.',langMismatchNotice:'Ngôn ngữ đã chọn không khớp với phần mở rộng file.',uploadSuccessNotice:'Đã tải mã nguồn lên hệ thống thành công.',uploadFailNotice:'Tải lên thất bại: '
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
    modalEyebrow:'BOT SUBMISSION',modalTitle:'Upload a new bot',modalLang:'Programming language',modalVersion:'Bot version',modalSource:'Source code file',modalChooseFile:'Choose a source file',modalFileHelp:'Single .py, .java, or .c file (max 500 KB). ASCII filename, no spaces.',modalNotice:'Uploaded file will be saved to your account. Matchmaking is currently in development.',modalCancel:'Cancel',modalSubmit:'Upload source',
    closeNotice:'Close',liveEngine:'LIVE ENGINE',selectSourceNotice:'Please select a source file.',singleExtNotice:'Use a single .py, .java, or .c file.',langMismatchNotice:'The selected language does not match the source file.',uploadSuccessNotice:'Source uploaded to the server.',uploadFailNotice:'Upload failed: '
  }
};

const DEFAULT_SUBMISSIONS=[
  {id:'SUB-101',name:'TacticalDruid.py',lang:'Python',version:'v3.2',date:'Oct 20, 2026',status:'Active'},
  {id:'SUB-102',name:'RpsSentinel.c',lang:'C',version:'v2.1',date:'Oct 18, 2026',status:'Stored'},
  {id:'SUB-103',name:'AncientWillow.java',lang:'Java',version:'v1.0',date:'Oct 15, 2026',status:'Stored'}
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

const rawInitHash = location.hash.replace('#','');
const initIsTourney = rawInitHash.startsWith('tournament/');
const initTourneyId = initIsTourney ? decodeURIComponent(rawInitHash.replace('tournament/','')) : null;

const state={
  page: initIsTourney ? 'tournaments' : (rawInitHash || 'overview'),
  theme:saved('ott-theme','dark'),
  lang:saved('ott-lang','vi'),
  submissions:[...DEFAULT_SUBMISSIONS],
  play:0,playing:false,speed:1,selectedMatch:'M-7042',
  filter:'all',search:'',rankTab:'Global',round:'Round of 16',
  adminLive:true,serverOnline:false,dataStatus:'ready',
  challengeReady:false,challengePending:false,challengeBotId:'',
  modal:null,apiDocsTab:'rules',mobile:false,selectedFile:null,matchMap:'Arena Classic',
  maxMoves:200,firstMove:'Random',noticeDismissed:false,
  tournaments:[],selectedTournamentId:initTourneyId,tournamentDetail:null,
  tournamentTab:'standings',tournamentFilter:'all',selectedTournamentMatch:null,
  adjudicateWinner:'PLAYER_A',adjudicateReason:'',newTournamentFormat:'ROUND_ROBIN'
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
  if(document.documentElement && document.documentElement.classList){
    if(isLight){
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme','light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme','dark');
    }
  }
  const metaTheme = typeof document.querySelector === 'function' ? document.querySelector('meta[name="theme-color"]') : null;
  if(metaTheme && metaTheme.setAttribute) metaTheme.setAttribute('content', isLight ? '#F5EFE6' : '#0B130E');
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
  bot:'<rect width="18" height="12" x="3" y="6" rx="2"/><path d="M9 11v2M15 11v2M9 2v4M15 2v4M2 12h1M21 12h1"/>'
};
const svg=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.plus}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function goToTournamentsList() {
  state.selectedTournamentId = null;
  state.tournamentDetail = null;
  state.page = 'tournaments';
  state.mobile = false;
  location.hash = 'tournaments';
  state.playing = false;
  render();
  window.scrollTo(0, 0);
  loadTournamentsData();
}

const go=p=>{
  if (p === 'tournaments') {
    goToTournamentsList();
    return;
  }
  state.page=p;state.mobile=false;location.hash=p;state.playing=false;render();window.scrollTo(0,0);
};
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
          <th>${t('thSource')}</th>
          <th>${t('thLang')}</th>
          <th>${t('thDate')}</th>
          <th>${t('thVersion')}</th>
          <th>${t('thStatus')}</th>
        </tr>
      </thead>
      <tbody>
        ${own.length?own.map(b=>`
          <tr>
            <td class="strong" style="color:var(--accent)">${esc(b.id)}</td>
            <td>${esc(b.name)}</td>
            <td><span class="chip ${b.lang==='Python'?'purplechip':b.lang==='C'?'orangec':'gray'}">${esc(b.lang)}</span></td>
            <td>${esc(b.date)}</td>
            <td>${esc(b.version)}</td>
            <td><span class="chip">● ${esc(submissionStatusLabel(b.status))}</span></td>
          </tr>`).join('')
        :`<tr><td colspan="6" class="empty">${t('noSubmissions')}</td></tr>`}
      </tbody>
    </table></div>
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
  const backTourneyBtn = state.fromTournamentId ? `<button class="btn sm secondary" style="margin-right:8px" onclick="openTournamentDetail('${state.fromTournamentId}')">← Quay lại giải đấu</button>` : '';
  return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'),backTourneyBtn+`<button class="btn secondary" onclick="resetReplay()">${svg('reset')} ${t('replayBtn')}</button>`)+
  `<div class="toolbar">
    <select class="select" onchange="openMatch(this.value)">
      ${completed.map(x=>`<option value="${x.id}" ${m.id===x.id?'selected':''}>${x.id} • ${x.a} vs ${x.b}</option>`).join('')}
    </select>
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
      <div style="margin-top:14px;padding:12px 16px;background:var(--bg-secondary);border:1px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">${rep.winner ? '🏆' : '⚔'}</span>
          <span style="font-size:13px;font-weight:700;color:var(--text-title)">
            ${state.play >= rep.events.length ? (rep.winner ? (rep.winner==='p1' ? 'Phe Vàng chiến thắng!' : 'Phe Xanh chiến thắng!') : 'Kết thúc: Hòa / Hết lượt') : `Trận đấu: ${esc(m.id)} (${esc(m.a)} vs ${esc(m.b)})`}
          </span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn sm secondary" onclick="resetReplay()">↻ Xem lại từ đầu</button>
          ${(m.tourneyId && isUserAdmin()) ? `
            <button class="btn sm btn-accent" onclick="adminRematchMatch('${m.tourneyId}', '${m.id}')">⚔ Đấu lại trận này</button>
          ` : (!m.tourneyId) ? `
            <button class="btn sm btn-accent" onclick="go('play')">⚔ Đấu lại / Ghép trận mới</button>
          ` : ''}
          ${state.fromTournamentId ? `
            <button class="btn sm secondary" onclick="openTournamentDetail('${state.fromTournamentId}')">← Quay lại giải đấu</button>
          ` : ''}
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
  if(typeof document.querySelectorAll === 'function') {
    document.querySelectorAll('[data-piece-id]').forEach(el=>{oldPositions[el.dataset.pieceId]=el.getBoundingClientRect()});
  }
  state.play=Math.min(rep.events.length,Math.max(0,state.play+delta));
  if(state.play===rep.events.length)state.playing=false;
  render();
  if(delta===1 && typeof document.querySelectorAll === 'function'){
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

/* ============================================================
   TOURNAMENT MANAGEMENT SYSTEM (FRONTEND)
   ============================================================ */

function isUserAdmin() {
  return typeof authState !== 'undefined' && authState.authenticated && ['ADMIN', 'JUDGE'].includes(authState.role);
}

function openTournamentDetail(id, tab = null) {
  state.selectedTournamentId = id;
  state.tournamentDetail = (state.tournaments || []).find(t => t.id === id) || null;
  if (tab) state.tournamentTab = tab;
  state.page = 'tournaments';
  state.mobile = false;
  location.hash = 'tournament/' + encodeURIComponent(id);
  state.playing = false;
  render();
  window.scrollTo(0, 0);
  loadTournamentDetail(id);
}

function closeTournamentDetail() {
  goToTournamentsList();
}

async function loadTournamentDetail(id) {
  try {
    const data = await api.get('/tournaments/' + encodeURIComponent(id));
    state.tournamentDetail = data;
    if (!state.tournamentTab || state.tournamentTab === 'standings' || state.tournamentTab === 'bracket') {
      state.tournamentTab = data.format === 'ROUND_ROBIN' ? 'standings' : 'bracket';
    }
    render();
  } catch (err) {
    notice('Không thể tải chi tiết giải: ' + err.message);
  }
}

function switchTournamentTab(tab) {
  state.tournamentTab = tab;
  render();
}

function filterTournaments(f) {
  state.tournamentFilter = f;
  render();
}

function openCreateTournamentModal() {
  if (!isUserAdmin()) return notice('Chỉ Admin mới có quyền tạo giải đấu.');
  state.newTournamentFormat = 'ROUND_ROBIN';
  state.modal = 'createTournament';
  render();
}

function selectTournamentFormat(fmt) {
  state.newTournamentFormat = fmt;
  render();
}

async function submitCreateTournament(e) {
  e.preventDefault();
  const name = document.getElementById('newTourneyName')?.value.trim();
  const desc = document.getElementById('newTourneyDesc')?.value.trim();
  const format = state.newTournamentFormat || 'ROUND_ROBIN';
  const maxMoves = Number(document.getElementById('newTourneyMoves')?.value || 200);
  const pieces = Number(document.getElementById('newTourneyPieces')?.value || 6);
  const first = document.getElementById('newTourneyFirst')?.value || 'Random';

  if (!name) return notice('Vui lòng nhập tên giải đấu');

  try {
    const created = await api.post('/admin/tournaments', {
      name, description: desc, format, maxMoves, pieces, first
    });
    notice('Tạo giải đấu thành công!');
    state.modal = null;
    await loadTournamentsData();
    openTournamentDetail(created.id);
  } catch (err) {
    notice('Lỗi tạo giải: ' + err.message);
  }
}

function openRegisterTournamentModal(id) {
  if (typeof authState === 'undefined' || !authState.authenticated) {
    notice('Vui lòng đăng nhập trước khi đăng ký tham gia.');
    openLoginPage();
    return;
  }
  const ownBots = (state.submissions || []).filter(b => b.userId === authState.id || b.ownedBy === authState.username);
  if (!ownBots.length) {
    notice('Bạn chưa có bot nào trong kho. Hãy upload một bot trước!');
    go('submit');
    return;
  }
  state.selectedTournamentId = id;
  state.modal = 'registerTournament';
  render();
}

async function submitRegisterTournament(e) {
  e.preventDefault();
  const botId = document.getElementById('regBotSelect')?.value;
  if (!botId) return notice('Vui lòng chọn một bot');

  const ownBots = (state.submissions || []).filter(b => b.userId === authState.id || b.ownedBy === authState.username);
  const chosen = ownBots.find(b => b.id === botId);
  if (!chosen) return notice('Bot không hợp lệ');

  try {
    await api.post(`/tournaments/${state.selectedTournamentId}/register`, {
      submissionId: chosen.id,
      submissionName: chosen.name,
      submissionLang: chosen.lang,
      submissionVersion: chosen.version || 'v1.0'
    });
    notice('Đăng ký tham gia giải đấu thành công! Bot chính thức đã được ghi nhận.');
    state.modal = null;
    await loadTournamentDetail(state.selectedTournamentId);
    await loadTournamentsData();
  } catch (err) {
    notice('Đăng ký thất bại: ' + err.message);
  }
}

async function submitUnregisterTournament(id) {
  if (!confirm('Bạn có chắc muốn hủy đăng ký giải đấu này?')) return;
  try {
    await api.post(`/tournaments/${id}/unregister`, {});
    notice('Đã hủy đăng ký');
    await loadTournamentDetail(id);
    await loadTournamentsData();
  } catch (err) {
    notice('Không thể hủy đăng ký: ' + err.message);
  }
}

async function adminOpenRegistration(id) {
  try {
    await api.post(`/admin/tournaments/${id}/open-registration`, {});
    notice('Đã mở cổng đăng ký cho giải đấu!');
    await loadTournamentDetail(id);
    await loadTournamentsData();
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminLockSubmissions(id) {
  if (!confirm('Khóa bài nộp sẽ chốt danh sách thi đấu. Thí sinh sẽ không thể đổi bot nữa. Xác nhận?')) return;
  try {
    await api.post(`/admin/tournaments/${id}/lock-submissions`, {});
    notice('Đã khóa cổng nộp bài và chốt danh sách chính thức!');
    await loadTournamentDetail(id);
    await loadTournamentsData();
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminGenerateBracket(id) {
  if (!confirm('Tạo vòng đấu và ghép cặp sẽ bắt đầu giải đấu chính thức. Xác nhận bốc thăm?')) return;
  try {
    await api.post(`/admin/tournaments/${id}/generate-bracket`, {});
    notice('Bốc thăm và tạo lịch thi đấu thành công!');
    await loadTournamentDetail(id);
    await loadTournamentsData();
  } catch (err) {
    notice('Lỗi tạo vòng: ' + err.message);
  }
}

async function adminApproveParticipant(id, userId) {
  try {
    await api.post(`/admin/tournaments/${id}/participants/${userId}/approve`, {});
    notice('Đã duyệt thí sinh tham gia!');
    await loadTournamentDetail(id);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminRejectParticipant(id, userId) {
  const reason = prompt('Nhập lý do từ chối thí sinh:');
  if (reason === null) return;
  try {
    await api.post(`/admin/tournaments/${id}/participants/${userId}/reject`, { reason });
    notice('Đã từ chối thí sinh');
    await loadTournamentDetail(id);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminApproveAll(id) {
  try {
    await api.post(`/admin/tournaments/${id}/participants/approve-all`, {});
    notice('Đã duyệt tất cả thí sinh đang chờ!');
    await loadTournamentDetail(id);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminStartMatch(tourneyId, matchId) {
  notice('Đang khởi chạy trận đấu ' + matchId + '...');
  try {
    const res = await api.post(`/admin/tournaments/${tourneyId}/matches/${matchId}/start`, {});
    notice(`Trận ${matchId} hoàn tất! Kết quả: ${res.match?.score || 'Xong'}`);
    await loadTournamentDetail(tourneyId);
    const pA = res.match?.playerA?.username || 'Đội Vàng';
    const pB = res.match?.playerB?.username || 'Đội Xanh';
    await watchTournamentReplay(matchId, pA, pB, tourneyId);
  } catch (err) {
    notice('Lỗi chạy trận: ' + err.message);
  }
}

async function adminPauseMatch(tourneyId, matchId) {
  const reason = prompt('Nhập lý do tạm dừng trận:', 'Trọng tài tạm dừng kiểm tra kỹ thuật');
  if (reason === null) return;
  try {
    await api.post(`/admin/tournaments/${tourneyId}/matches/${matchId}/pause`, { reason });
    notice('Đã tạm dừng trận đấu');
    await loadTournamentDetail(tourneyId);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminResumeMatch(tourneyId, matchId) {
  try {
    await api.post(`/admin/tournaments/${tourneyId}/matches/${matchId}/resume`, {});
    notice('Đã tiếp tục trận đấu');
    await loadTournamentDetail(tourneyId);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminCancelMatch(tourneyId, matchId) {
  const reason = prompt('Nhập lý do hủy trận đấu:', 'Bot vi phạm quy chế thi đấu');
  if (reason === null) return;
  try {
    await api.post(`/admin/tournaments/${tourneyId}/matches/${matchId}/cancel`, { reason });
    notice('Đã hủy trận đấu');
    await loadTournamentDetail(tourneyId);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

function openAdjudicateModal(tourneyId, matchId) {
  state.selectedTournamentId = tourneyId;
  state.selectedTournamentMatch = matchId;
  state.adjudicateWinner = 'PLAYER_A';
  state.adjudicateReason = '';
  state.modal = 'adjudicateMatch';
  render();
}

async function submitAdjudicateMatch(e) {
  e.preventDefault();
  const tourneyId = state.selectedTournamentId;
  const matchId = state.selectedTournamentMatch;
  const winner = state.adjudicateWinner || 'PLAYER_A';
  const reason = document.getElementById('adjReason')?.value.trim() || 'Quyết định của trọng tài';

  try {
    await api.post(`/admin/tournaments/${tourneyId}/matches/${matchId}/adjudicate`, { winner, reason });
    notice('Đã ghi nhận phán quyết của trọng tài!');
    state.modal = null;
    await loadTournamentDetail(tourneyId);
  } catch (err) {
    notice('Lỗi xử kết quả: ' + err.message);
  }
}

async function adminRunAllMatches(tourneyId) {
  notice('Đang chạy toàn bộ các trận đang chờ...');
  try {
    const res = await api.post(`/admin/tournaments/${tourneyId}/run-all-matches`, {});
    notice(`Đã hoàn tất ${res.executedCount} trận đấu!`);
    await loadTournamentDetail(tourneyId);
  } catch (err) {
    notice('Lỗi: ' + err.message);
  }
}

async function adminPublishResults(tourneyId) {
  if (!confirm('Công bố kết quả sẽ chốt Quán quân và kết thúc giải đấu. Xác nhận?')) return;
  try {
    const res = await api.post(`/admin/tournaments/${tourneyId}/publish-results`, {});
    notice(`Đã công bố kết quả giải đấu! Chúc mừng Quán quân 🏆 ${res.champion?.username}!`);
    await loadTournamentDetail(tourneyId);
    await loadTournamentsData();
  } catch (err) {
    notice('Lỗi công bố kết quả: ' + err.message);
  }
}

async function adminDeleteTournament(tourneyId) {
  // Xóa ngay lập tức trên UI (optimistic), không cần chờ đợi hay bấm xác nhận
  state.tournaments = (state.tournaments || []).filter(t => t.id !== tourneyId);
  if (state.selectedTournamentId === tourneyId) {
    state.selectedTournamentId = null;
    state.tournamentDetail = null;
  }
  render();
  notice('Đã xóa giải đấu thành công!');
  try {
    await api.delete(`/admin/tournaments/${tourneyId}`);
    await loadTournamentsData();
  } catch (err) {
    console.warn('Background delete notice:', err.message);
  }
}

async function adminRematchMatch(tourneyId, matchId) {
  notice('Đang khởi chạy đấu lại trận ' + matchId + '...');
  try {
    const res = await api.post(`/admin/tournaments/${tourneyId}/matches/${matchId}/rematch`, {});
    notice(`Đã đấu lại trận ${matchId}! Kết quả mới: ${res.match?.score || 'Hoàn tất'}`);
    await loadTournamentDetail(tourneyId);
    const pA = res.match?.playerA?.username || 'Đội Vàng';
    const pB = res.match?.playerB?.username || 'Đội Xanh';
    await watchTournamentReplay(matchId, pA, pB, tourneyId);
  } catch (err) {
    notice('Lỗi đấu lại: ' + err.message);
  }
}

async function watchTournamentReplay(matchId, pA = null, pB = null, tourneyId = null) {
  state.fromTournamentId = tourneyId || state.selectedTournamentId;
  notice('Đang tải dữ liệu trận đấu ' + matchId + '...');
  try {
    const replay = await api.get('/matches/' + encodeURIComponent(matchId) + '/replay');
    if (replay) {
      replayCache[matchId] = replay;
      let existing = matches.find(m => m.id === matchId);
      if (!existing) {
        existing = {
          id: matchId,
          status: 'completed',
          a: pA || replay.a || 'Đội Vàng',
          b: pB || replay.b || 'Đội Xanh',
          turns: replay.turns || replay.events?.length || 0,
          score: replay.winner === 'p1' ? '1 – 0' : replay.winner === 'p2' ? '0 – 1' : '0.5 – 0.5',
          time: 'Giải đấu',
          maxMoves: replay.maxMoves || 200,
          tourneyId: state.fromTournamentId
        };
        matches.unshift(existing);
      } else {
        existing.status = 'completed';
        existing.tourneyId = state.fromTournamentId;
      }
      state.selectedMatch = matchId;
      state.play = 0;
      state.playing = true;
      clearInterval(timer);
      timer = setInterval(() => {
        if (!state.playing || state.page !== 'arena') {
          clearInterval(timer);
          return;
        }
        step(1);
      }, 650 / state.speed);
      state.page = 'arena';
      location.hash = 'arena';
      render();
      window.scrollTo(0, 0);
      return;
    }
  } catch (err) {
    console.warn('Cannot fetch tournament replay directly:', err.message);
  }
  openMatch(matchId);
}

async function loadTournamentsData() {
  try {
    const data = await api.get('/tournaments');
    if (Array.isArray(data)) {
      state.tournaments = data;
      render();
    }
  } catch (err) {
    console.warn('Cannot load tournaments:', err.message);
  }
}

/* ============================================================
   TOURNAMENTS VIEW (STUDENTS & SPECTATORS)
   ============================================================ */

function tournaments() {
  if (state.selectedTournamentId) {
    if (state.tournamentDetail) {
      return tournamentDetailView(state.tournamentDetail);
    }
    return `
      <div style="padding:16px 0">
        <button class="btn sm secondary" onclick="goToTournamentsList()" style="margin-bottom:16px">← Danh sách giải đấu</button>
        <div class="card" style="padding:40px;text-align:center">
          ${tcgFrameHTML()}
          <div style="font-size:26px;margin-bottom:10px">⏳</div>
          <h3 style="margin-bottom:6px">Đang tải dữ liệu giải đấu...</h3>
          <p class="muted">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    `;
  }
  return tournamentListView();
}

function tournamentStatusBadge(status) {
  const map = {
    DRAFT: ['draft', 'Bản nháp'],
    REGISTRATION: ['registration', '● Mở đăng ký'],
    SUBMISSIONS_CLOSED: ['submissions_closed', 'Khóa nộp bài'],
    RUNNING: ['running', '● Đang thi đấu'],
    COMPLETED: ['completed', 'Đã kết thúc 🏆'],
    CANCELLED: ['draft', 'Đã hủy']
  };
  const [cls, label] = map[status] || ['draft', status];
  return `<span class="t-badge ${cls}">${label}</span>`;
}

function tournamentFormatBadge(format) {
  if (format === 'ROUND_ROBIN') {
    return `<span class="t-format-badge robin">🔄 Đấu vòng tròn</span>`;
  }
  return `<span class="t-format-badge knockout">⚡ Đấu loại trực tiếp</span>`;
}

function tournamentListView() {
  const isAdmin = isUserAdmin();
  let list = state.tournaments || [];
  if (state.tournamentFilter && state.tournamentFilter !== 'all') {
    list = list.filter(t => t.status === state.tournamentFilter);
  }

  const headerHtml = `
    <div class="section-head" style="margin-bottom:20px;flex-wrap:wrap;gap:14px">
      <div>
        <div class="hero-eyebrow-chip">GIẢI ĐẤU · TOURNAMENTS</div>
        <h1 style="font-size:28px;font-weight:900;color:var(--text-title);margin:8px 0 6px">Đấu trường Giải đấu OTT</h1>
        <p class="muted" style="max-width:680px">Theo dõi lịch thi đấu, bảng xếp hạng và các trận đấu đỉnh cao của cộng đồng lập trình bot OTT Rock-Paper-Scissors.</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        ${isAdmin ? `<button class="btn btn-accent" onclick="openCreateTournamentModal()">${svg('plus')} Tạo giải đấu mới</button>` : ''}
        <button class="btn secondary" onclick="loadTournamentsData()">${svg('refresh')} Tải lại</button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn sm ${state.tournamentFilter==='all'?'':'secondary'}" onclick="filterTournaments('all')">Tất cả (${(state.tournaments||[]).length})</button>
      <button class="btn sm ${state.tournamentFilter==='REGISTRATION'?'':'secondary'}" onclick="filterTournaments('REGISTRATION')">Đang mở đăng ký</button>
      <button class="btn sm ${state.tournamentFilter==='RUNNING'?'':'secondary'}" onclick="filterTournaments('RUNNING')">Đang thi đấu</button>
      <button class="btn sm ${state.tournamentFilter==='COMPLETED'?'':'secondary'}" onclick="filterTournaments('COMPLETED')">Đã kết thúc</button>
    </div>
  `;

  if (!list.length) {
    return headerHtml + emptyCard('Chưa có giải đấu phù hợp', 'Các giải đấu sẽ xuất hiện tại đây khi Ban tổ chức thiết lập.');
  }

  const cardsHtml = `
    <div class="tournament-grid">
      ${list.map(t => `
        <div class="tournament-card">
          ${tcgFrameHTML()}
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px">
              ${tournamentStatusBadge(t.status)}
              ${tournamentFormatBadge(t.format)}
            </div>
            <h2 style="font-size:18px;font-weight:900;color:var(--text-title);margin-bottom:8px">${esc(t.name)}</h2>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.5">${esc(t.description || 'Chưa có mô tả chi tiết.')}</p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;background:var(--bg-secondary);padding:12px;border-radius:10px;border:1px solid var(--line-subtle)">
              <div>
                <span class="tiny muted" style="text-transform:uppercase;font-weight:700">Thí sinh</span>
                <div style="font-size:15px;font-weight:800;color:var(--text-title);margin-top:2px">👥 ${t.approvedCount} / ${t.entryCount}</div>
              </div>
              <div>
                <span class="tiny muted" style="text-transform:uppercase;font-weight:700">Trận đấu</span>
                <div style="font-size:15px;font-weight:800;color:var(--text-title);margin-top:2px">⚔ ${t.completedMatches} / ${t.matchCount}</div>
              </div>
            </div>

            ${t.champion ? `
              <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.35);padding:10px 12px;border-radius:10px;margin-bottom:16px">
                <div style="font-size:11px;font-weight:800;color:#facc15;text-transform:uppercase;letter-spacing:0.5px">🏆 Quán quân giải đấu</div>
                <div style="font-size:14px;font-weight:800;color:var(--text-title);margin-top:3px">${esc(t.champion.username)} <span style="font-size:12px;color:var(--text-muted)">(${esc(t.champion.botName || '')})</span></div>
              </div>` : ''}
          </div>

          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <button class="btn btn-accent sm" style="flex:1" onclick="openTournamentDetail('${t.id}')">Xem giải đấu →</button>
            ${t.status === 'REGISTRATION' ? `<button class="btn sm secondary" onclick="openRegisterTournamentModal('${t.id}')">Đăng ký</button>` : ''}
            ${isAdmin ? `<button class="btn sm secondary" title="Quản trị" onclick="openTournamentDetail('${t.id}')">⚙</button>` : ''}
            ${isAdmin ? `<button class="btn sm secondary danger" title="Xóa giải đấu ngay lập tức" onclick="adminDeleteTournament('${t.id}')">🗑 Xóa</button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return headerHtml + cardsHtml;
}

function tournamentDetailView(t) {
  const isAdmin = isUserAdmin();
  const isEn = (state.lang === 'en');
  const myEntry = (t.entries || []).find(e => authState.authenticated && (e.userId === authState.id || e.username === authState.username));

  const heroHtml = `
    <div style="margin-bottom:16px">
      <button class="btn sm secondary" onclick="closeTournamentDetail()">← Danh sách giải đấu</button>
    </div>

    <div class="tournament-detail-hero">
      ${tcgFrameHTML()}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          ${tournamentStatusBadge(t.status)}
          ${tournamentFormatBadge(t.format)}
        </div>
        <div class="tiny muted">Mã giải: <code style="color:var(--text-title)">${esc(t.id)}</code></div>
      </div>

      <h1 style="font-size:26px;font-weight:900;color:var(--text-title);margin-bottom:8px">${esc(t.name)}</h1>
      <p style="font-size:14px;color:var(--text-body);margin-bottom:14px;max-width:760px;line-height:1.55">${esc(t.description || 'Chưa có mô tả cho giải đấu này.')}</p>

      <!-- Format explanation rule notice -->
      ${t.format === 'ROUND_ROBIN' ? `
        <div class="notice" style="background:rgba(168,85,247,0.1);border-color:rgba(168,85,247,0.35);color:#d8b4fe">
          ⚡ <strong>Thể thức Đấu vòng tròn (Round-Robin)</strong>: Mọi thí sinh đều thi đấu với nhau. Sau mỗi trận: <strong>Thắng = 3 điểm · Hòa = 1 điểm · Thua = 0 điểm</strong>. Người đứng đầu Bảng xếp hạng khi kết thúc là Quán quân!
        </div>` : `
        <div class="notice" style="background:rgba(244,63,94,0.1);border-color:rgba(244,63,94,0.35);color:#fda4af">
          ⚡ <strong>Thể thức Đấu loại trực tiếp (Knockout)</strong>: Chia cặp đấu knock-out từng vòng. <strong>Nếu số lượng người lẻ, thí sinh hạt giống được vào thẳng (BYE) vòng sau</strong> và đấu loại trực tiếp đến khi tìm được người vô địch!
        </div>`}

      <!-- Podium Banner if completed -->
      ${t.status === 'COMPLETED' && (t.champion || t.runnerUp) ? `
        <div class="tournament-podium-wrap">
          ${t.champion ? `
            <div class="podium-box champion">
              <span class="podium-icon">🏆</span>
              <div class="podium-title">Quán quân (Vô địch)</div>
              <div class="podium-name">${esc(t.champion.username)}</div>
              <div class="podium-bot">Bot: ${esc(t.champion.botName || 'Official Bot')}</div>
            </div>` : ''}
          ${t.runnerUp ? `
            <div class="podium-box runnerup">
              <span class="podium-icon">🥈</span>
              <div class="podium-title">Á quân</div>
              <div class="podium-name">${esc(t.runnerUp.username)}</div>
              <div class="podium-bot">Bot: ${esc(t.runnerUp.botName || 'Official Bot')}</div>
            </div>` : ''}
          ${t.thirdPlace ? `
            <div class="podium-box thirdplace">
              <span class="podium-icon">🥉</span>
              <div class="podium-title">Hạng ba</div>
              <div class="podium-name">${esc(t.thirdPlace.username)}</div>
              <div class="podium-bot">Bot: ${esc(t.thirdPlace.botName || 'Official Bot')}</div>
            </div>` : ''}
        </div>` : ''}

      <!-- Player Registration Box -->
      ${t.status === 'REGISTRATION' ? `
        <div style="background:var(--bg-secondary);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin-top:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">
          <div>
            <strong style="color:var(--text-title);display:block;margin-bottom:4px">Khu vực Đăng ký Thí sinh</strong>
            ${myEntry ? `
              <p class="small muted" style="margin:0">
                Bạn đã đăng ký bot chính thức: <span style="color:var(--accent);font-weight:700">${esc(myEntry.submissionName)}</span> (${esc(myEntry.submissionLang)}) · 
                Trạng thái: <span style="font-weight:700;color:${myEntry.status==='APPROVED'?'#4ade80':'#fb923c'}">${myEntry.status==='APPROVED'?'Đã được duyệt ✓':'Đang chờ duyệt'}</span>
              </p>` : `
              <p class="small muted" style="margin:0">Chọn 1 bot đã upload từ tài khoản của bạn để đăng ký thi đấu giải này.</p>`}
          </div>
          <div style="display:flex;gap:8px">
            ${myEntry ? `
              <button class="btn sm secondary" onclick="openRegisterTournamentModal('${t.id}')">Đổi bot</button>
              <button class="btn sm secondary danger" onclick="submitUnregisterTournament('${t.id}')">Hủy đăng ký</button>
            ` : `
              <button class="btn btn-accent" onclick="openRegisterTournamentModal('${t.id}')">✍ Đăng ký tham gia giải</button>
            `}
          </div>
        </div>` : ''}

      <!-- Admin Control Console (Only for Admin / Judge) -->
      ${isAdmin ? `
        <div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.25);border-radius:12px;padding:16px 20px;margin-top:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
            <span style="font-size:12px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:0.5px">⚙️ Bảng điều khiển Trọng tài / Ban tổ chức</span>
            <span class="tiny muted">Quyền hạn của bạn: ${esc(authState.role)}</span>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            ${t.status === 'DRAFT' ? `<button class="btn btn-accent sm" onclick="adminOpenRegistration('${t.id}')">📢 Mở cổng đăng ký</button>` : ''}
            ${t.status === 'REGISTRATION' ? `<button class="btn btn-accent sm" onclick="adminLockSubmissions('${t.id}')">🔒 Khóa bài nộp & Chốt danh sách</button>` : ''}
            ${['SUBMISSIONS_CLOSED', 'REGISTRATION', 'DRAFT'].includes(t.status) ? `<button class="btn btn-accent sm" onclick="adminGenerateBracket('${t.id}')">🎲 Bốc thăm & Tạo lịch thi đấu</button>` : ''}
            ${t.status === 'RUNNING' ? `
              <button class="btn btn-accent sm" onclick="adminRunAllMatches('${t.id}')">⚡ Chạy tất cả trận trong vòng này</button>
              <button class="btn secondary sm" onclick="adminPublishResults('${t.id}')">🏆 Công bố kết quả giải đấu</button>
            ` : ''}
            <button class="btn sm secondary danger" onclick="adminDeleteTournament('${t.id}')">🗑 Xóa giải</button>
          </div>
        </div>` : ''}
    </div>
  `;

  // Sub-Tabs Nav
  const activeTab = state.tournamentTab || (t.format === 'ROUND_ROBIN' ? 'standings' : 'bracket');
  const tabsNavHtml = `
    <div class="t-tabs-nav">
      ${t.format === 'ROUND_ROBIN' ? `
        <button class="t-tab-btn ${activeTab==='standings'?'active':''}" onclick="switchTournamentTab('standings')">
          📊 Bảng xếp hạng (Standings)
        </button>` : `
        <button class="t-tab-btn ${activeTab==='bracket'?'active':''}" onclick="switchTournamentTab('bracket')">
          🌲 Nhánh đấu (Bracket)
        </button>`}
      <button class="t-tab-btn ${activeTab==='matches'?'active':''}" onclick="switchTournamentTab('matches')">
        ⚔ Lịch thi đấu & Kết quả (${t.matches?.length || 0})
      </button>
      <button class="t-tab-btn ${activeTab==='participants'?'active':''}" onclick="switchTournamentTab('participants')">
        👥 Thí sinh & Bot (${t.entries?.length || 0})
      </button>
      <button class="t-tab-btn ${activeTab==='referee-log'?'active':''}" onclick="switchTournamentTab('referee-log')">
        📜 Nhật ký trọng tài (${t.refereeLogs?.length || 0})
      </button>
    </div>
  `;

  let tabContentHtml = '';

  // Tab 1: Standings (Round Robin)
  if (activeTab === 'standings') {
    const standings = t.standings || [];
    tabContentHtml = `
      <div class="card" style="padding:20px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 14px">
          <div>
            <h3 style="margin:0">Bảng xếp hạng Đấu Vòng Tròn</h3>
            <p class="small muted" style="margin:4px 0 0">Quy tắc điểm: <strong>Thắng +3 điểm · Hòa +1 điểm · Thua 0 điểm</strong>. Xếp hạng theo Điểm → Số trận thắng → Tổng lượt đấu.</p>
          </div>
        </div>

        ${!standings.length ? `<p class="muted" style="padding:20px;text-align:center">Chưa có dữ liệu bảng xếp hạng. Hãy bốc thăm để bắt đầu giải đấu.</p>` : `
          <div class="standings-table-wrap">
            <table class="standings-table">
              <thead>
                <tr>
                  <th style="width:60px">Hạng</th>
                  <th>Thí sinh</th>
                  <th>Bot chính thức</th>
                  <th style="text-align:center">Trận</th>
                  <th style="text-align:center">Thắng</th>
                  <th style="text-align:center">Hòa</th>
                  <th style="text-align:center">Thua</th>
                  <th style="text-align:center">Lượt đấu</th>
                  <th style="text-align:center">Điểm số (Pts)</th>
                </tr>
              </thead>
              <tbody>
                ${standings.map((s, idx) => {
                  const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal';
                  return `
                    <tr class="${idx === 0 ? 'top-1' : ''}">
                      <td><span class="rank-pill ${rankClass}">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</span></td>
                      <td><strong>${esc(s.username)}</strong></td>
                      <td><code style="color:var(--text-title)">${esc(s.botName)}</code> <span class="tiny muted">(${esc(s.botLang)})</span></td>
                      <td style="text-align:center">${s.played}</td>
                      <td style="text-align:center;color:#4ade80;font-weight:700">${s.wins}</td>
                      <td style="text-align:center;color:#facc15">${s.draws}</td>
                      <td style="text-align:center;color:#f87171">${s.losses}</td>
                      <td style="text-align:center;color:var(--text-muted)">${s.turns}</td>
                      <td style="text-align:center"><span class="points-pill">${s.points} pts</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // Tab 2: Bracket Tree View (Knockout)
  else if (activeTab === 'bracket') {
    const rounds = t.rounds || [];
    const matches = t.matches || [];

    tabContentHtml = `
      <div class="card" style="padding:20px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 14px">
          <div>
            <h3 style="margin:0">Sơ đồ Nhánh đấu Loại trực tiếp (Knockout Bracket)</h3>
            <p class="small muted" style="margin:4px 0 0">Đấu loại trực tiếp từng cặp. Thí sinh thắng tiến vào vòng kế tiếp. Nếu lẻ người, thí sinh hạt giống được <strong>vào thẳng (BYE)</strong>!</p>
          </div>
        </div>

        ${!rounds.length ? `<p class="muted" style="padding:20px;text-align:center">Chưa tạo nhánh đấu. Ban tổ chức cần bốc thăm và tạo vòng.</p>` : `
          <div class="bracket-tree-container">
            ${rounds.map(r => {
              const rMatches = matches.filter(m => r.matchIds?.includes(m.id));
              return `
                <div class="bracket-column">
                  <div class="bracket-col-title">${esc(r.name)}</div>
                  ${rMatches.map(m => {
                    const isBye = m.isBye;
                    const pAWon = m.status === 'COMPLETED' && m.winner === 'PLAYER_A';
                    const pBWon = m.status === 'COMPLETED' && m.winner === 'PLAYER_B';
                    return `
                      <div class="bracket-match-node ${m.status.toLowerCase()} ${isBye ? 'is-bye' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11px;color:var(--text-muted)">
                          <span>${esc(m.id)}</span>
                          ${isBye ? `<span class="bracket-bye-badge">⚡ Vào thẳng (BYE)</span>` : `<span>${esc(m.status)}</span>`}
                        </div>

                        <!-- Player A -->
                        <div class="bracket-player-row ${pAWon ? 'winner' : ''}">
                          <span>${m.playerA ? esc(m.playerA.username) : '<em class="muted">Chờ đối thủ...</em>'}</span>
                          <span>${pAWon ? '✓' : ''}</span>
                        </div>

                        <!-- Player B -->
                        <div class="bracket-player-row ${pBWon ? 'winner' : ''}">
                          <span>${m.playerB ? esc(m.playerB.username) : isBye ? '<em style="color:#60a5fa">MIỄN ĐẤU (BYE)</em>' : '<em class="muted">Chờ đối thủ...</em>'}</span>
                          <span>${pBWon ? '✓' : ''}</span>
                        </div>

                        ${m.status === 'COMPLETED' && !isBye ? `
                          <div style="margin-top:8px;padding-top:6px;border-top:1px dashed var(--line-subtle);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">
                            <span class="tiny muted">Tỉ số: <strong style="color:var(--text-title)">${esc(m.score)}</strong></span>
                            <div style="display:flex;gap:4px">
                              <button class="btn sm secondary" style="padding:3px 8px;font-size:11px;font-weight:700" onclick="watchTournamentReplay('${m.id}','${esc(m.playerA?.username||'')}','${esc(m.playerB?.username||'')}','${t.id}')">👁 Xem trận</button>
                              ${isAdmin ? `<button class="btn sm secondary" style="padding:3px 8px;font-size:11px;color:var(--accent);font-weight:700" onclick="adminRematchMatch('${t.id}','${m.id}')">⚔ Đấu lại</button>` : ''}
                            </div>
                          </div>` : (!isBye && m.playerA && m.playerB && isAdmin && m.status === 'QUEUED' ? `
                          <div style="margin-top:8px;padding-top:6px;border-top:1px dashed var(--line-subtle);display:flex;justify-content:flex-end">
                            <button class="btn sm btn-accent" style="padding:3px 8px;font-size:11px" onclick="adminStartMatch('${t.id}','${m.id}')">▶ Chạy trận</button>
                          </div>` : '')}
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // Tab 3: Matches & Schedule
  else if (activeTab === 'matches') {
    const rounds = t.rounds || [];
    const matches = t.matches || [];

    tabContentHtml = `
      <div class="card" style="padding:20px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 14px">
          <div>
            <h3 style="margin:0">Lịch thi đấu & Kết quả các trận</h3>
            <p class="small muted" style="margin:4px 0 0">Chi tiết diễn biến các vòng đấu, tỉ số và công cụ điều hành trận đấu của Trọng tài.</p>
          </div>
        </div>

        ${!matches.length ? `<p class="muted" style="padding:20px;text-align:center">Chưa có trận đấu nào được tạo.</p>` : `
          <div>
            ${rounds.map(r => {
              const rMatches = matches.filter(m => r.matchIds?.includes(m.id));
              return `
                <div style="margin-bottom:28px">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid var(--line);padding-bottom:8px">
                    <strong style="font-size:16px;color:var(--text-title)">${esc(r.name)}</strong>
                    <span class="tiny muted">${rMatches.length} trận đấu · Trạng thái: ${esc(r.status)}</span>
                  </div>

                  <div class="round-matches-grid">
                    ${rMatches.map(m => {
                      const pA = m.playerA;
                      const pB = m.playerB;
                      const isBye = m.isBye;
                      return `
                        <div class="t-match-card">
                          <div class="t-match-header" style="cursor:${m.status === 'COMPLETED' && !isBye ? 'pointer' : 'default'}" ${m.status === 'COMPLETED' && !isBye ? `onclick="watchTournamentReplay('${m.id}','${esc(pA?.username||'')}','${esc(pB?.username||'')}','${t.id}')" title="Bấm để xem trực tiếp diễn biến trận"` : ''}>
                            <div style="display:flex;align-items:center;gap:6px">
                              <span>Mã trận: <strong style="color:var(--text-title)">${esc(m.id)}</strong></span>
                              ${m.status === 'COMPLETED' && !isBye ? `<span class="chip" style="background:rgba(74,222,128,0.15);color:var(--accent);font-size:10px;padding:1px 6px">👁 Xem trực tiếp</span>` : ''}
                            </div>
                            <span class="t-badge ${m.status.toLowerCase()}">${esc(m.status)}</span>
                          </div>

                          <div class="t-match-body" style="cursor:${m.status === 'COMPLETED' && !isBye ? 'pointer' : 'default'}" ${m.status === 'COMPLETED' && !isBye ? `onclick="watchTournamentReplay('${m.id}','${esc(pA?.username||'')}','${esc(pB?.username||'')}','${t.id}')" title="Bấm để xem trực tiếp diễn biến trận"` : ''}>
                            <!-- Team A -->
                            <div class="t-match-team">
                              <span class="t-match-team-name">${pA ? esc(pA.username) : '—'}</span>
                              <span class="t-match-bot-name">${pA ? esc(pA.botName) : ''}</span>
                            </div>

                            <!-- Score / Status -->
                            <div style="text-align:center">
                              <div class="t-match-score-badge">${isBye ? 'BYE' : esc(m.score || 'vs')}</div>
                              ${m.turns ? `<span class="tiny muted" style="display:block;margin-top:4px">${m.turns} lượt</span>` : ''}
                            </div>

                            <!-- Team B -->
                            <div class="t-match-team right">
                              <span class="t-match-team-name">${pB ? esc(pB.username) : isBye ? 'Miễn đấu' : '—'}</span>
                              <span class="t-match-bot-name">${pB ? esc(pB.botName) : ''}</span>
                            </div>
                          </div>

                          ${m.reason ? `
                            <div class="tiny muted" style="background:var(--bg-secondary);padding:6px 10px;border-radius:6px">
                              Ghi chú: ${esc(m.reason)}
                            </div>` : ''}

                          <div class="t-match-footer">
                            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
                              ${m.status === 'COMPLETED' && !isBye ? `
                                <button class="btn sm btn-accent" onclick="watchTournamentReplay('${m.id}','${esc(pA?.username||'')}','${esc(pB?.username||'')}','${t.id}')">👁 Xem trực tiếp trận</button>` : ''}
                              ${isAdmin && m.status === 'COMPLETED' && !isBye ? `
                                <button class="btn sm secondary" style="color:var(--accent);font-weight:700" onclick="adminRematchMatch('${t.id}','${m.id}')">⚔ Đấu lại</button>` : ''}
                            </div>

                            ${isAdmin && !isBye ? `
                              <div style="display:flex;gap:6px;flex-wrap:wrap">
                                ${m.status === 'QUEUED' ? `<button class="btn sm btn-accent" onclick="adminStartMatch('${t.id}','${m.id}')">▶ Chạy trận</button>` : ''}
                                ${['QUEUED','RUNNING'].includes(m.status) ? `<button class="btn sm secondary" onclick="adminPauseMatch('${t.id}','${m.id}')">⏸ Tạm dừng</button>` : ''}
                                ${m.status === 'PAUSED' ? `<button class="btn sm secondary" onclick="adminResumeMatch('${t.id}','${m.id}')">▶ Tiếp tục</button>` : ''}
                                ${m.status !== 'COMPLETED' ? `<button class="btn sm secondary danger" onclick="adminCancelMatch('${t.id}','${m.id}')">✕ Hủy</button>` : ''}
                                <button class="btn sm secondary" onclick="openAdjudicateModal('${t.id}','${m.id}')">⚖ Xử kết quả</button>
                              </div>` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // Tab 4: Participants
  else if (activeTab === 'participants') {
    const entries = t.entries || [];
    tabContentHtml = `
      <div class="card" style="padding:20px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 14px;flex-wrap:wrap;gap:10px">
          <div>
            <h3 style="margin:0">Danh sách Thí sinh & Bot chính thức</h3>
            <p class="small muted" style="margin:4px 0 0">Mỗi thí sinh thi đấu với một bot chính thức duy nhất đã đăng ký và được duyệt.</p>
          </div>
          ${isAdmin ? `
            <div>
              <button class="btn sm secondary" onclick="adminApproveAll('${t.id}')">✓ Duyệt tất cả thí sinh</button>
            </div>` : ''}
        </div>

        ${!entries.length ? `<p class="muted" style="padding:20px;text-align:center">Chưa có thí sinh nào đăng ký tham gia.</p>` : `
          <div class="standings-table-wrap">
            <table class="standings-table">
              <thead>
                <tr>
                  <th>Thí sinh</th>
                  <th>Bot chính thức</th>
                  <th>Ngôn ngữ</th>
                  <th>Phiên bản</th>
                  <th>Thời gian đăng ký</th>
                  <th style="text-align:center">Trạng thái</th>
                  ${isAdmin ? `<th style="text-align:right">Thao tác</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${entries.map(e => `
                  <tr>
                    <td><strong>${esc(e.username)}</strong></td>
                    <td><code style="color:var(--text-title)">${esc(e.submissionName)}</code></td>
                    <td><span class="tiny" style="background:var(--bg-secondary);padding:3px 8px;border-radius:4px">${esc(e.submissionLang)}</span></td>
                    <td>${esc(e.submissionVersion || 'v1.0')}</td>
                    <td class="tiny muted">${new Date(e.joinedAt).toLocaleString('vi-VN')}</td>
                    <td style="text-align:center">
                      <span class="t-badge ${e.status.toLowerCase()}">${e.status === 'APPROVED' ? 'Đã duyệt' : e.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}</span>
                    </td>
                    ${isAdmin ? `
                      <td style="text-align:right">
                        ${e.status !== 'APPROVED' ? `<button class="btn sm secondary" style="padding:2px 8px;font-size:11px" onclick="adminApproveParticipant('${t.id}','${e.userId}')">✓ Duyệt</button>` : ''}
                        ${e.status !== 'REJECTED' ? `<button class="btn sm secondary danger" style="padding:2px 8px;font-size:11px" onclick="adminRejectParticipant('${t.id}','${e.userId}')">✕ Từ chối</button>` : ''}
                      </td>` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // Tab 5: Referee Audit Log
  else if (activeTab === 'referee-log') {
    const logs = t.refereeLogs || [];
    tabContentHtml = `
      <div class="card" style="padding:20px">
        ${tcgFrameHTML()}
        <div class="section-head" style="padding:0 0 14px">
          <div>
            <h3 style="margin:0">Nhật ký Thao tác của Trọng tài & Ban tổ chức</h3>
            <p class="small muted" style="margin:4px 0 0">Toàn bộ thao tác tạo giải, duyệt thí sinh, bốc thăm, điều khiển trận và công bố kết quả đều được lưu vết minh bạch.</p>
          </div>
        </div>

        ${!logs.length ? `<p class="muted" style="padding:20px;text-align:center">Chưa có nhật ký ghi nhận.</p>` : `
          <div class="referee-log-list">
            ${logs.map(l => `
              <div class="referee-log-item">
                <div class="log-meta-row">
                  <div>
                    <span class="log-action-tag">${esc(l.action)}</span> · 
                    <strong style="color:var(--text-title);margin-left:4px">${esc(l.actorName)}</strong> 
                    <span class="tiny" style="color:var(--text-muted)">(${esc(l.actorRole)})</span>
                  </div>
                  <span>${new Date(l.timestamp).toLocaleString('vi-VN')}</span>
                </div>
                <div style="font-size:13.5px;color:var(--text-body);line-height:1.45">${esc(l.details)}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  return heroHtml + tabsNavHtml + tabContentHtml;
}

/* ============================================================
   ADMIN TOURNAMENT DASHBOARD VIEW
   ============================================================ */

function admin() {
  if (typeof authState === 'undefined' || !authState.authenticated) {
    return header(t('adminEyebrow'), t('adminTitle'), t('adminDesc')) + emptyCard(t('needLogin'), t('needLoginDesc'));
  }
  if (!['JUDGE', 'ADMIN'].includes(authState.role)) {
    return header(t('adminEyebrow'), t('adminTitle'), t('adminDesc')) + emptyCard(t('noPermission'), t('noPermissionDesc'));
  }
  return adminTournamentDashboardView();
}

function adminTournamentDashboardView() {
  const tourneys = state.tournaments || [];
  const registrationCount = tourneys.filter(t => t.status === 'REGISTRATION').length;
  const runningCount = tourneys.filter(t => t.status === 'RUNNING').length;
  const completedCount = tourneys.filter(t => t.status === 'COMPLETED').length;

  return `
    <div class="section-head" style="margin-bottom:20px;flex-wrap:wrap;gap:14px">
      <div>
        <div class="hero-eyebrow-chip">QUẢN LÝ GIẢI ĐẤU · ADMIN & JUDGE</div>
        <h1 style="font-size:28px;font-weight:900;color:var(--text-title);margin:8px 0 6px">Trung tâm Điều hành & Trọng tài</h1>
        <p class="muted" style="max-width:680px">Thiết lập giải đấu, mở đăng ký, duyệt người tham gia, chọn bot chính thức, khóa bài nộp, tạo vòng, ghép cặp, điều hành trận đấu và công bố kết quả.</p>
      </div>
      <div>
        <button class="btn btn-accent" onclick="openCreateTournamentModal()">${svg('plus')} Tạo giải đấu mới</button>
      </div>
    </div>

    <!-- Quick Stats Metric Cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px">
      <div class="card" style="padding:18px">
        ${tcgFrameHTML()}
        <span class="tiny muted" style="font-weight:800;text-transform:uppercase">Tổng số giải</span>
        <div style="font-size:26px;font-weight:900;color:var(--text-title);margin-top:6px">${tourneys.length}</div>
      </div>
      <div class="card" style="padding:18px">
        ${tcgFrameHTML()}
        <span class="tiny muted" style="font-weight:800;text-transform:uppercase">Đang mở đăng ký</span>
        <div style="font-size:26px;font-weight:900;color:#4ade80;margin-top:6px">${registrationCount}</div>
      </div>
      <div class="card" style="padding:18px">
        ${tcgFrameHTML()}
        <span class="tiny muted" style="font-weight:800;text-transform:uppercase">Đang thi đấu</span>
        <div style="font-size:26px;font-weight:900;color:#60a5fa;margin-top:6px">${runningCount}</div>
      </div>
      <div class="card" style="padding:18px">
        ${tcgFrameHTML()}
        <span class="tiny muted" style="font-weight:800;text-transform:uppercase">Đã hoàn tất</span>
        <div style="font-size:26px;font-weight:900;color:#facc15;margin-top:6px">${completedCount}</div>
      </div>
    </div>

    <!-- Tournaments Management Table -->
    <div class="card" style="padding:22px">
      ${tcgFrameHTML()}
      <div class="section-head" style="padding:0 0 14px">
        <h3 style="margin:0">Danh sách Tất cả Giải đấu</h3>
      </div>

      ${!tourneys.length ? `<p class="muted" style="padding:20px;text-align:center">Chưa có giải đấu nào trong hệ thống. Hãy tạo giải đấu đầu tiên!</p>` : `
        <div class="standings-table-wrap">
          <table class="standings-table">
            <thead>
              <tr>
                <th>Tên giải đấu</th>
                <th>Thể thức</th>
                <th>Trạng thái</th>
                <th style="text-align:center">Thí sinh</th>
                <th style="text-align:center">Tiến độ trận</th>
                <th style="text-align:right">Hành động quản trị</th>
              </tr>
            </thead>
            <tbody>
              ${tourneys.map(t => `
                <tr>
                  <td>
                    <strong>${esc(t.name)}</strong>
                    <div class="tiny muted">${esc(t.id)}</div>
                  </td>
                  <td>${tournamentFormatBadge(t.format)}</td>
                  <td>${tournamentStatusBadge(t.status)}</td>
                  <td style="text-align:center"><strong>${t.approvedCount}</strong> / ${t.entryCount}</td>
                  <td style="text-align:center"><strong>${t.completedMatches}</strong> / ${t.matchCount}</td>
                  <td style="text-align:right">
                    <button class="btn sm btn-accent" style="padding:3px 10px;font-size:11.5px" onclick="openTournamentDetail('${t.id}')">Quản trị giải →</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

/* ============================================================
   MODALS: CREATE, REGISTER, ADJUDICATE
   ============================================================ */

function createTournamentModal() {
  const currentFmt = state.newTournamentFormat || 'ROUND_ROBIN';
  return `
    <div class="modaloverlay" onclick="if(event.target===this){state.modal=null;render()}">
      <div class="modal" role="dialog" aria-modal="true" style="max-width:560px">
        ${tcgFrameHTML()}
        <div class="modal-head">
          <div>
            <div class="hero-eyebrow-chip">BAN TỔ CHỨC · TẠO GIẢI ĐẤU</div>
            <h2 style="margin-top:6px">Thiết lập Giải đấu Mới</h2>
          </div>
          <button class="iconbtn" onclick="state.modal=null;render()">${svg('close')}</button>
        </div>

        <form onsubmit="submitCreateTournament(event)">
          <div class="form-group">
            <label class="form-label" for="newTourneyName">Tên giải đấu *</label>
            <input class="field" id="newTourneyName" placeholder="VD: Giải Vô Địch OTT Mùa Thu 2026" required minlength="3" maxlength="100">
          </div>

          <div class="form-group">
            <label class="form-label" for="newTourneyDesc">Mô tả giải đấu</label>
            <textarea class="field" id="newTourneyDesc" rows="2" placeholder="VD: Giải đấu giao hữu dành cho sinh viên IT..."></textarea>
          </div>

          <!-- Format Choice Selector -->
          <div class="form-group">
            <label class="form-label">Chọn thể thức thi đấu *</label>
            <div class="format-choice-wrap">
              <div class="format-choice-card ${currentFmt==='ROUND_ROBIN'?'selected':''}" onclick="selectTournamentFormat('ROUND_ROBIN')">
                <div class="format-choice-title">
                  <span>🔄</span> Đấu vòng tròn
                </div>
                <div class="format-choice-desc">
                  Mỗi cặp đấu với nhau. Thắng <strong>+3 điểm</strong>, Hòa <strong>+1 điểm</strong>, Thua <strong>0 điểm</strong>. Người cao điểm nhất là Quán quân.
                </div>
              </div>

              <div class="format-choice-card ${currentFmt==='SINGLE_ELIMINATION'?'selected':''}" onclick="selectTournamentFormat('SINGLE_ELIMINATION')">
                <div class="format-choice-title">
                  <span>⚡</span> Đấu loại trực tiếp
                </div>
                <div class="format-choice-desc">
                  Chia cặp knock-out. <strong>Nếu lẻ người sẽ được vào thẳng vòng sau</strong> và đấu loại trực tiếp đến khi tìm ra Quán quân.
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px">
            <div class="form-group">
              <label class="form-label" for="newTourneyMoves">Lượt tối đa</label>
              <input class="field" id="newTourneyMoves" type="number" min="50" max="1000" value="200">
            </div>
            <div class="form-group">
              <label class="form-label" for="newTourneyPieces">Số quân cờ</label>
              <input class="field" id="newTourneyPieces" type="number" min="2" max="28" value="6">
            </div>
            <div class="form-group">
              <label class="form-label" for="newTourneyFirst">Đi trước</label>
              <select class="field" id="newTourneyFirst">
                <option value="Random">Ngẫu nhiên</option>
                <option value="Player A">Đội A</option>
                <option value="Player B">Đội B</option>
              </select>
            </div>
          </div>

          <div class="row" style="justify-content:flex-end;gap:10px;margin-top:20px">
            <button class="btn secondary" type="button" onclick="state.modal=null;render()">Hủy</button>
            <button class="btn btn-accent" type="submit">Tạo giải đấu ${svg('arrow')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function registerTournamentModal() {
  const ownBots = (state.submissions || []).filter(b => b.userId === authState.id || b.ownedBy === authState.username);
  return `
    <div class="modaloverlay" onclick="if(event.target===this){state.modal=null;render()}">
      <div class="modal" role="dialog" aria-modal="true" style="max-width:480px">
        ${tcgFrameHTML()}
        <div class="modal-head">
          <div>
            <div class="hero-eyebrow-chip">ĐĂNG KÝ THI ĐẤU</div>
            <h2 style="margin-top:6px">Chọn Bot Chính Thức</h2>
          </div>
          <button class="iconbtn" onclick="state.modal=null;render()">${svg('close')}</button>
        </div>

        <form onsubmit="submitRegisterTournament(event)">
          <div class="form-group">
            <label class="form-label" for="regBotSelect">Chọn Bot thi đấu chính thức</label>
            <select class="field" id="regBotSelect" required>
              ${ownBots.map(b => `<option value="${esc(b.id)}">${esc(b.name)} • ${esc(b.lang)} • ${esc(b.version || 'v1.0')}</option>`).join('')}
            </select>
            <p class="tiny muted" style="margin-top:6px">Bot này sẽ được dùng cho mọi trận đấu trong giải sau khi Ban tổ chức khóa bài nộp.</p>
          </div>

          <div class="notice" style="margin:16px 0">
            ℹ️ Sau khi đăng ký, bài nộp của bạn sẽ ở trạng thái <strong>Chờ duyệt</strong>. Ban tổ chức / Trọng tài sẽ phê duyệt trước khi bắt đầu bốc thăm.
          </div>

          <div class="row" style="justify-content:flex-end;gap:10px;margin-top:20px">
            <button class="btn secondary" type="button" onclick="state.modal=null;render()">Hủy</button>
            <button class="btn btn-accent" type="submit">Xác nhận đăng ký ${svg('arrow')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function adjudicateMatchModal() {
  const tourney = state.tournamentDetail;
  const match = tourney?.matches?.find(m => m.id === state.selectedTournamentMatch);
  const pA = match?.playerA?.username || 'Đội A';
  const pB = match?.playerB?.username || 'Đội B';

  return `
    <div class="modaloverlay" onclick="if(event.target===this){state.modal=null;render()}">
      <div class="modal" role="dialog" aria-modal="true" style="max-width:480px">
        ${tcgFrameHTML()}
        <div class="modal-head">
          <div>
            <div class="hero-eyebrow-chip">QUYẾT ĐỊNH TRỌNG TÀI</div>
            <h2 style="margin-top:6px">Xử lý Kết quả Trận</h2>
          </div>
          <button class="iconbtn" onclick="state.modal=null;render()">${svg('close')}</button>
        </div>

        <form onsubmit="submitAdjudicateMatch(event)">
          <div class="notice" style="margin-bottom:16px">
            Trận đấu: <strong>${esc(state.selectedTournamentMatch)}</strong> (${esc(pA)} vs ${esc(pB)})
          </div>

          <div class="form-group">
            <label class="form-label">Chọn phán quyết *</label>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="radio" name="adjWinner" value="PLAYER_A" ${state.adjudicateWinner==='PLAYER_A'?'checked':''} onchange="state.adjudicateWinner=this.value">
                <span>Xử <strong>${esc(pA)}</strong> thắng (1 – 0)</span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="radio" name="adjWinner" value="PLAYER_B" ${state.adjudicateWinner==='PLAYER_B'?'checked':''} onchange="state.adjudicateWinner=this.value">
                <span>Xử <strong>${esc(pB)}</strong> thắng (0 – 1)</span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="radio" name="adjWinner" value="DRAW" ${state.adjudicateWinner==='DRAW'?'checked':''} onchange="state.adjudicateWinner=this.value">
                <span>Xử <strong>Hòa</strong> (0.5 – 0.5)</span>
              </label>
            </div>
          </div>

          <div class="form-group" style="margin-top:14px">
            <label class="form-label" for="adjReason">Lý do xử lý của Trọng tài *</label>
            <textarea class="field" id="adjReason" rows="2" placeholder="VD: Đối phương bot crash/vi phạm quy chế..." required></textarea>
            <p class="tiny muted" style="margin-top:4px">Lý do này sẽ được ghi vào Nhật ký thao tác trọng tài.</p>
          </div>

          <div class="row" style="justify-content:flex-end;gap:10px;margin-top:20px">
            <button class="btn secondary" type="button" onclick="state.modal=null;render()">Hủy</button>
            <button class="btn btn-accent" type="submit">Xác nhận quyết định ${svg('arrow')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
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
        <p class="small muted" style="margin:6px 0 0">Challenge Arena · ${t('challengeArenaDesc')}</p>
      </div>
    </div>
    <div class="notice" id="challengeStatus" style="margin:16px 0">${esc(message)}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:16px 0">
      <div class="form-group">
        <label class="form-label" for="challengeBot">${t('myBotLabel')}</label>
        <select id="challengeBot" class="field" onchange="state.challengeBotId=this.value" ${!own.length||state.challengePending?'disabled':''}>
          ${own.length?own.map(b=>`<option value="${esc(b.id)}" ${b.id===selected?'selected':''}>${esc(b.name)} • ${esc(b.lang)} • ${esc(b.version)}</option>`).join(''):`<option value="">${t('noBotAvailable')}</option>`}
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
  return adminTournamentHub();
}

function adminTournamentHub() {
  const tournaments = state.tournaments || [];
  const draftCount = tournaments.filter(t => t.status === 'DRAFT').length;
  const regCount = tournaments.filter(t => t.status === 'REGISTRATION').length;
  const runCount = tournaments.filter(t => t.status === 'RUNNING').length;
  const doneCount = tournaments.filter(t => t.status === 'COMPLETED').length;

  return `
    <div class="section-head" style="margin-bottom:24px;flex-wrap:wrap;gap:14px">
      <div>
        <div class="hero-eyebrow-chip">BAN TỔ CHỨC & TRỌNG TÀI · ADMIN HUB</div>
        <h1 style="font-size:28px;font-weight:900;color:var(--text-title);margin:8px 0 6px">Trung tâm Quản trị Giải đấu OTT</h1>
        <p class="muted" style="max-width:720px">Thiết lập giải đấu, mở đăng ký, duyệt bài nộp bot chính thức, tạo vòng ghép cặp (Vòng tròn / Loại trực tiếp có vé BYE), điều hành hoãn/tiếp tục/hủy trận và công bố Quán quân.</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-accent" onclick="openCreateTournamentModal()">${svg('plus')} Thiết lập giải đấu mới</button>
        <button class="btn secondary" onclick="loadTournamentsData()">${svg('refresh')} Đồng bộ dữ liệu</button>
      </div>
    </div>

    <!-- Quick Stats Metric Grid -->
    <div class="t-stats-grid" style="margin-bottom:24px">
      <div class="t-stat-box">
        <div class="stat-num" style="color:var(--accent)">${tournaments.length}</div>
        <div class="stat-lbl">Tổng số giải đấu</div>
      </div>
      <div class="t-stat-box">
        <div class="stat-num" style="color:#60a5fa">${regCount}</div>
        <div class="stat-lbl">Đang mở đăng ký</div>
      </div>
      <div class="t-stat-box">
        <div class="stat-num" style="color:#fbbf24">${runCount}</div>
        <div class="stat-lbl">Đang diễn ra thi đấu</div>
      </div>
      <div class="t-stat-box">
        <div class="stat-num" style="color:#4ade80">${doneCount}</div>
        <div class="stat-lbl">Đã chốt kết quả 🏆</div>
      </div>
    </div>

    <!-- Rule / Format Guidelines for Referee -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      <div class="t-panel" style="padding:16px 20px;border-left:4px solid #60a5fa">
        <h4 style="font-size:14px;font-weight:800;color:var(--text-title);margin-bottom:6px">🔄 Quy chế Đấu vòng tròn (Round-Robin)</h4>
        <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5">
          Tất cả thí sinh đấu vòng tròn với nhau. Điểm số: <strong>Thắng = 3 điểm, Hòa = 1 điểm, Thua = 0 điểm</strong>. Người có tổng điểm cao nhất xếp đầu và trở thành Quán quân.
        </p>
      </div>
      <div class="t-panel" style="padding:16px 20px;border-left:4px solid #f59e0b">
        <h4 style="font-size:14px;font-weight:800;color:var(--text-title);margin-bottom:6px">⚡ Quy chế Đấu loại trực tiếp (Single Elimination)</h4>
        <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5">
          Ghép cặp đấu knock-out. <strong>Nếu số thí sinh lẻ</strong>, hệ thống tự động cấp vé <strong>vào thẳng vòng sau (BYE)</strong> cho thí sinh lẻ đến khi tìm ra Quán quân.
        </p>
      </div>
    </div>

    <!-- Active Tournaments Table / Control Panel -->
    <div class="t-panel" style="margin-bottom:30px">
      <div class="t-panel-head">
        <h3 class="t-panel-title">Danh sách Giải đấu cần điều hành (${tournaments.length})</h3>
        <button class="btn sm secondary" onclick="go('tournaments')">Chuyển sang giao diện người xem →</button>
      </div>
      <div class="t-panel-body" style="padding:0">
        ${!tournaments.length ? `
          <div style="padding:30px;text-align:center;color:var(--text-muted)">Chưa có giải đấu nào. Hãy nhấn <strong>Thiết lập giải đấu mới</strong> để bắt đầu.</div>
        ` : `
          <div style="overflow-x:auto">
            <table class="t-standings-table">
              <thead>
                <tr>
                  <th style="padding-left:18px">Giải đấu</th>
                  <th>Thể thức</th>
                  <th>Trạng thái</th>
                  <th>Thí sinh</th>
                  <th>Tiến độ trận</th>
                  <th>Quán quân</th>
                  <th style="text-align:right;padding-right:18px">Thao tác Trọng tài</th>
                </tr>
              </thead>
              <tbody>
                ${tournaments.map(t => `
                  <tr>
                    <td style="padding-left:18px">
                      <div style="font-weight:800;color:var(--text-title);cursor:pointer" onclick="openTournamentDetail('${esc(t.id)}')">${esc(t.name)}</div>
                      <div class="tiny muted">${esc(t.id)}</div>
                    </td>
                    <td>${tournamentFormatBadge(t.format)}</td>
                    <td>${tournamentStatusBadge(t.status)}</td>
                    <td><strong>${t.approvedCount}</strong> / ${t.entryCount}</td>
                    <td><strong>${t.completedMatches}</strong> / ${t.matchCount}</td>
                    <td>
                      ${t.champion ? `<span style="color:#facc15;font-weight:800">🏆 ${esc(t.champion.username)}</span>` : '<span class="muted">Chưa chốt</span>'}
                    </td>
                    <td style="text-align:right;padding-right:18px">
                      <div style="display:flex;justify-content:flex-end;gap:6px;align-items:center">
                        <button class="btn sm" onclick="openTournamentDetail('${esc(t.id)}')">Quản trị & Xem chi tiết</button>
                        ${t.status === 'DRAFT' ? `
                          <button class="btn sm secondary" style="color:#60a5fa" onclick="adminOpenRegistration('${esc(t.id)}')">Mở ĐK</button>
                        ` : ''}
                        ${t.status === 'REGISTRATION' ? `
                          <button class="btn sm secondary" style="color:#fbbf24" onclick="adminLockSubmissions('${esc(t.id)}')">Khóa bài</button>
                        ` : ''}
                        ${t.status === 'SUBMISSIONS_CLOSED' ? `
                          <button class="btn sm btn-accent" onclick="adminGenerateBracket('${esc(t.id)}')">Tạo vòng</button>
                        ` : ''}
                        <button class="btn sm secondary" style="color:#f87171" onclick="adminDeleteTournament('${esc(t.id)}')" title="Xóa giải">🗑</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
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
        <div class="form-group">
          <label class="form-label">${t('modalLang')}</label>
          <select id="uploadLang" class="field" required>
            <option>Python</option>
            <option>Java</option>
            <option>C</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t('modalVersion')}</label>
          <input class="field" id="uploadVersion" value="v4.0" maxlength="25" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t('modalSource')}</label>
          <div class="dropzone" onclick="document.getElementById('sourceFile').click()">
            <div class="big">⇧</div>
            <strong id="fileLabel" style="color:var(--text-title)">${t('modalChooseFile')}</strong>
            <p style="color:var(--text-muted)">${t('modalFileHelp')}</p>
            <input id="sourceFile" type="file" accept=".py,.java,.c" style="display:none" onchange="state.selectedFile=this.files[0];document.getElementById('fileLabel').textContent=this.files[0]?.name||'${t('modalChooseFile')}'" required>
          </div>
        </div>
        <div class="notice" style="margin-bottom:20px">${t('modalNotice')}</div>
        <div class="row" style="justify-content:flex-end;gap:10px">
          <button class="btn secondary" type="button" onclick="state.modal=null;render()">${t('modalCancel')}</button>
          <button class="btn btn-accent" type="submit">${t('modalSubmit')} ${svg('arrow')}</button>
        </div>
      </form>
    </div>
  </div>`;
}

async function saveSubmission(e){
  e.preventDefault();
  let f=document.getElementById('sourceFile').files[0];
  if(!f)return notice(t('selectSourceNotice'));
  let lang=document.getElementById('uploadLang').value;
  let ext=f.name.split('.').pop().toLowerCase();
  if(!['py','java','c'].includes(ext))return notice(t('singleExtNotice'));
  if((ext==='py'&&lang!=='Python')||(ext==='java'&&lang!=='Java')||(ext==='c'&&lang!=='C'))return notice(t('langMismatchNotice'));
  try{
    const content=await f.text();
    await api.post('/submissions',{name:f.name,lang,version:document.getElementById('uploadVersion').value,content});
    state.modal=null;state.selectedFile=null;
    if(typeof loadBackend==='function')await loadBackend();
    notice(t('uploadSuccessNotice'));
  }catch(err){notice(t('uploadFailNotice')+err.message)}
}

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

    <!-- Center Navigation Links -->
    <nav class="nav-menu" aria-label="Main Navigation">
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
      <button class="nav-item-btn ${state.page==='tournaments'&&!state.selectedTournamentId?'active':''}" onclick="goToTournamentsList()">
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
    <button class="nav-item-btn ${state.page==='tournaments'&&!state.selectedTournamentId?'active':''}" onclick="goToTournamentsList()">${svg('trophy', 16)} <span>${t('navTournaments')}</span></button>
    <button class="nav-item-btn ${state.page==='submit'?'active':''}" onclick="go('submit')">${svg('bot', 16)} <span>${t('navSubmit')}</span></button>
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

  ${state.modal==='upload'?uploadModal():state.modal==='apiDocs'?apiDocsModal():state.modal==='createTournament'?createTournamentModal():state.modal==='registerTournament'?registerTournamentModal():state.modal==='adjudicateMatch'?adjudicateMatchModal():''}`;

  if(state.page==='overview'){
    setupSplitScrollObserver();
  }
}

/* IntersectionObserver for Sticky Split-Scroll Focus */
function setupSplitScrollObserver(){
  setTimeout(()=>{
    if(typeof document.querySelectorAll !== 'function') return;
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
  const raw = location.hash.replace('#','');
  if (raw.startsWith('tournament/')) {
    const tourneyId = decodeURIComponent(raw.replace('tournament/', ''));
    if (tourneyId && state.selectedTournamentId !== tourneyId) {
      openTournamentDetail(tourneyId);
    }
    return;
  }
  const next = raw || 'overview';
  if (next === 'tournaments') {
    if (state.selectedTournamentId) {
      state.selectedTournamentId = null;
      state.tournamentDetail = null;
    }
    state.page = 'tournaments';
    state.playing = false;
    clearInterval(timer);
    render();
  } else if (state.page !== next) {
    state.selectedTournamentId = null;
    state.tournamentDetail = null;
    state.page = next;
    state.playing = false;
    clearInterval(timer);
    render();
  }
});

render();
if (state.selectedTournamentId) {
  loadTournamentDetail(state.selectedTournamentId);
}


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
