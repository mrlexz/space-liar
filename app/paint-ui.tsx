import {useEffect,useState} from 'react';
export type Shot={remainingBefore:number;shooter:number;target:number;startedAt:number;fireAt:number;resolveAt:number;hit:boolean|null};
export function PaintStatus({shot,phase,names,serverNow}:{shot:Shot|null;phase:string;names:string[];serverNow?:number}){
 const [now,setNow]=useState(Date.now());const [offset,setOffset]=useState(0);
 useEffect(()=>{if(serverNow)setOffset(serverNow-Date.now())},[serverNow]);
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),100);return()=>clearInterval(t)},[]);
 if(!shot)return null;const pending=phase==='loading'||phase==='firing';const seconds=Math.max(0,Math.ceil((shot.fireAt-now-offset)/1000));
 return <div className={`paint-status ${pending?'cocking':''}`} aria-live="polite"><strong>{phase==='loading'?`LÊN NÒNG · ${seconds}s`:phase==='firing'?'BẮN!':shot.hit?'TRÚNG SƠN!':'TẠCH · ĐẠN RỖNG'}</strong><p>{names[shot.shooter]} → {names[shot.target]}</p><div className="chambers" aria-label={`${shot.remainingBefore} viên còn lại trước phát bắn`}>{Array.from({length:shot.remainingBefore},(_,i)=><span key={i} className={i===0?'paint-round':''}/>)}</div><small>1 viên sơn · {shot.remainingBefore-1} viên rỗng · Không nạp lại</small></div>;
}
export function Rankings({ranks,names}:{ranks:(number|null)[];names:string[]}){return <div className="rankings"><div className="hand-label">BẢNG XẾP HẠNG</div>{names.map((name,i)=>({name,rank:ranks[i],i})).sort((a,b)=>(a.rank??0)-(b.rank??0)).map(p=><div key={p.i}><b>{p.rank?['','🥇 Nhất','🥈 Nhì','🥉 Ba','4 · Tư'][p.rank]:'—'}</b><span>{p.name}</span><small>{p.rank?'Đã xác định':'Đang tranh hạng'}</small></div>)}</div>}
