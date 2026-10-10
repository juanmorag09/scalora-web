# Scalora — sitio web

Sitio corporativo de **Scalora** (_Build. Automate. Scale._). Una sola página estática,
construida con [Astro](https://astro.build) y TypeScript estricto, sin frameworks de
cliente: el navegador recibe HTML, CSS y menos de 4 KB de JavaScript.

- **Contenido separado del marcado:** los textos viven en `src/content/`, tipados.
- **Sistema de diseño por tokens:** colores, tipografía y espaciado en un solo archivo.
- **Calidad automatizada:** formato, lint, tipos, 36 pruebas unitarias y 30 de navegador
  (en escritorio y móvil, con accesibilidad vía axe) en un solo comando.
- **CI/CD:** GitHub Actions valida cada pull request y publica en GitHub Pages al llegar a `main`.

## Requisitos

- Node.js 22 (ver `.nvmrc`). Funciona desde la 20.11.
- npm 10 o superior.

## Empezar

```bash
npm install
npm run dev          # http://localhost:4321
```

Para las pruebas de navegador hace falta Chromium una sola vez:

```bash
npx playwright install chromium
```

## Comandos

| Comando            | Qué hace                                                         |
| ------------------ | ---------------------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo con recarga en caliente                   |
| `npm run build`    | Genera el sitio de producción en `dist/`                         |
| `npm run preview`  | Sirve `dist/` para revisarlo antes de publicar                   |
| `npm run check`    | Revisa tipos en archivos `.astro` y `.ts`                        |
| `npm run lint`     | ESLint                                                           |
| `npm run format`   | Aplica Prettier (`format:check` solo verifica)                   |
| `npm test`         | Pruebas unitarias (Vitest)                                       |
| `npm run test:e2e` | Pruebas de navegador y accesibilidad (Playwright + axe)          |
| `npm run validate` | Todo lo anterior en orden; es lo mismo que corre la CI           |
| `npm run og`       | Regenera `public/og-image.png`, la imagen al compartir el enlace |

## Estructura

```
src/
├── config/site.ts        Identidad, metadatos y menús
├── content/              Textos de cada sección (un archivo por sección)
├── types/content.ts      Contratos del contenido
├── styles/
│   ├── tokens.css        Tokens de diseño: única fuente de verdad visual
│   └── base.css          Reinicio y estilos de elemento
├── components/
│   ├── ui/               Piezas reutilizables (Button, Card, Grid, Section…)
│   ├── layout/           Header, Footer, Seo
│   └── sections/         Una sección de la página por archivo
├── layouts/BaseLayout.astro
├── lib/                  Lógica pura y probada (validación, rutas, navegación)
├── scripts/              JavaScript de cliente (menú móvil, formulario)
└── pages/                index, 404 y robots.txt
tests/
├── unit/                 Vitest: lógica y consistencia del contenido
└── e2e/                  Playwright: navegación, formulario, SEO, accesibilidad, calidad
docs/                     Arquitectura y bitácora de sprints
.github/workflows/        CI y despliegue
```

## Tareas frecuentes

**Cambiar un texto.** Edita el archivo de la sección en `src/content/`. El marcado no
contiene textos.

**Cambiar el color de marca.** Modifica `--color-accent` en `src/styles/tokens.css` y
ejecuta `npm run og` para actualizar la imagen de compartir. La prueba de accesibilidad
avisa si el nuevo color pierde contraste.

**Agregar un proyecto.** Añade una entrada en `src/content/projects.ts`. Con `image`
(ruta dentro de `public/`) se muestra la captura; con `url`, el enlace. Si el arreglo
queda vacío, la sección y su enlace del menú se ocultan solos.

**Agregar una sección.** Crea el contenido en `src/content/`, el componente en
`src/components/sections/` usando `Section` y `SectionHeader`, e impórtalo en
`src/pages/index.astro`. Si va en el menú, añádela en `src/config/site.ts` y en la lista
`SECTION_IDS` de `tests/unit/content.test.ts`.

## Variables de entorno

Copia `.env.example` como `.env`. Ninguna es obligatoria en desarrollo.

| Variable                  | Para qué sirve                                                                |
| ------------------------- | ----------------------------------------------------------------------------- |
| `SITE_URL`                | URL pública sin barra final. Alimenta canonical, Open Graph, sitemap y robots |
| `BASE_PATH`               | Ruta base si el sitio no está en la raíz (`/nombre-del-repo`)                 |
| `PUBLIC_CONTACT_ENDPOINT` | URL que recibe el formulario por `POST` con JSON `{ name, email, message }`   |
| `PUBLIC_CONTACT_EMAIL`    | Correo visible en la sección de contacto. Vacío = no se muestra               |

### Formulario de contacto

El formulario valida en el navegador y envía a `PUBLIC_CONTACT_ENDPOINT`. Sirve cualquier
servicio que acepte JSON y responda con un código 2xx (Formspree, Web3Forms, una función
serverless propia). **Sin endpoint, el formulario valida pero avisa que el envío no está
conectado**: no finge un envío.

## Despliegue en GitHub Pages

1. Crea el repositorio en GitHub y sube el proyecto a la rama `main`.
2. En **Settings → Pages → Build and deployment**, elige **Source: GitHub Actions**.
3. Opcional: en **Settings → Secrets and variables → Actions → Variables**, define
   `PUBLIC_CONTACT_ENDPOINT` y `PUBLIC_CONTACT_EMAIL`.
4. Cada push a `main` ejecuta la CI y, si pasa, publica.

`SITE_URL` y `BASE_PATH` se calculan solos a partir del repositorio. Para un **dominio
propio**, define las variables `SITE_URL=https://tu-dominio.com` y `BASE_PATH=/`, y
configura el dominio en Settings → Pages.

## Pendientes antes de publicar

- [ ] Reemplazar los tres proyectos de ejemplo en `src/content/projects.ts`.
- [ ] Definir `PUBLIC_CONTACT_ENDPOINT` y `PUBLIC_CONTACT_EMAIL`.
- [ ] Hacer el primer push: los flujos de GitHub Actions están revisados de forma estática
      pero todavía no se han ejecutado en GitHub.
- [ ] Añadir un aviso de privacidad: el formulario recoge nombre y correo.

## Más documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md): decisiones técnicas y sus razones.
- [`docs/SPRINTS.md`](docs/SPRINTS.md): qué se construyó en cada sprint y cómo se validó.
