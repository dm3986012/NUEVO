/* ===== Configuración: edita aquí los nombres de las unidades ===== */
const UNITS = [
  { name: 'Modelado de datos',        weeks: [1, 2, 3, 4] },
  { name: 'Azure SQL y arquitectura', weeks: [5, 6, 7, 8] },
  { name: 'Consultas avanzadas',      weeks: [9, 10, 11, 12] },
  { name: 'Optimización y cierre',    weeks: [13, 14, 15, 16] }
];
const ACTIVITIES = ['Actividad 1', 'Actividad 2'];
const TOTAL = UNITS.length * 4 * ACTIVITIES.length; // 32

let editor = false; try { editor = localStorage.getItem('editor') === '1'; } catch (e) {}
const PUB = Object.entries(EVIDENCIAS).flatMap(([w, l]) => l.map((f, i) => ({ id: 'p' + w + '-' + i, week: +w, act: f.act, name: f.name, url: f.url, size: 0, pub: true })));
const allFiles = () => files.concat(PUB);
const act = (t, d) => document.dispatchEvent(new CustomEvent('accion', { detail: { t, d } }));
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); };
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]));
const size = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

const isImg = n => /\.(png|jpe?g|webp|gif|svg)$/i.test(n);
const isPdf = n => /\.pdf$/i.test(n);
const isHtml = n => /\.html?$/i.test(n);
function filePreview(f) {
  if (isImg(f.name) && f.url) return `<img class="thumb" src="${esc(f.url)}" alt="" loading="lazy" onerror="this.style.display='none'">`;
  if (isPdf(f.name)) return `<span class="badge-pdf" title="PDF">PDF</span>`;
  if (isHtml(f.name)) return `<span class="badge-html" title="Página">HTML</span>`;
  if (/\.sql$/i.test(f.name)) return `<span class="badge-sql" title="SQL">SQL</span>`;
  return `<span class="badge-file">FILE</span>`;
}

