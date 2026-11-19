/* Juego clásico de básquetbol: arrastrar, apuntar y soltar para encestar. */
(() => {
  const $ = id => document.getElementById(id);
  let canvas,ctx,raf=null,score=0,shots=0,ball,dragging=false,pointer=null,active=false,scored=false,message='Arrastra la pelota hacia atrás y suéltala';
  const W=800,H=500,R=17,gravity=.22;
  const resetBall=()=>{ball={x:145,y:390,vx:0,vy:0,r:R,flying:false};dragging=false;pointer=null;scored=false;};
  function startBasketballGame(){
    if(raf)cancelAnimationFrame(raf);
    active=true;score=0;shots=0;resetBall();
    const modal=$('gameModal'),body=$('gameBody'),title=$('gameTitle');
    title.textContent='🏀 Reto de Básquetbol';
    body.innerHTML=`
      <div class="basketball-help"><span>🏀 Canastas: <b id="basketScore">0</b></span><span>Lanzamientos: <b id="basketShots">0</b></span><span>Encesta tantas veces como puedas</span></div>
      <div class="basketball-stage"><canvas id="basketballCanvas" width="800" height="500" aria-label="Cancha de básquetbol. Arrastra la pelota hacia atrás y suéltala para lanzarla."></canvas></div>
      <p class="basketball-help" id="basketMessage">Arrastra la pelota hacia atrás y suéltala para lanzar.</p>
      <div class="basketball-actions"><button class="primary" id="basketReset">↻ Reiniciar marcador</button><button id="basketAgain">↺ Colocar pelota</button></div>
      <p class="basketball-help">Consejo: cuanto más lejos arrastres la pelota, mayor será la fuerza del lanzamiento.</p>`;
    canvas=$('basketballCanvas');ctx=canvas.getContext('2d');
    canvas.addEventListener('pointerdown',down);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',up);
    canvas.addEventListener('pointercancel',up);
    $('basketReset').addEventListener('click',()=>{score=0;shots=0;resetBall();updateHud();message='¡Nuevo partido! Prepara tu lanzamiento.';});
    $('basketAgain').addEventListener('click',()=>{resetBall();message='Pelota lista. Apunta y lanza.';});
    updateHud();loop();
  }
  function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  function down(e){if(!active||ball.flying)return;const p=point(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<45){dragging=true;pointer=p;canvas.setPointerCapture(e.pointerId);}}
  function move(e){if(dragging)pointer=point(e);}
  function up(e){if(!dragging)return;pointer=point(e);const dx=ball.x-pointer.x,dy=ball.y-pointer.y;const power=Math.min(18,Math.hypot(dx,dy)*.105);if(power>1){ball.vx=dx*.105;ball.vy=dy*.105;const mag=Math.hypot(ball.vx,ball.vy);if(mag>18){ball.vx*=18/mag;ball.vy*=18/mag;}ball.flying=true;shots++;scored=false;message='¡Buen lanzamiento!';updateHud();}dragging=false;pointer=null;}
  function updateHud(){if($('basketScore'))$('basketScore').textContent=score;if($('basketShots'))$('basketShots').textContent=shots;if($('basketMessage'))$('basketMessage').textContent=message;}
  function drawCourt(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#183451');g.addColorStop(1,'#a85f32');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(0,430,W,70);
    ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,430);ctx.lineTo(W,430);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(160,430,105,Math.PI,Math.PI*2);ctx.stroke();
    // tablero, aro y red
    ctx.fillStyle='#e8f3ff';ctx.fillRect(650,105,12,130);ctx.strokeStyle='#26364c';ctx.lineWidth=5;ctx.strokeRect(650,105,12,130);
    ctx.strokeStyle='#f97316';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(615,235);ctx.lineTo(700,235);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(620,239);ctx.lineTo(628,280);ctx.lineTo(638,239);ctx.lineTo(648,280);ctx.lineTo(658,239);ctx.lineTo(668,280);ctx.lineTo(678,239);ctx.lineTo(688,280);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.13)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='bold 15px system-ui';ctx.fillText('CANCHA',28,35);
  }
  function drawBall(x,y){
    const grad=ctx.createRadialGradient(x-7,y-8,2,x,y,R);grad.addColorStop(0,'#ffca78');grad.addColorStop(.55,'#f97316');grad.addColorStop(1,'#9a3412');
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#54250f';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,R,Math.PI*.2,Math.PI*1.2);ctx.stroke();ctx.beginPath();ctx.arc(x,y,R,Math.PI*1.2,Math.PI*2.2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-R,y);ctx.quadraticCurveTo(x,y-5,x+R,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-R);ctx.quadraticCurveTo(x-5,y,x,y+R);ctx.stroke();
  }
  function loop(){
    if(!active||!canvas?.isConnected)return;
    ctx.clearRect(0,0,W,H);drawCourt();
    if(dragging&&pointer){ctx.setLineDash([8,7]);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ball.x,ball.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(ball.x+(ball.x-pointer.x),ball.y+(ball.y-pointer.y),5,0,Math.PI*2);ctx.fill();}
    if(ball.flying){
      const oldX=ball.x,oldY=ball.y;ball.x+=ball.vx;ball.y+=ball.vy;ball.vy+=gravity;ball.vx*=.998;
      if(!scored&&oldX<615&&ball.x>=615&&ball.x<=700&&ball.y>205&&ball.y<252){score++;scored=true;message='🏀 ¡CANASTA! ¡Excelente lanzamiento!';updateHud();}
      if(ball.y>H+40||ball.x>W+40||ball.x<-40){resetBall();if(!scored)message='Casi. Ajusta el ángulo y vuelve a intentarlo.';updateHud();}
      else if(ball.x>710&&ball.flying){ball.vx*=-.55;ball.x=710;}
      else if(ball.y>410&&ball.vy>0){ball.y=410;ball.vy*=-.48;ball.vx*=.72;if(Math.abs(ball.vy)<2){resetBall();message='Pelota lista para otro lanzamiento.';updateHud();}}
    }
    drawBall(ball.x,ball.y);
    if(dragging&&pointer){ctx.fillStyle='#fff';ctx.font='14px system-ui';ctx.fillText('SUELTA PARA LANZAR',pointer.x+12,pointer.y-14);}
    raf=requestAnimationFrame(loop);
  }
  window.startBasketballGame=startBasketballGame;
  const stopGame=()=>{active=false;if(raf)cancelAnimationFrame(raf);raf=null;};
  document.addEventListener('click',e=>{
    if(e.target.closest('#closeGame')||e.target===$('gameModal'))stopGame();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')stopGame();});
})();