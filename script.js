/* ===== Configuración: edita aquí los nombres de las unidades ===== */
const UNITS = [
  { name: 'Modelado de datos',        weeks: [1, 2, 3, 4] },
  { name: 'Azure SQL y arquitectura', weeks: [5, 6, 7, 8] },
  { name: 'Consultas avanzadas',      weeks: [9, 10, 11, 12] },
  { name: 'Optimización y cierre',    weeks: [13, 14, 15, 16] }
];
const ACTIVITIES = ['Actividad 1', 'Actividad 2'];
const TOTAL = UNITS.length * 4 * ACTIVITIES.length;

let editor = false; try { editor = localStorage.getItem('editor') === '1'; } catch (e) {}
const PUB = Object.entries(EVIDENCIAS || {}).flatMap(([w, l]) => l.map((f, i) => ({ id: 'p' + w + '-' + i, week: +w, act: f.act, name: f.name, url: f.url, size: 0, pub: true })));
const allFiles = () => files.concat(PUB);
const act = (t, d) => document.dispatchEvent(new CustomEvent('accion', { detail: { t, d } }));
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const toast = msg => { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]));
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

let db, files = [], unit = 0;
const open = () => new Promise((ok, fail) => {
  const r = indexedDB.open('portafolio-david', 1);
  r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('files')) d.createObjectStore('files', { keyPath: 'id', autoIncrement: true }); if (!d.objectStoreNames.contains('misc')) d.createObjectStore('misc', { keyPath: 'key' }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => fail(r.error);
});
const tx = (store, mode, fn) => new Promise((ok, fail) => {
  try {
    const q = fn(db.transaction(store, mode).objectStore(store));
    q.onsuccess = () => ok(q.result); q.onerror = () => fail(q.error);
  } catch (e) { fail(e); }
});

const slotFiles = (w, a) => allFiles().filter(f => f.week === w && f.act === a);
const weekCount = w => ACTIVITIES.reduce((n, _, a) => n + (slotFiles(w, a).length ? 1 : 0), 0);

async function addFiles(w, a, list) {
  try {
    for (const f of list) await tx('files', 'readwrite', s => s.add({ week: w, act: a, name: f.name, type: f.type, size: f.size, blob: f, date: Date.now() }));
    files = await tx('files', 'readonly', s => s.getAll());
    act('evidencia', { w, a }); toast(list.length > 1 ? list.length + ' archivos guardados' : 'Archivo guardado');
    render();
  } catch (e) { toast('No se pudo guardar el archivo'); }
}
async function removeFile(id) {
  await tx('files', 'readwrite', s => s.delete(id));
  files = files.filter(f => f.id !== id); toast('Archivo eliminado'); render();
}
function openFile(f) {
  const dialog = $('#fileViewer'), body = $('#viewerBody'), title = $('#viewerTitle');
  if (!dialog || !body || !title) { toast('No se pudo abrir la vista previa'); return; }
  title.textContent = f.name;
  body.replaceChildren();
  const url = f.pub ? f.url : URL.createObjectURL(f.blob);
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  if (['png','jpg','jpeg','webp','gif','svg','bmp'].includes(ext)) {
    const img = document.createElement('img'); img.className = 'viewer-image'; img.alt = f.name; img.src = url; body.appendChild(img);
  } else if (ext === 'pdf') {
    const frame = document.createElement('iframe'); frame.className = 'viewer-frame'; frame.title = f.name; frame.src = url + (f.pub ? '#view=FitH' : ''); body.appendChild(frame);
  } else if (['html','htm'].includes(ext)) {
    const frame = document.createElement('iframe'); frame.className = 'viewer-frame'; frame.title = f.name; frame.setAttribute('sandbox','allow-scripts allow-forms allow-modals'); frame.src = url; body.appendChild(frame);
  } else if (['sql','txt','md','csv','json','xml','js','css'].includes(ext)) {
    const pre = document.createElement('pre'); pre.className = 'viewer-code'; body.appendChild(pre);
    const read = f.pub ? fetch(url).then(r => { if (!r.ok) throw new Error('No se pudo cargar'); return r.text(); }) : f.blob.text();
    read.then(content => { pre.textContent = content; }).catch(() => { pre.textContent = 'No se pudo mostrar este archivo.'; });
  } else {
    const frame = document.createElement('iframe'); frame.className = 'viewer-frame'; frame.title = f.name; frame.src = url; body.appendChild(frame);
  }
  if (!dialog.open) dialog.showModal();
}

