/* Mini-juegos originales del portafolio: Quiz SQL, Reto de Código y Memoria */
(() => {
  const $ = id => document.getElementById(id);
  const modal=$('gameModal'), body=$('gameBody'), title=$('gameTitle');
  if(!modal||!body||!title)return;
  const quizzes={
    sql:[
      {q:'¿Qué cláusula se usa para filtrar filas en SQL?',opts:['WHERE','ORDER BY','GROUP BY','HAVING'],ok:0},
      {q:'¿Cuál es la función de un INDEX en una tabla?',opts:['Eliminar datos','Acelerar búsquedas','Crear usuarios','Hacer backup'],ok:1},
      {q:'En Azure SQL, ¿qué representa un Filegroup?',opts:['Un usuario','Un grupo de archivos de datos','Una vista','Un trigger'],ok:1},
      {q:'¿Qué comando crea una nueva tabla?',opts:['INSERT TABLE','CREATE TABLE','MAKE TABLE','NEW TABLE'],ok:1},
      {q:'¿Para qué sirve PRIMARY KEY?',opts:['Ordenar filas','Identificar de forma única cada registro','Crear índices secundarios','Filtrar nulos'],ok:1}
    ],
    code:[
      {q:'¿Cuál consulta trae usuarios activos ordenados por fecha de registro DESC?',opts:['SELECT * FROM usuarios WHERE activo=1 ORDER BY registro DESC','SELECT * FROM usuarios ORDER BY activo','GET usuarios WHERE activo','FIND usuarios ACTIVE'],ok:0},
      {q:'¿Qué hace SELECT COUNT(*) FROM pedidos?',opts:['Suma los precios','Cuenta el total de filas','Elimina pedidos','Crea un índice'],ok:1},
      {q:'Para unir dos tablas usamos:',opts:['MERGE','JOIN','CONNECT','LINK'],ok:1}
    ],
    memory:[
      {q:'¿Qué es un SCHEMA en bases de datos?',opts:['Colección lógica de objetos (tablas, vistas...)','Un tipo de índice','Un motor de almacenamiento','Un lenguaje de programación'],ok:0},
      {q:'¿Qué es RBAC?',opts:['Role-Based Access Control','Random Binary Access Code','Relational Backup and Copy','Remote Base Authentication'],ok:0},
      {q:'Azure SQL es principalmente:',opts:['Un servicio de base de datos relacional en la nube','Un lenguaje de programación','Un sistema operativo','Un framework front-end'],ok:0}
    ]
  };
  const names={sql:'Quiz SQL',code:'Reto de Código',memory:'Memoria de Conceptos'};
  let current=[],mode='sql',qIndex=0,score=0,lives=3,totalXP=0,locked=false,timer;
  try{totalXP=Number(localStorage.getItem('nuevo-game-xp')||0)}catch(e){}
  const updateXP=()=>{$('totalXP').textContent=totalXP+' XP';};
  const showMenu=()=>{
    title.textContent='🎮 Elige un mini-juego';
    body.innerHTML='<p class="game-intro">Selecciona un mini-juego para reforzar lo aprendido en clase:</p><div class="game-menu-list"><button class="game-menu-btn" data-mode="sql">🧠 Quiz SQL</button><button class="game-menu-btn" data-mode="code">💻 Reto de Código</button><button class="game-menu-btn" data-mode="memory">🃏 Memoria de Conceptos</button></div>';
  };
  const open=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');showMenu();};
  const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');clearTimeout(timer);};
  function start(m){
    mode=m;
    if(m==='basketball'){
      if(typeof window.startBasketballGame==='function') window.startBasketballGame();
      else {title.textContent='🏀 Reto de Básquetbol';body.innerHTML='<p>No se pudo cargar el juego. Actualiza la página e inténtalo otra vez.</p>';}
      return;
    }
    current=[...quizzes[m]].sort(()=>Math.random()-.5).slice(0,m==='code'?3:5);qIndex=0;score=0;lives=3;locked=false;$('gameHearts').textContent='❤️❤️❤️';showQuestion();
  }
  function showQuestion(){
    clearTimeout(timer);locked=false;
    if(qIndex>=current.length||lives<=0){finish();return;}
    const q=current[qIndex];title.textContent='🎮 '+names[mode]+' · Pregunta '+(qIndex+1)+'/'+current.length;
    body.innerHTML='<div class="quiz-q">'+esc(q.q)+'</div><div class="quiz-opts">'+q.opts.map((o,i)=>'<button class="quiz-opt" data-answer="'+i+'">'+esc(o)+'</button>').join('')+'</div><div class="quiz-feedback" id="quizFb"></div><div class="quiz-nav"><div class="quiz-score-display">⭐ '+score+' pts · ❤️'.repeat(0)+' '+('❤️'.repeat(lives))+'</div></div>';
  }
  function answer(idx){
    if(locked)return;locked=true;const q=current[qIndex];const opts=body.querySelectorAll('.quiz-opt');
    opts.forEach((btn,i)=>{btn.disabled=true;if(i===q.ok)btn.classList.add('correct');if(i===idx&&i!==q.ok)btn.classList.add('wrong');});
    const fb=$('quizFb');
    if(idx===q.ok){score+=10;totalXP+=15;updateXP();try{localStorage.setItem('nuevo-game-xp',String(totalXP))}catch(e){}fb.className='quiz-feedback show ok';fb.textContent='✅ ¡Correcto! +10 puntos · +15 XP';}
    else{lives--;fb.className='quiz-feedback show bad';fb.textContent='❌ Incorrecto. La respuesta era: '+q.opts[q.ok];}
    $('gameHearts').textContent='❤️'.repeat(lives)+'🖤'.repeat(3-lives);
    timer=setTimeout(()=>{qIndex++;showQuestion();},1100);
  }
  function finish(){
    clearTimeout(timer);const msg=lives<=0?'Se acabaron las vidas':'¡Ronda terminada!';
    body.innerHTML='<div class="game-finish"><div class="trophy">'+(score>=20?'🏆':'💪')+'</div><h3>'+msg+'</h3><p>Puntuación: <b>'+score+'</b> puntos</p><p class="xp">XP total: <b>'+totalXP+'</b></p><button type="button" id="playAgain">Jugar de nuevo</button> <button type="button" class="game-menu-btn" id="backMenu">Elegir otro juego</button></div>';
  }
  document.querySelectorAll('.mini-game-card').forEach(card=>{
    card.addEventListener('click',()=>{open();start(card.dataset.mode);});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();start(card.dataset.mode);}});
  });
  body.addEventListener('click',e=>{
    const answerBtn=e.target.closest('[data-answer]');if(answerBtn){answer(Number(answerBtn.dataset.answer));return;}
    const modeBtn=e.target.closest('[data-mode]');if(modeBtn){start(modeBtn.dataset.mode);return;}
    if(e.target.closest('#playAgain')){start(mode);return;}
    if(e.target.closest('#backMenu')){showMenu();}
  });
  $('closeGame').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close();});
  updateXP();
})();