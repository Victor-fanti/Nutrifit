const express = require('express');
const router = express.Router();

// POST /api/calculations
// body: { height_cm, weight_kg, age, sex ('M'|'F'), activityLevel }
router.post('/', (req, res) => {
  const { height_cm, weight_kg, age, sex, activityLevel } = req.body;
  if(!height_cm || !weight_kg || !age || !sex) return res.status(400).json({ error: 'Missing parameters' });

  // IMC
  const height_m = height_cm / 100;
  const imc = +(weight_kg / (height_m * height_m)).toFixed(2);

  // TMB (Mifflin-St Jeor)
  // Men: 10*w + 6.25*h - 5*a + 5
  // Women: 10*w + 6.25*h - 5*a - 161
  let tmb = 10 * weight_kg + 6.25 * height_cm - 5 * age + (sex === 'M' ? 5 : -161);
  tmb = Math.round(tmb);

  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const maintenanceCalories = Math.round(tmb * multiplier);

  res.json({ imc, tmb, maintenanceCalories });
});

module.exports = router;
