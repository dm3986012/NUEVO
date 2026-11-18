(() => {
  'use strict';
  const canvas = document.getElementById('gm');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 640, H = 400;
  const $ = id => document.getElementById(id);
  const ui = { lvl:$('gLvl'), goal:$('gGoal'), time:$('gTime'), score:$('gScore'), best:$('gBest'), menu:$('gMenu'), over:$('gOver') };
  const levels = [
    {goal:2,time:35,wind:0},{goal:3,time:38,wind:0},{goal:3,time:35,wind:.12},{goal:4,time:42,wind:.16},
    {goal:4,time:40,wind:.22},{goal:5,time:45,wind:.24},{goal:5,time:42,wind:.3},{goal:6,time:50,wind:.34}
  ];
  let level=0, score=0, made=0, left=35, running=false, dragging=false, shot=false, last=0, raf=0, wind=0;
  let best=0;
  try { best=Number(localStorage.getItem('encesta-best')||0); } catch(e) {}
  const ball={x:105,y:320,vx:0,vy:0,r:16};
  const hoop={x:510,y:174};
  const resetBall=()=>{ball.x=105;ball.y=320;ball.vx=0;ball.vy=0;shot=false;dragging=false;};
  const updateHud=()=>{if(ui.lvl)ui.lvl.textContent=(level+1)+'/8';if(ui.goal)ui.goal.textContent=made+'/'+levels[level].goal;if(ui.time)ui.time.textContent=Math.max(0,Math.ceil(left));if(ui.score)ui.score.textContent=score;if(ui.best)ui.best.textContent=best;};
  const panel=(title,body,buttons)=>{if(!ui.over)return;ui.over.innerHTML='<div class="game-card"><p class="mono game-kicker">ENCASTA · NIVEL '+(level+1)+'</p><h3>'+title+'</h3><p>'+body+'</p><div class="game-actions">'+buttons+'</div></div>';ui.over.classList.add('show');};
  const hidePanel=()=>{if(ui.over){ui.over.classList.remove('show');ui.over.innerHTML='';}};
  function start(n=0){level=Math.max(0,Math.min(7,n));score=0;made=0;left=levels[level].time;wind=levels[level].wind;running=true;last=0;resetBall();hidePanel();updateHud();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
  function finish(win){running=false;cancelAnimationFrame(raf);if(score>best){best=score;try{localStorage.setItem('encesta-best',String(best));}catch(e){}}updateHud();if(win){panel('¡Nivel superado!','Conseguiste '+made+' canastas y '+score+' puntos. ¿Seguimos?',(level<7?'<button data-next class="game-primary">Siguiente nivel →</button>':'<button data-restart class="game-primary">Volver a jugar ↻</button>')+'<button data-levels class="game-secondary">Niveles</button>');}else{panel('¡Se acabó el tiempo!','Lograste '+made+' de '+levels[level].goal+' canastas. ¡Inténtalo otra vez!', '<button data-retry class="game-primary">Reintentar ↻</button><button data-levels class="game-secondary">Niveles</button>');}}
  function draw(){ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#101d3b');sky.addColorStop(1,'#081326');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#142b4c';ctx.fillRect(0,300,W,100);ctx.strokeStyle='rgba(65,190,230,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,300);ctx.lineTo(W,300);ctx.stroke();
    ctx.strokeStyle='rgba(65,190,230,.14)';ctx.beginPath();ctx.arc(105,300,105,Math.PI,Math.PI*1.5);ctx.stroke();
    // Backboard and hoop
    ctx.fillStyle='#dbeafe';ctx.fillRect(550,92,8,105);ctx.fillStyle='#22d3ee';ctx.fillRect(528,120,25,5);
    ctx.strokeStyle='#fb923c';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(512,177,27,7,0,0,Math.PI);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(486,178);ctx.lineTo(493,208);ctx.lineTo(531,208);ctx.lineTo(538,178);ctx.stroke();
    // Target hint
    ctx.fillStyle='rgba(34,211,238,.08)';ctx.beginPath();ctx.arc(512,186,35,0,Math.PI*2);ctx.fill();
    // wind indicator
    if(wind){ctx.fillStyle='#93c5fd';ctx.font='12px monospace';ctx.fillText('VIENTO  '+(wind>0?'→':'←'),22,28);}
    // Ball and aiming guide
    if(dragging){ctx.setLineDash([6,6]);ctx.strokeStyle='#67e8f9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ball.x,ball.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(103,232,249,.55)';ctx.beginPath();ctx.arc(pointer.x,pointer.y,5,0,Math.PI*2);ctx.fill();}
    ctx.save();ctx.translate(ball.x,ball.y);ctx.rotate((ball.x-105)*.015);ctx.fillStyle='#f97316';ctx.beginPath();ctx.arc(0,0,ball.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#7c2d12';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,ball.r,Math.PI*.15,Math.PI*.85);ctx.moveTo(-15,-5);ctx.quadraticCurveTo(0,0,15,-5);ctx.moveTo(-15,5);ctx.quadraticCurveTo(0,0,15,5);ctx.stroke();ctx.restore();
    ctx.fillStyle='#dbeafe';ctx.font='12px monospace';ctx.fillText(dragging?'SUELTA PARA LANZAR':'ARRASTRA LA PELOTA HACIA ATRÁS',22,374);
    if(!running&&!ui.over?.classList.contains('show')){ctx.fillStyle='rgba(34,211,238,.9)';ctx.font='bold 16px sans-serif';ctx.fillText('Pulsa JUGAR para comenzar',220,210);}
  }
  let pointer={x:ball.x,y:ball.y};
  function loop(ts){if(!running)return;if(!last)last=ts;const dt=Math.min((ts-last)/1000,.032);last=ts;left-=dt;
    if(shot){ball.vx+=wind*dt*40;ball.vy+=520*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
      // score when ball crosses the hoop opening while descending
      if(ball.vy>0&&ball.x>485&&ball.x<535&&ball.y>168&&ball.y<204){made++;score+=100+Math.max(0,Math.ceil(left))*2;updateHud();resetBall();if(made>=levels[level].goal){finish(true);return;}}
      if(ball.y>H+35||ball.x>W+35||ball.x<-35){resetBall();}
    }
    if(left<=0){left=0;finish(false);return;}updateHud();draw();raf=requestAnimationFrame(loop);
  }
  function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  canvas.addEventListener('pointerdown',e=>{if(!running||shot)return;const p=pos(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<34){dragging=true;pointer=p;canvas.setPointerCapture?.(e.pointerId);draw();}});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;pointer=pos(e);draw();});
  canvas.addEventListener('pointerup',e=>{if(!dragging)return;pointer=pos(e);const dx=ball.x-pointer.x,dy=ball.y-pointer.y;dragging=false;ball.vx=Math.max(-80,Math.min(650,dx*4.1));ball.vy=Math.max(-720,Math.min(-170,dy*4.1));if(ball.vx<80)ball.vx=160;shot=true;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;draw();});
  if(ui.menu)ui.menu.addEventListener('click',()=>{running=false;cancelAnimationFrame(raf);panel('Elige un nivel','Selecciona dónde quieres jugar.',levels.map((_,i)=>'<button data-level="'+i+'" class="game-secondary">Nivel '+(i+1)+'</button>').join(''));});
  if(ui.over)ui.over.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-level'))start(+b.dataset.level);else if(b.hasAttribute('data-next'))start(Math.min(7,level+1));else if(b.hasAttribute('data-retry'))start(level);else if(b.hasAttribute('data-restart'))start(0);else if(b.hasAttribute('data-levels')){running=false;panel('Elige un nivel','Selecciona dónde quieres jugar.',levels.map((_,i)=>'<button data-level="'+i+'" class="game-secondary">Nivel '+(i+1)+'</button>').join(''));}});
  panel('¡Listo para jugar!','Arrastra la pelota hacia atrás y suéltala para encestar. Completa el objetivo antes de que termine el tiempo.','<button data-restart class="game-primary">JUGAR ▶</button><button data-levels class="game-secondary">Ver niveles</button>');
  updateHud();draw();
})();