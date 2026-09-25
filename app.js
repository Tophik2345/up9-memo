// Search only: pure index/ranking functions, also executable by the regression test.
const MemoSearch=(()=>{
 const normalize=s=>String(s).toLowerCase().replaceAll('ё','е').replace(/уп[\s-]*9/g,'уп9').replace(/(?<=\d)\s*\.\s*(?=\d)/g,'.').replace(/[^\p{L}\p{N}.]+/gu,' ').replace(/\.(?!\d)|(?<!\d)\./g,' ').replace(/\s+/g,' ').trim();
 const boiler=/^(правовое основание|дополнительное основание|основание|что можно|когда можно|как действовать|что нельзя|важно)[\s:!.]*$/i;
 const stop=new Set(['и','в','во','на','о','об','по','для','из','к','с','со','не','это','ро','ст','статья','статьи']);
 const tokens=s=>normalize(s).split(' ').filter(x=>x&&!stop.has(x));
 const stem=s=>s.length>4?s.replace(/(?:иями|ение|ения|ению|ений|ами|ями|ого|ому|ыми|ими|ать|ять|ов|ев|ам|ям|ах|ях|ой|ый|ий|ая|ое|ые|ие|а|я|ы|и|у|ю|е)$/,''):s;
 const matches=(term,text)=>text.split(' ').some(w=>w===term||(!/\d/.test(term)&&term.length>3&&stem(w)===stem(term)));
 const aliases={1:['уп9','уп 9'],3:['служебная проверка','проверка сотрудника','дисциплинарная проверка'],6:['объяснение','пояснение'],7:['отказ объяснение','отказ от объяснения'],8:['оперативная проверка','орм','оперативно розыскное мероприятие'],10:['орм','оперативно розыскные мероприятия'],15:['телефон','смартфон','мобильный','переписка','сообщения','discord','telegram','тг'],16:['база','базы','служебные базы','информационная система','учет'],19:['кпз','изолятор','место содержания'],21:['режимный объект'],22:['обыск','досмотр','личный обыск'],23:['задержание','задержать','задержан'],24:['наручники','cuffs','спецсредства'],28:['увольнение','уволить'],32:['отстранение','временное отстранение'],35:['ск','следственный комитет','передача в ск']};
 const npa=[['f',/федеральный закон о федеральной службе безопасности(?: ро)?|фз о фсб(?: ро)?|фз фсб|фсб/gu],['s',/федеральный закон о государственной службе(?: ро)?|фз о государственной службе(?: ро)?|госслужба/gu],['p',/процессуальный кодекс(?: ро)?/gu],['c',/внутренний устав(?: федеральной службы безопасности)?/gu],['t',/федеральный закон о государственных территориях(?: ро)?|статус территорий|государственные территории/gu]];
 function prepare(entries,topics,bases){return entries.map(e=>{const body=e.body.split(/\n+/).filter(x=>!boiler.test(x.trim())).join(' ').replace(/\s+/g,' ');return {...e,bodyText:body,titleIndex:normalize(e.title),bodyIndex:normalize(body),aliases:(aliases[e.id]||[]).map(normalize),bases:bases[e.id]||[],topicTitle:topics.find(t=>t.slug===e.topic).title};});}
 function query(raw){let q=normalize(raw),acts=[];for(const [key,re] of npa)q=q.replace(re,()=>{acts.push(key);return ' ';});const numbers=[...q.matchAll(/(?<![\p{L}\p{N}])\d+(?:\.\d+)?(?![\p{L}\p{N}])/gu)].map(x=>x[0]);return {q:normalize(raw),terms:tokens(q).filter(t=>!/^\d+(?:\.\d+)?$/.test(t)),numbers:[...new Set(numbers)],acts:[...new Set(acts)]};}
 function search(index,raw){const q=query(raw);if(q.q.length<2||boiler.test(q.q))return [];return index.map(e=>{let score=0,hits=0;const terms=q.terms;
 for(const num of q.numbers){if(e.bases.some(b=>b.article===num)){hits++;score+=400;}else score-=40;}
 if(q.numbers.length&&!hits)return null;
 for(const act of q.acts){if(e.bases.some(b=>b.act===act)){hits++;score+=220;}else return null;}
 for(const t of terms){let w=matches(t,e.titleIndex)?90:e.aliases.some(a=>matches(t,a))?60:matches(t,e.bodyIndex)?8:0;if(w){hits++;score+=w;}}
 if(!hits)return null;
 if(e.titleIndex===q.q)score+=1000;
 if(e.aliases.includes(q.q))score+=650;
 if(terms.length>1&&e.titleIndex.includes(q.q))score+=180;
 else if(terms.length>1&&e.bodyIndex.includes(q.q))score+=25;
 score+=120*hits/Math.max(1,terms.length+q.numbers.length+q.acts.length);
 if(q.numbers.length)score-=e.bases.length*2;
 return {...e,score,query:q};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.id-b.id);}
 return {normalize,tokens,stem,matches,prepare,query,search};
})();
if(typeof module!=='undefined')module.exports=MemoSearch;
if(typeof document!=='undefined')(()=>{'use strict';
 const boiler=/^(правовое основание|дополнительное основание|основание|что можно|когда можно|как действовать|что нельзя|важно)[\s:!.]*$/i;
 const {entries,topics,searchBases}=window.MEMO,indexed=MemoSearch.prepare(entries,topics,searchBases);
 const input=document.querySelector('#search'),box=document.querySelector('#search-results'),status=document.querySelector('#search-status');
 // type=text removes the browser's second clear control on every browser.
 input.type='text';input.setAttribute('inputmode','search');
 function highlight(el,text,q){const terms=[...q.terms,...q.numbers,...MemoSearch.tokens(q.q)];for(const part of text.split(/([\p{L}\p{N}]+(?:\.\d+)?)/gu)){const hit=terms.some(t=>MemoSearch.matches(t,MemoSearch.normalize(part)));const node=document.createElement(hit?'mark':'span');node.textContent=part;if(hit)el.append(node);else el.append(document.createTextNode(part));}}
 function snippet(e){const terms=e.query.terms;const paragraphs=e.body.split(/\n\n+/).filter(p=>!boiler.test(p.trim())&&!/ — (?:Глава|ст\.)/.test(p));const text=paragraphs.find(p=>terms.some(t=>MemoSearch.matches(t,MemoSearch.normalize(p))))||paragraphs.find(p=>p.length>65)||e.bodyText;const plain=text.replace(/\s+/g,' ').replace(/^- /,'');const words=[...plain.matchAll(/[\p{L}\p{N}]+/gu)];const hit=words.find(w=>terms.some(t=>MemoSearch.matches(t,MemoSearch.normalize(w[0]))));const start=Math.max(0,(hit?.index||0)-45);return (start?'…':'')+plain.slice(start,start+175)+(plain.length>start+175?'…':'');}
 function search(){const raw=input.value,q=MemoSearch.query(raw);box.replaceChildren();box.hidden=q.q.length<2;if(box.hidden){status.textContent=q.q?'Введите хотя бы 2 символа':'По всем темам и тексту памятки';return;}
 const found=MemoSearch.search(indexed,raw);status.textContent=found.length?'Найдено: '+found.length+(found.length>10?' · показано наиболее подходящих: 10':''):'Ничего не найдено';
 if(!found.length){const p=document.createElement('p');p.textContent='Попробуйте название действия, номер статьи или НПА.';box.append(p);return;}
 for(const e of found.slice(0,10)){const a=document.createElement('a');a.className='result';a.href=e.topic+'.html#section-'+e.id;const title=document.createElement('strong'),meta=document.createElement('small'),excerpt=document.createElement('span'),basis=document.createElement('small');highlight(title,e.title,e.query);meta.textContent=e.topicTitle;highlight(excerpt,snippet(e),e.query);const relevant=e.bases.filter(b=>(!q.numbers.length||q.numbers.includes(b.article))&&(!q.acts.length||q.acts.includes(b.act)));highlight(basis,(relevant.length?relevant:e.bases).slice(0,2).map(b=>b.label).join(' · '),e.query);a.append(title,meta,excerpt,basis);box.append(a);}}
 let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,140);});document.querySelector('#clear-search').addEventListener('click',()=>{clearTimeout(timer);input.value='';search();input.focus();});
const menu=document.querySelector('#menu-toggle'),nav=document.querySelector('#navigation');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});const materials=[...document.querySelectorAll('.material')],selector=document.querySelector('#subsection-select');function select(){if(!materials.length)return;const active=materials.find(x=>x.id===location.hash.slice(1))||materials[0];for(const el of materials)el.hidden=el!==active;for(const a of document.querySelectorAll('[data-section]')){if(a.dataset.section===active.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')}selector.value=active.id;if(location.hash)requestAnimationFrame(()=>active.scrollIntoView({block:'start'}))}if(selector){selector.addEventListener('change',()=>location.hash=selector.value);window.addEventListener('hashchange',select);select()}})();
