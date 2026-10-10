# Bitácora de sprints

El proyecto se construyó en seis incrementos. Cada uno tiene un objetivo, criterios de
aceptación y una validación que se ejecutó de verdad antes de pasar al siguiente. Los
resultados de abajo son los obtenidos, incluidos los fallos encontrados y su corrección.

> Los sprints se ejecutaron de forma consecutiva el 10 de octubre de 2026. Aquí «sprint»
> significa incremento validado, no una iteración de calendario.

| Sprint | Objetivo                         | Estado                                                      |
| ------ | -------------------------------- | ----------------------------------------------------------- |
| 0      | Base del proyecto                | Validado                                                    |
| 1      | Sistema de diseño                | Validado                                                    |
| 2      | Contenido tipado y secciones     | Validado                                                    |
| 3      | Interactividad                   | Validado                                                    |
| 4      | SEO, accesibilidad y rendimiento | Validado                                                    |
| 5      | CI/CD y documentación            | Validado en local; pendiente la primera ejecución en GitHub |

---

## Sprint 0 — Base del proyecto

**Objetivo.** Un proyecto que compile y que rechace código mal formado desde el primer día.

**Entregables.** Astro 7 con TypeScript en modo `strictest`, ESLint (reglas estrictas de
TypeScript y de Astro), Prettier, EditorConfig, alias `@/` hacia `src/`, variables de
entorno con esquema tipado y scripts de npm.

**Criterios de aceptación.**

- [x] `npm run format:check`, `lint`, `check` y `build` terminan sin errores ni avisos.
- [x] `SITE_URL` y `BASE_PATH` configurables por entorno.

**Validación.** Los cuatro comandos pasaron sobre una página mínima.

**Hallazgos.** `astro check` avisó de una API obsoleta en la configuración de ESLint
(`tseslint.config`); se cambió por `defineConfig` de `eslint/config`.

---

## Sprint 1 — Sistema de diseño

**Objetivo.** Que el aspecto de la página salga de un solo lugar.

**Entregables.** `tokens.css` (color, tipografía, espaciado, radios), `base.css`, fuentes
autoalojadas y los componentes `Container`, `Section`, `SectionHeader`, `Eyebrow`,
`Button`, `Card`, `Icon` y `Logo`.

**Criterios de aceptación.**

- [x] Ningún componente escribe un color fuera de los tokens.
- [x] Cambiar `--color-accent` recolorea botones, etiquetas e iconos.
- [x] Las fuentes se sirven desde el propio sitio.

**Validación.** `check`, `lint` y `build` sin errores sobre una página de muestra con los
componentes; el build incluyó los archivos de fuente en `dist/_astro/`.

---

## Sprint 2 — Contenido tipado y secciones

**Objetivo.** Reconstruir la página aprobada, con el contenido separado del marcado.

**Entregables.** `config/site.ts`, diez archivos de contenido tipado, cabecera, pie, diez
secciones (inicio, problema, servicios, enfoque, proceso, para quién, diferenciadores,
proyectos, nosotros, contacto) y cuatro componentes de apoyo que surgieron al maquetarlas:
`Grid`, `Split`, `Statement` y `FormField`.

**Criterios de aceptación.**

- [x] Todos los textos del documento de marca están en `src/content/`, no en componentes.
- [x] La página coincide con el diseño aprobado en escritorio y móvil.
- [x] La sección de proyectos y su enlace se ocultan si no hay proyectos.

**Validación.** `check`, `lint` y `build` sin errores; revisión visual con capturas a
1440 px y 390 px; pruebas unitarias de consistencia del contenido (cantidades, numeración
del proceso, identificadores únicos, enlaces del menú con sección existente).

**Hallazgos corregidos.**

- Se perdía el espacio entre fragmentos de una misma frase («en**algo** real»,
  «software.**Construimos**»). Se añadió el espacio explícito en cuatro lugares.
- Con la tipografía real, «Automate» se partía en dos líneas en la escalera del inicio. Se
  ajustó el tamaño y, en pantallas angostas, la escalera pasa a crecer hacia la derecha.

---

## Sprint 3 — Interactividad

**Objetivo.** Menú móvil y formulario que funcionen bien con teclado, lector de pantalla y
sin JavaScript.

**Entregables.** Menú desplegable en móvil (`aria-expanded`, cierre con Escape y al elegir
un enlace), validación del formulario con errores por campo, envío asíncrono a un endpoint
configurable, tiempo límite, campo trampa contra bots y enlace «Saltar al contenido».

**Criterios de aceptación.**

- [x] Sin JavaScript, el menú es visible y el formulario valida con el navegador.
- [x] Un envío inválido marca cada campo, enfoca el primero y no hace ninguna petición.
- [x] Un envío válido manda `{ name, email, message }` como JSON y confirma.
- [x] Un fallo del servidor se informa y conserva lo escrito.
- [x] Sin endpoint, el formulario lo dice en lugar de fingir el envío.

