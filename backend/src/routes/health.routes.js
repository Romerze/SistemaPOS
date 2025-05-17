const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/health.controller');
const { validate } = require('../middlewares/validation.middleware');

// Esquema de validación para parámetros de consulta (si es necesario)
const healthCheckSchema = {
  // Ejemplo: validar un parámetro de consulta opcional
  // timestamp: {
  //   in: ['query'],
  //   optional: true,
  //   isBoolean: true,
  //   toBoolean: true,
  //   errorMessage: 'El parámetro timestamp debe ser un valor booleano',
  // },
};

/**
 * @route   GET /api/health
 * @desc    Verifica el estado del servidor
 * @access  Público
 */
router.get('/', validate(healthCheckSchema), getHealth);

module.exports = router;
