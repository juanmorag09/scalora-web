# Reel de Instagram

Video vertical de 25 s (1080 × 1920, 30 fps, H.264) con la propuesta de Scalora.

- `reel.html` — la animación (HTML y CSS con la identidad del sitio). Se puede abrir en el
  navegador para ver el diseño; los tiempos de cada escena están en los atributos `--d`.
- `render.mjs` — la convierte en `scalora-reel.mp4` sin instalar nada (usa el Chrome del equipo).

```bash
node marketing/reel/render.mjs
```

El MP4 no se guarda en git (`.gitignore`): se regenera con el comando de arriba.
No lleva audio: en Instagram se le agrega música al publicar.
