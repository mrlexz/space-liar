export const presets=[
 {name:'Quí',role:'Áo thể thao · Kính râm',color:'#182330',quote:'“Tin tôi lần này đi.”',appearance:{shirt:'#182330',pants:'#1e2937',skin:'#dfb99e',hair:'#202127',shoes:'#272d32',hairStyle:'parted',glasses:'sun',outfit:'jersey',pantsStyle:'shorts',build:0.94}},
 {name:'Anh Hồ',role:'Áo trắng · Nụ cười tươi',color:'#e1e8f3',quote:'“Bài này thật mà!”',appearance:{shirt:'#e1e8f3',pants:'#34475d',skin:'#dcaa88',hair:'#242527',shoes:'#365473',hairStyle:'short',glasses:'none',outfit:'graphic',pantsStyle:'shorts',build:1.12}},
 {name:'Nguyên',role:'Áo polo · Tóc ngắn',color:'#9a8770',quote:'“Cứ lật lên xem.”',appearance:{shirt:'#9a8770',pants:'#172d37',skin:'#e3bca4',hair:'#343331',shoes:'#e3ddd0',hairStyle:'swept',glasses:'none',outfit:'polo',pantsStyle:'shorts',build:0.96}},
 {name:'Khánh Em',role:'Sơ mi xanh · Tóc mái',color:'#92b7e2',quote:'“Đến lượt ai rồi?”',appearance:{shirt:'#92b7e2',pants:'#202833',skin:'#dfb59b',hair:'#242327',shoes:'#343c43',hairStyle:'fringe',glasses:'none',outfit:'striped',pantsStyle:'long',build:1.03}}
];
export function normalizeAppearance(input,variant=0){
 const base=presets[variant]?.appearance;if(!base)throw new Error('Nhân vật không hợp lệ.');
 if(input===undefined||input===null)return {...base};
 if(typeof input!=='object'||Array.isArray(input))throw new Error('Diện mạo không hợp lệ.');
 const result={...base};
 for(const key of ['shirt','pants','skin','hair','shoes'])if(input[key]!==undefined){if(typeof input[key]!=='string'||!/^#[0-9a-fA-F]{6}$/.test(input[key]))throw new Error('Màu nhân vật không hợp lệ.');result[key]=input[key];}
 for(const [key,values] of Object.entries({hairStyle:['parted','short','swept','fringe'],glasses:['none','clear','sun'],outfit:['jersey','graphic','polo','striped'],pantsStyle:['shorts','long']}))if(input[key]!==undefined){if(!values.includes(input[key]))throw new Error('Kiểu nhân vật không hợp lệ.');result[key]=input[key];}
 if(input.build!==undefined){if(typeof input.build!=='number'||!Number.isFinite(input.build)||input.build<.85||input.build>1.2)throw new Error('Dáng người không hợp lệ.');result.build=input.build;}
 return result;
}