**Validación.** 21 pruebas unitarias de la lógica del formulario (límites, correos válidos
e inválidos, campo trampa, éxito, fallo de servidor, fallo de red, tiempo agotado) y
13 pruebas de navegador (7 de navegación, 6 del formulario) en escritorio y móvil.

**Hallazgos corregidos.**

- `astro preview` se lanza en segundo plano en entornos automatizados y Playwright lo
  daba por caído. Las pruebas usan ahora un servidor estático dedicado (`sirv`) sobre un
  build aparte (`dist-e2e/`), que además evita pisar el `dist/` de producción.
- Las pruebas buscaban los campos por etiqueta y coincidían también con una sección de
  nombre parecido. Ahora los localizan por rol y nombre accesible.

---

## Sprint 4 — SEO, accesibilidad y rendimiento

**Objetivo.** Que la página se encuentre, se comparta bien, la pueda usar cualquiera y
cargue rápido.

**Entregables.** Título, descripción, canonical, Open Graph, Twitter Card, datos
estructurados de la organización, sitemap, `robots.txt`, favicon, imagen para compartir,
página 404, precarga de fuentes y pruebas de accesibilidad con axe.

**Criterios de aceptación.**

- [x] Cero infracciones de axe (WCAG 2.2 AA y buenas prácticas) en la página, el menú
      móvil abierto, el formulario con errores y la 404.
- [x] Un solo `h1` y encabezados sin saltos de nivel.
- [x] Sin desbordamiento horizontal de 320 a 1920 px.
- [x] Sin peticiones a terceros y menos de 20 KB de JavaScript.
- [x] Todo objetivo táctil mide al menos 44 px.

**Validación.** 17 pruebas de navegador nuevas (8 de SEO, 5 de accesibilidad, 4 de
calidad). Lighthouse 13.5 sobre el sitio compilado, servido en local:

| Perfil     | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP   | CLS | Bloqueo |
| ---------- | ----------- | ------------- | ---------------- | --- | ----- | --- | ------- |
| Móvil      | 98          | 100           | 100              | 100 | 1,8 s | 0   | 0 ms    |
| Escritorio | 100         | 100           | 100              | 100 | 0,5 s | 0   | 0 ms    |

Son mediciones de laboratorio con red simulada; en producción dependen del hosting.
Peso de la página: 170 KB en total, de los cuales 3,9 KB son JavaScript.

**Hallazgos corregidos.**

- Con ruta base, el sitemap listaba la portada dos veces (con y sin barra final). Se
  normalizó la ruta base y se fijó la barra final.
- El enlace del correo medía 20 px de alto: por debajo del mínimo táctil. Ahora mide 44 px.
- Dos versiones de `playwright-core` instaladas a la vez rompían los tipos de axe. Se
  unificaron con `overrides`.

---

## Sprint 5 — CI/CD y documentación

**Objetivo.** Que nada llegue a producción sin pasar la validación, y que cualquiera pueda
retomar el proyecto.

**Entregables.** `ci.yml` (formato, lint, tipos, unitarias, build, auditoría, pruebas de
navegador), `deploy.yml` (publica en GitHub Pages solo si la CI pasa), Dependabot,
plantilla de pull request, configuración de VS Code, README y documento de arquitectura.

**Criterios de aceptación.**

- [x] `npm run validate` pasa desde una instalación limpia (`npm ci`).
- [x] Los flujos pasan `actionlint` sin hallazgos.
- [x] `npm audit --omit=dev` sin vulnerabilidades.
- [ ] Los flujos se ejecutan correctamente en GitHub. **Pendiente:** requiere el primer
      push a un repositorio; hasta entonces solo están revisados de forma estática.

**Validación final.** Instalación limpia y `npm run validate` completo:

| Comprobación          | Resultado                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Formato (Prettier)    | Sin diferencias                                                                                            |
| Lint (ESLint)         | 0 errores, 0 avisos                                                                                        |
| Tipos (`astro check`) | 0 errores, 0 avisos, 0 sugerencias                                                                         |
| Pruebas unitarias     | 36 de 36                                                                                                   |
| Build                 | 2 páginas, `robots.txt` y sitemap                                                                          |
| Pruebas de navegador  | 53 de 53 ejecutadas (30 pruebas × escritorio y móvil; 7 se omiten por no aplicar a ese tamaño de pantalla) |

---

## Pendientes fuera del alcance de estos sprints

Dependen de información o accesos que aún no existen:

1. **Proyectos reales** en `src/content/projects.ts` (hoy hay tres marcadores).
2. **Endpoint y correo de contacto** (`PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_CONTACT_EMAIL`).
3. **Primer despliegue** en GitHub Pages y verificación de los flujos en GitHub.
4. **Aviso de privacidad** para el formulario, que recoge nombre y correo.
