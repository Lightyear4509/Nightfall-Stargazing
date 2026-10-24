import fs from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'public', 'icon.svg');
const svg = await fs.readFile(svgPath, 'utf8');
const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
if (!viewBox) throw new Error('The source icon needs a numeric SVG viewBox.');
const sourceWidth = Number(viewBox[1]);
const sourceHeight = Number(viewBox[2]);
const outputSize = 1024;
const supersample = 2;
const scale = outputSize / sourceWidth * supersample;
const rasterSize = outputSize * supersample;
const raster = Buffer.alloc(rasterSize * rasterSize * 3);

function colorBytes(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}
function fillBackground(color) {
  const [red, green, blue] = colorBytes(color);
  for (let offset = 0; offset < raster.length; offset += 3) {
    raster[offset] = red; raster[offset + 1] = green; raster[offset + 2] = blue;
  }
}
function paint(x, y, rgb) {
  if (x < 0 || y < 0 || x >= rasterSize || y >= rasterSize) return;
  const offset = (y * rasterSize + x) * 3;
  raster[offset] = rgb[0]; raster[offset + 1] = rgb[1]; raster[offset + 2] = rgb[2];
}
function bounds(minX, minY, maxX, maxY, draw) {
  const left = Math.max(0, Math.floor(minX)); const top = Math.max(0, Math.floor(minY));
  const right = Math.min(rasterSize - 1, Math.ceil(maxX)); const bottom = Math.min(rasterSize - 1, Math.ceil(maxY));
  for (let y = top; y <= bottom; y += 1) for (let x = left; x <= right; x += 1) draw(x, y);
}
function drawDisc(cx, cy, radius, rgb) {
  bounds(cx-radius, cy-radius, cx+radius, cy+radius, (x,y) => {
    if ((x+0.5-cx)**2 + (y+0.5-cy)**2 <= radius**2) paint(x,y,rgb);
  });
}
function drawLine(a, b, stroke, rgb) {
  const radius = stroke / 2;
  const dx = b.x-a.x; const dy = b.y-a.y; const lengthSquared = dx*dx + dy*dy;
  bounds(Math.min(a.x,b.x)-radius, Math.min(a.y,b.y)-radius, Math.max(a.x,b.x)+radius, Math.max(a.y,b.y)+radius, (x,y) => {
    const t = Math.max(0, Math.min(1, ((x+0.5-a.x)*dx + (y+0.5-a.y)*dy) / lengthSquared));
    if ((x+0.5-a.x-t*dx)**2 + (y+0.5-a.y-t*dy)**2 <= radius**2) paint(x,y,rgb);
  });
}
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}
function parsePath(data) {
  const tokens = data.match(/[MmLlHhVv]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) ?? [];
  const lines = []; const vertices = [];
  let command = ''; let x = 0; let y = 0; let previous = {x:0,y:0};
  for (let index = 0; index < tokens.length;) {
    if (/^[A-Za-z]$/.test(tokens[index])) command = tokens[index++];
    if (command.toLowerCase() === 'm' || command.toLowerCase() === 'l') {
      const first = command.toLowerCase() === 'm';
      const nx = Number(tokens[index++]); const ny = Number(tokens[index++]);
      if (command === command.toLowerCase()) { x += nx; y += ny; } else { x = nx; y = ny; }
      const current = {x,y};
      if (!first) lines.push([previous,current]);
      vertices.push(current); previous = current;
      if (first) command = command === 'm' ? 'l' : 'L';
    } else if (command.toLowerCase() === 'h') {
      const value = Number(tokens[index++]); x = command === 'h' ? x+value : value;
      const current = {x,y}; lines.push([previous,current]); vertices.push(current); previous = current;
    } else if (command.toLowerCase() === 'v') {
      const value = Number(tokens[index++]); y = command === 'v' ? y+value : value;
      const current = {x,y}; lines.push([previous,current]); vertices.push(current); previous = current;
    } else throw new Error(`Unsupported path command: ${command}`);
  }
  return {lines, vertices};
}

