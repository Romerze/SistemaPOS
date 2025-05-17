const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/health.controller');

/**
 * @route   GET /api/health
 * @desc    Verifica el estado del servidor
 * @access  Público
 */
router.get('/', getHealth);

module.exports = router;
