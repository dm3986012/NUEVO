/* Laboratorio SQL interactivo: motor SQLite en el navegador */
(() => {
  const $ = s => document.querySelector(s);
  const seed = [
    "CREATE TABLE facultad (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL);",
    "CREATE TABLE programa (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, facultad_id INTEGER NOT NULL, FOREIGN KEY(facultad_id) REFERENCES facultad(id));",
    "CREATE TABLE alumno (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, ciclo INTEGER NOT NULL, programa_id INTEGER NOT NULL, FOREIGN KEY(programa_id) REFERENCES programa(id));",
    "INSERT INTO facultad VALUES (1,'Ingeniería'),(2,'Ciencias Empresariales'),(3,'Educación');",
    "INSERT INTO programa VALUES (1,'Ingeniería de Sistemas',1),(2,'Ingeniería Civil',1),(3,'Administración',2),(4,'Contabilidad',2),(5,'Educación Primaria',3);",
    "INSERT INTO alumno VALUES (1,'Ana Torres',6,1),(2,'Carlos Rojas',8,1),(3,'Luis Mendoza',4,2),(4,'María Flores',7,1),(5,'José Quispe',6,3),(6,'Rosa Huamán',9,4),(7,'Pedro Salazar',3,5),(8,'Lucía Castro',8,2),(9,'Miguel Paredes',10,1),(10,'Sofía Ramos',5,3),(11,'Daniel Vega',7,4),(12,'Elena Ríos',6,1);"
  ];
  let SQL=null,db=null,loading=null;
  const examples=[
    {label:'Ver alumnos',sql:'SELECT * FROM alumno;'},
    {label:'Alumnos por ciclo',sql:'SELECT nombre, ciclo FROM alumno WHERE ciclo > 5 ORDER BY ciclo DESC;'},
    {label:'Programas y alumnos',sql:'SELECT p.nombre AS programa, COUNT(a.id) AS total_alumnos FROM programa p LEFT JOIN alumno a ON a.programa_id=p.id GROUP BY p.id ORDER BY total_alumnos DESC;'},
    {label:'Alumnos de Sistemas',sql:"SELECT a.nombre, a.ciclo FROM alumno a JOIN programa p ON p.id=a.programa_id WHERE p.nombre='Ingeniería de Sistemas' ORDER BY a.nombre;"}
  ];
  async function getDb(){
    if(db)return db;
    if(loading)return loading;
    loading=(async()=>{
      if(!window.initSqlJs)throw new Error('No se pudo cargar el motor SQL. Comprueba tu conexión a internet y recarga la página.');
      SQL=await window.initSqlJs({locateFile:file=>'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/'+file});
      db=new SQL.Database();
      seed.forEach(q=>db.run(q));
      db.run('PRAGMA foreign_keys = ON;');
      return db;
    })();
    try{return await loading;}catch(e){loading=null;throw e;}
  }
  window.getDb=getDb;
  function showMessage(message,type='info'){
    const out=$('#sqlOut');if(!out)return;
    out.innerHTML='';
    const p=document.createElement('p');p.className='mono hint '+(type==='error'?'sql-error':'');p.textContent=message;out.appendChild(p);
  }
  function renderResults(result){
    const out=$('#sqlOut');out.replaceChildren();
    if(!result || !result.length || !result.some(r=>r.columns.length)){
      const p=document.createElement('p');p.className='mono hint';p.textContent='Consulta ejecutada correctamente. No hay filas para mostrar.';out.appendChild(p);return;
    }
    result.forEach((set,index)=>{
      if(!set.columns.length)return;
      const wrap=document.createElement('div');wrap.className='sql-result-wrap';
      const table=document.createElement('table');table.className='sql-result';
      const thead=document.createElement('thead'),tr=document.createElement('tr');
      set.columns.forEach(col=>{const th=document.createElement('th');th.textContent=col;tr.appendChild(th);});
      thead.appendChild(tr);table.appendChild(thead);
      const tbody=document.createElement('tbody');
      set.values.forEach(row=>{const r=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value===null?'NULL':String(value);r.appendChild(td);});tbody.appendChild(r);});
      table.appendChild(tbody);wrap.appendChild(table);
      const foot=document.createElement('p');foot.className='sql-result-count mono';foot.textContent=set.values.length+' fila(s) devuelta(s)'+(result.length>1?' · resultado '+(index+1):'');wrap.appendChild(foot);out.appendChild(wrap);
    });
  }
  async function runQuery(){
    const input=$('#sqlIn');if(!input)return;
    const query=input.value.trim();if(!query){showMessage('Escribe una consulta SQL o selecciona un ejemplo.');return;}
    const btn=$('#sqlRun');if(btn){btn.disabled=true;btn.textContent='Ejecutando…';}
    try{
      const d=await getDb();const results=d.exec(query);renderResults(results);
      document.dispatchEvent(new CustomEvent('accion',{detail:{t:'sql_ok',d:query}}));
      const msg=$('#retoMsg');if(msg)msg.textContent='';
    }catch(e){showMessage('Error SQL: '+e.message,'error');}
    finally{if(btn){btn.disabled=false;btn.textContent='Ejecutar ▶';}}
  }
  async function resetDb(){
    try{db?.close();}catch(e){}
    db=null;loading=null;
    try{await getDb();showMessage('Base de datos reiniciada. Se restauraron las tablas y los datos de ejemplo.');loadSchema();}
    catch(e){showMessage(e.message,'error');}
  }
  async function loadSchema(){
    const el=$('#schema');if(!el)return;
    try{const d=await getDb();const tables=d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0]?.values||[];
      el.replaceChildren();tables.forEach(([name])=>{const info=d.exec('PRAGMA table_info("'+String(name).replace(/"/g,'""')+'")')[0];const item=document.createElement('span');item.className='schema-table';const b=document.createElement('b');b.textContent=name;item.appendChild(b);item.append(' ('+(info?.values||[]).map(c=>c[1]+(c[5]?' 🔑':'')).join(', ')+')');el.appendChild(item);});
    }catch(e){el.textContent='No se pudo cargar la estructura: '+e.message;}
  }
  function init(){
    const chips=$('#sqlChips'),input=$('#sqlIn');
    if(!chips||!input)return;
    chips.innerHTML=examples.map((x,i)=>'<button type="button" class="sql-chip" data-example="'+i+'">'+x.label+'</button>').join('');
    chips.addEventListener('click',e=>{const b=e.target.closest('[data-example]');if(!b)return;input.value=examples[Number(b.dataset.example)].sql;input.focus();});
    $('#sqlRun')?.addEventListener('click',runQuery);
    $('#sqlReset')?.addEventListener('click',resetDb);
    input.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runQuery();}});
    const lab=$('#laboratorio');
    if(lab&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting)){observer.disconnect();getDb().then(loadSchema).catch(e=>showMessage(e.message,'error'));}});observer.observe(lab);}
    else getDb().then(loadSchema).catch(e=>showMessage(e.message,'error'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();