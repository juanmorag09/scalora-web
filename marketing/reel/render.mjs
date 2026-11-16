/**
 * Renderiza `reel.html` a MP4 (H.264, 1080 × 1920, 30 fps constantes) sin instalar nada:
 *
 *   1. Abre el reel en Chrome, congela cada instante con `window.seek(t)` y captura
 *      el cuadro (JPEG de alta calidad).
 *   2. Codifica cada cuadro con el codificador H.264 de Chrome (WebCodecs), con su
 *      marca de tiempo exacta: no hay cuadros perdidos aunque el equipo vaya lento.
 *   3. Empaqueta el resultado en un MP4 estándar (no fragmentado, `moov` al inicio),
 *      que es lo que mejor aceptan Instagram, WhatsApp y los reproductores.
 *
 * Uso (desde la raíz del proyecto):
 *   node marketing/reel/render.mjs                    → marketing/reel/scalora-reel.mp4
 *   node marketing/reel/render.mjs --stills 2,5,9 dir → solo esas imágenes, para revisar
 */
/* eslint-disable no-console -- herramienta de línea de comandos: informa su avance. */
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = resolve(import.meta.dirname, '..', '..');
const OUTPUT = join(import.meta.dirname, 'scalora-reel.mp4');
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const BITRATE = 12_000_000;
const KEYFRAME_EVERY = FPS * 2;
/** High Profile, nivel 4.0: admite 1080 × 1920 a 30 fps. */
const CODEC = 'avc1.640028';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
  '.js': 'text/javascript',
};

/** Cuadros capturados, servidos a la página codificadora como /frame/<n>. */
const frames = [];

const ENCODER_PAGE = `<!doctype html><meta charset="utf-8"><title>encoder</title>
<script>
window.encode = async ({ count, fps, width, height, bitrate, codec, keyEvery }) => {
  const chunks = [];
  let description = null;
  const encoder = new VideoEncoder({
    output(chunk, metadata) {
      if (metadata?.decoderConfig?.description && !description) {
        description = new Uint8Array(metadata.decoderConfig.description);
      }
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      chunks.push({ data, key: chunk.type === 'key', timestamp: chunk.timestamp });
    },
    error(e) { throw e; },
  });
  encoder.configure({
    codec, width, height, bitrate, framerate: fps,
    bitrateMode: 'variable', latencyMode: 'quality', avc: { format: 'avc' },
  });

  const load = (i) => fetch('/frame/' + i).then((r) => r.blob()).then(createImageBitmap);
  let next = load(0);
  for (let i = 0; i < count; i++) {
    const bitmap = await next;
    if (i + 1 < count) next = load(i + 1);
    const frame = new VideoFrame(bitmap, {
      timestamp: Math.round((i * 1e6) / fps),
      duration: Math.round(1e6 / fps),
    });
    encoder.encode(frame, { keyFrame: i % keyEvery === 0 });
    frame.close();
    bitmap.close();
    // No acumular demasiados cuadros pendientes en el codificador.
    while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 5));
  }
  await encoder.flush();
  encoder.close();

  const toBase64 = (bytes) => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  return {
    description: toBase64(description),
    samples: chunks.map((c) => ({ data: toBase64(c.data), key: c.key, timestamp: c.timestamp })),
  };
};
</script>`;

/* ---------------------------------------------------------------------------------- */
/* Empaquetado MP4                                                                     */
/* ---------------------------------------------------------------------------------- */

const u8 = (n) => Buffer.from([n & 0xff]);
const u16 = (n) => {
  const b = Buffer.alloc(2);
  b.writeUInt16BE(n);
  return b;
};
const u32 = (n) => {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
};
const zeros = (n) => Buffer.alloc(n);
const str = (s) => Buffer.from(s, 'latin1');

function box(type, ...parts) {
  const body = Buffer.concat(parts);
  return Buffer.concat([u32(body.length + 8), str(type), body]);
}

function fullBox(type, version, flags, ...parts) {
  return box(type, u8(version), u8(flags >> 16), u8(flags >> 8), u8(flags), ...parts);
}

/** Matriz identidad de transformación (vídeo sin rotar). */
const MATRIX = Buffer.concat(
  [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000].map((n) => u32(n)),
);

