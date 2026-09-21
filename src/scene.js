import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

const parts = [
  {id:'case',name:'Chassis',category:'STRUCTURE',symbol:'▤',description:'The chassis protects the hardware, provides mounting points, and guides airflow through the system. The side panel is removed here to reveal the internals.',facts:[['Role','Structure & protection'],['Connects to','All internal components'],['In this model','Mid-tower, side panel removed']]},
  {id:'board',name:'Motherboard',category:'CONNECTION',symbol:'▦',description:'The motherboard connects the processor, memory, storage, and expansion cards. Its traces carry signals, while power circuitry regulates electricity for the components.',facts:[['Role','Connect & coordinate'],['Key interfaces','CPU socket, DIMM slots, PCIe'],['In this model','Simplified ATX layout']]},
  {id:'cpu',name:'Processor & cooler',category:'COMPUTE',symbol:'⊞',description:'The CPU executes program instructions. A cooler sits on top of the processor, moving heat into metal fins so a fan can carry it away.',facts:[['Role','Execute instructions'],['Mounted on','Motherboard CPU socket'],['Cooling path','Processor → heatsink → air']]},
  {id:'ram',name:'Memory',category:'WORKING MEMORY',symbol:'▥',description:'RAM holds the data and instructions the processor is actively using. It is fast, temporary memory: its contents are lost when power is removed.',facts:[['Role','Fast, temporary workspace'],['Connects to','Motherboard DIMM slots'],['In this model','Two memory modules']]},
  {id:'gpu',name:'Graphics card',category:'GRAPHICS',symbol:'▰',description:'The GPU performs many calculations in parallel to render images and accelerate suitable workloads. Its own fans and heatsink remove heat from the graphics processor.',facts:[['Role','Render & parallel compute'],['Connects to','PCIe slot & power supply'],['In this model','Dual-fan expansion card']]},
  {id:'ssd',name:'Storage',category:'PERSISTENT STORAGE',symbol:'▱',description:'The solid-state drive stores the operating system, applications, and files even when power is off. This example is a compact M.2 drive mounted directly to the motherboard.',facts:[['Role','Keep applications & files'],['Connects to','Motherboard M.2 socket'],['In this model','M.2 solid-state drive']]},
  {id:'psu',name:'Power supply',category:'POWER',symbol:'ϟ',description:'The power supply converts incoming AC electricity into the regulated DC power used by the computer. Cables distribute that power to the motherboard and graphics card.',facts:[['Role','Convert & distribute power'],['Supplies','Motherboard, CPU & GPU'],['In this model','Bottom-mounted PSU']]},
  {id:'fans',name:'Case cooling',category:'THERMAL',symbol:'✳',description:'Case fans move air through the enclosure. A typical arrangement draws cooler air in at the front and exhausts warmer air at the rear or top.',facts:[['Role','Exchange warm & cool air'],['Works with','CPU & graphics coolers'],['In this model','Three front intake fans']]}
];
const list = document.querySelector('#component-list');
parts.forEach((part,i)=>{
 const row=document.createElement('div');row.className='part-row';
 const button=document.createElement('button');button.className='part-button';button.dataset.part=part.id;button.setAttribute('aria-pressed','false');button.innerHTML=`<span class="part-number">${String(i+1).padStart(2,'0')}</span><span>${part.name}</span><span class="part-arrow">↗</span>`;button.addEventListener('click',()=>selectPart(part.id));
 const visibility=document.createElement('button');visibility.className='visibility-button';visibility.dataset.visibility=part.id;visibility.setAttribute('aria-pressed','true');visibility.setAttribute('aria-label',`Hide ${part.name}`);visibility.title=`Hide ${part.name}`;visibility.innerHTML='<span aria-hidden="true">●</span>';
 visibility.addEventListener('click',()=>toggleVisibility(part.id));row.append(button,visibility);list.append(row);
});
const groups = new Map();
let selected = null;
let sceneApi = null;
const visibilityState = new Map(parts.map(part=>[part.id,true]));
let isolated = false;
let visibilityBeforeIsolation = null;

