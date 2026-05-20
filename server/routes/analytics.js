const express = require('express');
const router = express.Router();
const db = require('../db');

// Dashboard stats
router.get('/dashboard', (req, res) => {
  Promise.all([
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM clients', (err, row) => {
        err ? reject(err) : resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM appointments WHERE status = "scheduled"', (err, row) => {
        err ? reject(err) : resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM goals WHERE achieved = 1', (err, row) => {
        err ? reject(err) : resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.all('SELECT COUNT(*) as count, CAST(date as DATE) as date FROM messages GROUP BY date ORDER BY date DESC LIMIT 7', (err, rows) => {
        err ? reject(err) : resolve(rows);
      });
    })
  ]).then(([totalClients, scheduledAppointments, achievedGoals, recentActivity]) => {
    res.json({
      totalClients,
      scheduledAppointments,
      achievedGoals,
      recentActivity: recentActivity.map(r => ({ date: r.date, count: r.count }))
    });
  }).catch(err => res.status(500).json({ error: err.message }));
});

// Weight history for client
router.get('/weight/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  db.all('SELECT weight_kg, measured_at FROM weight_history WHERE client_id = ? ORDER BY measured_at ASC', [clientId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Record weight
router.post('/weight/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  const { weight_kg } = req.body;
  if (!weight_kg) return res.status(400).json({ error: 'Missing weight_kg' });

  const stmt = `INSERT INTO weight_history (client_id, weight_kg) VALUES (?,?)`;
  db.run(stmt, [clientId, weight_kg], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM weight_history WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

// Client stats
router.get('/client/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  Promise.all([
    new Promise((resolve, reject) => {
      db.get('SELECT * FROM clients WHERE id = ?', [clientId], (err, row) => {
        err ? reject(err) : resolve(row);
      });
    }),
    new Promise((resolve, reject) => {
      db.all('SELECT weight_kg, measured_at FROM weight_history WHERE client_id = ? ORDER BY measured_at DESC LIMIT 10', [clientId], (err, rows) => {
        err ? reject(err) : resolve(rows);
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM goals WHERE client_id = ?', [clientId], (err, row) => {
        err ? reject(err) : resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM goals WHERE client_id = ? AND achieved = 1', [clientId], (err, row) => {
        err ? reject(err) : resolve(row.count);
      });
    })
  ]).then(([client, weightHistory, totalGoals, achievedGoals]) => {
    // Calcular progresso
    const weightChange = weightHistory.length >= 2 
      ? (weightHistory[weightHistory.length - 1].weight_kg - weightHistory[0].weight_kg).toFixed(2)
      : 0;
    
    res.json({
      client,
      weightHistory,
      totalGoals,
      achievedGoals,
      weightChange
    });
  }).catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
