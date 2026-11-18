# Portafolio académico · David Martínez

Sitio estático (HTML, CSS y JavaScript). No necesita backend.

## Estructura
- `index.html` · página principal · `styles.css` + `futuro.css` · estilos
- `script.js` · actividades, laboratorio SQL, quiz, juego «Encesta», modo editor
- `futuro.js` · partículas, escritura animada, buscador (Ctrl+K), chatbot, modal de proyectos, habilidades, línea de tiempo
- `logros.js` · XP, niveles, medallas y retos académicos · `retos.js` · retos SQL verificados, estructura de tablas, historial
- `config.js` · **tus datos**: correo, proyectos, habilidades, hitos y archivos públicos
- `img/foto.jpg` · foto · `cv.pdf` y `cv/cv.html` · CV · `evidencias/` · archivos públicos

## Abrir en Visual Studio Code (Live Server)
1. Descomprime el ZIP y abre la carpeta con **File > Open Folder**.
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` > **Open with Live Server**.

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub y sube **el contenido** de la carpeta (que `index.html` quede en la raíz).
2. En **Settings > Pages** elige *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. En 1–2 minutos estará en `https://dm3986012.github.io/NUEVO/`. Todas las rutas son relativas.

## Configuración (config.js)
- `EMAIL`: correo del formulario. `PROYECTOS`: enlaces `repo`, `demo`, `doc`. `SKILLS`: niveles 1–5 (0 = sin definir).
- **Archivos públicos**: copia el archivo a `evidencias/semana-XX/` y regístralo en `EVIDENCIAS`.
- Los archivos subidos en **Modo editor** quedan solo en TU navegador: **no están publicados** hasta que los registres como públicos.

## Seguridad
- La clave del Modo editor está en JavaScript público: sirve para evitar confusiones, **no es seguridad real**. No guardes datos privados en la página.
- Todo texto que se muestra se escapa; no se ejecuta código introducido por usuarios.

## Pendiente (próximas versiones)
Resaltado de sintaxis en el editor SQL, vista previa de PDF e imágenes, fechas de entrega, misiones y sonido en el juego.
