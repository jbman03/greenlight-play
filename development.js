export const genres = {
 Western:{base:2.7,quality:69,audience:1.0,weeks:11,fit:'Adults'},
 Musical:{base:3.3,quality:70,audience:1.1,weeks:13,fit:'Broad audience'},
 Crime:{base:2.3,quality:71,audience:1.05,weeks:10,fit:'Adults'},
 Horror:{base:1.8,quality:65,audience:1.2,weeks:8,fit:'Adults'},
 Drama:{base:2.1,quality:72,audience:.95,weeks:10,fit:'Adults'},
 Comedy:{base:2.4,quality:64,audience:1.15,weeks:9,fit:'Broad audience'},
 Thriller:{base:2.5,quality:67,audience:1.1,weeks:10,fit:'Adults'},
 'Science fiction':{base:3.4,quality:64,audience:1.15,weeks:12,fit:'Young adults'},
 Adventure:{base:3.1,quality:65,audience:1.2,weeks:11,fit:'Broad audience'},
 Action:{base:3.2,quality:63,audience:1.2,weeks:11,fit:'Young adults'},
 Romance:{base:1.9,quality:68,audience:1.05,weeks:8,fit:'Adults'},
 Mystery:{base:2.2,quality:70,audience:1.05,weeks:9,fit:'Adults'},
 Fantasy:{base:3.8,quality:64,audience:1.15,weeks:13,fit:'Young adults'},
 Animation:{base:3.6,quality:68,audience:1.2,weeks:15,fit:'Broad audience'},
 Family:{base:2.3,quality:68,audience:1.1,weeks:9,fit:'Broad audience'},
 Nature:{base:1.3,quality:72,audience:.95,weeks:9,fit:'Broad audience'},
 History:{base:1.1,quality:75,audience:.85,weeks:8,fit:'Adults'},
 Science:{base:1.4,quality:73,audience:.95,weeks:10,fit:'Broad audience'},
 Music:{base:1.2,quality:70,audience:1,weeks:8,fit:'Young adults'},
 Sports:{base:1.3,quality:68,audience:1.05,weeks:9,fit:'Broad audience'},
 Society:{base:1,quality:76,audience:.85,weeks:8,fit:'Adults'}
};
export const scopes={Contained:{cost:.75,weeks:-2,reach:.85},Ensemble:{cost:1,weeks:0,reach:1},Epic:{cost:1.6,weeks:4,reach:1.2}};
export const documentaryGenres=['Nature','History','Science','Music','Sports','Society'];
export const formats=['Movie','TV series','Documentary'];
export const genresFor=format=>Object.keys(genres).filter(g=>documentaryGenres.includes(g)===(format==='Documentary'));
export const priorities={Story:{quality:5,reach:1,cost:.12},Performances:{quality:2,reach:1,cost:.15},Spectacle:{quality:0,reach:1.15,cost:.4},Interviews:{quality:2,reach:1,cost:.15},Cinematography:{quality:0,reach:1.15,cost:.4}};
export const prioritiesFor=format=>format==='Documentary'?['Story','Interviews','Cinematography']:['Story','Performances','Spectacle'];
export function develop(spec){
 if(!spec||typeof spec.title!=='string'||!spec.title.trim()||spec.title.length>65||typeof spec.concept!=='string'||spec.concept.trim().length<15||spec.concept.length>400)throw Error('Give your project a title and a concept of 15–400 characters.');
 const format=spec.format||'Movie',episodes=format==='TV series'?Number(spec.episodes??6):1;
 if(!formats.includes(format)||!genresFor(format).includes(spec.genre)||!Object.hasOwn(scopes,spec.scope)||!prioritiesFor(format).includes(spec.priority)||!['Adults','Young adults','Broad audience'].includes(spec.target)||format==='TV series'&&![4,6,8].includes(episodes))throw Error('Choose a valid format, genre, audience, scope, priority, and episode count.');
 const g=genres[spec.genre],scope=scopes[spec.scope],focus=priorities[spec.priority],seasonCost=format==='TV series'?.55+.18*episodes:1;
 return {id:'original',title:spec.title.trim(),desc:spec.concept.trim(),genre:spec.genre,format,episodes,base:+((g.base*scope.cost+focus.cost)*seasonCost).toFixed(3),quality:g.quality+focus.quality,audience:g.audience*scope.reach*focus.reach*(g.fit===spec.target?1.08:.95),weeks:g.weeks+scope.weeks+(format==='TV series'?episodes:0),scope:spec.scope,target:spec.target,priority:spec.priority,original:true};
}