function render() {
  const tabs = $('#tabs'), panel = $('#panel'), weeks = $('#weeks');
  if (!tabs || !panel) return;
  tabs.innerHTML = UNITS.map((u, i) => {
    const done = u.weeks.reduce((n, w) => n + weekCount(w), 0);
    return `<button class="tab" role="tab" data-u="${i}" aria-selected="${i === unit}">Unidad ${i + 1}<small class="mono">${done}/8 · ${esc(u.name)}</small></button>`;
  }).join('');
  panel.innerHTML = UNITS[unit].weeks.map(w => `
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
  if (weeks) {
    weeks.innerHTML = Array.from({ length: 16 }, (_, i) => { const c = weekCount(i + 1); return `<button type="button" data-go="${i + 1}" class="${c === 2 ? 'full' : c ? 'ok' : ''}" aria-label="Semana ${i + 1}">${pad(i + 1)}</button>`; }).join('');
  }
  const done = Array.from({ length: 16 }, (_, i) => weekCount(i + 1)).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / TOTAL * 100);
  const pctEl = $('#pct'), stPct = $('#stPct'), bar = $('#bar'), nDone = $('#nDone'), nFiles = $('#nFiles');
  if (pctEl) pctEl.textContent = pct + '%';
  if (stPct) stPct.textContent = pct + '%';
  if (bar) bar.style.width = pct + '%';
  if (nDone) nDone.textContent = done;
  if (nFiles) nFiles.textContent = allFiles().length;
  document.querySelectorAll('.link[data-go]').forEach(b => {
    const w = +b.dataset.go; const n = allFiles().filter(f => f.week === w).length;
    b.innerHTML = `Ver evidencia${n ? ' · ' + n + ' archivo(s)' : ''} <em>↗</em>`;
  });
}

function goWeek(w) {
  unit = UNITS.findIndex(u => u.weeks.includes(w));
  if (unit < 0) unit = 0;
  render();
  const el = $('#wk-' + w);
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800); }
}

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.u) { unit = +t.dataset.u; render(); }
  else if (t.dataset.go) goWeek(+t.dataset.go);
  else if (t.hasAttribute('data-up')) {
    const actEl = t.closest('.act'); if (!actEl) return;
    const w = +actEl.dataset.w, a = +actEl.dataset.a;
    openBasket(`Semana ${pad(w)} · ${ACTIVITIES[a]}`, f => addFiles(w, a, Array.isArray(f) ? f : [f]));
  }
  else if (t.dataset.open) { const f = allFiles().find(x => x.id == t.dataset.open); if (f) openFile(f); }
  else if (t.dataset.dl) { const f = allFiles().find(x => x.id == t.dataset.dl); if (f) openFile(f); }
  else if (t.dataset.rm) { if (confirm('¿Eliminar este archivo?')) removeFile(+t.dataset.rm); }
});

['dragover', 'dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
  const actEl = e.target.closest && e.target.closest('.act'); if (!actEl || !editor) return;
  e.preventDefault();
  if (ev === 'dragover') actEl.classList.add('over'); else actEl.classList.remove('over');
  if (ev === 'drop' && e.dataTransfer.files.length) addFiles(+actEl.dataset.w, +actEl.dataset.a, [...e.dataTransfer.files]);
}));

const viewerClose = $('#viewerClose'), fileViewer = $('#fileViewer');
if (viewerClose && fileViewer) viewerClose.onclick = () => fileViewer.close();
if (fileViewer) fileViewer.addEventListener('click', e => { if (e.target === fileViewer) fileViewer.close(); });

const root = document.documentElement, themeBtn = $('#theme');
if (themeBtn) {
  try { const t = localStorage.getItem('tema'); if (t) root.dataset.theme = t; } catch (e) {}
  const icon = () => themeBtn.textContent = root.dataset.theme === 'dark' ? '☀' : '☾'; icon();
  themeBtn.onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('tema', root.dataset.theme); } catch (e) {} icon(); };
}
const burger = $('#burger'), menu = $('#menu');
if (burger && menu) {
  burger.onclick = () => menu.classList.toggle('open');
  menu.onclick = e => { if (e.target.tagName === 'A') menu.classList.remove('open'); };
}

const getMisc = k => tx('misc', 'readonly', s => s.get(k));
const setMisc = (k, blob) => tx('misc', 'readwrite', s => s.put({ key: k, blob }));
function showFoto(blob) { const img = $('#fotoImg'); if (!img) return; img.src = URL.createObjectURL(blob); img.hidden = false; const ph = $('#fotoPh'); if (ph) ph.hidden = true; }
const fotoBtn = $('#fotoBtn');
if (fotoBtn) fotoBtn.onclick = () => openBasket('Tu foto de perfil', async f => { await setMisc('foto', f); showFoto(f); toast('Foto actualizada'); }, { accept: 'image/*', single: true });
const uploadCv = () => openBasket('Tu CV (PDF)', async f => { await setMisc('cv', f); toast('CV guardado'); }, { accept: 'application/pdf', single: true });
const cvUp = $('#cvUp'); if (cvUp) cvUp.onclick = uploadCv;
const cvBtn = $('#cvBtn');
if (cvBtn) cvBtn.onclick = async () => {
  let r = null; try { r = await getMisc('cv'); } catch (e) {}
  if (r) window.open(URL.createObjectURL(r.blob), '_blank');
  else if (editor) { toast('Aún no hay CV: súbelo ahora'); uploadCv(); }
  else if (typeof CONFIG !== 'undefined' && CONFIG.CV_URL) window.open(CONFIG.CV_URL, '_blank');
};

(async () => {
  try {
    db = await open();
    files = await tx('files', 'readonly', s => s.getAll()) || [];
    const f = await getMisc('foto'); if (f) showFoto(f.blob);
  } catch (e) { console.warn(e); toast('Tu navegador no permite guardar archivos localmente'); }
  render();
})();

function setEditor(v) {
  editor = v; document.body.classList.toggle('editor', v);
  try { localStorage.setItem('editor', v ? '1' : '0'); } catch (e) {}
  const ed = $('#edBtn'); if (ed) ed.textContent = v ? 'Salir del modo editor' : 'Modo editor';
  render();
}
const edBtn = $('#edBtn');
if (edBtn) edBtn.onclick = () => {
  if (editor) return setEditor(false);
  const k = prompt('Clave de editor:');
  if (typeof CONFIG !== 'undefined' && k === CONFIG.CLAVE_EDITOR) { setEditor(true); toast('Modo editor activado'); }
  else if (k !== null) toast('Clave incorrecta');
};
setEditor(editor);

document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
  document.querySelectorAll('.card').forEach(c => c.hidden = b.dataset.f !== 'todos' && !(c.dataset.tags || '').includes(b.dataset.f));
});

function openBasket(title, cb, opts) {
  opts = opts || {};
  const i = document.createElement('input');
  i.type = 'file'; i.multiple = !opts.single;
  if (opts.accept) i.accept = opts.accept;
  i.onchange = () => {
    if (!i.files.length) return;
    cb(opts.single ? i.files[0] : [...i.files]);
  };
  i.click();
}
