const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Verifica el estado del servidor
 * @route   GET /api/health
 * @access  Público
 */
const getHealth = (req, res) => {
  try {
    const healthData = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // Esto se puede mejorar verificando la conexión real a la base de datos
      version: process.env.npm_package_version || '1.0.0',
    };

    // Registrar el estado de salud
    logger.info('Verificación de salud del servidor', healthData);
    
    // Enviar respuesta exitosa
    return ApiResponse.success(res, healthData, 'Servidor funcionando correctamente');
  } catch (error) {
    // Registrar el error
    logger.error('Error en la verificación de salud', { error: error.message });
    
    // Enviar respuesta de error
    return ApiResponse.error(
      res, 
      'Error en la verificación de salud del servidor', 
      503, 
      process.env.NODE_ENV === 'development' ? error : null
    );
  }
};

// Función para verificar la conexión a la base de datos (opcional)
async function checkDatabaseConnection() {
  try {
    // Aquí iría la lógica para verificar la conexión a la base de datos
    // Por ejemplo, ejecutar una consulta simple como 'SELECT 1'
    return { status: 'connected' };
  } catch (error) {
    logger.error('Error de conexión a la base de datos', { error: error.message });
    return { status: 'disconnected', error: error.message };
  }
}

module.exports = {
  getHealth,
};
