# Arquitectura

Decisiones técnicas del sitio de Scalora y la razón de cada una. Si una decisión cambia,
se actualiza aquí.

## Resumen

```
src/content (textos tipados) ─┐
src/config  (identidad, menú) ─┼─▶ componentes Astro ─▶ astro build ─▶ dist/ (HTML + CSS estáticos)
src/styles  (tokens)          ─┘                                          │
                                                                          ▼
                                        GitHub Actions: CI ─▶ build ─▶ GitHub Pages
```

El sitio es **estático**: no hay servidor ni base de datos que operar, proteger o escalar.
Lo único dinámico es el formulario, que envía a un endpoint externo configurable.

## Decisiones

### 1. Astro en lugar de una SPA

Es una página de contenido. Astro compila los componentes a HTML en el build y no envía
framework al navegador. Resultado: 40 KB de HTML (8 KB comprimido), menos de 4 KB de
JavaScript y contenido legible por buscadores sin ejecutar scripts. Si el sitio crece
hacia una aplicación (login, panel), Astro admite islas de React o rutas de servidor sin
reescribir lo existente.

### 2. El contenido no vive en el marcado

Cada sección lee sus textos de `src/content/*.ts`, tipados con los contratos de
`src/types/content.ts`. Cambiar un texto no toca componentes, y TypeScript rechaza en el
build un contenido incompleto. Si más adelante se conecta un CMS, solo cambia el origen
de esos datos.

### 3. Tokens de diseño como única fuente de verdad

`src/styles/tokens.css` define color, tipografía, espaciado y radios como variables CSS.
Los componentes consumen tokens; no escriben colores sueltos. Cambiar `--color-accent`
recolorea el sitio entero.

### 4. Tres capas de componentes

| Capa        | Responsabilidad                             | Conoce el contenido |
| ----------- | ------------------------------------------- | ------------------- |
| `ui/`       | Piezas genéricas: Button, Card, Grid, Split | No                  |
| `layout/`   | Cabecera, pie, metadatos                    | Solo `config/site`  |
| `sections/` | Una sección de la página cada una           | Sí                  |

Los estilos son **CSS con ámbito por componente** (los de Astro), con nombres BEM. No hay
framework de utilidades: el sitio es pequeño y así el CSS final pesa 8 KB comprimido.

### 5. Mejora progresiva

La página funciona sin JavaScript: el menú se muestra completo y el formulario usa la
validación nativa del navegador. Con JavaScript, el menú móvil se vuelve desplegable y el
formulario gana validación en vivo y envío sin recargar. Una clase `js` en `<html>`,
puesta antes del primer pintado, evita parpadeos.

### 6. Lógica pura separada del DOM

`src/lib/` contiene funciones sin dependencias del navegador (validación del formulario,
unión de rutas, filtrado del menú). `src/scripts/` solo conecta esas funciones con el DOM.
Por eso la lógica se prueba con pruebas unitarias rápidas y el comportamiento real con
pruebas de navegador.

### 7. Formulario honesto y resistente

- Valida longitud y formato; los mensajes de error se asocian al campo con
  `aria-describedby` y el foco va al primer campo inválido.
- Un campo trampa oculto descarta bots sin CAPTCHA.
- El envío tiene tiempo límite de 10 s y nunca lanza: informa éxito, fallo de red o de
  servidor.
- Sin endpoint configurado, lo dice. No simula un envío.

La validación del navegador es comodidad para la persona, no seguridad: **el endpoint
debe volver a validar** lo que recibe.

### 8. Fuentes autoalojadas

Sora, Instrument Sans y JetBrains Mono se empaquetan con el sitio (Fontsource). No hay
peticiones a terceros: mejor privacidad, sin dependencia de un CDN externo, y las dos
fuentes del primer pantallazo se precargan para evitar saltos de texto.

### 9. Un mismo código para cualquier URL

`SITE_URL` y `BASE_PATH` llegan por entorno. El sitio funciona igual en
`usuario.github.io/repo/` que en un dominio propio; canonical, Open Graph, sitemap y
robots.txt se generan con la URL real del despliegue.

### 10. Estrategia de pruebas

| Nivel         | Herramienta                     | Qué protege                                                           |
| ------------- | ------------------------------- | --------------------------------------------------------------------- |
| Estático      | Prettier, ESLint, `astro check` | Formato, errores comunes y tipos                                      |
| Unitario      | Vitest                          | Validación, rutas, menú y consistencia del contenido                  |
| Navegador     | Playwright                      | Menú, formulario, SEO, desbordamientos, errores de consola            |
| Accesibilidad | axe-core                        | WCAG 2.2 AA en la página, el menú abierto y el formulario con errores |
| Presupuesto   | Playwright                      | Sin peticiones a terceros y menos de 20 KB de JavaScript              |

Las pruebas de navegador corren contra el **sitio compilado**, en escritorio y móvil.

### 11. CI/CD

- `ci.yml` valida cada pull request: formato, lint, tipos, unitarias, build, auditoría de
  dependencias de producción y pruebas de navegador.
- `deploy.yml` reutiliza esa misma CI y solo publica si pasa. Los permisos son mínimos:
  lectura del código en general y escritura en Pages únicamente en el job de publicación.
- Dependabot propone actualizaciones semanales de npm y de las acciones.

## Limitaciones conocidas

- **Cabeceras de seguridad.** GitHub Pages no permite definir cabeceras HTTP
  (Content-Security-Policy, HSTS propio). Si se necesitan, conviene poner Cloudflare
  delante o migrar a un hosting que las permita; el sitio no depende de GitHub Pages.
- **Auditoría de dependencias de desarrollo.** `npm audit` reporta avisos altos en la
  cadena de `eslint-plugin-astro` (paquete `braces`). Afectan solo a herramientas de
  desarrollo, no al sitio publicado; las dependencias de producción no tienen avisos.
- **Playwright fijado en 1.56.1.** Es la versión con la que se validó el proyecto.
  Dependabot propondrá la actualización; al aceptarla hay que subir también el `overrides`
  de `playwright-core` en `package.json`.
- **Imagen para compartir.** `public/og-image.png` se regenera a mano con `npm run og`.

## Evolución prevista

Cuando haga falta: páginas por servicio o casos de estudio (colecciones de contenido de
Astro), analítica respetuosa con la privacidad, versión en inglés y un CMS para que el
contenido lo edite alguien sin tocar código.
