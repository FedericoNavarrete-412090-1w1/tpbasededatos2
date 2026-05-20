import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

function toNum(v) {
  return v && typeof v.toNumber === 'function' ? v.toNumber() : v;
}

// GET /api/comments/:type/:id — obtener comentarios de una película o serie
router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const label = type === 'series' ? 'Serie' : 'Pelicula';
  try {
    const records = await query(`
      MATCH (u:Usuario)-[r:COMENTÓ]->(c:${label} {id: $id})
      RETURN u.nombre AS nombre, u.email AS email, r.mensaje AS mensaje, r.fecha AS fecha, r.commentId AS commentId
      ORDER BY r.fecha DESC
      LIMIT 50
    `, { id });
    res.json(records.map(r => ({
      nombre: r.get('nombre'),
      email: r.get('email'),
      mensaje: r.get('mensaje'),
      fecha: r.get('fecha'),
      commentId: r.get('commentId'),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments/:type/:id — agregar comentario
router.post('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { email, mensaje } = req.body;
  if (!email || !mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'email y mensaje son obligatorios' });
  }
  const label = type === 'series' ? 'Serie' : 'Pelicula';
  const commentId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  try {
    await query(`
      MATCH (u:Usuario {email: $email})
      MATCH (c:${label} {id: $id})
      CREATE (u)-[:COMENTÓ {commentId: $commentId, mensaje: $mensaje, fecha: $fecha}]->(c)
    `, { email, id, commentId, mensaje: mensaje.trim(), fecha: new Date().toISOString() });
    res.json({ ok: true, commentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:type/:id/:commentId/:email — eliminar un comentario (solo el autor)
router.delete('/:type/:id/:commentId/:email', async (req, res) => {
  const { type, id, commentId, email } = req.params;
  const label = type === 'series' ? 'Serie' : 'Pelicula';
  try {
    const result = await query(`
      MATCH (u:Usuario {email: $email})-[r:COMENTÓ {commentId: $commentId}]->(c:${label} {id: $id})
      DELETE r
      RETURN count(r) AS deleted
    `, { email, id, commentId });
    const deleted = toNum(result[0]?.get('deleted') || 0);
    if (deleted === 0) return res.status(404).json({ error: 'Comentario no encontrado o no autorizado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
