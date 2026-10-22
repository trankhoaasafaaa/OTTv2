/* OTT Arena • online player interface */
const ICONS={overview:'▦',arena:'⚔',submit:'⇧',leaderboard:'▥',tournaments:'♜',admin:'⚙',play:'⚔',history:'◷'};
const saved=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const I18N={
  vi:{
    brandSub:'Nền tảng Đấu Bot',navGroupArena:'SÀN ĐẤU · ARENA',navGroupWorkspace:'QUẢN LÝ · WORKSPACE',
    navOverview:'Tổng quan',navPlay:'Đấu bot',navArena:'Sàn đấu chính',navLeaderboard:'Bảng xếp hạng',navTournaments:'Giải đấu',navSubmit:'Bot của tôi',navAdmin:'Quản lý giải',crumbPlatform:'Nền tảng',
    engineStatus:'Engine v2.0 • 8×8 Grid',toggleTheme:'Chuyển giao diện',toggleLang:'Chuyển đổi ngôn ngữ (VI / EN)',signIn:'Đăng nhập',signOut:'Đăng xuất',guest:'Khách',signedIn:'Đã đăng nhập',guestHint:'Đăng nhập để quản lý bot',guestFightHint:'Đăng nhập để thi đấu',footer:'OTTARENA · Nền tảng Đấu Bot · Engine v2.0',dataError:'Chưa tải được dữ liệu mới. Vui lòng thử lại sau ít phút.',retry:'Thử lại',
    heroEyebrow:'ĐẤU TRƯỜNG BOT BATTLE',heroTitle1:'Lập trình chiến thuật.',heroTitle2:'Làm chủ sàn đấu.',heroDesc:'Tải bot lên, tham gia xếp hạng ELO và theo dõi kết quả các trận đấu của cộng đồng. Sàn đấu thuộc về bạn.',heroPlay:'Đấu thử ngay (Sandbox)',heroUpload:'Tải lên Bot',miniArenaTitle:'Sàn đấu 8×8',
    statYourBots:'Bot của bạn',statYourBotsFoot:'Các phiên bản đã nộp',statRankedBots:'Bot được xếp hạng',statRankedBotsFoot:'Trong bảng xếp hạng hiện tại',statMatches:'Trận đã ghi nhận',statMatchesFoot:'Trong danh sách trận hiện tại',statCompleted:'Trận hoàn tất',statCompletedFoot:'Có kết quả được ghi nhận',
    quickStartTitle:'Hướng dẫn nhanh',quickStartChip:'BẮT ĐẦU NHANH',step1Title:'Viết thuật toán Bot',step1Desc:'Lập trình bot bằng Python, Java hoặc C theo luật chơi OTT 8×8 Rock-Paper-Scissors. Tham khảo tài liệu API để hiểu cấu trúc di chuyển.',step2Title:'Tải code lên hệ thống',step2Desc:'Tải file mã nguồn (.py, .java, .c) lên nền tảng. Bot sẽ được lưu vào thư viện và sẵn sàng cho bước tiếp theo.',step3Title:'Tham gia xếp hạng ELO',step3Desc:'Vào khu vực Đấu bot, chọn bot của bạn và gửi yêu cầu ghép trận. Hệ thống tự động tìm đối thủ và cập nhật điểm ELO sau mỗi trận.',
    recentTitle:'Lịch sử đấu gần đây',viewAll:'Xem tất cả →',turnsUnit:'lượt',matchCompleted:'Hoàn tất',matchPending:'Đang diễn ra',replayTitle:'Xem lại trận',noMatches:'Chưa có trận đấu',noMatchesDesc:'Các trận sẽ xuất hiện tại đây sau khi hoàn tất.',findMatchNow:'Tìm trận ngay',
    leaderboardTitle:'Top Bot dẫn đầu',fullBoard:'Bảng đầy đủ →',noRankData:'Chưa có dữ liệu xếp hạng.',
    subHeroEyebrow:'KHU VỰC LẬP TRÌNH',subHeroTitle:'Bot của tôi',subHeroDesc:'Quản lý các phiên bản bot thuộc tài khoản của bạn.',subUploadBtn:'Tải lên bot',subLibraryChip:'KHO BOT',subLibraryTitle:'Danh sách bot của bạn',subLibraryDesc:'Chấp nhận một file .py, .java hoặc .c · Tối đa 500 KB',subHistory:'Lịch sử bài nộp',thSubId:'Mã bài nộp',thSource:'File nguồn',thLang:'Ngôn ngữ',thDate:'Thời gian nộp',thVersion:'Phiên bản',thStatus:'Trạng thái',noSubmissions:'Chưa có bài nộp. Đăng nhập và tải bot lên để bắt đầu.',subBox1Title:'Nộp bot',subBox1Desc:'Chọn ngôn ngữ, phiên bản và file mã nguồn. Sau khi tải lên thành công, bot sẽ xuất hiện trong lịch sử bài nộp của bạn.',subBox1Notice:'Bot đã lưu chưa đồng nghĩa với đã được kiểm tra hoặc sẵn sàng thi đấu.',subBox2Title:'Thi đấu',subBox2Desc:'Chọn bot của bạn và tìm đối thủ tại khu vực Đấu bot.',goToPlay:'Đến Đấu bot',statusStoredWaiting:'Đã lưu · Chờ thi đấu',statusStored:'Đã lưu',statusActive:'Đang hoạt động',
    lbHeroEyebrow:'XẾP HẠNG THI ĐẤU',lbHeroTitle:'Bảng xếp hạng',lbHeroDesc:'Thứ hạng được cập nhật tự động sau mỗi trận đấu tính điểm ELO.',lbStatRanked:'Bot được xếp hạng',lbStatRankedFoot:'Trong bảng xếp hạng hiện tại',lbStatTopElo:'Điểm cao nhất',lbStatLangs:'Ngôn ngữ',lbStatLangsFoot:'Có bot được xếp hạng',searchPlaceholder:'Tìm kiếm bot thi đấu...',allLangs:'Tất cả ngôn ngữ',thRank:'Thứ hạng',thCompetitor:'Đội thi / Bot',thElo:'Điểm ELO',thChange:'Biến động',noMatchingBots:'Chưa có bot phù hợp để hiển thị.',
    playHeroEyebrow:'THI ĐẤU',playHeroTitle:'Đấu bot',playHeroDesc:'Chọn bot của bạn, tìm đối thủ và theo dõi kết quả.',loginToPlay:'Đăng nhập để đấu bot',loginToPlayDesc:'Chọn bot thuộc tài khoản của bạn để tìm đối thủ.',challengeArenaTitle:'⚔ Đấu trường Thách đấu',challengeArenaDesc:'Chọn bot của bạn để tham gia trận đấu với bot khác.',myBotLabel:'Bot của tôi',opponentLabel:'Đối thủ',opponentAutoVal:'Hệ thống tự động ghép đối thủ',maxMovesLabel:'Giới hạn lượt',findMatch:'Tìm trận',findingMatch:'Đang tìm trận…',contestClosed:'Thi đấu chưa mở',uploadNewBot:'Upload bot mới',reload:'Tải lại',needBotFirst:'Bạn cần tải lên ít nhất một bot trước khi tìm trận.',challengeNotice:'Chọn bot của bạn để gửi yêu cầu tìm đối thủ. Kết quả ghép trận do hệ thống quyết định.',noBotAvailable:'Chưa có bot',
    arenaHeroEyebrow:'TRẬN ĐẤU · KÉO BÚA BAO',arenaHeroDesc:'Xem lại diễn biến và kết quả của trận đấu đã ghi nhận.',replayBtn:'Xem lại',noReplay:'Chưa có replay',noReplayDesc:'Replay sẽ xuất hiện sau khi có trận đấu hoàn tất.',replayNotLoaded:'Replay chưa được tải',replayNotLoadedDesc:'Chọn tải lại để xem diễn biến trận đấu.',loadReplay:'Tải replay',matchReplayChip:'XEM LẠI TRẬN',subChipRPS:'OTT Kéo–Búa–Bao · 8×8',goldPlayer:'🟡 Vàng',bluePlayer:'🔵 Xanh',goldGoalDesc:'🟡 Vàng đến ô → h8',blueGoalDesc:'🔵 Xanh đến ô → a1',turnActive:'Đến lượt',turnWaiting:'Đang đợi',turnWord:'Lượt',readyToStart:'Sẵn sàng bắt đầu',rulesTitle:'Luật chơi OTT',rulesRPS:'BÚA thắng KÉO · KÉO thắng BAO · BAO thắng BÚA',rulesBody1:'Mỗi quân cờ di chuyển 1 ô theo chiều ngang, dọc hoặc chéo. Bạn chỉ có thể bắt quân đối phương nếu quân của bạn thắng loại quân đó theo luật Oẳn Tù Tì. Không thể bắt quân cùng phe hoặc quân cùng loại.',rulesBody2:'Phe Vàng thắng khi đưa quân về ô h8, phe Xanh thắng khi đưa quân về ô a1, hoặc khi tiêu diệt toàn bộ quân cờ của đối phương.',rulesBody3:'Các quân cờ được sắp xếp đối xứng qua đường chéo chính, mỗi bên 6 quân mặc định.',matchInfoTitle:'Thông tin trận',gameLabel:'Thể thức',limitLabel:'Giới hạn',turnsPlayedLabel:'Số lượt đã đấu',matchResultLabel:'Kết quả trận',inProgressVal:'Đang diễn ra',goldWinsVal:'Phe Vàng thắng',blueWinsVal:'Phe Xanh thắng',drawVal:'Hòa / hết nước đi',turnLogTitle:'Nhật ký nước đi',pressPlayToWatch:'Nhấn ▶ để theo dõi diễn biến trận.',captureWord:' · BẮT QUÂN',capturesWord:'bắt quân',prevTurn:'Nước trước',nextTurn:'Nước sau',playPause:'Phát / Tạm dừng',restart:'Bắt đầu lại',
    tournamentsEyebrow:'GIẢI ĐẤU',tournamentsTitle:'Giải đấu',tournamentsDesc:'Thông tin giải đấu, lịch thi đấu và kết quả.',tournamentNotOpen:'Giải đấu chưa mở',tournamentNotOpenDesc:'Các giải đấu sẽ xuất hiện tại đây khi tính năng được mở và có thông tin được công bố.',adminEyebrow:'QUẢN LÝ HỆ THỐNG',adminTitle:'Quản lý giải',adminDesc:'Dành cho Ban tổ chức.',needLogin:'Cần đăng nhập',needLoginDesc:'Vui lòng đăng nhập bằng tài khoản được cấp quyền.',noPermission:'Không có quyền truy cập',noPermissionDesc:'Tài khoản của bạn không có quyền quản lý giải.',adminWipTitle:'Chức năng đang được chuẩn bị',adminWipDesc:'Các công cụ quản lý giải sẽ xuất hiện khi tính năng được mở.',
    modalEyebrow:'NỘP BÀI THI ĐẤU',modalTitle:'Tải lên bot mới',modalLang:'Ngôn ngữ lập trình',modalVersion:'Phiên bản bot',modalSource:'File mã nguồn',modalChooseFile:'Chọn file mã nguồn',modalFileHelp:'File đơn .py, .java, hoặc .c (tối đa 500 KB). Tên file không dấu, không khoảng trắng.',modalNotice:'File tải lên sẽ được lưu vào tài khoản của bạn. Tính năng thi đấu hiện chưa mở.',modalCancel:'Hủy',modalSubmit:'Tải lên mã nguồn'
  },
  en:{
    brandSub:'Bot Battle Platform',navGroupArena:'ARENA',navGroupWorkspace:'WORKSPACE',
    navOverview:'Overview',navPlay:'Bot Duel',navArena:'Match Arena',navLeaderboard:'Leaderboard',navTournaments:'Tournaments',navSubmit:'My Bots',navAdmin:'Tournament Admin',crumbPlatform:'Platform',
    engineStatus:'Engine v2.0 • 8×8 Grid',toggleTheme:'Toggle theme',toggleLang:'Switch language (VI / EN)',signIn:'Sign In',signOut:'Sign Out',guest:'Guest',signedIn:'Signed in',guestHint:'Sign in to manage bots',guestFightHint:'Sign in to compete',footer:'OTTARENA · Bot Battle Platform · Engine v2.0',dataError:'Failed to fetch latest data. Please try again shortly.',retry:'Retry',
    heroEyebrow:'BOT BATTLE ARENA',heroTitle1:'Code your strategy.',heroTitle2:'Enter the arena.',heroDesc:'Upload your bot, climb the ELO leaderboard, and watch community battles in real-time. The arena is yours.',heroPlay:'Play Sandbox',heroUpload:'Upload Bot',miniArenaTitle:'8×8 Grid Arena',
    statYourBots:'Your Bots',statYourBotsFoot:'Versions submitted',statRankedBots:'Ranked Bots',statRankedBotsFoot:'In active leaderboard',statMatches:'Recorded Matches',statMatchesFoot:'Total matches on record',statCompleted:'Completed Matches',statCompletedFoot:'Matches with final result',
    quickStartTitle:'Quick Start',quickStartChip:'GET STARTED',step1Title:'Code your Bot Algorithm',step1Desc:'Program your bot in Python, Java, or C following the 8×8 Rock-Paper-Scissors rules. Follow API docs for move formatting.',step2Title:'Upload code to platform',step2Desc:'Upload your source code file (.py, .java, .c). Your bot is saved to your library and ready for action.',step3Title:'Climb the ELO rankings',step3Desc:'Head to the Bot Duel arena, select your bot, and challenge opponents. System updates your ELO rating after each battle.',
    recentTitle:'Recent Battles',viewAll:'View all →',turnsUnit:'turns',matchCompleted:'Completed',matchPending:'In progress',replayTitle:'Watch replay',noMatches:'No matches yet',noMatchesDesc:'Matches will appear here once played.',findMatchNow:'Find a match now',
    leaderboardTitle:'Top Leaderboard',fullBoard:'Full leaderboard →',noRankData:'No ranking data yet.',
    subHeroEyebrow:'DEVELOPER WORKSPACE',subHeroTitle:'My Submissions',subHeroDesc:'Manage bot versions uploaded to your account.',subUploadBtn:'Upload bot',subLibraryChip:'BOT LIBRARY',subLibraryTitle:'Your bots',subLibraryDesc:'Accepts single .py, .java, or .c file · Max 500 KB',subHistory:'Submission history',thSubId:'Submission',thSource:'Source file',thLang:'Language',thDate:'Submitted',thVersion:'Version',thStatus:'Status',noSubmissions:'No submissions yet. Sign in and upload a bot to get started.',subBox1Title:'Submit a Bot',subBox1Desc:'Choose language, version, and source file. Once uploaded, your bot appears in your submission history.',subBox1Notice:'Saved bots are not automatically verified or approved for competitive matches.',subBox2Title:'Compete',subBox2Desc:'Select your bot and find opponents in the Bot Duel arena.',goToPlay:'Go to Bot Duel',statusStoredWaiting:'Saved · Waiting for match',statusStored:'Saved',statusActive:'Active',
    lbHeroEyebrow:'COMPETITIVE RANKINGS',lbHeroTitle:'The Leaderboard',lbHeroDesc:'Rankings updated dynamically based on ELO match results.',lbStatRanked:'Ranked Bots',lbStatRankedFoot:'In active leaderboard',lbStatTopElo:'Highest ELO',lbStatLangs:'Languages',lbStatLangsFoot:'Active languages',searchPlaceholder:'Search competitors...',allLangs:'All languages',thRank:'Rank',thCompetitor:'Competitor',thElo:'ELO Rating',thChange:'Change',noMatchingBots:'No matching bots found.',
    playHeroEyebrow:'COMPETE',playHeroTitle:'Bot Duel',playHeroDesc:'Select your bot, challenge opponents, and track results.',loginToPlay:'Sign in to duel',loginToPlayDesc:'Select a bot associated with your account to find opponents.',challengeArenaTitle:'⚔ Challenge Arena',challengeArenaDesc:'Select your bot to battle against other competitors.',myBotLabel:'My bot',opponentLabel:'Opponent',opponentAutoVal:'Auto matchmaking by system',maxMovesLabel:'Turn limit',findMatch:'Find Match',findingMatch:'Searching for match…',contestClosed:'Competition closed',uploadNewBot:'Upload new bot',reload:'Reload',needBotFirst:'You need to upload at least one bot before finding a match.',challengeNotice:'Choose your bot to request a match. Pairing is handled automatically.',noBotAvailable:'No bots available',
    arenaHeroEyebrow:'MATCHES · ROCK PAPER SCISSORS',arenaHeroDesc:'Watch turn-by-turn playback of recorded matches.',replayBtn:'Replay',noReplay:'No replay available',noReplayDesc:'Replays will appear here once a match is completed.',replayNotLoaded:'Replay not loaded',replayNotLoadedDesc:'Click reload to load match events.',loadReplay:'Load replay',matchReplayChip:'MATCH REPLAY',subChipRPS:'OTT Rock–Paper–Scissors · 8×8',goldPlayer:'🟡 Gold',bluePlayer:'🔵 Blue',goldGoalDesc:'🟡 Gold goal → h8',blueGoalDesc:'🔵 Blue goal → a1',turnActive:'Turn active',turnWaiting:'Waiting',turnWord:'Turn',readyToStart:'Ready to start',rulesTitle:'OTT Rules',rulesRPS:'ROCK beats SCISSORS · SCISSORS beats PAPER · PAPER beats ROCK',rulesBody1:'Each piece moves one square horizontally, vertically, or diagonally. You may capture an opponent only if your piece beats the target piece type. You cannot capture friendly pieces or pieces of the same type.',rulesBody2:'Gold wins by reaching h8, Blue wins by reaching a1, or by eliminating all opposing pieces.',rulesBody3:'Pieces are placed symmetrically across the main diagonal, with 6 pieces per side by default.',matchInfoTitle:'Match Info',gameLabel:'Game',limitLabel:'Limit',turnsPlayedLabel:'Turns played',matchResultLabel:'Match result',inProgressVal:'In progress',goldWinsVal:'Gold wins',blueWinsVal:'Blue wins',drawVal:'Draw / no moves left',turnLogTitle:'Turn Log',pressPlayToWatch:'Press ▶ to watch the replay.',captureWord:' · CAPTURE',capturesWord:'captures',prevTurn:'Previous turn',nextTurn:'Next turn',playPause:'Play / Pause',restart:'Restart',
    tournamentsEyebrow:'COMPETITIONS',tournamentsTitle:'Tournaments',tournamentsDesc:'Tournament info, schedules, and official brackets.',tournamentNotOpen:'Tournaments not open',tournamentNotOpenDesc:'Official tournament brackets will appear here when announced.',adminEyebrow:'ADMINISTRATION',adminTitle:'Tournament Management',adminDesc:'For tournament organizers.',needLogin:'Login required',needLoginDesc:'Please sign in with an authorized organizer account.',noPermission:'Access restricted',noPermissionDesc:'Your account does not have permission to manage tournaments.',adminWipTitle:'Feature in preparation',adminWipDesc:'Tournament administration tools will be available when enabled.',
    modalEyebrow:'BOT SUBMISSION',modalTitle:'Upload a new bot',modalLang:'Programming language',modalVersion:'Bot version',modalSource:'Source code file',modalChooseFile:'Choose a source file',modalFileHelp:'Single .py, .java, or .c file (max 500 KB). ASCII filename, no spaces.',modalNotice:'Uploaded file will be saved to your account. Matchmaking is currently in development.',modalCancel:'Cancel',modalSubmit:'Upload source'
  }
};
const state={page:location.hash.replace('#','')||'overview',theme:saved('ott-theme','light'),lang:saved('ott-lang','vi'),submissions:[],play:0,playing:false,speed:1,selectedMatch:null,filter:'all',search:'',rankTab:'Global',round:'Round of 16',adminLive:true,serverOnline:false,dataStatus:'loading',challengeReady:false,challengePending:false,challengeBotId:'',modal:null,mobile:false,selectedFile:null,matchMap:'Arena Classic',maxMoves:200,firstMove:'Random'};
const t=k=>I18N[state.lang]?.[k]??I18N.vi[k]??k;
function toggleLang(){
  state.lang=state.lang==='vi'?'en':'vi';
  localStorage.setItem('ott-lang',JSON.stringify(state.lang));
  render();
  if(typeof updateSidebarProfile==='function')updateSidebarProfile();
  if(typeof injectTopNavAuth==='function')injectTopNavAuth();
}
window.toggleLang=toggleLang;window.t=t;
const players=[];
const matches=[];
const icons={plus:'<path d="M12 5v14M5 12h14"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',play:'<path d="m8 5 12 7-12 7z"/>',pause:'<path d="M7 5v14M17 5v14"/>',reset:'<path d="M3 11a9 9 0 1 1 3 7M3 4v7h7"/>',check:'<path d="m5 12 4 4L19 6"/>',chevron:'<path d="m9 18 6-6-6-6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>',cup:'<path d="M8 21h8M12 17v4M6 3h12v8a6 6 0 0 1-12 0V3ZM6 6H3v3a4 4 0 0 0 4 4m11-7h3v3a4 4 0 0 1-4 4"/>',server:'<rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-10a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',chart:'<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>',code:'<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-12-2 16"/>',overview:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',swords:'<path d="m14.5 17.5 6.5-6.5a2.12 2.12 0 0 0 0-3l-2-2a2.12 2.12 0 0 0-3 0L9.5 12.5"/><path d="m16 8 3 3"/><path d="m2 22 5.5-5.5"/><path d="m9.5 17.5-6.5-6.5a2.12 2.12 0 0 1 0-3l2-2a2.12 2.12 0 0 1 3 0l6.5 6.5"/><path d="m8 8-3 3"/><path d="m22 22-5.5-5.5"/>',flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',barchart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>',trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34M6 4h12a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z"/>',bot:'<rect width="18" height="12" x="3" y="6" rx="2"/><path d="M9 11v2M15 11v2M9 2v4M15 2v4M2 12h1M21 12h1"/>'};
const svg=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.plus}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const go=p=>{state.page=p;state.mobile=false;location.hash=p;state.playing=false;render();window.scrollTo(0,0)};
const notice=s=>{document.querySelector('.toast')?.remove();let n=document.createElement('div');n.className='toast';n.textContent=s;document.body.append(n);setTimeout(()=>n.remove(),3400)};
const avatar=(initials,color='purple')=>`<span class="avatar" style="background:${({purple:'#4e416b',blue:'#2f515d',orange:'#654535',pink:'#603b55'})[color]};color:${({purple:'#e0d2ff',blue:'#b7eaf9',orange:'#ffdec4',pink:'#fbd0e1'})[color]}">${esc(initials)}</span>`;
const header=(eyebrow,title,desc,button='')=>`<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="intro">${desc}</p></div>${button}</div>`;
const stat=(label,value,foot,icon)=>`<div class="card stat"><div class="stat-label">${label}</div><span class="stat-icon">${svg(icon)}</span><div class="stat-val">${value}</div><div class="stat-foot">${foot}</div></div>`;
// Original OTTv2 rules: 8x8; diagonal and orthogonal single-step moves; RPS captures;
// p1 goal h8 (r0,c7), p2 goal a1 (r7,c0), elimination wins.
const OTT_TYPES=['rock','paper','scissors'];
const OTT_SIGNS={rock:'R',paper:'P',scissors:'S'};
function pieceSVG(type,owner){
  const gold = owner==='p1';
  const palette = gold
    ? {rock:['#ffef86','#ffc933','#ef8f1e','#6f3d0d'], paper:['#fff6cb','#f0b342','#c46a16','#6f3d0d'], sc:['#ffd84f','#f39a1f','#b14e14','#6f2b0c'], eye:'#2b1a12'}
    : {rock:['#9aecff','#42c8ff','#2c79eb','#0e3873'], paper:['#eafaff','#8fdcff','#2d84ea','#1a4e9b'], sc:['#aef3ff','#57cdf7','#2077eb','#0d3e81'], eye:'#132146'};
  if(type==='rock') return `<svg class="piece-svg set-b rock ${owner}" viewBox="0 0 42 42" aria-hidden="true">
    <ellipse cx="21" cy="34.5" rx="13" ry="3.2" fill="#000" opacity=".13"/>
    <path d="M12 30 L8 24 L9 17 L14 11 L22 8 L29 10 L33 16 L34 23 L31 29 L24 33 L17 33 Z" fill="${palette.rock[1]}" stroke="${palette.rock[3]}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 30 L8 24 L9 17 L14 11 L22 8 L29 10 L33 16 L34 23 L31 29 L24 33 L17 33 Z" fill="url(#gradRock${gold?'G':'B'})" opacity=".55"/>
    <path d="M13 18 L18 12 L22 17 L18 23 Z" fill="${palette.rock[0]}" opacity=".95"/>
    <path d="M22 17 L27 12 L31 17 L27 23 Z" fill="#fff7cd" opacity=".95"/>
    <path d="M17 23 L22 17 L27 23 L21 29 Z" fill="${palette.rock[2]}" opacity=".65"/>
    <rect x="16" y="20" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <rect x="23" y="20" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <circle cx="8" cy="17" r="2.1" fill="${palette.rock[1]}" stroke="${palette.rock[3]}" stroke-width="1.5"/>
    <circle cx="34" cy="25" r="2.1" fill="${palette.rock[1]}" stroke="${palette.rock[3]}" stroke-width="1.5"/>
    <defs><linearGradient id="gradRock${gold?'G':'B'}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  </svg>`;
  if(type==='paper') return `<svg class="piece-svg set-b paper ${owner}" viewBox="0 0 42 42" aria-hidden="true">
    <ellipse cx="21" cy="34.5" rx="12" ry="3.1" fill="#000" opacity=".13"/>
    <path d="M14 10 H28 C30 10 31 11 31 13 V28 C31 30 30 31 28 31 H15 C13 31 12 30 12 28 V13 C12 11 13 10 14 10 Z" fill="${palette.paper[0]}" stroke="${palette.paper[3]}" stroke-width="2"/>
    <path d="M14 10 H28 C30 10 31 11 31 13 V28 C31 30 30 31 28 31 H15 C13 31 12 30 12 28 V13 C12 11 13 10 14 10 Z" fill="url(#gradPaper${gold?'G':'B'})" opacity=".45"/>
    <rect x="11" y="10" width="4" height="5" rx="1" fill="${palette.paper[2]}" stroke="${palette.paper[3]}" stroke-width="1.4"/>
    <rect x="27" y="10" width="4" height="5" rx="1" fill="${palette.paper[2]}" stroke="${palette.paper[3]}" stroke-width="1.4"/>
    <rect x="11" y="26.5" width="4" height="5" rx="1" fill="${palette.paper[2]}" stroke="${palette.paper[3]}" stroke-width="1.4"/>
    <rect x="27" y="26.5" width="4" height="5" rx="1" fill="${palette.paper[2]}" stroke="${palette.paper[3]}" stroke-width="1.4"/>
    <rect x="17" y="18" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <rect x="23" y="18" width="3" height="7" rx="1" fill="${palette.eye}"/>
    <path d="M21 14 L25 16 L24 21 H18 L17 16 Z" fill="${gold?'#f0ac1d':'#4a9fff'}" opacity=".95"/>
    <path d="M16 26 H27" stroke="${gold?'#d6a042':'#74b0ff'}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
    <defs><linearGradient id="gradPaper${gold?'G':'B'}" x1="0" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  </svg>`;
  return `<svg class="piece-svg set-b scissors ${owner}" viewBox="0 0 42 42" aria-hidden="true">
    <ellipse cx="21" cy="34.5" rx="12" ry="3.1" fill="#000" opacity=".13"/>
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
function initialOTT(seed,count=6){const rng=seeded(seed),b=Array.from({length:8},()=>Array(8).fill(null)),cells=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(r>c)cells.push([r,c]);for(let i=cells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]]}for(let i=0;i<Math.min(count,cells.length);i++){let [r,c]=cells[i],t=OTT_TYPES[Math.floor(rng()*3)];b[r][c]={owner:'p1',type:t,id:'a'+i};b[c][r]={owner:'p2',type:t,id:'b'+i}}return b}
function legalOTT(b,owner){const out=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){let piece=b[r][c];if(!piece||piece.owner!==owner)continue;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(nr<0||nr>7||nc<0||nc>7)continue;const target=b[nr][nc];if(!target||(target.owner!==owner&&OTT_BEATS[piece.type]===target.type))out.push({from:[r,c],to:[nr,nc],capture:!!target,unit:piece.type,owner})}}return out}
function buildReplay(id){return replayCache[id]||null;}
const ottCoord=([r,c])=>'abcdefgh'[c]+(8-r);
function board(){const rep=buildReplay(state.selectedMatch),b=rep.snapshots[Math.min(state.play,rep.events.length)];return `<div class="ott-board-shell"><div class="ott-files">${'abcdefgh'.split('').map(x=>`<span>${x}</span>`).join('')}</div><div class="gameboard ott-board" role="grid" aria-label="OTT 8 by 8 Rock Paper Scissors board">${b.flatMap((row,r)=>row.map((p,c)=>`<div role="gridcell" class="square ${(r+c)%2?'alt':''} ${(r===0&&c===7)?'goal-blue':''} ${(r===7&&c===0)?'goal-gold':''}" data-square="${r}-${c}" title="${ottCoord([r,c])}${p?' · '+(p.owner==='p1'?t('goldPlayer'):t('bluePlayer'))+' '+p.type:''}">${c===0?`<span class="rank-label">${8-r}</span>`:''}${(r===0&&c===7||r===7&&c===0)?'<span class="goal-marker">⚑</span>':''}${p?`<span class="ott-piece ${p.owner} ${p.type}" data-piece-id="${p.id}" aria-label="${p.owner==='p1'?t('goldPlayer'):t('bluePlayer')} ${p.type}">${pieceSVG(p.type,p.owner)}</span>`:''}</div>`)).join('')}</div><div class="board-caption"><span>${t('goldGoalDesc')}</span><span>${t('blueGoalDesc')}</span></div></div>`}

function requestSubmissionUpload(){
  if(typeof authState==='undefined'||!authState.authenticated){openLoginPage();return;}
  state.modal='upload';render();
}
function submissionStatusLabel(value){
  if(/awaiting external worker|stored|sandbox|docker/i.test(value||''))return t('statusStoredWaiting');
  return value||t('statusStored');
}
function countLabel(value){return state.dataStatus==='ready'?String(value):'—';}
function retryArenaData(){state.dataStatus='loading';render();void loadBackend();}
function emptyCard(title,description){return `<div class="card admin-box empty" role="status"><h2>${esc(title)}</h2><p>${esc(description)}</p></div>`;}

function dashboard(){
  const recent=matches.slice(0,5);
  // Stat cards with color-coded icons
  const statCards=`
  <div class="stats">
    <div class="card stat">
      <div class="stat-top">
        <div class="stat-label">${t('statYourBots')}</div>
        <div class="stat-icon green">${svg('code',18)}</div>
      </div>
      <div class="stat-val">${countLabel(state.submissions.length)}</div>
      <div class="stat-foot">${t('statYourBotsFoot')}</div>
    </div>
    <div class="card stat">
      <div class="stat-top">
        <div class="stat-label">${t('statRankedBots')}</div>
        <div class="stat-icon blue">${svg('chart',18)}</div>
      </div>
      <div class="stat-val">${countLabel(players.length)}</div>
      <div class="stat-foot">${t('statRankedBotsFoot')}</div>
    </div>
    <div class="card stat">
      <div class="stat-top">
        <div class="stat-label">${t('statMatches')}</div>
        <div class="stat-icon purple">${svg('cup',18)}</div>
      </div>
      <div class="stat-val">${countLabel(matches.length)}</div>
      <div class="stat-foot">${t('statMatchesFoot')}</div>
    </div>
    <div class="card stat">
      <div class="stat-top">
        <div class="stat-label">${t('statCompleted')}</div>
        <div class="stat-icon amber">${svg('check',18)}</div>
      </div>
      <div class="stat-val">${countLabel(matches.filter(m=>m.status==='completed').length)}</div>
      <div class="stat-foot">${t('statCompletedFoot')}</div>
    </div>
  </div>`;

  function miniBoardHTML(){
    const sp={'0,7':'mg-gold','7,0':'mg-blue','1,6':'mg-gold','2,4':'mg-gold','0,5':'mg-gold','6,1':'mg-blue','5,3':'mg-blue','7,2':'mg-blue','3,4':'mg-clash'};
    const syms={'0,7':'★','7,0':'★','1,6':'✊','2,4':'✌️','0,5':'🖐️','6,1':'✊','5,3':'🖐️','7,2':'✌️','3,4':'⚡'};
    let cells='';
    for(let r=0;r<8;r++){
      for(let c=0;c<8;c++){
        const k=r+','+c;
        cells+=`<div class="mg-cell ${sp[k]||''}">${syms[k]||''}</div>`;
      }
    }
    return `<div class="hero-mini-board">
      <div class="mini-grid-8x8">${cells}</div>
      <div class="mini-board-tag">
        <div class="mbt-title">OTT</div>
        <div class="mbt-sub">${t('miniArenaTitle')}</div>
        <div class="mbt-rps">✊ 🖐️ ✌️</div>
      </div>
    </div>`;
  }

  // Hero banner
  const heroBanner=`
  <div class="hero-banner">
    <div class="hero-left" style="position:relative;z-index:2">
      <div class="hero-eyebrow">${svg('trophy',11)} ${t('heroEyebrow')}</div>
      <div class="hero-title">${t('heroTitle1')}<br><span class="accent">${t('heroTitle2')}</span></div>
      <div class="hero-desc">${t('heroDesc')}</div>
      <div class="hero-actions">
        <button class="btn secondary" onclick="go('play')">${svg('swords')} ${t('heroPlay')}</button>
        <button class="btn" onclick="requestSubmissionUpload()" style="box-shadow:0 0 18px rgba(34,197,94,0.35)">${svg('upload')} ${t('heroUpload')}</button>
      </div>
    </div>
    <div class="hero-right">
      ${miniBoardHTML()}
    </div>
    <div class="hero-watermark">OTT</div>
  </div>`;

  // Quick Start steps
  const quickStart=`
  <div class="card" style="margin-bottom:20px">
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
          <div class="qs-icon">${svg('code',16)}</div>
        </div>
        <div class="qs-step">
          <div class="qs-num">02</div>
          <div class="qs-content">
            <div class="qs-title">${t('step2Title')}</div>
            <div class="qs-desc">${t('step2Desc')}</div>
          </div>
          <div class="qs-icon">${svg('upload',16)}</div>
        </div>
        <div class="qs-step">
          <div class="qs-num">03</div>
          <div class="qs-content">
            <div class="qs-title">${t('step3Title')}</div>
            <div class="qs-desc">${t('step3Desc')}</div>
          </div>
          <div class="qs-icon">${svg('chart',16)}</div>
        </div>
      </div>
    </div>
  </div>`;

  // Recent matches
  const recentMatches=`
  <div class="card">
    <div class="section-head">
      <h3>${t('recentTitle')}</h3>
      <a href="#arena" onclick="go('arena');return false">${t('viewAll')}</a>
    </div>
    <div class="results">
      ${recent.length?recent.map(m=>`
        <div class="match-row">
          <div style="flex:1;min-width:0">
            <div class="match-title">${esc(m.a)} <span style="color:var(--muted)">vs</span> ${esc(m.b)}</div>
            <div class="match-meta">${esc(m.time)} &nbsp;·&nbsp; ${m.turns} ${t('turnsUnit')}</div>
          </div>
          ${m.status==='completed'?`<span class="match-status completed">${t('matchCompleted')}</span>`:`<span class="match-status pending">${t('matchPending')}</span>`}
          <button class="iconbtn" onclick="openMatch('${esc(m.id)}')" title="${t('replayTitle')}" ${m.status==='completed'?'':'disabled'} style="flex-shrink:0">${svg('play',14)}</button>
        </div>`).join('')
      :`<div style="padding:36px 22px;text-align:center;color:var(--muted)">
          <div style="font-size:32px;margin-bottom:10px;opacity:.4">${svg('play',32)}</div>
          <div style="font-weight:600;margin-bottom:6px">${t('noMatches')}</div>
          <div style="font-size:12px">${t('noMatchesDesc')}</div>
          <button class="btn sm secondary" style="margin-top:14px" onclick="go('play')">${t('findMatchNow')}</button>
        </div>`}
    </div>
  </div>`;

  // Mini Leaderboard (top 5)
  const rankClasses=['gold','silver','bronze','plain','plain'];
  const miniLB=`
  <div class="card">
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
            <div class="lb-bot-author">${esc(p[3])} &nbsp;·&nbsp; <span style="opacity:.7">${esc(p[1])}</span></div>
          </div>
          <div class="lb-elo">${p[4].toLocaleString()}</div>
        </div>`).join('')
      :`<div class="empty">${t('noRankData')}</div>`}
    </div>
  </div>`;

  return heroBanner + statCards +
    `<div class="dash-grid" style="margin-bottom:20px">
      <div>${recentMatches}</div>
      <div>${miniLB}</div>
    </div>` +
    quickStart;
}
function rankTable(rows,mini=false){return `<div class="tablewrap"><table class="table"><thead><tr><th>${t('thRank')}</th><th>${t('thCompetitor')}</th><th>${t('thLang')}</th><th>${t('thElo')}</th><th>${t('thChange')}</th>${mini?'':`<th>${t('thStatus')}</th>`}</tr></thead><tbody>${rows.length?rows.map(p=>`<tr><td><span class="rank ${p[0]==='01'?'gold':p[0]==='02'?'silver':p[0]==='03'?'bronze':''}">#${p[0]}</span></td><td><div class="player">${avatar(p[2],p[6])}<span>${esc(p[1])}</span></div></td><td><span class="chip ${p[3]==='Python'?'purplechip':p[3]==='C'?'orangec':'gray'}">${esc(p[3])}</span></td><td><strong>${p[4].toLocaleString()}</strong></td><td>${esc(p[5])}</td>${mini?'':`<td><span class="chip">● ${t('statusActive')}</span></td>`}</tr>`).join(''):`<tr><td colspan="${mini?5:6}" class="empty">${t('noMatchingBots')}</td></tr>`}</tbody></table></div>`}
function leaderboard(){
  const rows=players.filter(p=>(state.filter==='all'||state.filter==='All languages'||state.filter==='Tất cả ngôn ngữ'||p[3]===state.filter)&&(`${p[1]} ${p[3]}`.toLowerCase().includes(state.search.toLowerCase())));
  return header(t('lbHeroEyebrow'),t('lbHeroTitle'),t('lbHeroDesc'))+
  `<div class="stats">${stat(t('lbStatRanked'),countLabel(players.length),t('lbStatRankedFoot'),'cup')}${stat(t('lbStatTopElo'),players.length?esc(players[0][4]):'—',players.length?esc(players[0][1]):'—','chart')}${stat(t('lbStatLangs'),countLabel(new Set(players.map(p=>p[3])).size),t('lbStatLangsFoot'),'code')}${stat(t('statYourBots'),countLabel(state.submissions.length),t('statYourBotsFoot'),'users')}</div>
  <div class="card"><div class="section-head"><h3>${t('lbHeroTitle')}</h3></div><div class="toolbar" style="padding:0 21px"><input class="search" aria-label="${t('searchPlaceholder')}" placeholder="${t('searchPlaceholder')}" value="${esc(state.search)}" oninput="state.search=this.value;updateRankingTable()"><select class="select" aria-label="Filter" onchange="state.filter=this.value;updateRankingTable()"><option value="all">${t('allLangs')}</option>${['Python','Java','C'].map(v=>`<option value="${v}" ${v===state.filter?'selected':''}>${v}</option>`).join('')}</select></div><div id="rankings">${rankTable(rows)}</div></div>`;
}
function updateRankingTable(){document.getElementById('rankings').innerHTML=rankTable(players.filter(p=>(state.filter==='all'||state.filter==='All languages'||state.filter==='Tất cả ngôn ngữ'||p[3]===state.filter)&&(`${p[1]} ${p[3]}`.toLowerCase().includes(state.search.toLowerCase()))))}
function submissions(){
  const own=state.submissions||[];
  return header(t('subHeroEyebrow'),t('subHeroTitle'),t('subHeroDesc'),`<button class="btn" onclick="requestSubmissionUpload()">${svg('upload')} ${t('subUploadBtn')}</button>`)+
  `<div class="card submission-hero"><div><span class="chip">${t('subLibraryChip')}</span><h2 style="margin:12px 0 5px">${t('subLibraryTitle')}</h2><div class="muted small">${t('subLibraryDesc')}</div></div><button class="btn secondary" onclick="requestSubmissionUpload()">${t('subUploadBtn')} ${svg('arrow')}</button></div>
  <div class="card"><div class="section-head"><h3>${t('subHistory')}</h3></div><div class="tablewrap"><table class="table"><thead><tr><th>${t('thSubId')}</th><th>${t('thSource')}</th><th>${t('thLang')}</th><th>${t('thDate')}</th><th>${t('thVersion')}</th><th>${t('thStatus')}</th></tr></thead><tbody>${own.length?own.map(b=>`<tr><td class="strong">${esc(b.id)}</td><td>${esc(b.name)}</td><td><span class="chip ${b.lang==='Python'?'purplechip':b.lang==='C'?'orangec':'gray'}">${esc(b.lang)}</span></td><td>${esc(b.date)}</td><td>${esc(b.version)}</td><td><span class="chip">${esc(submissionStatusLabel(b.status))}</span></td></tr>`).join(''):`<tr><td colspan="6" class="empty">${t('noSubmissions')}</td></tr>`}</tbody></table></div></div>
  <div class="grid2" style="margin-top:20px"><div class="card admin-box"><h3>${t('subBox1Title')}</h3><p>${t('subBox1Desc')}</p><p class="notice">${t('subBox1Notice')}</p></div><div class="card admin-box"><h3>${t('subBox2Title')}</h3><p>${t('subBox2Desc')}</p><button class="btn secondary" onclick="go('play')">${t('goToPlay')} ${svg('arrow')}</button></div></div>`;
}
function arena(){const completed=matches.filter(x=>x.status==='completed');let m=completed.find(x=>x.id===state.selectedMatch)||completed[0];if(!m)return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'))+emptyCard(t('noReplay'),t('noReplayDesc'));state.selectedMatch=m.id;let rep=buildReplay(m.id);if(!rep)return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'))+`<div class="card admin-box empty"><h2>${t('replayNotLoaded')}</h2><p>${t('replayNotLoadedDesc')}</p><button class="btn secondary" onclick="openServerMatch('${esc(m.id)}')">${t('loadReplay')}</button></div>`;state.play=Math.min(state.play,rep.events.length);const last=rep.events[state.play-1];return header(t('arenaHeroEyebrow'),t('navArena'),t('arenaHeroDesc'),`<button class="btn secondary" onclick="resetReplay()">${svg('reset')} ${t('replayBtn')}</button>`)+`<div class="toolbar"><select class="select" onchange="openMatch(this.value)">${completed.map(x=>`<option value="${x.id}" ${m.id===x.id?'selected':''}>${x.id} · ${x.a} vs ${x.b}</option>`).join('')}</select><span class="chip purplechip">${t('matchReplayChip')}</span><span class="chip gray">${t('subChipRPS')}</span></div><div class="arena-layout"><div class="card arena-stage"><div class="fightbar"><div class="fighter">${avatar(m.a.split(' ').map(x=>x[0]).join(''),'orange')}<b>${m.a}</b><small>${t('goldPlayer')} · h8 · ${state.play%2===0?t('turnActive'):t('turnWaiting')}</small></div><div class="vs">VS</div><div class="fighter">${avatar(m.b.split(' ').map(x=>x[0]).join(''),'purple')}<b>${m.b}</b><small>${t('bluePlayer')} · a1 · ${state.play%2===1?t('turnActive'):t('turnWaiting')}</small></div></div><div class="boardwrap">${board()}</div><div class="replay-controls"><div class="row between small"><span class="muted">${t('turnWord')} ${state.play} / ${rep.events.length}</span><span class="muted">${last?`${last.owner==='p1'?t('goldPlayer'):t('bluePlayer')}: ${ottCoord(last.from)} → ${ottCoord(last.to)}${last.capture?t('captureWord'):''}`:t('readyToStart')}</span></div><div class="progress"><div style="width:${state.play/Math.max(1,rep.events.length)*100}%"></div></div><div class="controlbar"><button onclick="step(-1)" title="${t('prevTurn')}">◂◂</button><button class="primary" onclick="togglePlay()" title="${t('playPause')}">${svg(state.playing?'pause':'play')}</button><button onclick="step(1)" title="${t('nextTurn')}">▸▸</button><button onclick="state.speed=state.speed===1?2:state.speed===2?4:1;render()">${state.speed}×</button><button onclick="resetReplay()" title="${t('restart')}">${svg('reset',15)}</button></div></div></div><div><div class="card"><div class="section-head"><h3>${t('rulesTitle')}</h3><span class="chip">8 × 8</span></div><div class="ott-rules"><div class="rule-icons"><span>${t('rulesRPS')}</span></div><p>${t('rulesBody1')}</p><p>${t('rulesBody2')}</p><p>${t('rulesBody3')}</p></div></div><div class="card" style="margin-top:20px"><div class="section-head"><h3>${t('matchInfoTitle')}</h3><span class="chip gray">REPLAY</span></div><div class="details"><div class="detail"><span>${t('thSubId')}</span><strong>${m.id}</strong></div><div class="detail"><span>${t('gameLabel')}</span><strong>OTT RPS</strong></div><div class="detail"><span>${t('limitLabel')}</span><strong>${esc(m.maxMoves||rep.maxMoves||200)} ${t('turnsUnit')}</strong></div><div class="detail"><span>${t('turnsPlayedLabel')}</span><strong>${state.play}</strong></div><div class="detail"><span>${t('matchResultLabel')}</span><strong>${state.play<rep.events.length?t('inProgressVal'):rep.winner?(rep.winner==='p1'?t('goldWinsVal'):t('blueWinsVal')):t('drawVal')}</strong></div></div></div><div class="card" style="margin-top:20px"><div class="section-head"><h3>${t('turnLogTitle')}</h3><span class="small muted">${state.play} ${t('turnsUnit')}</span></div><div id="timeline">${eventLog()}</div></div></div></div>`}
function eventLog(){const rep=buildReplay(state.selectedMatch);return rep.events.slice(Math.max(0,state.play-6),state.play).reverse().map((e,i)=>`<div class="logline"><span>#${String(state.play-i).padStart(3,'0')}</span><strong>${e.owner==='p1'?'🟡 Gold':'🔵 Blue'}</strong> ${OTT_SIGNS[e.unit]} ${ottCoord(e.from)} → ${ottCoord(e.to)} ${e.capture?` · ⚔ ${t('capturesWord')} `+OTT_SIGNS[e.captured]:''}</div>`).join('')||`<div class="logline">${t('pressPlayToWatch')}</div>`}
function resetReplay(){state.play=0;state.playing=false;clearInterval(timer);render()}
function step(delta){const rep=buildReplay(state.selectedMatch);if(!rep)return;let oldPositions={};document.querySelectorAll('[data-piece-id]').forEach(el=>{oldPositions[el.dataset.pieceId]=el.getBoundingClientRect()});state.play=Math.min(rep.events.length,Math.max(0,state.play+delta));if(state.play===rep.events.length)state.playing=false;render();if(delta===1){document.querySelectorAll('[data-piece-id]').forEach(el=>{const before=oldPositions[el.dataset.pieceId];if(!before)return;const after=el.getBoundingClientRect();const dx=before.left-after.left,dy=before.top-after.top;if((dx||dy)&&Math.abs(dx)<600&&Math.abs(dy)<600)el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:Math.max(170,420/state.speed),easing:'ease-in-out'});});}}
let timer;function togglePlay(){const rep=buildReplay(state.selectedMatch);if(!rep)return;if(state.play>=rep.events.length)state.play=0;state.playing=!state.playing;render();clearInterval(timer);if(state.playing)timer=setInterval(()=>{if(!state.playing||state.page!=='arena'){clearInterval(timer);return}step(1)},650/state.speed)}
function openMatch(id){state.selectedMatch=id;state.play=0;state.playing=false;clearInterval(timer);go('arena')}
function tournaments(){return header(t('tournamentsEyebrow'),t('tournamentsTitle'),t('tournamentsDesc'))+emptyCard(t('tournamentNotOpen'),t('tournamentNotOpenDesc'));}
const bmatch=(a,b)=>`<div class="bracket-match"><div><span class="winner">${a}</span><b class="accent">1</b></div><div><span>${b}</span><b class="muted">0</b></div></div>`;
function submittedBotsPanel(){
  const loggedIn=typeof authState!=='undefined'&&authState.authenticated;
  if(!loggedIn)return `<div class="card admin-box"><h2>${t('loginToPlay')}</h2><p>${t('loginToPlayDesc')}</p><button class="btn" onclick="openLoginPage()">${t('signIn')}</button></div>`;
  const own=(state.submissions||[]).filter(b=>b.userId===authState.id);
  const selected=own.some(b=>b.id===state.challengeBotId)?state.challengeBotId:own[0]?.id;
  const enabled=state.challengeReady&&state.dataStatus==='ready'&&own.length>0&&!state.challengePending;
  const message=state.challengePending?t('findingMatch'):state.dataStatus!=='ready'?t('dataError'):!state.challengeReady?t('contestClosed'):!own.length?t('needBotFirst'):t('challengeNotice');
  return `<div class="card admin-box submitted-panel"><div class="section-head"><div><h3>${t('challengeArenaTitle')}</h3><p class="small" style="margin:8px 0 0">${t('challengeArenaDesc')}</p></div></div>
  <p class="notice" id="challengeStatus" role="status" aria-live="polite">${esc(message)}</p>
  <div class="submission-fields"><div class="form-group"><label class="form-label" for="challengeBot">${t('myBotLabel')}</label><select id="challengeBot" class="field" onchange="state.challengeBotId=this.value" ${!own.length||state.challengePending?'disabled':''}>${own.length?own.map(b=>`<option value="${esc(b.id)}" ${b.id===selected?'selected':''}>${esc(b.name)} · ${esc(b.lang)} · ${esc(b.version)}</option>`).join(''):`<option value="">${t('noBotAvailable')}</option>`}</select></div>
  <div class="form-group"><label class="form-label">${t('opponentLabel')}</label><p class="field" style="margin:0">${t('opponentAutoVal')}</p></div>
  <div class="form-group"><label class="form-label" for="challengeMaxMoves">${t('maxMovesLabel')}</label><input id="challengeMaxMoves" class="field" type="number" min="1" max="1000" value="${Number(state.maxMoves)||200}" onchange="state.maxMoves=Number(this.value)" ${!enabled?'disabled':''}></div></div>
  <div class="row" style="flex-wrap:wrap"><button class="btn" id="challengeBtn" aria-describedby="challengeStatus" onclick="challengeMatch()" ${!enabled?'disabled':''}>${svg('play')} ${state.challengePending?t('findingMatch'):state.challengeReady?t('findMatch'):t('contestClosed')}</button><button class="btn secondary" onclick="requestSubmissionUpload()">${svg('upload')} ${t('uploadNewBot')}</button><button class="btn secondary" onclick="retryArenaData()" ${state.challengePending?'disabled':''}>${t('reload')}</button></div></div>`;
}
function play(){return header(t('playHeroEyebrow'),t('playHeroTitle'),t('playHeroDesc'))+submittedBotsPanel();}

