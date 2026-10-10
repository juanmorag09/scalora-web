/** Menú desplegable en móvil. Sin JavaScript el menú queda visible, así que esto solo mejora. */

const DESKTOP_QUERY = '(min-width: 48rem)';

export function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!toggle || !nav) return;

  const label = toggle.querySelector<HTMLElement>('[data-nav-toggle-label]');

  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.dataset['open'] = String(open);
    if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
  };

  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';

  toggle.hidden = false;
  setOpen(false);

  toggle.addEventListener('click', () => {
    setOpen(!isOpen());
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
