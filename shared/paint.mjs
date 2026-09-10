export const COCK_MS=4000;
export const FLIGHT_MS=700;
export const RESULT_MS=2000;
// Each target owns a shrinking cylinder; consumed blanks never return.
export function prepareShot(g,caller,names,now=Date.now()){
 const lied=g.last.cards.some(c=>c!==g.target&&c!=='★');
 const target=lied?g.last.who:caller,shooter=lied?caller:g.last.who;
 const result=`${names[g.last.who]} ${lied?'nói dối':'nói thật'}! Bài lật: ${g.last.cards.join(' · ')}. ${names[shooter]} đang lên nòng, nhắm vào ${names[target]}.`;
 return {...g,phase:'loading',loser:target,result,shot:{shooter,target,startedAt:now,fireAt:now+COCK_MS,resolveAt:now+COCK_MS+FLIGHT_MS,hit:null,remainingBefore:g.ammo?.[target]??6},log:[result,...g.log].slice(0,8)};
}
export function advancePaint(g,names,now=Date.now(),roll=(remaining)=>Math.floor(Math.random()*remaining)){
 if(!g?.shot||!['loading','firing'].includes(g.phase))return g;
 if(now<g.shot.fireAt)return g;
 if(now<g.shot.resolveAt)return g.phase==='firing'?g:{...g,phase:'firing'};
 const ammo=[...(g.ammo??g.lives.map(()=>6))];const remaining=ammo[g.shot.target];if(remaining<1)throw new Error("Empty cylinder");const hit=roll(remaining)===0;ammo[g.shot.target]--;const lives=[...g.lives],ranks=[...g.ranks],painted=[...g.painted];
 if(hit){ranks[g.shot.target]=lives.filter(v=>v>0).length;lives[g.shot.target]=0;painted[g.shot.target]=true;}
 const alive=lives.map((v,i)=>v>0?i:-1).filter(i=>i>=0);const winner=alive.length===1?alive[0]:-1;if(winner>=0)ranks[winner]=1;
 const result=hit?`${names[g.shot.target]} trúng sơn, xếp hạng ${ranks[g.shot.target]}!`:`Tạch! Đạn rỗng. ${names[g.shot.target]} an toàn, tiếp tục chơi.`;
 return {...g,ammo,nextRoundAt:winner>=0?null:now+RESULT_MS,lives,ranks,painted,winner,phase:winner>=0?'end':'result',shot:{...g.shot,hit},result,log:[result,...g.log].slice(0,8)};
}