function updateVisibilityControls(){
 parts.forEach(part=>{const visible=visibilityState.get(part.id);const button=document.querySelector(`[data-visibility="${part.id}"]`);button.setAttribute('aria-pressed',String(visible));button.setAttribute('aria-label',`${visible?'Hide':'Show'} ${part.name}`);button.title=`${visible?'Hide':'Show'} ${part.name}`;button.innerHTML=`<span aria-hidden="true">${visible?'●':'○'}</span>`;});
}
function applyVisibility(){groups.forEach((group,id)=>{group.visible=visibilityState.get(id);});updateVisibilityControls();}
function setIsolation(next){
 if(next&&!selected)return;
 if(next){visibilityBeforeIsolation=new Map(visibilityState);parts.forEach(part=>visibilityState.set(part.id,part.id===selected));isolated=true;}
 else if(isolated){visibilityState.clear();visibilityBeforeIsolation.forEach((value,key)=>visibilityState.set(key,value));isolated=false;visibilityBeforeIsolation=null;}
 applyVisibility();
 const button=document.querySelector('#isolate-part');button.setAttribute('aria-pressed',String(isolated));button.querySelector('span:last-child').textContent=isolated?'Exit isolate':'Isolate';
 document.querySelector('#view-badge').textContent=isolated?'ISOLATED VIEW':(sceneApi?.exploded?'EXPLODED VIEW':'CUTAWAY VIEW');
 if(selected)document.querySelector('#scene-status').textContent=`● ${parts.find(p=>p.id===selected).name} ${isolated?'isolated':'restored'}`;
}
function toggleVisibility(id){
 if(isolated)setIsolation(false);
 visibilityState.set(id,!visibilityState.get(id));applyVisibility();
 const part=parts.find(p=>p.id===id);document.querySelector('#scene-status').textContent=`● ${part.name} ${visibilityState.get(id)?'shown':'hidden'}`;
}
function selectPart(id){
 selected=id;
 groups.forEach((group,key)=>group.traverse(mesh=>{if(mesh.isMesh){mesh.material.emissive.setHex(key===id?0x8dcc54:mesh.userData.baseEmissive);mesh.material.emissiveIntensity=key===id?0.35:mesh.userData.baseIntensity;}}));
 document.querySelectorAll('.scene-label').forEach(label=>label.classList.toggle('selected',label.textContent===parts.find(part=>part.id===id).name));
 document.querySelectorAll('.part-button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.part===id)));
 const part=parts.find(p=>p.id===id);
 document.querySelector('#detail-category').textContent=part.category;
 document.querySelector('#detail-symbol').textContent=part.symbol;
 document.querySelector('#detail-number').textContent=`${String(parts.indexOf(part)+1).padStart(2,'0')} / HARDWARE PROFILE`;
 document.querySelector('#detail-title').textContent=part.name;
 document.querySelector('#detail-description').textContent=part.description;
 document.querySelector('#detail-facts').innerHTML=part.facts.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
 document.querySelector('#isolate-part').disabled=false;document.querySelector('#focus-part').disabled=false;
 if(isolated){parts.forEach(item=>visibilityState.set(item.id,item.id===id));applyVisibility();}
 document.querySelector('#scene-status').textContent=`● ${part.name} selected`;
}
document.querySelector('#start-cpu').addEventListener('click',()=>selectPart('cpu'));

function startScene(){
 const canvas=document.querySelector('#pc-scene');
 const viewer=document.querySelector('.viewer');
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,0.1,100);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 const labelRenderer=new CSS2DRenderer({element:document.querySelector('#scene-labels')});labelRenderer.setSize(viewer.clientWidth,viewer.clientHeight);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=6;controls.maxDistance=15;controls.maxPolarAngle=Math.PI*.9;
 camera.position.set(5.7,3.7,8.6);controls.target.set(0,1.9,0);controls.update();controls.saveState();
 scene.add(new THREE.HemisphereLight(0xd8efff,0x424a3a,2.5));
 const key=new THREE.DirectionalLight(0xe7f2ff,3.8);key.position.set(3,7,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-5;key.shadow.bias=-.001;scene.add(key);
 const rim=new THREE.DirectionalLight(0x92bcdf,2);rim.position.set(-4,3,-3);scene.add(rim);
 const color={frame:0x465460,dark:0x19232b,board:0x284840,silver:0xa5b4be,accent:0xb5ef82,gold:0xa8955c};
 parts.forEach(part=>{const group=new THREE.Group();group.name=part.id;scene.add(group);groups.set(part.id,group);});
 const hitTargets=[];
 function mesh(id,geometry,position,tint,metal=.35){const material=new THREE.MeshStandardMaterial({color:tint,roughness:.48,metalness:metal});const item=new THREE.Mesh(geometry,material);item.position.set(...position);item.castShadow=true;item.receiveShadow=true;item.userData={part:id,baseEmissive:0,baseIntensity:1};groups.get(id).add(item);hitTargets.push(item);return item;}
 const box=(id,size,pos,tint,metal)=>mesh(id,new THREE.BoxGeometry(...size),pos,tint,metal);
 function cylinder(id,r,depth,pos,tint){const m=mesh(id,new THREE.CylinderGeometry(r,r,depth,40),pos,tint);m.rotation.x=Math.PI/2;return m;}
 function fan(id,x,y,z,r){box(id,[r*2.18,r*2.18,.12],[x,y,z-.03],color.dark);const ring=mesh(id,new THREE.TorusGeometry(r*.9,.035,8,48),[x,y,z+.085],color.silver);cylinder(id,r*.23,.09,[x,y,z+.12],color.silver);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const blade=box(id,[r*.48,r*.23,.045],[x+Math.cos(a)*r*.53,y+Math.sin(a)*r*.53,z+.09],color.frame);blade.rotation.z=a+.5;}return ring;}
 // Open near-side chassis. Rear tray and edge rails make the cutaway legible.
 box('case',[3.3,.16,1.75],[0,.18,0],color.frame);
 box('case',[3.3,.13,1.75],[0,4.48,0],color.frame);
 box('case',[3.22,4.2,.08],[0,2.32,-.87],color.dark);
 for(const x of [-1.57,1.57]) for(const z of [-.8,.8])box('case',[.1,4.2,.1],[x,2.32,z],color.silver);
 for(const x of [-1.15,1.15])for(const z of [-.55,.55])box('case',[.36,.16,.36],[x,.04,z],color.dark);
 for(let i=0;i<14;i++)box('case',[.06,.02,1.15],[-1.25+i*.17,4.56,-.04],color.dark);
 box('case',[.12,4.1,1.5],[1.58,2.3,0],color.dark);
 // Mainboard and plausible chips/traces, with a CPU cooler that remains identifiable.
 box('board',[2.35,3.05,.11],[-.27,2.72,-.7],color.board);
 for(let i=0;i<8;i++){box('board',[.035,1.2,.018],[-1.24+i*.2,2,-.635],0x527b69);box('board',[.45,.025,.018],[-.9+i*.2,1.45+i*.12,-.63],0x527b69);}
 for(const x of [-1.26,.72])for(const y of [1.31,4.09])cylinder('board',.045,.035,[x,y,-.61],color.silver);
 box('board',[.25,1.4,.3],[-1.31,3.17,-.48],color.silver);
 for(let i=0;i<3;i++)box('board',[1.36,.095,.15],[-.36,1.52+i*.22,-.54],color.dark);
 box('cpu',[.85,.85,.12],[-.49,3.35,-.54],color.silver);
 for(let i=0;i<12;i++)box('cpu',[.95,.042,.5],[-.49,2.96+i*.067,-.19],color.silver);
 fan('cpu',-.49,3.34,.14,.44);
 for(const x of [.35,.61]){box('ram',[.12,1.35,.29],[x,3.35,-.39],color.dark);box('ram',[.08,1.24,.04],[x,3.35,-.215],color.accent);}
 box('gpu',[2.29,.69,.56],[-.2,2.12,-.04],color.dark);
 fan('gpu',-.75,2.13,.28,.28);fan('gpu',.15,2.13,.28,.28);
 box('gpu',[2.1,.06,.04],[-.2,2.48,.28],color.accent);
 box('gpu',[.12,.82,.61],[-1.38,2.13,-.09],color.silver);
 box('ssd',[.65,.22,.07],[-.5,1.64,-.52],color.dark);
 for(let i=0;i<3;i++)box('ssd',[.13,.14,.025],[-.71+i*.19,1.64,-.47],color.silver);
 cylinder('ssd',.026,.035,[-.2,1.64,-.46],color.gold);
 box('psu',[1.7,.72,1.2],[-.6,.67,-.03],color.dark);
 for(let i=0;i<10;i++)box('psu',[.07,.45,.025],[-1.24+i*.125,.68,.585],color.frame);
 box('psu',[.5,.06,.026],[-.6,.37,.6],color.silver);
 for(const y of [1.4,2.58,3.76])fan('fans',1.04,y,-.05,.45);
 // Bundled power cables curve along the lower and right perimeter.
 for(let i=0;i<4;i++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.23,.66,-.02+i*.07),new THREE.Vector3(.66,.7,.1+i*.05),new THREE.Vector3(.77,1.08,.07+i*.05),new THREE.Vector3(.62,2.47,-.36+i*.04)]);mesh('psu',new THREE.TubeGeometry(curve,24,.021,6,false),[0,0,0],0x58636b);}
 const labelAnchors={case:[-1.55,4.5,.85],board:[-1.15,4.18,-.48],cpu:[-.5,3.94,.22],ram:[.58,4.08,-.2],gpu:[-.15,2.54,.42],ssd:[-.48,1.82,-.42],psu:[-.55,1.12,.57],fans:[1.04,4.28,.18]};
 parts.forEach(part=>{const node=document.createElement('span');node.className='scene-label';node.textContent=part.name;const label=new CSS2DObject(node);label.position.set(...labelAnchors[part.id]);groups.get(part.id).add(label);});
 const explodedOffsets={case:[0,0,0],board:[-.55,.15,-.5],cpu:[-.55,.65,.9],ram:[.65,.6,.25],gpu:[-.45,-.05,1.55],ssd:[-.25,-.5,.85],psu:[-.25,-.55,-.35],fans:[1.25,.1,.6]};
 const explodeTargets=new Map(parts.map(part=>[part.id,new THREE.Vector3()]));let exploded=false;
 let cameraTween=null;
 function setExploded(next){exploded=next;parts.forEach(part=>explodeTargets.get(part.id).set(...(next?explodedOffsets[part.id]:[0,0,0])));const button=document.querySelector('#explode-view');button.setAttribute('aria-pressed',String(next));button.querySelector('span:last-child').textContent=next?'Assemble':'Explode';document.querySelector('#view-badge').textContent=isolated?'ISOLATED VIEW':(next?'EXPLODED VIEW':'CUTAWAY VIEW');document.querySelector('#scene-status').textContent=`● ${next?'Exploded':'Assembled'} view`;}
 function focusPart(id){
  const group=groups.get(id);if(!visibilityState.get(id)){visibilityState.set(id,true);applyVisibility();}
  group.updateWorldMatrix(true,true);const box3=new THREE.Box3().setFromObject(group);const sphere=box3.getBoundingSphere(new THREE.Sphere());const direction=camera.position.clone().sub(controls.target).normalize();const fov=THREE.MathUtils.degToRad(camera.fov);const distance=THREE.MathUtils.clamp(Math.max(sphere.radius*1.25,1.15)/Math.tan(fov/2),2.3,10);controls.minDistance=2.1;cameraTween={started:performance.now(),duration:650,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toTarget:sphere.center.clone(),toPosition:sphere.center.clone().add(direction.multiplyScalar(distance))};document.querySelector('#scene-status').textContent=`● Focusing ${parts.find(part=>part.id===id).name}`;
 }
 sceneApi={get exploded(){return exploded;},setExploded,focusPart};
 const floor=new THREE.Mesh(new THREE.CircleGeometry(5,80),new THREE.ShadowMaterial({opacity:.25}));floor.rotation.x=-Math.PI/2;floor.position.y=-.05;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(12,24,0x496070,0x2e414e);grid.position.y=-.06;grid.material.transparent=true;grid.material.opacity=.28;scene.add(grid);
 const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let down=null;let gesture=false;const activePointers=new Set();
 canvas.addEventListener('pointerdown',event=>{activePointers.add(event.pointerId);if(activePointers.size>1)gesture=true;down={x:event.clientX,y:event.clientY,id:event.pointerId};});
 canvas.addEventListener('pointermove',event=>{if(down&&Math.hypot(event.clientX-down.x,event.clientY-down.y)>5)gesture=true;});
 canvas.addEventListener('pointerup',event=>{activePointers.delete(event.pointerId);if(down&&down.id===event.pointerId&&!gesture&&event.button===0){const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const visibleTargets=hitTargets.filter(item=>visibilityState.get(item.userData.part));const hit=raycaster.intersectObjects(visibleTargets,false)[0];if(hit)selectPart(hit.object.userData.part);}if(!activePointers.size){down=null;gesture=false;}});
 canvas.addEventListener('pointercancel',event=>{activePointers.delete(event.pointerId);down=null;if(!activePointers.size)gesture=false;});
 function zoom(factor){const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();}
 document.querySelector('#zoom-in').addEventListener('click',()=>zoom(.85));document.querySelector('#zoom-out').addEventListener('click',()=>zoom(1.18));
 document.querySelector('#explode-view').addEventListener('click',()=>setExploded(!exploded));
 document.querySelector('#isolate-part').addEventListener('click',()=>setIsolation(!isolated));
 document.querySelector('#focus-part').addEventListener('click',()=>selected&&focusPart(selected));
 document.querySelector('#show-all').addEventListener('click',()=>{if(isolated)setIsolation(false);parts.forEach(part=>visibilityState.set(part.id,true));applyVisibility();document.querySelector('#scene-status').textContent='● All components shown';});
 document.querySelector('#reset-view').addEventListener('click',()=>{cameraTween=null;controls.minDistance=6;controls.reset();document.querySelector('#scene-status').textContent=selected?`● ${parts.find(p=>p.id===selected).name} selected · View reset`:'● View reset';});
 canvas.addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if(key==='+'||key==='='){event.preventDefault();zoom(.85);}else if(key==='-'){event.preventDefault();zoom(1.18);}else if(key==='e'){event.preventDefault();setExploded(!exploded);}else if(key==='i'&&selected){event.preventDefault();setIsolation(!isolated);}else if(key==='f'&&selected){event.preventDefault();focusPart(selected);}else if(key==='escape'&&isolated){event.preventDefault();setIsolation(false);}
 });
 new ResizeObserver(()=>{camera.aspect=viewer.clientWidth/viewer.clientHeight;camera.updateProjectionMatrix();renderer.setSize(viewer.clientWidth,viewer.clientHeight,false);labelRenderer.setSize(viewer.clientWidth,viewer.clientHeight);}).observe(viewer);
 document.querySelector('#scene-status').textContent='● Ready to explore';
 renderer.setAnimationLoop(time=>{
  groups.forEach((group,id)=>{const target=explodeTargets.get(id);group.position.lerp(target,.1);if(group.position.distanceToSquared(target)<.000001)group.position.copy(target);});
  if(cameraTween){const elapsed=Math.min((time-cameraTween.started)/cameraTween.duration,1);const eased=1-Math.pow(1-elapsed,3);camera.position.lerpVectors(cameraTween.fromPosition,cameraTween.toPosition,eased);controls.target.lerpVectors(cameraTween.fromTarget,cameraTween.toTarget,eased);if(elapsed===1){cameraTween=null;document.querySelector('#scene-status').textContent=`● ${parts.find(part=>part.id===selected).name} focused`;}}
  controls.update();renderer.render(scene,camera);labelRenderer.render(scene,camera);
 });
}
try{startScene();}catch(error){console.error(error);const fallback=document.querySelector('#scene-error');fallback.hidden=false;fallback.textContent='The 3D view could not start. Try a browser with WebGL enabled. You can still explore all component descriptions using the index.';document.querySelector('#scene-status').textContent='3D unavailable · Component guide ready';}
