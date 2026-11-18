/* ===== CONFIGURACIÓN DEL PORTAFOLIO ===== */
const CONFIG = {
  EMAIL: 'tu-correo@ejemplo.com',   // aquí llegarán los mensajes del formulario
  CLAVE_EDITOR: 'david2026',        // clave para activar el "Modo editor" (cámbiala)
  CV_URL: 'cv.pdf'                  // CV público (ponlo junto a index.html)
};
/* Archivos PÚBLICOS que verán todos los visitantes.
   1) Copia el archivo a evidencias/semana-XX/   2) Regístralo aquí.
   week: 1-16 · act: 0 = Actividad 1, 1 = Actividad 2 */
const EVIDENCIAS = {
  // 5: [ { act: 0, name: 'Manual Azure SQL.pdf', url: 'evidencias/semana-05/manual.pdf' } ],
};

/* ===== DATOS DEL PORTAFOLIO (editables) ===== */
const FRASES = ['Datos con estructura. Ideas con evidencia.', 'SELECT curiosidad FROM ingenieria_de_sistemas;', 'Primero entender el modelo. Después, escribir la consulta.', 'Modelar · Consultar · Documentar'];
/* Proyectos (mismo orden que las tarjetas). repo / demo / doc: pon aquí tus enlaces reales; vacío = "no publicado". */
const PROYECTOS = [
  { n: 'SQL QUEST', sem: [8], sub: 'Esquemas e Indexación', d: 'Un recorrido por la estructura de una base de datos: organizar esquemas y entender cómo los índices ayudan a consultar con intención.', obj: 'Comprender esquemas e indexación para consultar con intención.', tec: ['SQL', 'Esquemas', 'Indexación'], repo: '', demo: '#laboratorio', doc: '' },
  { n: 'Manual Azure SQL', sem: [5], sub: 'Grados y Títulos', d: 'Una guía práctica para trabajar con Azure SQL a través de un caso académico de grados y títulos.', obj: 'Documentar el uso de Azure SQL con un caso académico.', tec: ['Azure SQL', 'Manual', 'Consultas'], repo: '', demo: '', doc: '' },
  { n: 'Arquitectura Física', sem: [6], sub: 'Almacenamiento', d: 'Una mirada a cómo se organiza físicamente la información y a las decisiones que conectan el modelo con su almacenamiento.', obj: 'Entender cómo se organiza físicamente la información.', tec: ['Arquitectura', 'Datos', 'Almacenamiento'], repo: '', demo: '', doc: '' },
  { n: 'Cadena Editorial', sem: [3, 4], sub: 'Empresa Informática', d: 'Modelado de una empresa editorial y datos de ejemplo para dar contexto a las relaciones entre sus entidades.', obj: 'Modelar entidades y relaciones con datos de ejemplo.', tec: ['Modelado', 'Relaciones', 'Datos de ejemplo'], repo: '', demo: '', doc: '' }
];
/* Habilidades. lvl: 0 = sin definir, 1-5 = nivel que TÚ decidas (no se inventan porcentajes). */
const SKILLS = [
  { n: 'Java', cat: 'Lenguajes', lvl: 0, use: [] },
  { n: 'JavaScript', cat: 'Lenguajes', lvl: 0, use: ['Este portafolio', 'Juego «Encesta»'] },
  { n: 'HTML', cat: 'Web', lvl: 0, use: ['Este portafolio'] },
  { n: 'CSS', cat: 'Web', lvl: 0, use: ['Este portafolio'] },
  { n: 'SQL', cat: 'Datos', lvl: 0, use: ['SQL QUEST', 'Manual Azure SQL', 'Laboratorio SQL'] },
  { n: 'MySQL', cat: 'Datos', lvl: 0, use: [] },
  { n: 'Bases de datos', cat: 'Datos', lvl: 0, use: ['Cadena Editorial', 'Arquitectura Física'] },
  { n: 'GitHub', cat: 'Herramientas', lvl: 0, use: [] },
  { n: 'Visual Studio Code', cat: 'Herramientas', lvl: 0, use: [] }
];
/* Hitos extra para la línea de tiempo: { when: 'Semana 2', title: '...', sub: '...', kind: 'Aprendizaje' } */
const EXTRA = [];
