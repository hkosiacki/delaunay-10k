'use strict';var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key]}}}return target};(function(){var image=document.getElementById('image');var cv=document.getElementById('canvas');var form=document.getElementById('f');var floor=Math.floor;var round=Math.round;var sqrt=Math.sqrt;function clamp(v,a,b){return Math.max(a,Math.min(parseInt(v,10)||0,b))}function pad(str){return str.length<2?'0'+str:str}function hex(r,g,b){return'#'+[r,g,b].map(function(v){return pad(floor(v).toString(16))}).join('')}function lerp(v0,v1,t){return{r:(1-t)*v0.r+t*v1.r,g:(1-t)*v0.g+t*v1.g,b:(1-t)*v0.b+t*v1.b}}function color(h,s,v){var r=void 0,g=void 0,b=void 0;var i=floor(h*6);var f=h*6-i;var p=v*(1-s);var q=v*(1-f*s);var t=v*(1-(1-f)*s);// eslint-disable-next-line default-case
switch(i%6){case 0:r=v,g=t,b=p;break;case 1:r=q,g=v,b=p;break;case 2:r=p,g=v,b=t;break;case 3:r=p,g=q,b=v;break;case 4:r=t,g=p,b=v;break;case 5:r=v,g=p,b=q;break;}r=floor(r*255);g=floor(g*255);b=floor(b*255);return{r:r,g:g,b:b}}function generate(){var w=clamp(document.getElementById('w').value,240,2560);var h=clamp(document.getElementById('h').value,240,2560);var hue1=clamp(document.getElementById('hue1').value,0,359);var hue2=clamp(document.getElementById('hue2').value,0,359);var grid=clamp(document.getElementById('grid').value,25,250);var disp=clamp(document.getElementById('disp').value,0,45);var seed=w+h+hue1+hue2+grid+disp;var rand=window.SCRandom(seed);var dx=w/round(w/grid);var dy=h/round(h/grid);var spread=grid*disp/100;var c1=color(hue1/360,0.4,0.6);var c2=color(hue2/360,0.6,0.4);var t=function t(x,y){var d1=sqrt(x*x+y*y);var d2=sqrt((w-x)*(w-x)+(h-y)*(h-y));return d1/(d1+d2)};var verts=[];var a=void 0,r=void 0,nx=void 0,ny=void 0;for(var y=-dy/2;y<h+dy;y+=dy){for(var x=-dx/2;x<w+dx;x+=dx){a=rand.random()*2*Math.PI;r=(0.6+rand.random()/2.5)*spread;nx=x+r*Math.sin(a);ny=y+r*Math.cos(a);verts.push(_extends({},lerp(c1,c2,t(nx,ny)),{pos:[nx,ny]}))}}var tris=window.Delaunay.triangulate(verts,'pos');cv.width=w;cv.height=h;var ctx=cv.getContext('2d');for(var i=tris.length;i;){var c={r:0,g:0,b:0};ctx.beginPath();--i;c.r+=verts[tris[i]].r;c.g+=verts[tris[i]].g;c.b+=verts[tris[i]].b;ctx.moveTo(verts[tris[i]].pos[0],verts[tris[i]].pos[1]);--i;c.r+=verts[tris[i]].r;c.g+=verts[tris[i]].g;c.b+=verts[tris[i]].b;ctx.lineTo(verts[tris[i]].pos[0],verts[tris[i]].pos[1]);--i;c.r+=verts[tris[i]].r;c.g+=verts[tris[i]].g;c.b+=verts[tris[i]].b;ctx.lineTo(verts[tris[i]].pos[0],verts[tris[i]].pos[1]);ctx.closePath();c.r/=3;c.g/=3;c.b/=3;ctx.strokeStyle=ctx.fillStyle=hex(c.r,c.g,c.b);ctx.stroke();ctx.fill()}}image&&(image.style.display='none');cv.style.display='block';document.getElementById('get-pv').disabled=true;document.getElementById('save').style.display='block';(form.onchange=generate)()})();