/* ===== Base de datos local (IndexedDB) ===== */
let db;
const open = () => new Promise((ok, fail) => {
  const r = indexedDB.open('portafolio-david', 1);
  r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('files', { keyPath: 'id', autoIncrement: true }); d.createObjectStore('misc', { keyPath: 'key' }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => fail(r.error);
});
const tx = (store, mode, fn) => new Promise((ok, fail) => {
  const q = fn(db.transaction(store, mode).objectStore(store)); q.onsuccess = () => ok(q.result); q.onerror = () => fail(q.error);
});

let files = [];
let unit = 0;
const slotFiles = (w, a) => allFiles().filter(f => f.week === w && f.act === a);
const weekCount = w => ACTIVITIES.reduce((n, _, a) => n + (slotFiles(w, a).length ? 1 : 0), 0);

async function addFiles(w, a, list) {
  try {
    for (const f of list) await tx('files', 'readwrite', s => s.add({ week: w, act: a, name: f.name, type: f.type, size: f.size, blob: f, date: Date.now() }));
    files = await tx('files', 'readonly', s => s.getAll());
    act('evidencia', { w, a }); toast(list.length > 1 ? `${list.length} archivos guardados` : 'Archivo guardado');
    render();
  } catch (e) { toast('No se pudo guardar el archivo'); }
}
async function removeFile(id) {
  await tx('files', 'readwrite', s => s.delete(id));
  files = files.filter(f => f.id !== id); toast('Archivo eliminado'); render();
}
function openFile(f, download) {
  if (f.pub) return window.open(f.url, '_blank');
  const url = URL.createObjectURL(f.blob);
  if (!download && /^(image|text)\/|pdf/.test(f.type)) window.open(url, '_blank');
  else { const a = document.createElement('a'); a.href = url; a.download = f.name; a.click(); }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ===== Interfaz ===== */
function render() {
  $('#tabs').innerHTML = UNITS.map((u, i) => {
    const done = u.weeks.reduce((n, w) => n + weekCount(w), 0);
    return `<button class="tab" role="tab" data-u="${i}" aria-selected="${i === unit}">Unidad ${i + 1}<small class="mono">${done}/8 · ${esc(u.name)}</small></button>`;
  }).join('');
  $('#panel').innerHTML = UNITS[unit].weeks.map(w => `
    <article class="wk" id="wk-${w}"><p class="mono wk-h"><span>SEMANA ${pad(w)}</span><span>${weekCount(w)}/2 ACTIVIDADES</span></p>
    ${ACTIVITIES.map((name, a) => {
      const fl = slotFiles(w, a);
      return `<div class="act ${fl.length ? 'done' : ''}" data-w="${w}" data-a="${a}">
        <div class="act-h"><b><i class="st"></i>${name}<small>${fl.length ? fl.length + ' archivo(s)' : 'Sin archivos todavía'}</small></b>
        ${editor ? '<button class="up" type="button" data-up>Subir archivo ↑</button>' : ''}</div>
        ${fl.length ? `<ul class="files">${fl.map(f => `<li class="file-item ${isImg(f.name)?'is-img':''} ${isPdf(f.name)?'is-pdf':''}">
          ${filePreview(f)}
          <span class="nm" title="${esc(f.name)}">${esc(f.name)}</span>
          <span class="sz mono">${f.pub ? 'público' : size(f.size)}</span>
          <button type="button" data-open="${f.id}" aria-label="Abrir">↗</button>
          ${f.pub ? '' : '<button type="button" data-dl="' + f.id + '" aria-label="Descargar">⬇</button>' + (editor ? '<button class="rm" type="button" data-rm="' + f.id + '" aria-label="Eliminar">✕</button>' : '')}
        </li>`).join('')}</ul>` : ''}
      </div>`;
    }).join('')}</article>`).join('');
  $('#weeks').innerHTML = Array.from({ length: 16 }, (_, i) => { const c = weekCount(i + 1); return `<button type="button" data-go="${i + 1}" class="${c === 2 ? 'full' : c ? 'ok' : ''}" aria-label="Semana ${i + 1}">${pad(i + 1)}</button>`; }).join('');
  const done = Array.from({ length: 16 }, (_, i) => weekCount(i + 1)).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / TOTAL * 100);
  $('#pct').textContent = $('#stPct').textContent = pct + '%';
  $('#bar').style.width = pct + '%'; $('#nDone').textContent = done; $('#nFiles').textContent = allFiles().length;
  document.querySelectorAll('.link[data-go]').forEach(b => { const w = +b.dataset.go; const n = allFiles().filter(f => f.week === w).length; b.innerHTML = `Ver evidencia${n ? ' · ' + n + ' archivo(s)' : ''} <em>↗</em>`; });
}

function goWeek(w) {
  unit = UNITS.findIndex(u => u.weeks.includes(w)); render();
  const el = $('#wk-' + w); el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800);
}

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.u) { unit = +t.dataset.u; render(); }
  else if (t.dataset.go) goWeek(+t.dataset.go);
  else if (t.hasAttribute('data-up')) { const act = t.closest('.act'); const w = +act.dataset.w, a = +act.dataset.a; openBasket(`Semana ${pad(w)} · ${ACTIVITIES[a]}`, f => addFiles(w, a, [f])); }
  else if (t.dataset.open) openFile(allFiles().find(f => f.id == t.dataset.open));
  else if (t.dataset.dl) openFile(allFiles().find(f => f.id == t.dataset.dl), true);
  else if (t.dataset.rm) { if (confirm('¿Eliminar este archivo?')) removeFile(+t.dataset.rm); }
});
['dragover', 'dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
  const act = e.target.closest && e.target.closest('.act'); if (!act || !editor) return;
  e.preventDefault();
  if (ev === 'dragover') act.classList.add('over'); else act.classList.remove('over');
  if (ev === 'drop' && e.dataTransfer.files.length) addFiles(+act.dataset.w, +act.dataset.a, [...e.dataTransfer.files]);
}));

const root = document.documentElement, themeBtn = $('#theme');
try { const t = localStorage.getItem('tema'); if (t) root.dataset.theme = t; } catch (e) {}
const icon = () => themeBtn.textContent = root.dataset.theme === 'dark' ? '☀' : '☾'; icon();
themeBtn.onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('tema', root.dataset.theme); } catch (e) {} icon(); };
$('#burger').onclick = () => $('#menu').classList.toggle('open');
$('#menu').onclick = e => { if (e.target.tagName === 'A') $('#menu').classList.remove('open'); };

const getMisc = k => tx('misc', 'readonly', s => s.get(k));
const setMisc = (k, blob) => tx('misc', 'readwrite', s => s.put({ key: k, blob }));
function showFoto(blob) { const img = $('#fotoImg'); img.src = URL.createObjectURL(blob); img.hidden = false; $('#fotoPh').hidden = true; }
$('#fotoBtn').onclick = () => openBasket('Tu foto de perfil', async f => { await setMisc('foto', f); showFoto(f); toast('Foto actualizada'); }, { accept: 'image/*', single: true });
const uploadCv = () => openBasket('Tu CV (PDF)', async f => { await setMisc('cv', f); toast('CV guardado'); }, { accept: 'application/pdf', single: true });
$('#cvUp').onclick = uploadCv;
$('#cvBtn').onclick = async () => { let r = null; try { r = await getMisc('cv'); } catch (e) {} if (r) window.open(URL.createObjectURL(r.blob), '_blank'); else if (editor) { toast('Aún no hay CV: súbelo ahora'); uploadCv(); } else window.open(CONFIG.CV_URL, '_blank'); };

