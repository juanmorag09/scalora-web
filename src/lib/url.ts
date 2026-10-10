/** Une la ruta base del sitio con una ruta interna sin duplicar ni perder barras. */
export function joinBase(base: string, path: string): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

/** Ruta de un recurso de `public/` respetando `BASE_PATH` (p. ej. GitHub Pages de proyecto). */
export function withBase(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
