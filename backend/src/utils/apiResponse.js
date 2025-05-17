const logger = require('./logger');

/**
 * Clase para respuestas exitosas de la API
 */
class ApiResponse {
  /**
   * Crea una respuesta exitosa
   * @param {Object} res - Objeto de respuesta de Express
   * @param {*} data - Datos a enviar en la respuesta
   * @param {string} message - Mensaje descriptivo
   * @param {number} statusCode - Código de estado HTTP (por defecto: 200)
   * @returns {Object} - Respuesta JSON
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
    };

    // Registrar respuesta exitosa
    logger.info(`[${statusCode}] ${message}`);
    
    return res.status(statusCode).json(response);
  }

  /**
   * Crea una respuesta de error
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP (por defecto: 500)
   * @param {Error} [error] - Objeto de error opcional
   * @returns {Object} - Respuesta JSON de error
   */
  static error(res, message = 'Error interno del servidor', statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      statusCode,
    };

    // En desarrollo, incluir detalles del error
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Registrar error
    logger.error(`[${statusCode}] ${message}`, { error });
    
    return res.status(statusCode).json(response);
  }

  /**
   * Crea una respuesta de error de validación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {Object} errors - Objeto con errores de validación
   * @param {string} message - Mensaje de error (opcional)
   * @returns {Object} - Respuesta JSON de error de validación
   */
  static validationError(res, errors, message = 'Error de validación') {
    const response = {
      success: false,
      message,
      errors,
      statusCode: 400,
    };

    // Registrar error de validación
    logger.warn(`[400] ${message}`, { errors });
    
    return res.status(400).json(response);
  }

  /**
   * Crea una respuesta de recurso no encontrado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} resource - Nombre del recurso no encontrado
   * @param {string} id - ID del recurso no encontrado (opcional)
   * @returns {Object} - Respuesta JSON de recurso no encontrado
   */
  static notFound(res, resource, id = null) {
    const message = id 
      ? `${resource} con ID ${id} no encontrado`
      : `${resource} no encontrado`;
    
    const response = {
      success: false,
      message,
      statusCode: 404,
    };

    // Registrar recurso no encontrado
    logger.warn(`[404] ${message}`);
    
    return res.status(404).json(response);
  }

  /**
   * Crea una respuesta de no autorizado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error (opcional)
   * @returns {Object} - Respuesta JSON de no autorizado
   */
  static unauthorized(res, message = 'No autorizado') {
    const response = {
      success: false,
      message,
      statusCode: 401,
    };

    // Registrar intento no autorizado
    logger.warn(`[401] ${message}`);
    
    return res.status(401).json(response);
  }

  /**
   * Crea una respuesta de permiso denegado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error (opcional)
   * @returns {Object} - Respuesta JSON de permiso denegado
   */
  static forbidden(res, message = 'Permiso denegado') {
    const response = {
      success: false,
      message,
      statusCode: 403,
    };

    // Registrar intento sin permisos
    logger.warn(`[403] ${message}`);
    
    return res.status(403).json(response);
  }
}

module.exports = ApiResponse;
