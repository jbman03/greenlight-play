export const directors=[
 {name:'Maya Chen',fee:.2,skill:8,genre:'Drama',trait:'Character specialist'},
 {name:'Elias Voss',fee:.15,skill:6,genre:'Horror',trait:'Atmosphere specialist'},
 {name:'Nora Bell',fee:.18,skill:7,genre:'Comedy',trait:'Comic timing specialist'},
 {name:'Jordan Reed',fee:.05,skill:3,genre:'All',trait:'Versatile newcomer'},
 {name:'Imani Brooks',fee:.24,skill:9,genre:'Thriller',trait:'Suspense specialist'},
 {name:'Felix Arden',fee:.38,skill:10,genre:'Science fiction',trait:'Visual world-builder'},
 {name:'Lucia Moreno',fee:.3,skill:9,genre:'Adventure',trait:'Action storyteller'},
 {name:'Dev Patelson',fee:.09,skill:5,genre:'Drama',trait:'Emerging writer-director'}
];
export const actors=[
 {name:'Avery Cole',fee:.12,appeal:1.04,skill:5,genre:'Horror',trait:'Emerging performer'},
 {name:'Samira Wells',fee:.3,appeal:1.16,skill:9,genre:'Drama',trait:'Acclaimed performer'},
 {name:'Theo Grant',fee:.55,appeal:1.3,skill:7,genre:'Adventure',trait:'Established crowd-puller'},
 {name:'June Park',fee:.08,appeal:1,skill:6,genre:'Comedy',trait:'Breakout comic'},
 {name:'Rafael Costa',fee:.2,appeal:1.1,skill:8,genre:'Thriller',trait:'Intense character actor'},
 {name:'Cleo Hart',fee:.15,appeal:1.06,skill:6,genre:'Science fiction',trait:'Rising genre favorite'},
 {name:'Owen Price',fee:.07,appeal:.98,skill:4,genre:'Drama',trait:'New face'},
 {name:'Zara Quinn',fee:.4,appeal:1.22,skill:9,genre:'Horror',trait:'Genre headliner'},
 {name:'Miles Okafor',fee:.22,appeal:1.12,skill:7,genre:'Comedy',trait:'Reliable comic lead'},
 {name:'Elena Vale',fee:.32,appeal:1.18,skill:8,genre:'Adventure',trait:'Physical performer'}
];
export function initialCareers(){return {directors:directors.map(()=>({credits:0,momentum:0,relationship:0})),actors:actors.map(()=>({credits:0,momentum:0,relationship:0}))};}
export function talentInfo(s,role,id){const list=role==='director'?directors:actors,base=list[id];if(!base)throw Error('Choose a valid talent.');const career=s?.careers?.[role==='director'?'directors':'actors']?.[id]||{credits:0,momentum:0,relationship:0};const busy=s?.films?.find(f=>!f.released&&Number(f[role])===Number(id));return {...base,...career,fee:+(base.fee*Math.max(.7,1+career.momentum*.035)*Math.max(.85,1-career.relationship*.015)).toFixed(3),skill:Math.min(18,base.skill+Math.floor(career.credits/2)),appeal:base.appeal?Math.max(.8,base.appeal+career.momentum*.012):undefined,busy:busy?.title||null};}
export function updateCareers(s,f){f.careerNews=[];for(const role of ['director','actor']){const id=Number(f[role]),list=role==='director'?'directors':'actors',before=talentInfo(s,role,id),career=s.careers[list][id];const profit=f.expectedRevenue-f.total;const change=(f.score>=75?2:f.score<55?-2:0)+(profit>=0?1:-2);career.credits++;career.momentum=Math.max(-8,Math.min(20,career.momentum+change));career.relationship=Math.min(10,career.relationship+1);const after=talentInfo(s,role,id);f.careerNews.push(`${after.name}: ${career.credits} studio credit${career.credits===1?'':'s'}; next fee $${Math.round(after.fee*1000)}K (${after.fee>before.fee?'up':after.fee<before.fee?'down':'unchanged'}).`);}}
