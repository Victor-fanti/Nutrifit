const express = require('express');
const router = express.Router();
const db = require('../db');

// List meal plans for client
router.get('/client/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  db.all('SELECT * FROM meal_plans WHERE client_id = ? ORDER BY created_at DESC', [clientId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create meal plan
router.post('/', (req, res) => {
  const { client_id, name, description, daily_calories, protein_g, carbs_g, fat_g } = req.body;
  if (!client_id || !name) return res.status(400).json({ error: 'Missing required fields' });

  const stmt = `INSERT INTO meal_plans (client_id, name, description, daily_calories, protein_g, carbs_g, fat_g) VALUES (?,?,?,?,?,?,?)`;
  db.run(stmt, [client_id, name, description, daily_calories, protein_g, carbs_g, fat_g], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM meal_plans WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

// Update meal plan
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, description, daily_calories, protein_g, carbs_g, fat_g } = req.body;
  const stmt = `UPDATE meal_plans SET name=?, description=?, daily_calories=?, protein_g=?, carbs_g=?, fat_g=? WHERE id=?`;
  db.run(stmt, [name, description, daily_calories, protein_g, carbs_g, fat_g, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM meal_plans WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json(row);
    });
  });
});

// Delete meal plan
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM meal_plans WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
