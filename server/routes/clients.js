const express = require('express');
const router = express.Router();
const db = require('../db');

// List clients
router.get('/', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create client
router.post('/', (req, res) => {
  const { name, birthdate, sex, height_cm, weight_kg, allergies, objective, notes } = req.body;
  const stmt = `INSERT INTO clients (name,birthdate,sex,height_cm,weight_kg,allergies,objective,notes) VALUES (?,?,?,?,?,?,?,?)`;
  db.run(stmt, [name, birthdate, sex, height_cm, weight_kg, allergies, objective, notes], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (e,row)=>{
      if(e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

// Get client
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM clients WHERE id = ?', [id], (err,row) => {
    if(err) return res.status(500).json({ error: err.message });
    if(!row) return res.status(404).json({ error: 'Client not found' });
    res.json(row);
  });
});

// Update client
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, birthdate, sex, height_cm, weight_kg, allergies, objective, notes } = req.body;
  const stmt = `UPDATE clients SET name=?,birthdate=?,sex=?,height_cm=?,weight_kg=?,allergies=?,objective=?,notes=? WHERE id=?`;
  db.run(stmt, [name, birthdate, sex, height_cm, weight_kg, allergies, objective, notes, id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM clients WHERE id = ?', [id], (e,row)=>{
      if(e) return res.status(500).json({ error: e.message });
      res.json(row);
    });
  });
});

// Delete client
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM clients WHERE id = ?', [id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Goals for client
router.get('/:id/goals', (req, res) => {
  const id = req.params.id;
  db.all('SELECT * FROM goals WHERE client_id = ? ORDER BY id DESC', [id], (err,rows)=>{
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/:id/goals', (req, res) => {
  const client_id = req.params.id;
  const { title, target_date, target_weight, notes } = req.body;
  const stmt = `INSERT INTO goals (client_id,title,target_date,target_weight,notes) VALUES (?,?,?,?,?)`;
  db.run(stmt, [client_id,title,target_date,target_weight,notes], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM goals WHERE id = ?', [this.lastID], (e,row)=>{
      if(e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

router.delete('/:id/goals/:goalId', (req, res) => {
  const { id, goalId } = req.params;
  db.run('DELETE FROM goals WHERE id = ? AND client_id = ?', [goalId, id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Messages (chat) for client
router.get('/:id/messages', (req, res) => {
  const id = req.params.id;
  db.all('SELECT * FROM messages WHERE client_id = ? ORDER BY id ASC', [id], (err,rows)=>{
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/:id/messages', (req, res) => {
  const client_id = req.params.id;
  const { sender, message } = req.body;
  const stmt = `INSERT INTO messages (client_id,sender,message) VALUES (?,?,?)`;
  db.run(stmt, [client_id,sender,message], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM messages WHERE id = ?', [this.lastID], (e,row)=>{
      if(e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

module.exports = router;
