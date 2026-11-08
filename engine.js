import {careerStatus} from './career.js';
import {develop} from './development.js';
import {directors,actors,initialCareers,talentInfo,updateCareers} from './talent.js';
export const scripts = [
 {id:'horror',title:'The Last Light',genre:'Horror',desc:'A lighthouse keeper receives distress calls from a ship that vanished thirty years ago.',base:1.8,quality:67,audience:1.3,weeks:8},
 {id:'drama',title:'Small Hours',genre:'Drama',desc:'An estranged father and daughter share one final overnight shift at the family diner.',base:2.2,quality:78,audience:.95,weeks:10},
 {id:'comedy',title:'Second Take',genre:'Comedy',desc:'Two former child stars accidentally book the same comeback role. Neither plans to leave.',base:2.6,quality:64,audience:1.2,weeks:9}
];
export {directors,actors} from './talent.js';
export function fresh(name='Westward Pictures',mode='balanced',seed=Date.now()>>>0){return {version:2,careerWeeks:156,name,mode,seed:seed||1,startSeed:seed||1,week:1,cash:mode==='relaxed'?12:8,rep:12,careers:initialCareers(),films:[],log:[{week:1,text:'Your studio is open. Develop an original film or explore a screenplay.'}],ledger:[],nextId:1};}
export function migrate(s){if(!s||![1,2].includes(s.version))throw Error('Unsupported save version');if(s.version===1){s.careers=initialCareers();for(const f of s.films){for(const role of ['director','actor']){const c=s.careers[role==='director'?'directors':'actors'][Number(f[role])];if(!c)throw Error('Invalid talent in save');if(f.released){c.credits++;c.relationship=Math.min(10,c.relationship+1);}}}s.version=2;}return s;}
export function random(s){s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
export function committed(s){return s.films.filter(f=>!f.released).reduce((a,f)=>a+f.remaining,0);}
export function addLog(s,text){s.log.unshift({week:s.week,text});s.log=s.log.slice(0,80);}
export function transact(s,amount,text){s.cash+=amount;s.ledger.unshift({week:s.week,amount,text});s.ledger=s.ledger.slice(0,150);}
export function projectFor(c){const p=c.script==='original'?develop(c.spec):scripts.find(x=>x.id===c.script);if(!p)throw Error('Choose a valid screenplay.');return p;}
export function quote(c,s){const p=projectFor(c);return +(p.base*Number(c.scale)+talentInfo(s,'director',c.director).fee+talentInfo(s,'actor',c.actor).fee+Number(c.marketing)).toFixed(3);}
export function greenlight(s,c){
 if(careerStatus(s).ended)throw Error('This career has ended. Continue in sandbox or start a new game.');
 if(s.films.filter(f=>!f.released).length>=2)throw Error('Both production slots are occupied. Release a film to free a slot.');
 const p=projectFor(c),d=talentInfo(s,'director',c.director),a=talentInfo(s,'actor',c.actor);
 if(d.busy||a.busy)throw Error(`${d.busy?d.name:a.name} is already working on an active film. Choose someone available.`);
 if(![.8,1,1.3].includes(Number(c.scale))||![.25,.6,1].includes(Number(c.marketing))||!['theatrical','streaming'].includes(c.route)||!['approval','delegated'].includes(c.delegation))throw Error('Choose valid production settings.');
 if(p.format==='TV series'&&c.route!=='streaming')throw Error('Limited series release through streaming.');
 const total=quote(c,s);if(s.cash-committed(s)-total<.3)throw Error('Keep at least $300,000 uncommitted for company expenses. Try a smaller production or cast.');
 const f={...p,script:c.script,spec:c.spec?structuredClone(c.spec):undefined,title:String(c.title||p.title).trim().slice(0,65)||p.title,director:Number(c.director),actor:Number(c.actor),scale:Number(c.scale),marketing:Number(c.marketing),route:c.route,delegation:c.delegation,id:s.nextId++,total,remaining:total*.8,spent:total*.2,age:0,duration:p.weeks,bonus:0,event:null,eventDone:false,released:false,revenue:0,seedRoll:random(s),releaseWeek:null,contract:{director:{...d},actor:{...a}},economy:2};
 s.films.push(f);transact(s,-total*.2,`${f.title}: development deposit`);addLog(s,`${f.title} is greenlit. ${d.name} and ${a.name} are booked until release.`);return f;
}
export function resolveEvent(s,f,choice){if(careerStatus(s).ended)throw Error('This career has ended. Continue in sandbox before resolving decisions.');return applyEvent(s,f,choice);}
function applyEvent(s,f,choice){if(!s.films.includes(f)||!['invest','adapt'].includes(choice))throw Error('Choose a valid production decision.');if(!f.event)return; if(choice==='invest'){if(s.cash-committed(s)<.18)throw Error('Not enough uncommitted cash for the extra shoot.');transact(s,-.18,`${f.title}: extra shoot`);f.spent+=.18;f.total+=.18;f.bonus+=7;addLog(s,`${f.title}: you funded an extra shoot to strengthen the film.`);}else{f.bonus-=2;addLog(s,`${f.title}: the crew adapted the scene and stayed on budget.`);}f.event=null;}
export function release(s,f){
 const d=f.contract?.director||directors[f.director],a=f.contract?.actor||actors[f.actor];
 const performance=f.economy===2?a.skill*.25+(a.genre===f.genre?3:0)+(['Performances','Interviews'].includes(f.priority)?a.skill*.65:0)+Math.min(3,(d.relationship+a.relationship)*.3):0;
 f.score=Math.round(Math.max(25,Math.min(96,f.quality+d.skill+(d.genre===f.genre?6:0)+(Number(f.scale)-1)*12+f.bonus+performance+(f.seedRoll-.5)*22)));
 const demand=.65+f.score/100, marketing=1+Number(f.marketing)*.55, luck=.65+random(s)*.85;
 f.gross=f.base*(f.economy===2?1.65:3.1)*f.audience*a.appeal*demand*marketing*luck;
 f.expectedRevenue=f.route==='streaming'?(f.economy===2?f.base*f.audience*a.appeal*(.8+f.score/100)*(.85+random(s)*.3):f.total*(.85+f.score/160+random(s)*.2)):f.gross*.48;
 f.released=true;f.releaseWeek=s.week;f.payments=0;s.rep=Math.max(0,Math.min(100,s.rep+Math.round((f.score-50)/6)));
 updateCareers(s,f);addLog(s,`${f.title} opens to ${f.score}/100 reviews. ${f.route==='streaming'?'A streaming license is signed.':'Audience receipts begin next week.'}`);addLog(s,`${d.name} and ${a.name} are available again. Their careers and next-project fees have updated.`);
}
export function advance(s){if(careerStatus(s).ended)throw Error('This career has ended. Continue in sandbox or start a new game.');if(s.films.some(f=>f.event))throw Error('Resolve your pending production decision before advancing.');s.week++;transact(s,-.045,'Weekly studio overhead');for(const f of s.films){if(f.released){if(f.payments<4){const payment=f.expectedRevenue/4;transact(s,payment,`${f.title}: ${f.route==='streaming'?'license':'distribution'} payment ${f.payments+1}/4`);f.revenue+=payment;f.payments++;}continue;}f.age++;const spend=f.age>=f.duration?f.remaining:Math.min(f.remaining,f.total*.8/f.duration);f.remaining-=spend;f.spent+=spend;transact(s,-spend,`${f.title}: production installment`);if(f.age===Math.floor(f.duration/2)&&!f.eventDone){f.eventDone=true;f.event=f.format==='Documentary'?'A key interview needs a follow-up visit. Fund another shoot for a stronger account, or edit around the available material.':random(s)>.5?'Your director sees an opportunity to reshoot the final scene. An extra shoot could improve the ending.':'A location falls through. Rebuilding the scene costs extra; a simpler rewrite keeps the schedule intact.';if(f.delegation==='delegated'){applyEvent(s,f,'adapt');addLog(s,`${f.title}: your producer handled the decision within budget.`);}}if(f.age>=f.duration)release(s,f);}if(s.cash<0)addLog(s,'Cash is negative. Start a new game or wait for contracted receipts; financing is not in this prototype.');return s;}
export function stage(f){if(f.released)return 'Released';if(f.format==='Documentary'&&f.age/f.duration<.2)return 'Research';const t=f.age/f.duration;return t<.2?'Development':t<.4?'Pre-production':t<.75?'Production':t<.9?'Post-production':'Release preparation';}

