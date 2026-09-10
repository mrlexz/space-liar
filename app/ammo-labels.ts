import * as THREE from 'three';

/** Screen-space text anchored to each animated character's head. */
export function createAmmoLabels(host:HTMLElement,rigs:{root:THREE.Group;head:THREE.Group}[]){
 const layer=document.createElement('div');layer.className='ammo-label-layer';host.appendChild(layer);
 const labels=rigs.map(()=>{const label=document.createElement('div');label.className='ammo-head-label';label.hidden=true;layer.appendChild(label);return label;});
 const point=new THREE.Vector3();
 return {
  update(camera:THREE.Camera,ammo:number[]|undefined,lives:number[]|undefined){
   const width=host.clientWidth,height=host.clientHeight;
   rigs.forEach((rig,i)=>{
    const label=labels[i];const count=ammo?.[i];
    rig.head.updateWorldMatrix(true,false);point.set(0,.85,0);rig.head.localToWorld(point);point.project(camera);
    const visible=rig.root.visible&&count!==undefined&&point.z>=-1&&point.z<=1&&Math.abs(point.x)<1.1&&Math.abs(point.y)<1.1;
    label.hidden=!visible;if(!visible)return;
    const eliminated=lives?.[i]===0;const text=`${count} viên${eliminated?' · Đã loại':''}`;
    if(label.textContent!==text)label.textContent=text;
    label.classList.toggle('eliminated',eliminated);
    label.classList.toggle('last-round',!eliminated&&count===1);
    label.style.transform=`translate(${(point.x+1)*width/2}px,${(1-point.y)*height/2}px) translate(-50%,-100%)`;
   });
  },
  dispose(){layer.remove();}
 };
}
