const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('./logger');
const ApiResponse = require('./apiResponse');

/**
 * Genera un token de acceso JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} [expiresIn] - Tiempo de expiración del token (ej: '1h', '7d')
 * @returns {string} - Token JWT firmado
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  try {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  } catch (error) {
    logger.error('Error al generar token JWT', { error: error.message });
    throw new Error('Error al generar el token de autenticación');
  }
};

/**
 * Genera un token de actualización JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} - Token de actualización JWT firmado
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, config.jwt.refreshSecret, { 
      expiresIn: config.jwt.refreshExpiresIn 
    });
  } catch (error) {
    logger.error('Error al generar token de actualización', { error: error.message });
    throw new Error('Error al generar el token de actualización');
  }
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @param {boolean} [isRefreshToken=false] - Indica si es un token de actualización
 * @returns {Object} - Datos decodificados del token
 */
const verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.secret;
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Error al verificar token JWT', { 
      error: error.message,
      tokenType: isRefreshToken ? 'refresh' : 'access'
    });
    
    if (error.name === 'TokenExpiredError') {
      const error = new Error('Token expirado');
      error.name = 'TokenExpiredError';
      throw error;
    }
    
    const authError = new Error('Token inválido');
    authError.name = 'JsonWebTokenError';
    throw authError;
  }
};

/**
 * Middleware para verificar la autenticación JWT
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const authenticateJWT = (req, res, next) => {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Token de autenticación no proporcionado');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar y decodificar el token
      const decoded = verifyToken(token);
      
      // Adjuntar los datos del usuario al objeto de solicitud
      req.user = decoded;
      
      // Registrar la autenticación exitosa
      logger.info('Autenticación exitosa', { userId: decoded.userId });
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Sesión expirada, por favor inicia sesión nuevamente');
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error en autenticación JWT', { error: error.message });
    return ApiResponse.unauthorized(res, 'No autorizado - Token inválido');
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param {Array} allowedRoles - Roles permitidos para acceder a la ruta
 * @returns {Function} - Middleware de verificación de roles
 */
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'No autenticado');
      }
      
      const userRole = req.user.role || 'user';
      
      if (!allowedRoles.includes(userRole)) {
        return ApiResponse.forbidden(
          res, 
          'No tienes permiso para acceder a este recurso'
        );
      }
      
      next();
    } catch (error) {
      logger.error('Error en verificación de roles', { error: error.message });
      return ApiResponse.error(res, 'Error de autorización', 500);
    }
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticateJWT,
  checkRole,
};
