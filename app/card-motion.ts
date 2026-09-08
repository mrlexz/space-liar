import * as THREE from 'three';

export type TableCards = {round:number; counts:number[]; last:null|{who:number;count:number}};

// Only public card counts enter this scene; every card stays face down.
export function createCardMotion(scene:THREE.Scene, seats:number[][]) {
  const group = new THREE.Group();
  scene.add(group);
  const paper = new THREE.MeshStandardMaterial({color:'#f3e3c4',roughness:.65});
  const back = new THREE.MeshStandardMaterial({color:'#85473e',roughness:.55});
  const ink = new THREE.MeshStandardMaterial({color:'#d9b779',metalness:.25,roughness:.5});
  const geometries:THREE.BufferGeometry[]=[];
  function card() {
    const g=new THREE.Group();
    for(const [w,h,d,material,y] of [[.36,.025,.53,paper,0],[.31,.009,.47,back,.018],[.22,.006,.012,ink,.025]] as const){
      const geometry=new THREE.BoxGeometry(w,h,d);geometries.push(geometry);
      const mesh=new THREE.Mesh(geometry,material);mesh.position.y=y;mesh.castShadow=true;g.add(mesh);
    }
    group.add(g);return g;
  }
  const hands=seats.map(()=>Array.from({length:5},card));
  const pile=Array.from({length:20},card);
  const flights:{mesh:THREE.Group;from:THREE.Vector3;to:THREE.Vector3;start:number;duration:number;angle:number}[]=[];
  let previous:TableCards|undefined, dealtAt=0, pileSize=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function held(seat:number,index:number,count:number,time:number){
    const [x,z]=seats[seat],angle=Math.atan2(-x,-z),offset=(index-(count-1)/2)*.17;
    return new THREE.Vector3(x*.76+Math.cos(angle)*offset,1.94+Math.abs(offset)*.12+ (reduced.matches?0:Math.sin(time*1.8+seat)*.018),z*.76-Math.sin(angle)*offset);
  }
  function update(state:TableCards|undefined,time:number){
    if(!state){hands.flat().forEach(c=>c.visible=false);pile.forEach(c=>c.visible=false);previous=undefined;flights.length=0;pileSize=0;return;}
    const newDeal=!previous||state.round!==previous.round||state.counts.some((n,i)=>n>(previous?.counts[i]??0));
    if(newDeal){dealtAt=time;pileSize=0;flights.length=0;}
    else if(previous){
      state.counts.forEach((n,seat)=>{
        const removed=(previous!.counts[seat]??0)-n;
        for(let j=0;j<removed&&pileSize<20;j++){
          const index=pileSize++,mesh=pile[index];
          flights.push({mesh,from:held(seat,n+j,n+removed,time),to:new THREE.Vector3(Math.sin(index*2.4)*.19,1.86+index*.027,Math.cos(index*2.4)*.15),start:time+j*.075,duration:reduced.matches?0:.58,angle:index*.47});
        }
      });
    }
    hands.forEach((cards,seat)=>cards.forEach((mesh,i)=>{
      const count=state.counts[seat]??0;mesh.visible=i<count;if(!mesh.visible)return;
      const target=held(seat,i,count,time),delay=(i*state.counts.length+seat)*.065;
      const progress=reduced.matches?1:THREE.MathUtils.clamp((time-dealtAt-delay)/.48,0,1),ease=1-Math.pow(1-progress,3);
      mesh.position.lerpVectors(new THREE.Vector3(0,1.99,0),target,ease);
      mesh.position.y+=Math.sin(progress*Math.PI)*.55;
      mesh.rotation.set(ease*.95,Math.atan2(-seats[seat][0],-seats[seat][1]),(i-(count-1)/2)*.12*ease);
      mesh.visible=progress>0;
    }));
    pile.forEach((mesh,i)=>{mesh.visible=i<pileSize;});
    for(let i=flights.length-1;i>=0;i--){
      const f=flights[i],p=f.duration===0?1:THREE.MathUtils.clamp((time-f.start)/f.duration,0,1),ease=p*p*(3-2*p);
      f.mesh.position.lerpVectors(f.from,f.to,ease);f.mesh.position.y+=Math.sin(p*Math.PI)*.7;
      f.mesh.rotation.set((1-p)*.95,f.angle*ease,Math.sin(p*Math.PI)*.3);
      if(p===1)flights.splice(i,1);
    }
    previous={...state,counts:[...state.counts]};
  }
  return {update,dispose(){scene.remove(group);geometries.forEach(g=>g.dispose());[paper,back,ink].forEach(m=>m.dispose());}};
}
