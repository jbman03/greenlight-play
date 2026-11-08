import {scripts,directors,actors,migrate} from './engine.js';
import {careerLengths} from './career.js';
import {genres,formats} from './development.js';
export const MAX_SAVE_BYTES=5*1024*1024;
export function validateSave(s){if(s.careerWeeks!==undefined&&!careerLengths.includes(s.careerWeeks)||s.retired!==undefined&&typeof s.retired!=='boolean'||s.ideaBatch!==undefined&&(!Number.isSafeInteger(s.ideaBatch)||s.ideaBatch<0))throw Error('Invalid career settings');if(s.version!==2||typeof s.name!=='string'||!['balanced','relaxed'].includes(s.mode)||!Number.isFinite(s.cash)||!Number.isInteger(s.week)||s.week<1||!Number.isFinite(s.seed)||!Number.isFinite(s.rep)||!Number.isInteger(s.nextId)||!Array.isArray(s.films)||!Array.isArray(s.log)||!Array.isArray(s.ledger))throw Error('Invalid save');for(const [role,count] of [['directors',directors.length],['actors',actors.length]]){const list=s.careers?.[role];if(!Array.isArray(list)||list.length!==count)throw Error('Invalid careers');for(const c of list)if(!Number.isInteger(c.credits)||c.credits<0||!Number.isFinite(c.momentum)||c.momentum < -8||c.momentum>20||!Number.isFinite(c.relationship)||c.relationship<0||c.relationship>10)throw Error('Invalid career');}for(const f of s.films){if(!(f.script==='original'||scripts.some(p=>p.id===f.script))||!directors[f.director]||!actors[f.actor]||typeof f.title!=='string'||!['streaming','theatrical'].includes(f.route))throw Error('Invalid film');for(const k of ['id','total','remaining','spent','age','duration','bonus','seedRoll','revenue','base','quality','audience'])if(!Number.isFinite(f[k]))throw Error('Invalid film');if(f.released&&(!Number.isFinite(f.expectedRevenue)||!Number.isFinite(f.payments)||!Number.isFinite(f.score)))throw Error('Invalid release');}for(const l of s.log)if(typeof l.text!=='string'||!Number.isFinite(l.week))throw Error('Invalid log');for(const l of s.ledger)if(typeof l.text!=='string'||!Number.isFinite(l.amount)||!Number.isFinite(l.week))throw Error('Invalid ledger');}
export function parseSave(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_SAVE_BYTES)throw Error('Save file exceeds the 5 MB limit.');
 const s=migrate(JSON.parse(raw));validateSave(s);validateDetails(s);return s;
}
function validateDetails(s){
 const number=(v,min=-1e12,max=1e12)=>{if(!Number.isFinite(v)||v<min||v>max)throw Error('Invalid save number');};
 const integer=(v,min,max)=>{number(v,min,max);if(!Number.isSafeInteger(v))throw Error('Invalid save integer');};
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid save text');};
 text(s.name,200);integer(s.week,1,10000000);integer(s.seed,0,4294967295);integer(s.startSeed,0,4294967295);integer(s.nextId,1,10000000);number(s.cash);number(s.rep,0,100);
 if(s.films.length>10000||s.log.length>1000||s.ledger.length>2000)throw Error('Save contains too many records');
 const ids=new Set(),bookedD=new Set(),bookedA=new Set();
 for(const f of s.films){
  integer(f.id,1,s.nextId-1);if(ids.has(f.id))throw Error('Duplicate film');ids.add(f.id);
  integer(f.director,0,directors.length-1);integer(f.actor,0,actors.length-1);
  if(!Object.hasOwn(genres,f.genre)||f.format!==undefined&&!formats.includes(f.format))throw Error('Invalid genre or format');
  if(typeof f.released!=='boolean'||typeof f.eventDone!=='boolean'||!['approval','delegated'].includes(f.delegation))throw Error('Invalid production state');
  if(![.8,1,1.3].includes(Number(f.scale))||![.25,.6,1].includes(Number(f.marketing)))throw Error('Invalid budget settings');
  text(f.title,200);text(f.desc,2000);if(f.event!==null&&f.event!==undefined)text(f.event,2000);
  for(const k of ['total','spent','revenue','base','quality','audience'])number(f[k],0);
  number(f.remaining,-.000001);number(f.bonus,-1000,1000);number(f.seedRoll,0,1);integer(f.duration,1,10000);integer(f.age,0,f.duration);
  if(f.format==='TV series'&&(![4,6,8].includes(f.episodes)||f.route!=='streaming'))throw Error('Invalid season');
  if(f.economy!==undefined&&f.economy!==2)throw Error('Unsupported economy');
  if(f.original){for(const k of ['scope','target','priority'])text(f[k],100);}
  if(f.contract){for(const role of ['director','actor']){const c=f.contract[role];if(!c)throw Error('Invalid contract');text(c.name,200);text(c.genre,100);number(c.skill,0,18);number(c.fee,0);number(c.relationship,0,10);if(role==='actor')number(c.appeal,0,10);}}
  if(f.economy===2&&!f.contract)throw Error('Missing contract');
  if(f.careerNews!==undefined){if(!Array.isArray(f.careerNews)||f.careerNews.length>20)throw Error('Invalid career news');f.careerNews.forEach(t=>text(t,2000));}
  if(f.released){number(f.expectedRevenue,0);number(f.gross,0);integer(f.payments,0,4);integer(f.releaseWeek,1,s.week);number(f.score,0,100);}
  else {if(bookedD.has(f.director)||bookedA.has(f.actor))throw Error('Duplicate booking');bookedD.add(f.director);bookedA.add(f.actor);}
 }
 if(bookedD.size>2)throw Error('Too many active productions');
 for(const l of s.log){text(l.text,4000);integer(l.week,1,s.week);}
 for(const l of s.ledger){text(l.text,4000);integer(l.week,1,s.week);number(l.amount);}
}
