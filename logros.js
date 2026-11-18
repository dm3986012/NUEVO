/* ===== Logros, XP y retos académicos. Todo se gana con acciones reales y se guarda en localStorage ===== */
(() => {
  const KEY = 'logros', base = () => ({ xp: 0, sql: 0, retos: {}, quiz: 0, qn: 0, basket: 0, wins: {}, ev: {}, proj: {}, vis: {}, flags: {}, b: {}, m: {} });
  let S = base(); try { S = Object.assign(base(), JSON.parse(localStorage.getItem(KEY))); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const TITLES = ['Novato', 'Aprendiz', 'Explorador', 'Analista', 'Arquitecto de datos', 'Ingeniero', 'Maestro de datos'];
  const lvl = xp => Math.floor(Math.sqrt(xp / 50)) + 1, from = l => 50 * (l - 1) ** 2, to = l => 50 * l * l, n = o => Object.keys(o).length;
  const BADGES = [
    ['🔍', 'Primera consulta', 'Ejecuta una consulta SQL', s => s.sql >= 1], ['🧠', 'Analista', 'Ejecuta 10 consultas', s => s.sql >= 10],
    ['🏆', 'Reto superado', 'Resuelve un reto SQL', s => n(s.retos) >= 1], ['💎', 'Maestro SQL', 'Resuelve los 5 retos SQL', s => n(s.retos) >= 5],
    ['🎓', 'Quiz perfecto', '4/4 en el quiz', s => s.quiz >= 4], ['🏀', 'Primera canasta', 'Encesta una vez', s => s.basket >= 1],
    ['🥇', 'Encestador', 'Encesta 25 veces', s => s.basket >= 25], ['⭐', 'Tres estrellas', '3 estrellas en un nivel', s => Object.values(s.wins).some(v => v >= 3)],
    ['📎', 'Primera evidencia', 'Sube evidencia a una actividad', s => n(s.ev) >= 1], ['📚', 'Semana completa', 'Evidencia en las 2 actividades de una semana', s => Array.from({ length: 16 }, (_, i) => i + 1).some(w => s.ev[w + '-0'] && s.ev[w + '-1'])],
    ['🧭', 'Explorador', 'Recorre todas las secciones', s => n(s.vis) >= 9], ['🔎', 'Buscador', 'Usa el buscador', s => s.flags.search],
    ['🤖', 'Conversador', 'Habla con el asistente', s => s.flags.chat], ['📂', 'Curioso', 'Abre todos los proyectos', s => n(s.proj) >= PROYECTOS.length]
  ];
  const MISSIONS = [
    ['Resuelve 3 retos SQL', s => n(s.retos), 3, 60], ['Gana 3 niveles del juego', s => n(s.wins), 3, 60], ['Sube evidencia a 4 actividades', s => n(s.ev), 4, 80],
    ['Abre los 4 proyectos', s => n(s.proj), PROYECTOS.length, 40], ['Consigue 5 canastas', s => s.basket, 5, 30]
  ];
  document.querySelector('#skills').insertAdjacentHTML('beforebegin', `<section class="sec" id="logros"><div class="wrap">
    <div class="sec-head"><div><p class="eyebrow mono">LOGROS</p><h2>Tu progreso.</h2></div><p class="note">Se desbloquean con acciones reales: consultas, retos, juego y evidencias. Se guardan solo en este navegador.</p></div>
    <div class="panel lv-card"><div class="lv-n" id="lvN">1</div><div class="lv-i"><p class="mono" id="lvT"></p><div class="bar"><i id="lvBar"></i></div><p class="mono hint" id="lvX"></p></div><div class="lv-s mono" id="lvS"></div></div>
    <div class="ach"><div><h3>Medallas</h3><div class="badges" id="bdg"></div></div><div><h3>Retos académicos</h3><ul class="missions" id="mis"></ul><button class="btn ghost" id="lgReset" type="button" style="margin-top:1rem">Reiniciar progreso</button></div></div></div></section>`);
  const $c = document.querySelector('#xpChip') || (() => { document.querySelector('#sBtn').insertAdjacentHTML('beforebegin', '<button class="xpchip mono" id="xpChip" type="button" aria-label="Ver logros"></button>'); return document.querySelector('#xpChip'); })();
  $c.onclick = () => document.querySelector('#logros').scrollIntoView({ behavior: 'smooth' });
  function render() {
    const L = lvl(S.xp), p = Math.round((S.xp - from(L)) / (to(L) - from(L)) * 100);
    $('#lvN').textContent = L; $('#lvT').textContent = (TITLES[Math.min(L - 1, TITLES.length - 1)]).toUpperCase(); $('#lvBar').style.width = p + '%'; $('#lvX').textContent = `${S.xp} XP · faltan ${to(L) - S.xp} para el nivel ${L + 1}`;
    $('#lvS').innerHTML = `<span>${S.sql} consultas</span><span>${n(S.retos)}/5 retos SQL</span><span>${S.basket} canastas</span><span>${n(S.ev)} evidencias</span><span>quiz ${S.quiz}/4</span>`;
    $('#bdg').innerHTML = BADGES.map((b, i) => `<div class="bdg ${S.b[i] ? 'on' : ''}" title="${esc(b[2])}"><span>${S.b[i] ? b[0] : '🔒'}</span><b>${esc(b[1])}</b><small>${esc(b[2])}</small></div>`).join('');
    $('#mis').innerHTML = MISSIONS.map((m, i) => { const c = Math.min(m[1](S), m[2]); return `<li class="${S.m[i] ? 'ok' : ''}"><span>${S.m[i] ? '✔ ' : ''}${esc(m[0])} <em class="mono">+${m[3]} XP</em></span><div class="bar"><i style="width:${c / m[2] * 100}%"></i></div><small class="mono">${c}/${m[2]}</small></li>`; }).join('');
    $c.textContent = `Nv ${L} · ${S.xp} XP`;
  }
  function gain(x) { S.xp += x; }
  function check() {
    const before = lvl(S.xp - 0);
    BADGES.forEach((b, i) => { if (!S.b[i] && b[3](S)) { S.b[i] = 1; gain(10); toast(`🏅 Medalla: ${b[1]} (+10 XP)`); } });
    MISSIONS.forEach((m, i) => { if (!S.m[i] && m[1](S) >= m[2]) { S.m[i] = 1; gain(m[3]); toast(`🎯 Reto completado: ${m[0]} (+${m[3]} XP)`); } });
    save(); render(); document.dispatchEvent(new Event('logros-update'));
  }
  let lastL = lvl(S.xp);
  document.addEventListener('accion', e => {
    const { t, d } = e.detail;
    if (t === 'sql_ok') { S.sql++; if (S.sql <= 20) gain(5); }
    else if (t === 'reto_ok') { if (!S.retos[d.id]) { S.retos[d.id] = d.pts; gain(d.pts); } }
    else if (t === 'quiz') { S.quiz = Math.max(S.quiz, d); if (++S.qn <= 3) gain(d * 10); }
    else if (t === 'basket') { S.basket++; if (S.basket <= 50) gain(2); }
    else if (t === 'win') { const pv = S.wins[d.key] || 0; if (d.stars > pv) { S.wins[d.key] = d.stars; gain((d.stars - pv) * 15); } }
    else if (t === 'evidencia') { const k = d.w + '-' + d.a; if (!S.ev[k]) { S.ev[k] = 1; gain(20); } }
    else if (t === 'proyecto') { if (!S.proj[d]) { S.proj[d] = 1; gain(5); } }
    else if (t === 'search' || t === 'chat') { if (!S.flags[t]) { S.flags[t] = 1; gain(5); } }
    else if (t === 'visit') { if (!S.vis[d]) { S.vis[d] = 1; gain(3); } }
    check(); const L = lvl(S.xp); if (L > lastL) { toast(`⬆ ¡Subiste al nivel ${L}!`); lastL = L; }
  });
  $('#lgReset').onclick = () => { if (confirm('¿Reiniciar todo tu progreso de logros?')) { S = base(); lastL = 1; save(); render(); document.dispatchEvent(new Event('logros-update')); } };
  window.Logros = { state: () => S };
  render();
})();
