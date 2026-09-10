import * as THREE from 'three';

// A small articulated rig: local +Z faces the table; fingers point along +Z.
export function createCharacter(color:string,variant:number) {
  const root=new THREE.Group(),head=new THREE.Group();
  const materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
  function material(color:string){const m=new THREE.MeshStandardMaterial({color,roughness:.7});materials.push(m);return m;}
  const skin=material(['#ecc0a0','#dfae91','#bc8d70','#edc5ad'][variant]),shirt=material(color),dark=material('#252630'),cream=material('#f4e9d4'),gold=material('#d5b06c'),hair=material(['#27232a','#32252b','#211f26','#51332c'][variant]);
  function shape(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number){geometries.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  const box=(w:number,h:number,d:number,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number)=>shape(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
  const ball=(r:number,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number)=>shape(new THREE.SphereGeometry(r,20,14),m,p,x,y,z);
  const torso=shape(new THREE.CylinderGeometry(.42,.5,.88,20),shirt,root,0,1.5,0);torso.scale.z=.8;
  box(.08,.65,.03,cream,root,0,1.5,.385);
  for(const side of [-1,1]){const collar=box(.19,.19,.05,cream,root,side*.12,1.87,.35);collar.rotation.z=side*.45;box(.23,.64,.28,dark,root,side*.27,.85,.2);box(.27,.15,.43,dark,root,side*.27,.49,.29);}
  for(let i=0;i<3;i++)ball(.025,gold,root,0,1.65-i*.16,.415);
  box(.2,.22,.025,cream,root,-.23,1.56,.37);box(.14,.06,.015,gold,root,-.23,1.6,.39);
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
  if(variant===0){for(const side of [-1,1])shape(new THREE.TorusGeometry(.12,.018,8,24),gold,head,side*.17,.06,.506);box(.1,.018,.02,gold,head,0,.07,.51);}
  if(variant===1){const pony=ball(.29,hair,head,0,.08,-.41);pony.scale.y=1.7;for(const side of [-1,1])ball(.04,gold,head,side*.47,-.08,.04);}
  if(variant===2){shape(new THREE.CylinderGeometry(.5,.5,.13,24),shirt,head,0,.43,0);box(.6,.045,.4,shirt,head,0,.4,.32);}
  if(variant===3){ball(.24,hair,head,0,.29,-.34);box(.23,.045,.045,gold,head,.23,.29,.31);}
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
  return {root,head,gunHand:arms[1].pivot,update,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
