/**
 * @desc    Verifica el estado del servidor
 * @route   GET /api/health
 * @access  Público
 */
const getHealth = (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
};

module.exports = {
  getHealth,
};
