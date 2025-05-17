const { StatusCodes } = require('http-status-codes');
const { ValidationError } = require('express-validator');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

// Clase personalizada para errores de la aplicación
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Manejador de errores global
exports.globalErrorHandler = (err, req, res, next) => {
  // Establecer valores por defecto
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';
  
  // Determinar si la respuesta debe ser en JSON o HTML
  const acceptsHTML = req.accepts('html') === 'html';
  const sendError = (status, message, error = {}) => {
    if (acceptsHTML) {
      // Si el cliente acepta HTML, renderizar la plantilla de error
      res.status(status).render('error', {
        status,
        message,
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    } else {
      // Si no, enviar JSON
      res.status(status).json({
        status: status >= 500 ? 'error' : 'fail',
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  };

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // Manejar diferentes tipos de errores
  // Errores de validación (express-validator)
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    const errors = {};
    err.forEach((error) => {
      if (!errors[error.param]) {
        errors[error.param] = [];
      }
      errors[error.param].push(error.msg);
    });

    if (req.accepts('html') === 'html') {
      return res.status(StatusCodes.BAD_REQUEST).render('error', {
        status: StatusCodes.BAD_REQUEST,
        message: 'Error de validación',
        errors: { validation: errors },
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: 'Error de validación',
      errors,
    });
  }

  // Errores de JWT
  if (err instanceof JsonWebTokenError) {
    return sendError(
      StatusCodes.UNAUTHORIZED,
      'Token inválido o expirado',
      err
    );
  }

  if (err instanceof TokenExpiredError) {
    return sendError(
      StatusCodes.UNAUTHORIZED,
      'Sesión expirada, por favor inicia sesión nuevamente',
      err
    );
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      StatusCodes.BAD_REQUEST,
      'JSON inválido en el cuerpo de la solicitud',
      err
    );
  }

  // Error 404
  if (err.statusCode === StatusCodes.NOT_FOUND) {
    return sendError(
      StatusCodes.NOT_FOUND,
      err.message || 'Recurso no encontrado',
      err
    );
  }

  // Error de validación de base de datos
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    err.errors.forEach((error) => {
      if (!errors[error.path]) {
        errors[error.path] = [];
      }
      errors[error.path].push(error.message);
    });

    if (req.accepts('html') === 'html') {
      return res.status(StatusCodes.BAD_REQUEST).render('error', {
        status: StatusCodes.BAD_REQUEST,
        message: 'Error de validación de datos',
        error: { validation: errors },
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: 'Error de validación de datos',
      errors,
    });
  }

  // Error de autenticación
  if (err.name === 'UnauthorizedError') {
    return sendError(
      StatusCodes.UNAUTHORIZED,
      'No autorizado. Por favor, inicia sesión para continuar.',
      err
    );
  }

  // Error de permiso denegado
  if (err.name === 'ForbiddenError') {
    return sendError(
      StatusCodes.FORBIDDEN,
      'No tienes permiso para acceder a este recurso',
      err
    );
  }

  // Error de límite de tasa
  if (err.name === 'RateLimitExceeded') {
    return sendError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Demasiadas solicitudes, por favor intente más tarde',
      err
    );
  }

  // Error genérico (500)
  logger.error('❌ Error no manejado:', err);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Lo sentimos, algo salió mal en el servidor. Por favor, inténtalo de nuevo más tarde.' 
    : err.message;
    
  sendError(
    err.statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err : undefined
  );
};

// Manejador para rutas no encontradas (404)
exports.notFoundHandler = (req, res, next) => {
  const error = new AppError(`No se encontró ${req.originalUrl} en este servidor`, StatusCodes.NOT_FOUND);
  next(error);
};

// Función para manejar errores asíncronos
exports.catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

// Exportar la clase AppError para usarla en otros archivos
module.exports.AppError = AppError;
