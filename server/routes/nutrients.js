const express = require('express');
const router = express.Router();

// POST /api/nutrients
// body: { weight_kg, age, sex ('M'|'F'), activityLevel, goal ('loss'|'maintain'|'gain') }
router.post('/', (req, res) => {
  const { weight_kg, age, sex, activityLevel, goal } = req.body;
  if (!weight_kg || !age || !sex || !activityLevel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Estimativa de TMB (Mifflin-St Jeor)
  const height_cm = 170; // Usar um padrão ou receber como parâmetro
  let tmb = 10 * weight_kg + 6.25 * height_cm - 5 * age + (sex === 'M' ? 5 : -161);
  tmb = Math.round(tmb);

  // Fator de atividade
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  let maintenance = Math.round(tmb * multiplier);

  // Ajuste por objetivo
  let dailyCalories = maintenance;
  if (goal === 'loss') dailyCalories = Math.round(maintenance * 0.85); // -15%
  if (goal === 'gain') dailyCalories = Math.round(maintenance * 1.1);   // +10%

  // Macronutrientes (em percentual calórico)
  // Padrão: 30% proteína, 40% carboidratos, 30% gordura
  const protein_g = Math.round((dailyCalories * 0.30) / 4);
  const carbs_g = Math.round((dailyCalories * 0.40) / 4);
  const fat_g = Math.round((dailyCalories * 0.30) / 9);

  res.json({
    tmb,
    maintenance,
    dailyCalories,
    protein_g,
    carbs_g,
    fat_g,
    goal
  });
});

module.exports = router;
