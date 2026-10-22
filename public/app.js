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
    quickStartTitle:'Hướng dẫn nhanh',quickStartChip:'BẮT ĐẦU NHANH',step1Title:'Viết thuật toán Bot',step1Desc:'Lập trình bot bằng Python, Java hoặc C theo luật chơi OTT 8×8 Rock-Paper-Scissors. Tham khảo tài liệu API để hiểu cấu trúc di chuyển.',step2Title:'Tải code lên hệ thống',step2Desc:'Tải file mã nguồn (.py, .java, .c) lên nền tảng. Bot sẽ được lưu vào thư viện và sẵn sàng cho bước tiếp theo.',step3Title:'Tham gia xếp hạng ELO',step3Desc:'Vào khu vực Đấu bot, chọn bot của bạn và gửi yêu cầu ghép trận. Hệ thống tự động tìm đối thủ và cập nhật điểm ELO sau mỗi trận.',
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
    quickStartTitle:'Quick Start',quickStartChip:'GET STARTED',step1Title:'Code your Bot Algorithm',step1Desc:'Program your bot in Python, Java, or C following the 8×8 Rock-Paper-Scissors rules. Follow API docs for move formatting.',step2Title:'Upload code to platform',step2Desc:'Upload your source code file (.py, .java, .c). Your bot is saved to your library and ready for action.',step3Title:'Climb the ELO rankings',step3Desc:'Head to the Bot Duel arena, select your bot, and challenge opponents. System updates your ELO rating after each battle.',
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

const state={
  page:location.hash.replace('#','')||'overview',
  theme:saved('ott-theme','dark'),
  lang:saved('ott-lang','vi'),
  submissions:[...DEFAULT_SUBMISSIONS],
  play:0,playing:false,speed:1,selectedMatch:'M-7042',
  filter:'all',search:'',rankTab:'Global',round:'Round of 16',
  adminLive:true,serverOnline:false,dataStatus:'ready',
  challengeReady:false,challengePending:false,challengeBotId:'',
  modal:null,mobile:false,selectedFile:null,matchMap:'Arena Classic',
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
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme','light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme','dark');
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
  return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'),`<button class="btn secondary" onclick="resetReplay()">${svg('reset')} ${t('replayBtn')}</button>`)+
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
  return header(t('adminEyebrow'),t('adminTitle'),t('adminDesc'))+emptyCard(t('adminWipTitle'),t('adminWipDesc'));
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

  ${state.modal==='upload'?uploadModal():''}`;

  if(state.page==='overview'){
    setupSplitScrollObserver();
  }
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
