import * as THREE from 'three';
import {normalizeAppearance} from '../shared/appearance.mjs';
import type {Appearance} from './appearance';

// A small articulated rig: local +Z faces the table; fingers point along +Z.
export function createCharacter(color:string,variant:number,appearance?:Appearance) {
  const look=normalizeAppearance(appearance,variant);
  const root=new THREE.Group(),head=new THREE.Group();
  const materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
  function material(color:string){const m=new THREE.MeshStandardMaterial({color,roughness:.7});materials.push(m);return m;}
  const skin=material(look.skin),shirt=material(look.shirt),dark=material('#252630'),pants=material(look.pants),shoes=material(look.shoes),cream=material('#f4e9d4'),gold=material('#d5b06c'),hair=material(look.hair);
  const textures:THREE.Texture[]=[];
  function shape(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number){geometries.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  const box=(w:number,h:number,d:number,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number)=>shape(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
  const ball=(r:number,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number)=>shape(new THREE.SphereGeometry(r,20,14),m,p,x,y,z);
  const torso=shape(new THREE.CylinderGeometry(.42,.5,.88,20),shirt,root,0,1.5,0);torso.scale.z=.8;
  for(const side of [-1,1]){if(look.pantsStyle==='shorts'){box(.23,.32,.28,pants,root,side*.27,1.01,.2);box(.18,.32,.22,skin,root,side*.27,.69,.2);}else box(.23,.64,.28,pants,root,side*.27,.85,.2);box(.27,.15,.43,shoes,root,side*.27,.49,.29);}
  if(look.outfit==='polo'||look.outfit==='striped'){
   for(const side of [-1,1]){const collar=box(.19,.19,.05,cream,root,side*.12,1.87,.35);collar.rotation.z=side*.45;}
   box(.045,look.outfit==='polo'?.25:.68,.03,cream,root,0,1.53,.408);
   for(let i=0;i<(look.outfit==='polo'?2:4);i++)ball(.016,gold,root,0,1.72-i*.13,.425);
  }
  if(look.outfit==='striped')for(let i=-4;i<=4;i++)box(.011,.66,.025,cream,root,i*.074,1.5,.38-Math.abs(i)*.014);
  if(look.outfit==='jersey'||look.outfit==='graphic'){
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d')!;
   ctx.fillStyle=look.shirt;ctx.fillRect(0,0,256,256);ctx.textAlign='center';ctx.font='bold 170px Arial';ctx.fillStyle='#f5f5f5';
   if(look.outfit==='jersey')ctx.fillText('11',128,192);else{ctx.font='bold 65px Arial';for(let i=0;i<3;i++){ctx.fillStyle=i===1?'#e26055':'#337ca7';ctx.fillText('BALI',128,70+i*72);}}
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);const print=new THREE.MeshStandardMaterial({map:texture,roughness:.8});materials.push(print);shape(new THREE.PlaneGeometry(.49,.51),print,root,0,1.48,.407);
  }
  head.position.y=2.32;root.add(head);ball(.48,skin,head,0,0,0);
  const cap=ball(.5,hair,head,0,.2,-.08);cap.scale.y=.64;
  for(const side of [-1,1]){
    ball(.095,skin,head,side*.47,0,0);
    const eye=ball(.082,cream,head,side*.17,.06,.424);eye.scale.y=.8;
    ball(.042,dark,head,side*.17,.06,.488);ball(.014,cream,head,side*.16,.078,.52);
    const brow=box(.16,.034,.045,hair,head,side*.17,.19,.438);brow.rotation.z=side*.1;
    const cheek=ball(.064,material('#cb8d7c'),head,side*.3,-.07,.365);cheek.scale.z=.3;
  }
  ball(.065,skin,head,0,-.055,.48);box(.14,.025,.03,dark,head,0,-.19,.439);
  if(look.glasses!=='none'){
   for(const side of [-1,1]){shape(new THREE.TorusGeometry(.13,.021,8,24),gold,head,side*.17,.06,.515);if(look.glasses==='sun'){const lens=ball(.12,material('#44455b'),head,side*.17,.06,.51);lens.scale.z=.2;}}
   box(.1,.022,.022,gold,head,0,.07,.52);
  }
  if(look.hairStyle==='parted'){for(const side of [-1,1]){const lock=ball(.23,hair,head,side*.21,.29,.24);lock.scale.set(1,.7,.5);lock.rotation.z=side*.35;}}
  if(look.hairStyle==='short'){
   // A full crown above the scalp, rather than a flattened sphere buried in it.
   cap.visible=false;
   shape(new THREE.SphereGeometry(.515,28,18,0,Math.PI*2,0,Math.PI*.42),hair,head,0,.08,-.02);
   for(const side of [-1,1]){const temple=ball(.13,hair,head,side*.43,.16,-.06);temple.scale.set(.5,1.2,1.6);}
  }
  if(look.hairStyle==='swept'){const lock=ball(.3,hair,head,-.08,.33,.16);lock.scale.set(1.3,.45,.8);lock.rotation.z=-.25;}
  if(look.hairStyle==='fringe')for(let i=-2;i<=2;i++){const lock=ball(.12,hair,head,i*.14,.23,.35);lock.scale.set(.65,1.35,.5);}
  if(variant===1){head.scale.x=1.07;const smile=shape(new THREE.TorusGeometry(.085,.009,8,20,Math.PI),material('#7e4b42'),head,0,-.145,.468);smile.rotation.z=Math.PI;}
  root.scale.x=look.build;
  const arms=[-1,1].map(side=>{
    const pivot=new THREE.Group();pivot.position.set(side*.43,1.83,.04);root.add(pivot);
    const sleeve=shape(new THREE.CapsuleGeometry(.115,.33,5,12),shirt,pivot,0,0,.22);sleeve.rotation.x=Math.PI/2;
    const forearm=shape(new THREE.CapsuleGeometry(.087,.25,5,12),skin,pivot,0,0,.52);forearm.rotation.x=Math.PI/2;
    box(.19,.08,.1,cream,pivot,0,0,.4);
    const palm=ball(.115,skin,pivot,0,0,.75);palm.scale.set(.85,.65,1);
    const finger=new THREE.Group();finger.position.set(-.045,0,.81);pivot.add(finger);
    const index=shape(new THREE.CapsuleGeometry(.033,.18,4,8),skin,finger,0,0,.1);index.rotation.x=Math.PI/2;
    for(let j=0;j<3;j++)ball(.035,skin,pivot,.01+j*.04,-.02,.81);
    ball(.047,skin,pivot,-.09,-.035,.74);
    if(side===-1){box(.18,.035,.11,dark,pivot,0,.082,.53);box(.11,.01,.075,gold,pivot,0,.104,.53);}
    return {pivot,finger};
  });
  const forward=new THREE.Vector3(0,0,1),direction=new THREE.Vector3(),rest=new THREE.Quaternion(),aim=new THREE.Quaternion();
  let blend=0,lastTime=0;
  function update(time:number,target:THREE.Vector3|null,holding:boolean,reduced:boolean){
    const dt=Math.min(.1,time-lastTime);lastTime=time;
    blend=THREE.MathUtils.damp(blend,target?1:0,8,dt);
    head.rotation.y=target?Math.atan2(target.x,target.z)*.3:Math.sin(time*.55)*.035;
    head.rotation.z=target?-.05:0;
    arms.forEach(({pivot,finger},i)=>{
      rest.setFromEuler(new THREE.Euler(holding?-.15:.65,i===0?.12:-.12,0));
      if(i===1&&target){direction.copy(target).sub(pivot.position).normalize();aim.setFromUnitVectors(forward,direction);pivot.quaternion.copy(rest).slerp(aim,reduced?1:blend);}
      else pivot.quaternion.slerp(rest,reduced?1:1-Math.exp(-dt*9));
      finger.rotation.x=i===1&&target?0:-1.3;
    });
  }
  return {root,head,gunHand:arms[1].pivot,update,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
