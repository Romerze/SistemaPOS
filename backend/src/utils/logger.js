const winston = require('winston');
const { format, transports } = winston;
const path = require('path');
const config = require('../config/config');

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para la consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Añadir colores a winston
winston.addColors(colors);

// Formato personalizado para los logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
  format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message} ${
        info.stack ? '\n' + info.stack : ''
      }`
  )
);

// Configurar los transportes (consola y archivos)
const transportsList = [
  // Transporte para consola
  new transports.Console({
    format: format.combine(
      format.colorize({ all: true }),
      format.printf(
        (info) =>
          `${info.timestamp} ${info.level}: ${info.message} ${
            info.stack ? '\n' + info.stack : ''
          }`
      )
    ),
  }),
  // Transporte para archivo de errores
  new transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: logFormat,
  }),
  // Transporte para todos los logs
  new transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: logFormat,
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: config.logLevel || 'info',
  levels,
  format: logFormat,
  transports: transportsList,
  exitOnError: false, // No salir en excepciones manejadas
});

// Si no estamos en producción, también mostramos los logs de debug
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
      level: 'debug',
    })
  );
}

// Manejador para excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  // No salir en desarrollo para permitir la depuración
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

// Manejador para promesas rechazadas no manejadas
process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
  // No salir en desarrollo para permitir la depuración
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

module.exports = logger;
