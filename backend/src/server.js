require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const path = require('path');
const { connectDB } = require('./config/database');
const config = require('./config/config');
const logger = require('./utils/logger');
const { globalErrorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { UPLOAD_DIR } = require('./utils/fileUpload');

// Inicializar la aplicación Express
const app = express();

// Configurar el directorio de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para logger de peticiones HTTP
app.use((req, res, next) => {
  logger.http(`[${req.method}] ${req.originalUrl}`, {
    ip: req.ip,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
});

// Configuración de middlewares
app.use(helmet()); // Seguridad HTTP

// Configuración de CORS
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
}));

// Limitar peticiones para prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
  handler: (req, res) => {
    logger.warn(`Límite de tasa excedido para la IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
    });
  },
});

app.use(limiter);

// Logs HTTP en desarrollo usando morgan
if (process.env.NODE_ENV === 'development') {
  app.use(
    morgan('dev', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

// Parsear JSON y URL-encoded
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Importar rutas
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes/api');

// Importar utilidades
const { asyncHandler } = require('./utils/common');

// Ruta de documentación de la API (se implementará más adelante)
app.get('/api-docs', (req, res) => {
  res.send('Documentación de la API (próximamente)');
});

// Rutas de la API
app.use('/api/health', healthRoutes);
app.use('/api/v1', apiRoutes); // Prefijo para la API v1

// Manejar rutas no encontradas (404)
app.use(notFoundHandler);

// Manejador global de errores
app.use(globalErrorHandler);

// Puerto del servidor
const PORT = config.port;

// Ruta para probar manejo de errores (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  // Ruta para probar errores
  app.get('/error-test', (req, res) => {
    // Esto generará un error intencional para probar el manejador de errores
    throw new Error('Este es un error de prueba');
  });
  
  // Ruta para probar la carga de archivos
  app.post('/upload-test', asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file) {
      throw new Error('No se ha subido ningún archivo');
    }
    
    const file = req.files.file;
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    await file.mv(filePath);
    
    res.json({
      success: true,
      message: 'Archivo subido correctamente',
      file: {
        name: file.name,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${fileName}`
      }
    });
  }));
}

// Ruta raíz
app.get('/', (req, res) => {
  res.send(`
    <div style="text-align: center; margin-top: 50px;">
      <h1>🚀 SistemaPOS Backend</h1>
      <p>API REST para el Sistema de Punto de Venta</p>
      <div style="margin-top: 30px;">
        <a href="/api/health" style="margin: 0 10px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verificar Estado</a>
        <a href="/api-docs" style="margin: 0 10px; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Ver Documentación</a>
      </div>
    </div>
  `);
});

// Iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    const server = app.listen(PORT, () => {
      logger.info('\n' + '='.repeat(60));
      logger.info(`🚀 Servidor iniciado en modo ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`📊 Estado: http://localhost:${PORT}/api/health`);
      logger.info(`📚 Documentación: http://localhost:${PORT}/api-docs`);
      logger.info('='.repeat(60) + '\n');
    });

    // Manejadores de cierre elegante
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          logger.info('Servidor cerrado');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error) => {
      logger.error('Error no manejado:', error);
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      logger.info('SIGTERM recibido');
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
