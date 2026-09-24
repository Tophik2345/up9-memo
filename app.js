(() => {
  'use strict';
  const {entries,answers,pages}=window.MEMO;
  const $=id=>document.getElementById(id);
  const normalize=s=>s.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/стать[яиюе]/g,'ст').replace(/[«»„“”".,:;!?()—–-]/g,' ').replace(/\s+/g,' ').trim();
  const canonical=s=>s.replace(/ФЗ/g,'Федеральный закон').replace(/О ФСБ РО/g,'О Федеральной службе безопасности РО').replace(/Внутреннего устава ФСБ РО/g,'Внутреннего устава Федеральной службы безопасности РО');
  const stem=t=>t.length>5?t.slice(0,-2):t;
  const indexed=entries.map(e=>({...e,index:normalize((e.decision||[]).join(' ')+' '+e.title+' '+e.originalTitle+' '+(e.displayBody||e.body)+' '+e.body+' '+canonical(e.body)+' '+answers.filter(a=>a[4]===e.id).map(a=>a[1]).join(' '))}));
  const href=e=>e.page+'.html#section-'+e.id;
  const menu=$('menu-toggle');
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('navigation').classList.toggle('open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');$('navigation').classList.remove('open');}});
  function reveal(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const el=document.getElementById(id);if(!el)return;if(el.tagName==='DETAILS')el.open=true;requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));}
  window.addEventListener('hashchange',reveal);reveal();
  function search(){const q=normalize($('search').value);const box=$('search-results');box.replaceChildren();box.hidden=!q;if(!q){$('search-status').textContent='По всем 36 разделам, статьям и нормативным актам';return;}
    const terms=q.split(' ');const found=indexed.filter(e=>terms.every(t=>t==='ст'?e.index.includes('ст '):t==='ск'?/(^|\s)ск(\s|$)/.test(e.index):/^\d+$/.test(t)?new RegExp('(^|\\D)'+t+'(\\D|$)').test(e.index):e.index.includes(stem(t)))).sort((a,b)=>Number(normalize(b.title).includes(q))-Number(normalize(a.title).includes(q)));
    $('search-status').textContent=found.length?'Найдено разделов: '+found.length:'Ничего не найдено. Попробуйте название действия или номер статьи.';
    for(const e of found){const a=document.createElement('a');a.className='result';a.href=href(e);const h=document.createElement('strong');h.textContent=e.title;const meta=document.createElement('span');meta.textContent=pages.find(p=>p[0]===e.page)[1]+' · Раздел '+e.id;const p=document.createElement('span');let body=(e.displayBody||e.body).replace(/\n/g,' ');const at=normalize(body).indexOf(terms.find(t=>t!=='ст')||q);let start=Math.max(0,at-70);p.textContent=(start?'…':'')+body.slice(start,start+220)+(body.length>start+220?'…':'');a.append(h,meta,p);box.append(a);}
  }
  $('search').addEventListener('input',search);$('clear-search').addEventListener('click',()=>{$('search').value='';search();$('search').focus();});
  const question=$('question');
  if(question){function answer(){const q=normalize(question.value);const area=$('answer');area.replaceChildren();document.querySelectorAll('[data-question]').forEach(b=>b.setAttribute('aria-pressed',String(normalize(b.dataset.question)===q)));if(!q)return;const matches=answers.filter(a=>a[1].split(' ').some(k=>k==='ск'?/(^|\s)ск(\s|$)/.test(q):q.includes(k)));if(!matches.length){area.textContent='Готового ответа не найдено. Попробуйте поиск по памятке выше.';return;}for(const a of matches){const article=document.createElement('article');article.className='answer-card';const h=document.createElement('h3');h.textContent=a[2];const p=document.createElement('p');p.textContent=a[3];const link=document.createElement('a');link.href=href(entries.find(e=>e.id===a[4]));link.textContent='Подробнее → '+entries.find(e=>e.id===a[4]).title;article.append(h,p,link);area.append(article);}}
    question.addEventListener('input',answer);document.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>{question.value=b.dataset.question;answer();}));
  }
  const expand=$('expand-all');if(expand){expand.addEventListener('click',()=>{const articles=[...document.querySelectorAll('details.article')];const open=articles.some(d=>!d.open);articles.forEach(d=>d.open=open);expand.textContent=open?'Свернуть всё':'Раскрыть всё';});}
})();
