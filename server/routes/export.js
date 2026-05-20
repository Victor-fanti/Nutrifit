const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY id ASC', [], (err, rows)=>{
    if(err) return res.status(500).json({ error: err.message });
    const header = ['id','name','birthdate','sex','height_cm','weight_kg','allergies','objective','notes','created_at'];
    const csv = [header.join(',')].concat(rows.map(r => [r.id,escapeCsv(r.name),r.birthdate,r.sex,r.height_cm,r.weight_kg,escapeCsv(r.allergies),escapeCsv(r.objective),escapeCsv(r.notes),r.created_at].join(','))).join('\n');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="clients.csv"');
    res.send(csv);
  });
});

function escapeCsv(v){
  if(v==null) return '';
  return '"'+String(v).replace(/"/g,'""')+'"';
}

module.exports = router;
