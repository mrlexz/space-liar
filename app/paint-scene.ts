import * as THREE from 'three';
import type {Shot} from './paint-ui';
type Rig={root:THREE.Group;head:THREE.Group;gunHand:THREE.Group};
export function createPaintScene(scene:THREE.Scene,rigs:Rig[],positions:number[][]){
 const materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
 const mat=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.5});materials.push(m);return m};
 const teal=mat('#2ed6c2'),orange=mat('#ff9f36'),dark=mat('#243744'),pink=mat('#ff36b3');
 function mesh(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Object3D,x:number,y:number,z:number){geometries.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
 const guns=rigs.map((rig,i)=>{const gun=new THREE.Group();scene.add(gun);mesh(new THREE.BoxGeometry(.2,.18,.55),teal,gun,0,0,.12);mesh(new THREE.BoxGeometry(.14,.32,.16),orange,gun,0,-.2,-.05);const barrel=mesh(new THREE.CylinderGeometry(.075,.075,.3,16),orange,gun,0,0,.48);barrel.rotation.x=Math.PI/2;const cylinder=mesh(new THREE.CylinderGeometry(.14,.14,.2,12),dark,gun,0,0,.02);cylinder.rotation.x=Math.PI/2;
 for(let n=0;n<6;n++){const a=n*Math.PI/3;mesh(new THREE.SphereGeometry(.025,8,8),n===0?pink:orange,cylinder,Math.cos(a)*.11,.11,Math.sin(a)*.11);}
 const splash=new THREE.Group();rig.head.add(splash);for(let n=0;n<9;n++){const a=n*2.4;const r=n===0?0:.09+(.02*n);const drop=mesh(new THREE.SphereGeometry(n===0?.14:.045,12,10),pink,splash,Math.cos(a)*r,Math.sin(a)*r,.48);drop.scale.z=.18;}splash.visible=false;
 return {gun,cylinder,splash,rest:new THREE.Vector3(positions[i][0]*.68,1.96,positions[i][1]*.66)};});
 const projectile=mesh(new THREE.SphereGeometry(.07,12,12),pink,scene,0,0,0);projectile.visible=false;const hand=new THREE.Vector3(),target=new THREE.Vector3(),origin=new THREE.Vector3();let lastShot=-1,hitAt=0;
 return {update(shot:Shot|null|undefined,painted:boolean[]|undefined,reduced:boolean){const now=Date.now();guns.forEach((g,i)=>{g.gun.visible=rigs[i].root.visible;g.splash.visible=!!painted?.[i];const aiming=shot?.shooter===i&&now<shot.resolveAt+1800;if(aiming&&shot){rigs[i].gunHand.updateWorldMatrix(true,false);hand.set(0,0,.73);rigs[i].gunHand.localToWorld(hand);g.gun.position.lerp(hand,reduced?1:.16);rigs[shot.target].head.getWorldPosition(target);g.gun.lookAt(target);if(!reduced&&now>=shot.fireAt&&now<shot.resolveAt)g.gun.translateZ(-.09*Math.sin((now-shot.fireAt)/700*Math.PI));g.cylinder.rotation.y=now<shot.fireAt&&!reduced?(now-shot.startedAt)*.025:0;}else{g.gun.position.lerp(g.rest,reduced?1:.15);g.gun.lookAt(0,1.96,0);}});
 if(shot?.hit&&lastShot!==shot.startedAt){lastShot=shot.startedAt;hitAt=now;}projectile.visible=!!shot?.hit&&!reduced&&now-hitAt<350;if(projectile.visible&&shot){guns[shot.shooter].gun.getWorldPosition(origin);rigs[shot.target].head.getWorldPosition(target);projectile.position.lerpVectors(origin,target,Math.min(1,(now-hitAt)/350));}
 },dispose(){guns.forEach(g=>{scene.remove(g.gun);g.splash.removeFromParent()});scene.remove(projectile);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
