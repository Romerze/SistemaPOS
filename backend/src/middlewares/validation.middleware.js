const { validationResult, checkSchema } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware para validar los datos de entrada según un esquema
 * @param {Object} schema - Esquema de validación de express-validator
 * @returns {Array} - Middleware de validación
 */
const validate = (schema) => {
  return [
    // Validar según el esquema
    checkSchema(schema),
    
    // Middleware para manejar los resultados de la validación
    (req, res, next) => {
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        return next();
      }
      
      // Formatear errores para la respuesta
      const formattedErrors = {};
      errors.array().forEach(error => {
        const { param, msg } = error;
        if (!formattedErrors[param]) {
          formattedErrors[param] = [];
        }
        formattedErrors[param].push(msg);
      });
      
      return ApiResponse.validationError(res, formattedErrors);
    },
  ];
};

/**
 * Middleware para validar parámetros de paginación
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return ApiResponse.error(
      res, 
      'El parámetro "page" debe ser un número mayor o igual a 1',
      400
    );
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return ApiResponse.error(
      res, 
      'El parámetro "limit" debe ser un número entre 1 y 100',
      400
    );
  }
  
  // Asignar valores validados a req.pagination
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
  
  next();
};

/**
 * Middleware para validar parámetros de ordenamiento
 * @param {Array} allowedFields - Campos permitidos para ordenar
 * @returns {Function} - Middleware de validación
 */
const validateSorting = (allowedFields = []) => {
  return (req, res, next) => {
    const { sortBy = 'createdAt', order = 'asc' } = req.query;
    
    // Validar campo de ordenamiento
    if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
      return ApiResponse.error(
        res,
        `El campo de ordenamiento debe ser uno de: ${allowedFields.join(', ')}`,
        400
      );
    }
    
    // Validar dirección de ordenamiento
    const orderLower = order.toLowerCase();
    if (orderLower !== 'asc' && orderLower !== 'desc') {
      return ApiResponse.error(
        res,
        'La dirección de ordenamiento debe ser "asc" o "desc"',
        400
      );
    }
    
    // Asignar valores validados a req.sorting
    req.sorting = {
      sortBy,
      order: orderLower,
    };
    
    next();
  };
};

module.exports = {
  validate,
  validatePagination,
  validateSorting,
  validationResult,
};
