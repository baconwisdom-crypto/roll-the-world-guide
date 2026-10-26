import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../out/',import.meta.url));
const flag=process.argv.indexOf('--port');
const port=Number(flag<0?4173:process.argv[flag+1]);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2'};
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=resolve(root,'.'+pathname);
  if(file!==root.replace(/[\\/]$/,'')&&!file.startsWith(root.endsWith(sep)?root:root+sep)) {res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('Not found')));}
}).listen(port,'127.0.0.1',()=>console.log(`Static preview: http://127.0.0.1:${port}`));
