import {useEffect,useRef,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';

type AudioGame={round:number;turn:number;phase:string;counts?:number[];hands?:unknown[][];shot?:{startedAt:number;fireAt:number;hit:boolean|null}|null};
class GameAudio {
 context=new AudioContext();
 master=this.context.createGain();
 constructor(){this.master.gain.value=.32;this.master.connect(this.context.destination);}
 tone(frequency:number,duration:number,delay=0,type:OscillatorType='sine',gain=.2,end=frequency){
  if(this.context.state!=='running'||document.hidden)return;
  const start=this.context.currentTime+delay,o=this.context.createOscillator(),v=this.context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(Math.max(1,end),start+duration);v.gain.setValueAtTime(0,start);v.gain.linearRampToValueAtTime(gain,start+.008);v.gain.exponentialRampToValueAtTime(.001,start+duration);o.connect(v);v.connect(this.master);o.start(start);o.stop(start+duration+.02);o.onended=()=>{o.disconnect();v.disconnect()};
 }
 noise(duration:number,gain=.2,cutoff=1800,delay=0){
  if(this.context.state!=='running'||document.hidden)return;
  const start=this.context.currentTime+delay,b=this.context.createBuffer(1,Math.ceil(this.context.sampleRate*duration),this.context.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),v=this.context.createGain();source.buffer=b;filter.type='lowpass';filter.frequency.value=cutoff;v.gain.setValueAtTime(gain,start);v.gain.exponentialRampToValueAtTime(.001,start+duration);source.connect(filter);filter.connect(v);v.connect(this.master);source.start(start);source.onended=()=>{source.disconnect();filter.disconnect();v.disconnect()};
 }
 deal(){for(let i=0;i<5;i++)this.noise(.08,.16,3500,i*.09)}
 card(){this.noise(.1,.2,2500);this.tone(180,.1,0,'triangle',.12,80)}
 challenge(){this.tone(130,.7,0,'sawtooth',.09,55);this.tone(195,.6,0,'triangle',.1,75)}
 cock(){this.noise(.07,.16,4500);this.tone(680,.05,0,'triangle',.1,360)}
 pulse(){this.tone(65,.14,0,'sine',.45,42);this.tone(58,.11,.18,'sine',.28,40)}
 fire(){this.noise(.14,.5,1800);this.tone(150,.18,0,'triangle',.25,38)}
 result(hit:boolean){if(hit){this.noise(.35,.35,950);this.tone(320,.4,0,'sine',.2,70)}else{this.noise(.025,.28,6000);this.tone(880,.05,0,'triangle',.12,420)}}
 victory(){[262,330,392,523].forEach((f,i)=>this.tone(f,.65,i*.16,'triangle',.16))}
 async close(){await this.context.close()}
}
export function useGameAudio(game:AudioGame|null|undefined,active=true,clockOffset=0){
 const [enabled,setEnabled]=useState(false),[error,setError]=useState('');const engine=useRef<GameAudio|null>(null);const previous=useRef('');const offset=useRef(clockOffset);offset.current=clockOffset;
 async function toggle(){if(enabled){setEnabled(false);engine.current?.master.gain.setValueAtTime(0,engine.current.context.currentTime);return;}
  try{engine.current??=new GameAudio();await engine.current.context.resume();engine.current.master.gain.setValueAtTime(.32,engine.current.context.currentTime);setEnabled(true);setError('');engine.current.cock()}catch{setError('Trình duyệt chưa bật được âm thanh. Hãy thử lại.');}
 }
 useEffect(()=>()=>{void engine.current?.close()},[]);
 useEffect(()=>{const handler=()=>{const e=engine.current;if(e)e.master.gain.setValueAtTime(enabled&&active&&!document.hidden? .32:0,e.context.currentTime)};handler();document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler)},[enabled,active]);
 const cards=game?.counts??game?.hands?.map(h=>h.length);const playKey=game?`${game.round}:${cards?.join(',')}`:'';
 useEffect(()=>{const old=previous.current;previous.current=playKey;if(!enabled||!active||!game||!old||game.phase!=='play')return;if(old.split(':')[0]!==String(game.round))engine.current?.deal();else if(old!==playKey)engine.current?.card()},[playKey,enabled,active,game?.phase]);
 // One schedule per shot, unaffected by polling or the loading→firing transition.
 useEffect(()=>{if(!enabled||!active||!game?.shot)return;const s=game.shot;const timers:ReturnType<typeof setTimeout>[]=[];const fire=s.fireAt+offset.current;const start=s.startedAt+offset.current;
  const schedule=(at:number,fn:()=>void)=>{const delay=at-Date.now();if(delay>=0)timers.push(setTimeout(fn,delay))};
  if(Date.now()<fire){engine.current?.challenge();for(let elapsed=0;elapsed<fire-start;elapsed+=Math.max(180,650-elapsed*.12)){schedule(start+elapsed,()=>{engine.current?.cock();engine.current?.pulse()})}schedule(fire,()=>engine.current?.fire());}
  return()=>timers.forEach(clearTimeout);
 },[game?.shot?.startedAt,enabled,active]);
 const resultKey=game?.shot?.hit==null?'':`${game.shot.startedAt}:${game.shot.hit}`;const heardResult=useRef('');
 useEffect(()=>{if(!resultKey||resultKey===heardResult.current)return;heardResult.current=resultKey;if(enabled&&active){engine.current?.result(!!game?.shot?.hit);if(game?.phase==='end')engine.current?.victory()}},[resultKey,enabled,active,game?.phase]);
 const roundKey=game?.round;const seenRound=useRef<number|undefined>(undefined);
 useEffect(()=>{if(game&&seenRound.current===undefined&&enabled&&active)engine.current?.deal();seenRound.current=roundKey},[roundKey,enabled,active]);
 return <span className="game-audio-control"><button type="button" className="icon-button" onClick={()=>void toggle()} aria-pressed={enabled} aria-label={enabled?'Tắt âm thanh':'Bật âm thanh'} title={enabled?'Tắt âm thanh':'Bật âm thanh'}>{enabled?<Volume2 size={20}/>:<VolumeX size={20}/>}</button>{error&&<span role="status">{error}</span>}</span>;
}