function admin(){
  if(typeof authState==='undefined'||!authState.authenticated)return header(t('adminEyebrow'),t('adminTitle'),t('adminDesc'))+emptyCard(t('needLogin'),t('needLoginDesc'));
  if(!['JUDGE','ADMIN'].includes(authState.role))return header(t('adminEyebrow'),t('adminTitle'),t('adminDesc'))+emptyCard(t('noPermission'),t('noPermissionDesc'));
  return header(t('adminEyebrow'),t('adminTitle'),t('adminDesc'))+emptyCard(t('adminWipTitle'),t('adminWipDesc'));
}
function uploadModal(){return `<div class="modaloverlay" onclick="if(event.target===this){state.modal=null;render()}"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow">${t('modalEyebrow')}</div><h2 id="modal-title">${t('modalTitle')}</h2></div><button class="iconbtn" onclick="state.modal=null;render()">${svg('close')}</button></div><form onsubmit="saveSubmission(event)"><div class="form-group"><label class="form-label">${t('modalLang')}</label><select id="uploadLang" class="field" required><option>Python</option><option>Java</option><option>C</option></select></div><div class="form-group"><label class="form-label">${t('modalVersion')}</label><input class="field" id="uploadVersion" value="v4.0" maxlength="25" required></div><div class="form-group"><label class="form-label">${t('modalSource')}</label><div class="dropzone" onclick="document.getElementById('sourceFile').click()"><div class="big">⇧</div><strong id="fileLabel">${t('modalChooseFile')}</strong><p>${t('modalFileHelp')}</p><input id="sourceFile" type="file" accept=".py,.java,.c" style="display:none" onchange="state.selectedFile=this.files[0];document.getElementById('fileLabel').textContent=this.files[0]?.name||'${t('modalChooseFile')}'" required></div></div><div class="notice" style="margin-bottom:20px">${t('modalNotice')}</div><div class="row" style="justify-content:flex-end"><button class="btn secondary" type="button" onclick="state.modal=null;render()">${t('modalCancel')}</button><button class="btn" type="submit">${t('modalSubmit')} ${svg('arrow')}</button></div></form></div></div>`}
async function saveSubmission(e){e.preventDefault();let f=document.getElementById('sourceFile').files[0];if(!f)return notice('Please select a source file.');let lang=document.getElementById('uploadLang').value;let ext=f.name.split('.').pop().toLowerCase();if(!['py','java','c'].includes(ext))return notice('Use a single .py, .java, or .c file.');if((ext==='py'&&lang!=='Python')||(ext==='java'&&lang!=='Java')||(ext==='c'&&lang!=='C'))return notice('The selected language does not match the source file.');try{const content=await f.text();await api.post('/submissions',{name:f.name,lang,version:document.getElementById('uploadVersion').value,content});state.modal=null;state.selectedFile=null;await loadBackend();notice('Source uploaded to the server.')}catch(err){notice('Upload failed: '+err.message)}}
function render(){
  const labels={
    overview: t('navOverview'),
    play: t('navPlay'),
    arena: t('navArena'),
    submit: t('navSubmit'),
    leaderboard: t('navLeaderboard'),
    tournaments: t('navTournaments'),
    admin: t('navAdmin')
  };
  const arenaNavs=[
    ['overview', t('navOverview'), 'overview'],
    ['play', t('navPlay'), 'swords'],
    ['arena', t('navArena'), 'flame'],
    ['leaderboard', t('navLeaderboard'), 'barchart'],
    ['tournaments', t('navTournaments'), 'trophy']
  ];
  const workspaceNavs=[['submit', t('navSubmit'), 'bot']];
  const buildNav=([p,l,icon])=>`<button class="nav ${state.page===p?'active':''}" onclick="go('${p}')">${svg(icon||'overview',16)}<span>${l}</span></button>`;
  const userInitials=(typeof authState!=='undefined'&&authState.authenticated)?(authState.name||authState.username||'??').substring(0,2).toUpperCase():'SV';
  const userName=(typeof authState!=='undefined'&&authState.authenticated)?(authState.name||authState.username||t('guest')):(t('guest'));
  document.getElementById('app').innerHTML=`
<div class="app">
<aside class="sidebar ${state.mobile?'open':''}">
  <div class="brand">
    <div class="brandicon">◈</div>
    <div>
      <div class="brand-name">OTT<span class="accent">ARENA</span></div>
      <span class="brand-sub">${t('brandSub')}</span>
    </div>
  </div>
  <div class="nav-group">${t('navGroupArena')}</div>
  ${arenaNavs.map(buildNav).join('')}
  <div class="nav-group" style="margin-top:8px">${t('navGroupWorkspace')}</div>
  ${workspaceNavs.map(buildNav).join('')}
  ${typeof authState!=='undefined'&&authState.authenticated&&['JUDGE','ADMIN'].includes(authState.role)?`<button class="nav ${state.page==='admin'?'active':''}" onclick="go('admin')">${svg('server',16)}<span>${t('navAdmin')}</span></button>`:''}
  <div class="sidebottom">
    <div class="side-profile">
      ${avatar(userInitials,'purple')}
      <div style="min-width:0">
        <div class="strong small" style="color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(userName)}</div>
        <div class="tiny muted">${(typeof authState!=='undefined'&&authState.authenticated)?t('signedIn'):t('guestHint')}</div>
      </div>
      <span class="muted" style="margin-left:auto;flex-shrink:0">⋯</span>
    </div>
  </div>
</aside>
<main class="main">
  <header class="topbar">
    <div class="row">
      <button class="iconbtn hamburger" onclick="state.mobile=!state.mobile;render()">${svg('menu')}</button>
      <div class="crumb">${t('crumbPlatform')} <span class="crumb-sep">›</span> <b>${labels[state.page]||t('navOverview')}</b></div>
    </div>
    <div class="topactions">
      <div class="ping-badge"><div class="ping-dot"></div><span>${t('engineStatus')}</span></div>
      <button class="lang-toggle-btn" title="${t('toggleLang')}" onclick="toggleLang()" type="button" aria-label="Toggle language">
        <span class="lang-tag ${state.lang==='vi'?'active':''}">VI</span>
        <span class="lang-sep">/</span>
        <span class="lang-tag ${state.lang==='en'?'active':''}">EN</span>
      </button>
      <button class="iconbtn" title="${t('toggleTheme')}" onclick="state.theme=state.theme==='dark'?'light':'dark';localStorage.setItem('ott-theme',JSON.stringify(state.theme));render()">${svg(state.theme==='dark'?'sun':'moon')}</button>
      ${(typeof authState!=='undefined'&&authState.username)?'':`<button class="btn sm" onclick="openLoginPage?openLoginPage():null">${svg('users',13)} ${t('signIn')}</button>`}
    </div>
  </header>
  <div class="content">
    ${state.dataStatus==='error'?`<div class="notice" role="alert" style="margin-bottom:20px">${t('dataError')} <button class="btn sm secondary" onclick="retryArenaData()">${t('retry')}</button></div>`:''}
    ${({overview:dashboard,play,arena,submit:submissions,leaderboard,tournaments,admin})[state.page]?.()||dashboard()}
    <div class="footer">${t('footer')}</div>
  </div>
</main>
</div>
${state.modal==='upload'?uploadModal():''}`;
}
window.addEventListener('hashchange',()=>{const next=location.hash.replace('#','')||'overview';if(state.page!==next){state.page=next;state.playing=false;clearInterval(timer);render()}});render();