(async () => {
  try {
    db = await open();
    files = await tx('files', 'readonly', s => s.getAll());
    const f = await getMisc('foto'); if (f) showFoto(f.blob);
  } catch (e) { toast('Tu navegador no permite guardar archivos localmente'); }
  render();
})();

function setEditor(v) {
  editor = v; document.body.classList.toggle('editor', v);
  try { localStorage.setItem('editor', v ? '1' : '0'); } catch (e) {}
  $('#edBtn').textContent = v ? 'Salir del modo editor' : 'Modo editor'; render();
}
$('#edBtn').onclick = () => {
  if (editor) return setEditor(false);
  const k = prompt('Clave de editor:');
  if (k === CONFIG.CLAVE_EDITOR) { setEditor(true); toast('Modo editor activado'); } else if (k !== null) toast('Clave incorrecta');
};
setEditor(editor);

document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
  document.querySelectorAll('.card').forEach(c => c.hidden = b.dataset.f !== 'todos' && !c.dataset.tags.includes(b.dataset.f));
});

const SEED = `CREATE TABLE facultad(id INTEGER PRIMARY KEY, nombre TEXT);
CREATE TABLE programa(id INTEGER PRIMARY KEY, nombre TEXT, facultad_id INTEGER REFERENCES facultad(id));
CREATE TABLE alumno(id INTEGER PRIMARY KEY, nombre TEXT, programa_id INTEGER REFERENCES programa(id), ciclo INTEGER);
CREATE INDEX idx_alumno_programa ON alumno(programa_id);
INSERT INTO facultad VALUES(1,'Ingeniería'),(2,'Ciencias Empresariales'),(3,'Humanidades');
INSERT INTO programa VALUES(1,'Ingeniería de Sistemas',1),(2,'Ingeniería Civil',1),(3,'Administración',2),(4,'Contabilidad',2),(5,'Psicología',3);
INSERT INTO alumno VALUES(1,'Ana Ríos',1,5),(2,'Luis Paredes',1,3),(3,'Marta Soto',2,7),(4,'Jorge Vela',3,2),(5,'Lucía Rojas',1,8),(6,'Carlos Díaz',4,4),(7,'Elena Cruz',5,6),(8,'Pedro Huamán',2,1),(9,'Rosa Quispe',3,9),(10,'Diego Salas',1,2);`;
const EXAMPLES = [
  ['JOIN', 'SELECT a.nombre, p.nombre AS programa\nFROM alumno a\nJOIN programa p ON p.id = a.programa_id\nORDER BY a.nombre;'],
  ['GROUP BY', 'SELECT p.nombre, COUNT(*) AS alumnos\nFROM alumno a\nJOIN programa p ON p.id = a.programa_id\nGROUP BY p.nombre\nORDER BY alumnos DESC;'],
  ['Índice', 'EXPLAIN QUERY PLAN\nSELECT * FROM alumno WHERE programa_id = 1;'],
  ['Todo alumno', 'SELECT * FROM alumno;']
].map(([n, q]) => [n, q.replace(/\\n/g, '\n')]);
$('#sqlChips').innerHTML = EXAMPLES.map((e, i) => `<button type="button" data-q="${i}" aria-pressed="false">${e[0]}</button>`).join('');
$('#sqlIn').value = EXAMPLES[0][1];
const loadScript = src => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/';
let SQL, sdb;
async function getDb(fresh) {
  if (!SQL) { await loadScript(SQLJS + 'sql-wasm.js'); SQL = await initSqlJs({ locateFile: f => SQLJS + f }); }
  if (!sdb || fresh) { sdb = new SQL.Database(); sdb.run(SEED); }
  return sdb;
}
async function runSql() {
  const out = $('#sqlOut'); out.innerHTML = '<p class="mono hint">Ejecutando…</p>';
  let d; try { d = await getDb(); } catch (e) { out.innerHTML = '<p class="mono err">No se pudo cargar el motor SQL. Necesitas conexión a internet.</p>'; return; }
  try {
    const res = d.exec($('#sqlIn').value); act('sql_ok', $('#sqlIn').value);
    if (!res.length) { out.innerHTML = '<p class="mono hint">Consulta ejecutada. No hay filas para mostrar.</p>'; return; }
    const r = res[res.length - 1];
    out.innerHTML = `<div class="tw"><table><thead><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.slice(0, 50).map(row => `<tr>${row.map(v => `<td>${esc(String(v ?? 'NULL'))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="mono hint">${r.values.length} fila(s)</p>`;
  } catch (e) { out.innerHTML = `<p class="mono err">Error: ${esc(e.message || String(e))}</p>`; }
}
$('#sqlRun').onclick = runSql;
$('#sqlReset').onclick = async () => { try { await getDb(true); toast('Datos reiniciados'); } catch (e) { toast('Sin conexión al motor SQL'); } };
$('#sqlIn').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') runSql(); });
$('#sqlChips').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('#sqlIn').value = EXAMPLES[+b.dataset.q][1]; $('#sqlChips').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); runSql(); };

