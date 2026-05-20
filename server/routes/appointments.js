const express = require('express');
const router = express.Router();
const db = require('../db');

// List all appointments
router.get('/', (req, res) => {
  db.all('SELECT * FROM appointments ORDER BY date ASC, time ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// List appointments for client
router.get('/client/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  db.all('SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC, time DESC', [clientId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create appointment
router.post('/', (req, res) => {
  const { client_id, date, time, type, notes } = req.body;
  if (!client_id || !date || !time) return res.status(400).json({ error: 'Missing required fields' });

  const stmt = `INSERT INTO appointments (client_id, date, time, type, notes) VALUES (?,?,?,?,?)`;
  db.run(stmt, [client_id, date, time, type || 'consulta', notes], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM appointments WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

// Update appointment
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { date, time, type, notes, status } = req.body;
  const stmt = `UPDATE appointments SET date=?, time=?, type=?, notes=?, status=? WHERE id=?`;
  db.run(stmt, [date, time, type, notes, status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM appointments WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json(row);
    });
  });
});

// Delete appointment
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
