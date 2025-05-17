const logger = require('./logger');

/**
 * Formatea una respuesta de error estandarizada
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Error} [error] - Objeto de error opcional
 * @returns {Object} - Objeto de error formateado
 */
const formatError = (message, statusCode = 500, error = null) => {
  const errorObj = {
    success: false,
    message,
    statusCode,
  };

  // En desarrollo, incluir detalles del error
  if (process.env.NODE_ENV === 'development' && error) {
    errorObj.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return errorObj;
};

/**
 * Maneja errores asíncronos en controladores de Express
 * @param {Function} fn - Función del controlador asíncrono
 * @returns {Function} - Función de middleware de Express
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    logger.error('Error en controlador asíncrono', { 
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';
    
    res.status(statusCode).json(formatError(message, statusCode, error));
  });
};

/**
 * Valida un ID de MongoDB
 * @param {string} id - ID a validar
 * @returns {boolean} - True si el ID es válido, false en caso contrario
 */
const isValidObjectId = (id) => {
  // Expresión regular para validar un ID de MongoDB
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

/**
 * Formatea una fecha a un formato legible
 * @param {Date} date - Fecha a formatear
 * @param {string} [format='es-ES'] - Formato de localización
 * @returns {string} - Fecha formateada
 */
const formatDate = (date, format = 'es-ES') => {
  if (!(date instanceof Date) || isNaN(date)) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat(format, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Mexico_City',
  }).format(date);
};

/**
 * Genera un código aleatorio
 * @param {number} length - Longitud del código
 * @param {boolean} [useNumbers=true] - Incluir números
 * @param {boolean} [useLetters=true] - Incluir letras
 * @param {boolean} [useSpecial=false] - Incluir caracteres especiales
 * @returns {string} - Código generado
 */
const generateRandomCode = (
  length = 8,
  useNumbers = true,
  useLetters = true,
  useSpecial = false
) => {
  let chars = '';
  let result = '';
  
  if (useNumbers) chars += '0123456789';
  if (useLetters) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  if (useSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!chars) {
    throw new Error('Debe habilitar al menos un tipo de carácter');
  }
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Elimina propiedades indefinidas o nulas de un objeto
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} - Objeto limpio
 */
const removeEmptyProperties = (obj) => {
  const newObj = { ...obj };
  
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined || newObj[key] === null) {
      delete newObj[key];
    } else if (typeof newObj[key] === 'object' && !Array.isArray(newObj[key])) {
      // Limpiar objetos anidados recursivamente
      newObj[key] = removeEmptyProperties(newObj[key]);
      
      // Si el objeto anidado está vacío después de limpiar, eliminarlo
      if (Object.keys(newObj[key]).length === 0) {
        delete newObj[key];
      }
    }
  });
  
  return newObj;
};

module.exports = {
  formatError,
  asyncHandler,
  isValidObjectId,
  formatDate,
  generateRandomCode,
  removeEmptyProperties,
};
