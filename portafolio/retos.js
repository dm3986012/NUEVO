/* ===== Laboratorio SQL: estructura, retos verificados con ejecución real, limpiar e historial ===== */
(() => {
  const RETOS = [
    { id: 'r1', pts: 50, t: 'Lista el nombre de todos los alumnos, ordenados alfabéticamente.', ref: 'SELECT nombre FROM alumno ORDER BY nombre', hint: 'SELECT … FROM alumno ORDER BY …' },
    { id: 'r2', pts: 75, t: 'Muestra nombre y ciclo de los alumnos que están en un ciclo mayor a 5.', ref: 'SELECT nombre, ciclo FROM alumno WHERE ciclo > 5', hint: 'Usa WHERE con el operador >.' },
    { id: 'r3', pts: 100, t: 'Para cada programa, muestra su nombre y cuántos alumnos tiene.', ref: 'SELECT p.nombre, COUNT(*) FROM alumno a JOIN programa p ON p.id = a.programa_id GROUP BY p.nombre', hint: 'JOIN con programa y GROUP BY.' },
    { id: 'r4', pts: 125, t: 'Muestra el nombre de los alumnos del programa «Ingeniería de Sistemas».', ref: "SELECT a.nombre FROM alumno a JOIN programa p ON p.id = a.programa_id WHERE p.nombre = 'Ingeniería de Sistemas'", hint: 'JOIN y WHERE sobre el nombre del programa.' },
    { id: 'r5', pts: 150, t: '¿Qué facultad tiene más alumnos? Muestra solo su nombre.', ref: 'SELECT f.nombre FROM alumno a JOIN programa p ON p.id = a.programa_id JOIN facultad f ON f.id = p.facultad_id GROUP BY f.nombre ORDER BY COUNT(*) DESC LIMIT 1', hint: 'Une las 3 tablas, agrupa y ordena por COUNT(*) descendente.' }
  ];
  const panel = document.querySelector('.lab .panel'), chips = $('#sqlChips');
  chips.insertAdjacentHTML('beforebegin', '<div class="schema mono" id="schema">Estructura: se carga al abrir el laboratorio…</div>');
  chips.insertAdjacentHTML('afterend', '<div class="retos"><label class="mono" for="retoSel">RETO SQL</label><select id="retoSel"></select><p id="retoTxt" class="retotxt"></p></div>');
  panel.querySelector('.actions').insertAdjacentHTML('afterbegin', '<button class="btn ghost" id="sqlClear" type="button">Limpiar</button><button class="btn primary" id="retoCheck" type="button" hidden>Comprobar reto ✓</button>');
  $('#sqlOut').insertAdjacentHTML('afterend', '<p id="retoMsg" class="retomsg" aria-live="polite"></p><details class="hist"><summary class="mono">Historial (<span id="hN">0</span>)</summary><ul id="hist"></ul></details>');
  let hist = []; try { hist = JSON.parse(localStorage.getItem('sqlhist')) || []; } catch (e) {}
  const solved = () => window.Logros.state().retos;
  const labels = () => { const v = $('#retoSel').value; $('#retoSel').innerHTML = '<option value="">Modo libre</option>' + RETOS.map((r, i) => `<option value="${r.id}">Reto ${i + 1} · ${r.pts} pts${solved()[r.id] ? ' ✔' : ''}</option>`).join(''); $('#retoSel').value = v; };
  const drawHist = () => { $('#hN').textContent = hist.length; $('#hist').innerHTML = hist.map((q, i) => `<li data-i="${i}" tabindex="0">${esc(q.replace(/\s+/g, ' ').slice(0, 90))}</li>`).join(''); };
  const loadSchema = async () => {
    try { const d = await getDb(); const t = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0]?.values.map(r => r[0]) || [];
      $('#schema').innerHTML = t.map(nm => `<span><b>${esc(nm)}</b>(${d.exec(`PRAGMA table_info("${nm.replace(/"/g, '""')}")`)[0].values.map(c => esc(c[1]) + (c[5] ? ' 🔑' : '')).join(', ')})</span>`).join('') || 'Sin tablas.';
    } catch (e) { $('#schema').textContent = 'La estructura se muestra al cargar el motor SQL (requiere internet).'; }
  };
  new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { ob.disconnect(); loadSchema(); } }).observe(document.querySelector('#laboratorio'));
  $('#sqlReset').addEventListener('click', () => setTimeout(loadSchema, 300));
  $('#sqlClear').onclick = () => { $('#sqlIn').value = ''; $('#sqlOut').innerHTML = '<p class="mono hint">El resultado aparecerá aquí.</p>'; $('#retoMsg').textContent = ''; $('#sqlIn').focus(); };
  $('#retoSel').onchange = () => { const r = RETOS.find(x => x.id === $('#retoSel').value); $('#retoCheck').hidden = !r; $('#retoMsg').textContent = ''; $('#retoTxt').textContent = r ? `${r.t} (Pista: ${r.hint})` : ''; };
  document.addEventListener('accion', e => { if (e.detail.t === 'sql_ok') { const q = (e.detail.d || '').trim(); if (q) { hist = [q, ...hist.filter(x => x !== q)].slice(0, 10); try { localStorage.setItem('sqlhist', JSON.stringify(hist)); } catch (er) {} drawHist(); } } });
  document.addEventListener('logros-update', labels);
  $('#hist').onclick = e => { const li = e.target.closest('[data-i]'); if (li) $('#sqlIn').value = hist[+li.dataset.i]; };
  const rows = r => r ? r.values.map(v => v.map(String)) : [];
  const same = (a, b, ordered) => { const x = a.map(r => r.join('\u0001')), y = b.map(r => r.join('\u0001')); if (!ordered) { x.sort(); y.sort(); } return x.length === y.length && x.every((v, i) => v === y[i]); };
  $('#retoCheck').onclick = async () => {
    const r = RETOS.find(x => x.id === $('#retoSel').value), m = $('#retoMsg'); if (!r) return;
    let d; try { d = await getDb(); } catch (e) { m.textContent = 'No se pudo cargar el motor SQL (requiere internet).'; return; }
    let u; try { const ex = d.exec($('#sqlIn').value); u = ex[ex.length - 1]; } catch (e) { m.textContent = '❌ Tu consulta tiene un error: ' + e.message; return; }
    if (!u) { m.textContent = '❌ Tu consulta no devolvió filas. Escribe un SELECT para el reto.'; return; }
    let ref; try { ref = d.exec(r.ref).pop(); } catch (e) { m.textContent = 'Los datos fueron modificados: pulsa «Reiniciar datos» e inténtalo otra vez.'; return; }
    if (same(rows(u), rows(ref), /order by/i.test(r.ref))) { const nuevo = !solved()[r.id]; act('reto_ok', { id: r.id, pts: r.pts }); m.textContent = nuevo ? `✅ ¡Correcto! +${r.pts} puntos de experiencia.` : '✅ Correcto (ya lo habías resuelto).'; }
    else m.textContent = u.values.length === ref.values.length ? `❌ Aún no coincide: tienes el mismo número de filas (${ref.values.length}), pero los valores o su orden son distintos. Pista: ${r.hint}` : `❌ Aún no coincide: devolviste ${u.values.length} fila(s) y se esperaban ${ref.values.length}. Pista: ${r.hint}`;
  };
  labels(); drawHist();
})();
