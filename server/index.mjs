import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {create,join,auth,view,act,leave,sweep,tick} from './game.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const buckets=new Map();
export const server=http.createServer(async(req,res)=>{const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){
 const key=req.socket.remoteAddress;const now=Date.now();let b=buckets.get(key);if(!b||now-b.time>60000){b={time:now,n:0};buckets.set(key,b);}if(++b.n>600)return json({error:'Quá nhiều yêu cầu. Thử lại sau một phút.'},429);
 if(req.method==='POST'&&req.headers.origin&&req.headers['sec-fetch-site']==='cross-site')return json({error:'Yêu cầu khác nguồn không được phép.'},403);
 if(url.pathname==='/api/health')return json({ok:true});
 let body={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return json({error:'Yêu cầu quá lớn.'},413);}try{body=JSON.parse(raw||'{}')}catch{return json({error:'JSON không hợp lệ.'},400)}}
 if(req.method==='POST'&&['/api/create','/api/join'].includes(url.pathname)){const {room,player}=url.pathname==='/api/create'?create(body.name,body.character,body.appearance):join(String(body.code??'').toUpperCase(),body.name,body.character,body.appearance);return json({token:player.token,state:view(room,player)});}
 const token=(req.headers.authorization??'').replace(/^Bearer /,'');const {room,player}=auth(url.searchParams.get('code'),token);
 if(req.method==='GET'&&url.pathname==='/api/state')return json(view(room,player));
 if(req.method==='POST'&&url.pathname==='/api/action'){act(room,player,body.action,body.revision,body.indices);return json(view(room,player));}
 if(req.method==='POST'&&url.pathname==='/api/leave'){leave(room,player);return json({ok:true});}return json({error:'Không tìm thấy API.'},404);
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root)){res.writeHead(403);return res.end();}try{const data=await readFile(path);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.glb':'model/gltf-binary'};res.writeHead(200,{'Content-Type':types[extname(path)]??'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':path.includes('/assets/')?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404);res.end('Not found');}
 }catch(e){json({error:e.message??'Yêu cầu không hợp lệ.'},400);}
});
const shotTimer=setInterval(()=>tick(),100);shotTimer.unref();
const timer=setInterval(()=>{sweep();for(const [k,b] of buckets)if(Date.now()-b.time>120000)buckets.delete(k)},5000);timer.unref();
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT??3001),'0.0.0.0',()=>console.log(`Office Bluff: http://localhost:${process.env.PORT??3001}`));
