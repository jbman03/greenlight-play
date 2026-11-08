import {genres, genresFor} from './development.js';
import {suggestTitle, suggestConcept} from './names.js';

// Separate from the simulation RNG: browsing ideas never changes box-office results.
export function opportunities(s, batch = 0) {
  let seed = ((s.startSeed || 1) + Math.imul(batch + 1, 2654435761)) >>> 0;
  const random = () => {seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296;};
  const shuffled = list => list.map(value => ({value, order: random()})).sort((a,b) => a.order-b.order).map(x=>x.value);
  const fiction = shuffled(genresFor('Movie')), docs = shuffled(genresFor('Documentary'));
  return ['Movie','Movie','Movie','TV series','Documentary','Documentary'].map((format,i) => {
    const genre = format === 'Documentary' ? docs[i-4] : fiction[i];
    return {format, genre, episodes: 4, title: suggestTitle({genre,format}, random),
      concept: suggestConcept({genre,format}, random), scope:'Contained', priority:'Story', target:genres[genre].fit};
  });
}
