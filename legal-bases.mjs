// Сверено непосредственно с темами форума Кутузовского 25.09.2026.
// Индекс zakon-RO-/kutuzovsky.json используется только для поиска тем.
export const acts={
 f:{name:'Федеральный закон «О Федеральной службе безопасности РО»',url:'https://forum.russia.online/threads/federal-nyi-zakon-o-federal-noi-sluzhbe-bezopasnosti-ro.5310/'},
 c:{name:'Внутренний устав Федеральной службы безопасности',url:'https://forum.russia.online/threads/vnutrennii-ustav-federal-noi-sluzhby-bezopasnosti.4634/'},
 s:{name:'Федеральный закон «О государственной службе РО»',url:'https://forum.russia.online/threads/federal-nyi-zakon-o-gosudarstvennoi-sluzhbe-ro.4971/'},
 p:{name:'Процессуальный кодекс РО',url:'https://forum.russia.online/threads/protsessual-nyi-kodeks-ro.4910/'},
 t:{name:'Федеральный закон «О государственных территориях РО»',url:'https://forum.russia.online/threads/federal-nyi-zakon-o-gosudarstvennykh-territoriyakh-ro.4981/'}
};
const titles={f:{35:'Основания оперативно-розыскной деятельности',36:'Виды оперативно-розыскных мероприятий',37:'Ограничение конституционных прав при оперативном мероприятии',38:'Наблюдение и фиксация',43:'Использование государственных информационных систем',44:'Истребование сведений и документов',45:'Установление личности и проверка документов',66:'Преступление, совершенное сотрудником ФСБ РО',68:'Общие правила применения силы',69:'Физическая сила',70:'Специальные средства',77:'Собственная безопасность ФСБ РО'},c:{11:'Основная компетенция подразделений',21:'Виды дисциплинарных взысканий',22:'Порядок применения взыскания',23:'Полномочия по применению взысканий'},s:{4:'Основные права государственного служащего',15:'Соразмерность дисциплинарной меры',16:'Служебная проверка',17:'Отстранение, увольнение, обжалование и восстановление'},p:{1:'Личный обыск','6.1':'','6.3':''},t:{'2.7':'','2.18':'','3.16':''}};
export const references=Object.fromEntries(Object.entries(titles).flatMap(([act,items])=>Object.entries(items).map(([article,title])=>[act+article,{act,article,title,...acts[act],chapter:act==='p'?(article==='1'?'Глава V «Обыск и допрос»':'Глава I «Следствие»'):'',status:act==='t'?'unconfirmed':'confirmed'}])));
// Номер после двоеточия — ровно та структурная единица, которая есть в тексте форума.
export const basisMap={
1:['c11:ч. 4','f77'],2:['c11:ч. 4','f77'],3:['f77:ч. 2','c11:ч. 4','s16'],4:['s16:ч. 1'],
5:['s16','c22:ч. 1','s4:п. 4','f43','f44','f66'],6:['c22:ч. 1','s4:п. 4'],7:['c22:ч. 1'],
8:['f77:ч. 2','f35'],9:['f35'],10:['f36','p6.1','f35','f37'],11:['f36:п. 1','p6.1:п. «а»'],12:['f36:п. 2'],13:['f36:п. 4','p6.1:п. «д»'],14:['f36:п. 5','f38'],15:['f37','p6.1:п. «л»'],
16:['f43'],17:['f44'],18:['f45'],19:['t2.7'],20:['t2.18'],21:['t3.16'],22:['p1'],23:['f66:ч. 2'],24:['p6.3'],25:['f68','f69'],26:['f70'],27:['c23:ч. 5','c22'],28:['c21','c23'],29:['c23'],30:['c22:ч. 2','s15'],31:['c22:ч. 3','s15:ч. 3'],32:['s17:ч. 1','c23:ч. 4','c21'],33:['f77:ч. 3','f66'],34:['f66:ч. 2'],35:['f66:ч. 1, 3'],36:['f35','f66']};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function label(key,unit='') {const r=references[key];return r.name+' — '+(r.chapter?r.chapter+', ':'')+'ст. '+r.article+(unit?', '+unit:'')+(r.title?' «'+r.title+'»':'')+(r.status==='unconfirmed'?' [требует проверки]':'');}
export function basisHtml(id){return basisMap[id].map(k=>{const [key,unit]=k.split(':');const r=references[key];return '<p><a href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+esc(label(key,unit))+' ↗</a></p>';}).join('');}
export const warning='Требует проверки. Указанная в исходной памятке статья не найдена в действующей теме форума «О государственных территориях РО». Прежнее название «О статусе территорий и особых объектах РО» не соответствует текущему заголовку темы. Изложенное в исходной памятке право доступа не подтверждено этой ссылкой; похожая статья взамен не подставлялась.';
// Все ссылки в повествовании тоже приводятся к проверенному справочнику.
export function normalize(text,id){
 text=text.replace(/(?:ст\.\s*)68[–—-]69\s+(?:ФЗ|Федерального закона)\s*«[^»]+»/gi,'ст. 68 ФЗ «О ФСБ РО»; ст. 69 ФЗ «О ФСБ РО»');
 text=text.replace(/(?:Глава|главы) V Процессуального кодекса РО/g,'@@SEARCH_BASIS@@');
 const suffix='(?:Внутреннего устава(?: Федеральной службы безопасности РО| ФСБ РО)?|(?:ФЗ|Федерального закона)\\s*«[^»]+»|Процессуального кодекса РО|этого же закона|этого закона|этого Устава)';
 const re=new RegExp('(?:(ч\\.|п\\.)\\s*(«[а-я]»|\\d+)\\s*)?ст\\.\\s*(\\d+(?:\\.\\d+)?)(?:\\s+'+suffix+')?','gi');
 return text.replace(re,(whole,kind,unit,num)=>{let act=/Внутреннего|Устава/.test(whole)?'c':/государственной службе|этого же закона/.test(whole)&&num==='4'?'s':/государственной службе/.test(whole)?'s':/Процессуального/.test(whole)||['6.1','6.3'].includes(num)?'p':['2.7','2.18','3.16'].includes(num)?'t':['11','21','22','23'].includes(num)?'c':['4','15','16','17'].includes(num)?'s':'f';
 const key=act+num;if(!references[key])throw new Error('Неизвестное основание: '+whole+' в '+id);return label(key,kind?kind.toLowerCase()+' '+unit:'');}).replaceAll('@@SEARCH_BASIS@@',label('p1'));
}
export function linkReferences(html){
 const names=Object.values(acts).map(a=>a.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 const re=new RegExp('('+names+') — (?:Глава [IV]+ «[^»]+», )?ст\\. (\\d+(?:\\.\\d+)?)(?:, (?:ч\\.|п\\.) (?:«[а-я]»|[\\d, ]+))?(?: «[^»]+»)?(?: \\[требует проверки\\])?','g');
 return html.replace(re,(text,name)=>'<a href="'+Object.values(acts).find(a=>a.name===name).url+'" target="_blank" rel="noopener noreferrer">'+text+'</a>');
}
