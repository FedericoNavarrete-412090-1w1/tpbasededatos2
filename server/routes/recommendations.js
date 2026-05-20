import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

function toNum(v) {
  return v && typeof v.toNumber === 'function' ? v.toNumber() : v;
}

// POST /api/recommendations — recomendar contenido a otro usuario
router.post('/', async (req, res) => {
  const { fromEmail, toEmail, contentId, contentType, mensaje } = req.body;
  if (!fromEmail || !toEmail || !contentId) {
    return res.status(400).json({ error: 'fromEmail, toEmail y contentId son obligatorios' });
  }
  try {
    const tipoLabel = contentType === 'Serie' ? 'Serie' : 'Pelicula';
    await query(`
      MATCH (from:Usuario {email: $fromEmail})
      MATCH (c:${tipoLabel} {id: $contentId})
      MERGE (from)-[r:RECOMENDÓ]->(c)
      SET r.para = $toEmail,
          r.mensaje = $mensaje,
          r.fecha = $fecha
    `, {
      fromEmail,
      toEmail,
      contentId: String(contentId),
      mensaje: mensaje || '',
      fecha: new Date().toISOString(),
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recommendations/manual/:email — recomendaciones manuales recibidas
router.get('/manual/:email', async (req, res) => {
  try {
    const records = await query(`
      MATCH (from:Usuario)-[r:RECOMENDÓ]->(c)
      WHERE r.para = $email AND (c:Pelicula OR c:Serie)
      OPTIONAL MATCH (c)-[:PERTENECE_A]->(g:Genero)
      OPTIONAL MATCH (d:Director)-[:DIRIGIÓ]->(c)
      RETURN c,
             collect(DISTINCT g.nombre) AS generos,
             collect(DISTINCT d.nombre) AS directores,
             from.nombre               AS recomienda,
             from.email                AS recomiendaEmail,
             r.mensaje                 AS mensaje,
             r.fecha                   AS fecha
      ORDER BY r.fecha DESC
      LIMIT 20
    `, { email: req.params.email });

    const mapRecord = (r) => {
      const node = r.get('c');
      const p = node.properties;
      const esSerie = node.labels.includes('Serie');
      return {
        contenido: {
          id: p.id, titulo: p.titulo, anio: toNum(p.anio),
          duracion: toNum(p.duracion), imagen: p.imagen,
          generos: r.get('generos') || [],
          director: (r.get('directores') || [])[0] || null,
          tipo: esSerie ? 'Serie' : 'Película',
          ...(esSerie ? { temporadas: toNum(p.temporadas) } : {}),
        },
        recomienda: r.get('recomienda'),
        recomiendaEmail: r.get('recomiendaEmail'),
        mensaje: r.get('mensaje'),
        fecha: r.get('fecha'),
      };
    };

    res.json(records.map(mapRecord));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recommendations/:email — contenido bien calificado por amigos
router.get('/:email', async (req, res) => {
  try {
    // ── Películas recomendadas por amigos ─────────────────────────────────
    // Nota: ORDER BY c.puntuacion DESC va dentro de cada subquery, luego
    // unificamos y reordenamos en JS para evitar ORDER BY duplicado.
    const moviesRecords = await query(`
      MATCH (yo:Usuario {email: $email})-[:ES_AMIGO_DE]->(amigo:Usuario)-[c:CALIFICÓ]->(p:Pelicula)
      WHERE NOT (yo)-[:CALIFICÓ]->(p) AND c.puntuacion >= 7
      WITH p, amigo, c
      OPTIONAL MATCH (p)-[:PERTENECE_A]->(g:Genero)
      OPTIONAL MATCH (d:Director)-[:DIRIGIÓ]->(p)
      RETURN p,
             collect(DISTINCT g.nombre) AS generos,
             collect(DISTINCT d.nombre) AS directores,
             amigo.nombre               AS recomienda,
             amigo.email                AS recomiendaEmail,
             c.puntuacion               AS puntuacion,
             c.resena                   AS resena,
             'Película'                 AS tipo
      LIMIT 15
    `, { email: req.params.email });

    // ── Series recomendadas por amigos ────────────────────────────────────
    const seriesRecords = await query(`
      MATCH (yo:Usuario {email: $email})-[:ES_AMIGO_DE]->(amigo:Usuario)-[c:CALIFICÓ]->(s:Serie)
      WHERE NOT (yo)-[:CALIFICÓ]->(s) AND c.puntuacion >= 7
      WITH s, amigo, c
      OPTIONAL MATCH (s)-[:PERTENECE_A]->(g:Genero)
      OPTIONAL MATCH (d:Director)-[:DIRIGIÓ]->(s)
      RETURN s AS p,
             collect(DISTINCT g.nombre) AS generos,
             collect(DISTINCT d.nombre) AS directores,
             amigo.nombre               AS recomienda,
             amigo.email                AS recomiendaEmail,
             c.puntuacion               AS puntuacion,
             c.resena                   AS resena,
             'Serie'                    AS tipo
      LIMIT 15
    `, { email: req.params.email });

    const mapRecord = (r) => {
      const p = r.get('p').properties;
      const tipo = r.get('tipo');
      return {
        contenido: {
          id: p.id, titulo: p.titulo, anio: toNum(p.anio),
          duracion: toNum(p.duracion), imagen: p.imagen,
          generos: r.get('generos') || [],
          director: (r.get('directores') || [])[0] || null,
          tipo,
          ...(tipo === 'Serie' ? { temporadas: toNum(p.temporadas) } : {}),
        },
        recomienda: r.get('recomienda'),
        recomiendaEmail: r.get('recomiendaEmail'),
        puntuacion: toNum(r.get('puntuacion')),
        resena: r.get('resena'),
      };
    };

    // Unificamos y ordenamos por puntuación en JS (sin ORDER BY duplicado en Cypher)
    const all = [...moviesRecords.map(mapRecord), ...seriesRecords.map(mapRecord)]
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 20);

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
