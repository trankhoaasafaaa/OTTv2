/* Account cosmetics only. Browser-local preferences, never authentication or game data. */
'use strict';
(()=>{
 const characters=[['reaper','Người gác đêm','Night keeper'],['pumpkin','Bí ngô tinh quái','Pumpkin trickster'],['ghost','Bóng ma nhỏ','Little ghost'],['cat','Mèo ánh trăng','Moon cat'],['mummy','Xác ướp mộng mơ','Sleepy mummy'],['frank','Frank tí hon','Tiny Frank']];
 const colors=['#49365e','#344f65','#694237','#3b5551'];
 const asset=id=>'assets/halloween/'+id+'.svg';
 const text=(vi,en)=>state.lang==='en'?en:vi;
 const name=id=>characters.find(c=>c[0]===id)?.[state.lang==='en'?2:1]||'';
 const key=id=>'ott-halloween-cosmetics:'+id;
 const valid=p=>p&&characters.some(c=>c[0]===p.character)&&colors.includes(p.color);
 function read(id){try{const p=JSON.parse(localStorage.getItem(key(id))||'null');if(valid(p))return p;}catch{}return {character:'ghost',color:colors[0]};}
 const dialog=document.createElement('dialog');dialog.id='hw-character-dialog';dialog.setAttribute('aria-labelledby','hw-title');document.body.append(dialog);
 const notice=document.createElement('div');notice.id='hw-message';notice.setAttribute('role','status');document.body.append(notice);
 let draft=null,editingId=null,priorFocus=null,scheduled=false;
 function say(s){notice.textContent=s;notice.style.display='block';clearTimeout(say.timer);say.timer=setTimeout(()=>notice.style.display='none',4000);}
 function draw(){
  dialog.innerHTML=`<button type="button" class="hw-close" aria-label="${text('Đóng, không lưu','Close without saving')}">×</button><h2 id="hw-title">${text('Người đồng hành của bạn','Your little alter ego')}</h2><p>${text('Diện mạo tài khoản không thay đổi luật chơi hoặc sức mạnh bot.','Your appearance does not change game rules or bot abilities.')}</p><div class="hw-picker-body"><section class="hw-large"><img src="${asset(draft.character)}" alt="${name(draft.character)}"><h3>${name(draft.character)}</h3><small>${text('Chiến thuật vẫn do bạn.','The strategy is yours.')}</small></section><div><div class="hw-character-grid">${characters.map(c=>`<button type="button" class="hw-choice" data-character="${c[0]}" aria-pressed="${c[0]===draft.character}"><img src="${asset(c[0])}" alt="">${name(c[0])}</button>`).join('')}</div><div class="hw-swatches"><span>${text('Nền avatar','Avatar background')}</span>${colors.map((c,i)=>`<button type="button" class="hw-swatch" data-color="${c}" style="background:${c}" aria-label="${text('Màu nền','Background')} ${i+1}" aria-pressed="${c===draft.color}"></button>`).join('')}</div></div></div><div class="hw-dialog-foot"><small>${text('Lưu riêng theo tài khoản trên trình duyệt này. Chưa đồng bộ sang thiết bị khác.','Saved per account in this browser. Not synced to other devices.')}</small><button type="button" class="btn secondary hw-cancel">${text('Hủy','Cancel')}</button><button type="button" class="btn btn-accent" id="hw-save">${text('Lưu nhân vật','Save character')}</button></div>`;
 }
 function open(){if(!authState.authenticated||!authState.id)return;editingId=authState.id;draft=read(editingId);priorFocus=document.activeElement;draw();dialog.showModal();}
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.classList.contains('hw-close')||b.classList.contains('hw-cancel')){dialog.close();return;}
  if(b.dataset.character&&characters.some(c=>c[0]===b.dataset.character)){draft.character=b.dataset.character;draw();dialog.querySelector(`[data-character="${draft.character}"]`).focus();}
  if(b.dataset.color&&colors.includes(b.dataset.color)){draft.color=b.dataset.color;draw();dialog.querySelector(`[data-color="${draft.color}"]`).focus();}
  if(b.id==='hw-save'){
   if(!authState.authenticated||authState.id!==editingId){dialog.close();return;}
   try{localStorage.setItem(key(editingId),JSON.stringify(draft));}catch{say(text('Trình duyệt không cho phép lưu lựa chọn.','Browser storage is unavailable.'));return;}
   dialog.close();decorate();say(text('Đã lưu nhân vật trên trình duyệt này.','Character saved in this browser.'));
  }
 });
 dialog.addEventListener('close',()=>{editingId=null;draft=null;if(priorFocus?.isConnected)priorFocus.focus();else document.querySelector('#authNavBtn')?.focus();});
 function decorate(){
  if(!authState.authenticated||!authState.id){if(dialog.open)dialog.close();document.querySelector('#hw-account-cosmetics')?.remove();return;}
  if(dialog.open&&editingId!==authState.id)dialog.close();
  const p=read(authState.id),sig=authState.id+':'+p.character+':'+p.color+':'+state.lang;
  for(const el of document.querySelectorAll('.user-avatar-badge,.side-profile .avatar'))if(el.dataset.hwSignature!==sig){el.innerHTML=`<img class="hw-avatar" src="${asset(p.character)}" alt="">`;el.classList.add('hw-portrait');el.style.setProperty('--hw-avatar-bg',p.color);el.dataset.hwSignature=sig;}
  const menu=document.querySelector('#authDropdownMenu');
  if(menu&&!menu.querySelector('[data-hw-open]')){const b=document.createElement('button');b.type='button';b.className='auth-dropdown-item';b.dataset.hwOpen='';b.textContent='✧ '+text('Chọn nhân vật','Choose character');b.onclick=open;menu.append(b);}
  const content=document.querySelector('#accountContent');
  if(state.page==='account'&&content&&content.children.length&&!content.querySelector('#hw-account-cosmetics')){const card=document.createElement('section');card.id='hw-account-cosmetics';card.className='hw-account-card';content.append(card);}
  const card=document.querySelector('#hw-account-cosmetics');
  if(card&&card.dataset.hwSignature!==sig){card.innerHTML=`<img src="${asset(p.character)}" alt="${name(p.character)}" style="background:${p.color}"><div><h3>${text('Nhân vật của bạn','Your character')}</h3><p>${name(p.character)}</p><small>${text('Chỉ lưu trên trình duyệt này, chưa đồng bộ thiết bị.','Saved in this browser, not synced across devices.')}</small></div><button type="button" class="btn secondary">${text('Chọn nhân vật','Choose character')} ✧</button>`;card.querySelector('button').onclick=open;card.dataset.hwSignature=sig;}
 }
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;decorate();});}});
 observer.observe(document.querySelector('#app'),{childList:true,subtree:true});
 window.addEventListener('storage',e=>{if(e.key===key(authState.id))decorate();});
 decorate();
})();