function buildMp4({ width, height, fps, description, samples }) {
  const count = samples.length;
  const timescale = fps * 1000;
  const sampleDelta = 1000;
  const mediaDuration = count * sampleDelta;
  const movieDuration = Math.round((count / fps) * 1000);

  const ftyp = box(
    'ftyp',
    str('isom'),
    u32(0x200),
    str('isom'),
    str('iso2'),
    str('avc1'),
    str('mp41'),
  );

  const moov = (chunkOffset) => {
    const mvhd = fullBox(
      'mvhd',
      0,
      0,
      u32(0),
      u32(0),
      u32(1000),
      u32(movieDuration),
      u32(0x00010000),
      u16(0x0100),
      zeros(10),
      MATRIX,
      zeros(24),
      u32(2),
    );
    const tkhd = fullBox(
      'tkhd',
      0,
      3,
      u32(0),
      u32(0),
      u32(1),
      zeros(4),
      u32(movieDuration),
      zeros(8),
      u16(0),
      u16(0),
      u16(0),
      zeros(2),
      MATRIX,
      u32(width << 16),
      u32(height << 16),
    );
    const mdhd = fullBox(
      'mdhd',
      0,
      0,
      u32(0),
      u32(0),
      u32(timescale),
      u32(mediaDuration),
      u16(0x55c4),
      u16(0),
    );
    const hdlr = fullBox('hdlr', 0, 0, u32(0), str('vide'), zeros(12), str('VideoHandler\0'));
    const vmhd = fullBox('vmhd', 0, 1, zeros(8));
    const dinf = box('dinf', fullBox('dref', 0, 0, u32(1), fullBox('url ', 0, 1)));

    const avc1 = box(
      'avc1',
      zeros(6),
      u16(1),
      zeros(16),
      u16(width),
      u16(height),
      u32(0x00480000),
      u32(0x00480000),
      zeros(4),
      u16(1),
      zeros(32),
      u16(0x0018),
      u16(0xffff),
      box('avcC', description),
      box('pasp', u32(1), u32(1)),
    );
    const stsd = fullBox('stsd', 0, 0, u32(1), avc1);
    const stts = fullBox('stts', 0, 0, u32(1), u32(count), u32(sampleDelta));
    const keys = samples.flatMap((s, i) => (s.key ? [i + 1] : []));
    const stss = fullBox('stss', 0, 0, u32(keys.length), ...keys.map(u32));
    const stsc = fullBox('stsc', 0, 0, u32(1), u32(1), u32(count), u32(1));
    const stsz = fullBox(
      'stsz',
      0,
      0,
      u32(0),
      u32(count),
      ...samples.map((s) => u32(s.data.length)),
    );
    const stco = fullBox('stco', 0, 0, u32(1), u32(chunkOffset));
    const stbl = box('stbl', stsd, stts, stss, stsc, stsz, stco);

    const minf = box('minf', vmhd, dinf, stbl);
    const mdia = box('mdia', mdhd, hdlr, minf);
    const trak = box('trak', tkhd, mdia);
    return box('moov', mvhd, trak);
  };

  // `moov` va antes de `mdat` (arranque rápido); su tamaño no depende del offset.
  const moovSize = moov(0).length;
  const mdatPayload = Buffer.concat(samples.map((s) => s.data));
  const chunkOffset = ftyp.length + moovSize + 8;
  return Buffer.concat([
    ftyp,
    moov(chunkOffset),
    u32(mdatPayload.length + 8),
    str('mdat'),
    mdatPayload,
  ]);
}

/* ---------------------------------------------------------------------------------- */
/* Servidor local y renderizado                                                        */
/* ---------------------------------------------------------------------------------- */

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (url.pathname === '/encoder') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return response.end(ENCODER_PAGE);
  }
  if (url.pathname.startsWith('/frame/')) {
    const frame = frames[Number(url.pathname.slice(7))];
    response.writeHead(frame ? 200 : 404, { 'content-type': 'image/jpeg' });
    return response.end(frame);
  }
  const path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (!path.startsWith(ROOT)) {
    response.writeHead(403);
    return response.end();
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});

await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome' });

try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.goto(`${base}/marketing/reel/reel.html`);
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.REEL_DURATION);
  const total = Math.round(duration * FPS);

  const stillsArg = process.argv.indexOf('--stills');
  if (stillsArg !== -1) {
    const times = process.argv[stillsArg + 1].split(',').map(Number);
    const dir = process.argv[stillsArg + 2] ?? join(import.meta.dirname, 'stills');
    for (const t of times) {
      await page.evaluate((s) => window.seek(s), t);
      await page.screenshot({ path: join(dir, `still-${String(t).replace('.', '_')}s.png`) });
    }
    console.log(`Guardadas ${times.length} imágenes en ${dir}`);
  } else {
    // 1. Captura de cuadros
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.seek(t), i / FPS);
      frames.push(await page.screenshot({ type: 'jpeg', quality: 95 }));
      if (i % FPS === 0) process.stdout.write(`\rCapturando ${i}/${total} cuadros`);
    }
    process.stdout.write(`\rCapturados ${total} cuadros.          \n`);

    // 2. Codificación H.264 con marcas de tiempo exactas
    console.log('Codificando H.264…');
    const encoderPage = await browser.newPage();
    await encoderPage.goto(`${base}/encoder`);
    const result = await encoderPage.evaluate((options) => window.encode(options), {
      count: total,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
      bitrate: BITRATE,
      codec: CODEC,
      keyEvery: KEYFRAME_EVERY,
    });

    const samples = result.samples.map((s) => ({ ...s, data: Buffer.from(s.data, 'base64') }));
    if (samples.length !== total)
      throw new Error(`Se esperaban ${total} cuadros y hay ${samples.length}`);
    const inOrder = samples.every((s, i) => i === 0 || s.timestamp > samples[i - 1].timestamp);
    if (!inOrder)
      throw new Error('El codificador reordenó cuadros (B-frames); el empaquetado no lo soporta.');

    // 3. Empaquetado MP4
    const mp4 = buildMp4({
      width: WIDTH,
      height: HEIGHT,
      fps: FPS,
      description: Buffer.from(result.description, 'base64'),
      samples,
    });
    await writeFile(OUTPUT, mp4);
    console.log(
      `Listo: ${OUTPUT} (${(mp4.length / 1e6).toFixed(1)} MB, ${samples.length} cuadros)`,
    );
  }
} finally {
  await browser.close();
  server.close();
}