const rect = svg.match(/<rect\b[^>]*>/)?.[0];
const rectAttrs = rect ? attrs(rect) : {};
fillBackground(rectAttrs.fill ?? '#080d14');
for (const match of svg.matchAll(/<path\b[^>]*>/g)) {
  const shape = attrs(match[0]); const rgb = colorBytes(shape.stroke ?? '#000000');
  const {lines, vertices} = parsePath(shape.d ?? '');
  for (const [a,b] of lines) drawLine({x:a.x*scale,y:a.y*scale},{x:b.x*scale,y:b.y*scale},Number(shape['stroke-width'] ?? 1)*scale,rgb);
  if (shape['stroke-linejoin'] === 'round') for (const point of vertices) drawDisc(point.x*scale,point.y*scale,Number(shape['stroke-width'] ?? 1)*scale/2,rgb);
}
for (const match of svg.matchAll(/<circle\b[^>]*>/g)) {
  const shape = attrs(match[0]); const cx=Number(shape.cx)*scale; const cy=Number(shape.cy)*scale; const radius=Number(shape.r)*scale;
  if (shape.fill && shape.fill !== 'none') drawDisc(cx,cy,radius,colorBytes(shape.fill));
  if (shape.stroke && shape.stroke !== 'none') {
    const rgb=colorBytes(shape.stroke); const half=Number(shape['stroke-width'] ?? 1)*scale/2;
    bounds(cx-radius-half,cy-radius-half,cx+radius+half,cy+radius+half,(x,y)=>{
      const delta=Math.hypot(x+0.5-cx,y+0.5-cy)-radius;
      if (Math.abs(delta)<=half) paint(x,y,rgb);
    });
  }
}

const crcTable=Uint32Array.from({length:256},(_,index)=>{let value=index;for(let bit=0;bit<8;bit+=1)value=(value&1)?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
function crc32(buffer) { let value=0xffffffff; for(const byte of buffer)value=crcTable[(value^byte)&0xff]^(value>>>8);return (value^0xffffffff)>>>0; }
function chunk(type,data) { const name=Buffer.from(type); const length=Buffer.alloc(4); length.writeUInt32BE(data.length); const checksum=Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([name,data]))); return Buffer.concat([length,name,data,checksum]); }
function pngAtSize(size) {
  const scanlines=Buffer.alloc((size*3+1)*size);
  for(let y=0;y<size;y+=1){
    const row=y*(size*3+1);scanlines[row]=0;
    const y0=Math.floor(y*rasterSize/size);const y1=Math.floor((y+1)*rasterSize/size);
    for(let x=0;x<size;x+=1){
      const x0=Math.floor(x*rasterSize/size);const x1=Math.floor((x+1)*rasterSize/size);const count=(y1-y0)*(x1-x0);
      for(let channel=0;channel<3;channel+=1){let sum=0;for(let sy=y0;sy<y1;sy+=1)for(let sx=x0;sx<x1;sx+=1)sum+=raster[(sy*rasterSize+sx)*3+channel];scanlines[row+1+x*3+channel]=Math.round(sum/count);}
    }
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scanlines,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
const outputs=[['assets/icon.png',1024],['public/icon-512.png',512],['public/icon-192.png',192],['public/apple-touch-icon.png',180]];
for(const [relativePath,size] of outputs){const png=pngAtSize(size);if(png.readUInt32BE(16)!==size||png.readUInt32BE(20)!==size)throw new Error(`PNG dimensions are invalid for ${relativePath}`);const outputPath=path.join(root,relativePath);await fs.mkdir(path.dirname(outputPath),{recursive:true});await fs.writeFile(outputPath,png);console.log(`Generated ${relativePath} (${size}x${size}, ${png.length} bytes).`);}
const appConfig=JSON.parse(await fs.readFile(path.join(root,'app.json'),'utf8')).expo;
if(appConfig.icon!=='./assets/icon.png'||appConfig.android?.adaptiveIcon?.foregroundImage!=='./assets/icon.png')throw new Error('Expo native icon configuration must reference the generated source icon.');
const pwaManifest=JSON.parse(await fs.readFile(path.join(root,'public','manifest.json'),'utf8'));
for(const icon of pwaManifest.icons){const relativePath=icon.src.replace(/^\//,'');await fs.access(path.join(root,'public',relativePath));}
console.log('Expo launcher and PWA manifest icon references verified.');