const QUIZ = [
  { q: '¿Qué cláusula une filas de dos tablas por una columna en común?', o: ['JOIN', 'LIMIT', 'GROUP BY', 'DISTINCT'], a: 0, e: 'JOIN relaciona tablas, normalmente con una clave foránea.' },
  { q: '¿Para qué sirve un índice?', o: ['Hacer copias de seguridad', 'Acelerar las búsquedas', 'Cifrar los datos', 'Borrar duplicados'], a: 1, e: 'Un índice permite encontrar filas sin recorrer toda la tabla.' },
  { q: '¿Qué garantiza una clave primaria?', o: ['Que la columna sea numérica', 'Que la tabla sea temporal', 'Que cada fila sea única e identificable', 'Que no existan relaciones'], a: 2, e: 'La clave primaria identifica de forma única cada fila.' },
  { q: 'En SQL Server, ¿qué archivo guarda los datos principales?', o: ['.bak', '.ldf', '.sql', '.mdf'], a: 3, e: '.mdf guarda los datos, .ldf el registro y .bak el respaldo.' }
];
let qi = 0, score = 0;
function renderQuiz() {
  const box = $('#quiz');
  if (qi >= QUIZ.length) {
    act('quiz', score);
    box.innerHTML = `<p class="mono lbl">RESULTADO</p><p class="score">${score}/${QUIZ.length}</p><p class="qtext">${score === QUIZ.length ? '¡Perfecto! Dominas lo básico.' : score >= 2 ? 'Buen avance. Repasa los temas que fallaste.' : 'Sigue practicando: prueba las consultas del laboratorio.'}</p><button class="btn primary" id="qRe" type="button">Reintentar</button>`;
    $('#qRe').onclick = () => { qi = 0; score = 0; renderQuiz(); }; return;
  }
  const q = QUIZ[qi];
  box.innerHTML = `<p class="mono lbl">PREGUNTA ${qi + 1} DE ${QUIZ.length}</p><p class="qtext">${q.q}</p><div class="opts">${q.o.map((t, i) => `<button type="button" data-o="${i}">${esc(t)}</button>`).join('')}</div><p class="fb" id="qFb" aria-live="polite"></p>`;
  box.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
    const ok = +b.dataset.o === q.a; if (ok) score++;
    box.querySelectorAll('[data-o]').forEach(x => { x.disabled = true; if (+x.dataset.o === q.a) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    $('#qFb').innerHTML = `${ok ? '¡Correcto! ' : 'No exactamente. '}${q.e} <button class="btn ghost" id="qNext" type="button">${qi + 1 < QUIZ.length ? 'Siguiente' : 'Ver resultado'}</button>`;
    $('#qNext').onclick = () => { qi++; renderQuiz(); };
  });
}
renderQuiz();

$('#msgForm').onsubmit = e => {
  e.preventDefault(); const f = new FormData(e.target);
  const body = `${f.get('msg')}\n\n— ${f.get('name')} (${f.get('mail')})`;
  location.href = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent('Mensaje desde tu portafolio')}&body=${encodeURIComponent(body)}`;
  toast('Abriendo tu correo…');
};

const photo = document.querySelector('.photo');
if (photo && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  photo.addEventListener('mousemove', e => { const r = photo.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; photo.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`; });
  photo.addEventListener('mouseleave', () => photo.style.transform = '');
}
addEventListener('scroll', () => { $('#prog').style.width = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100) + '%'; }, { passive: true });

/* Basketball upload and game kept from original - simplified openBasket stub for compatibility */
function openBasket(title, cb, opts) {
  bmOpts = opts || {};
  const i = document.createElement('input');
  i.type = 'file'; i.multiple = !bmOpts.single;
  if (bmOpts.accept) i.accept = bmOpts.accept;
  i.onchange = () => i.files.length && cb(bmOpts.single ? i.files[0] : [...i.files]);
  i.click();
}
