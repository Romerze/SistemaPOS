const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Configuración de la aplicación
  app: {
    name: process.env.APP_NAME || 'Sistema POS',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Configuración de la base de datos
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sistema_pos',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Habilita el borrado lógico
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  },
  
  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_jwt',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'tu_clave_secreta_refresco_jwt',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    resetPasswordExpiresIn: '1h', // Tiempo de expiración para restablecer contraseña
  },
  
  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  
  // Configuración de rate limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos por defecto
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 solicitudes por ventana
  },
  
  // Configuración de logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    errorFile: process.env.ERROR_LOG_FILE || './logs/error.log',
    maxSize: '20m',
    maxFiles: '14d',
  },
  
  // Configuración de correo electrónico
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'tu_correo@example.com',
    pass: process.env.SMTP_PASS || 'tu_contraseña',
    from: process.env.SMTP_FROM || 'Sistema POS <noreply@example.com>',
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  },
  
  // Configuración de carga de archivos
  uploads: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB por defecto
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  },
  
  // Configuración de seguridad
  security: {
    saltRounds: 10, // Para bcrypt
    requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '10kb',
    csrf: {
      enabled: process.env.CSRF_ENABLED !== 'false',
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    },
  },
  
  // Configuración de caché (opcional, para Redis)
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: 3600, // 1 hora por defecto
    type: process.env.CACHE_TYPE || 'memory', // memory o redis
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || '',
    },
  },
  
  // Configuración de almacenamiento (opcional, para AWS S3, Google Cloud Storage, etc.)
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // local, s3, gcs, etc.
    local: {
      path: './storage',
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_BUCKET_NAME || '',
    },
  },
};

// Validar configuraciones requeridas
const validateConfig = () => {
  const required = [
    { key: 'JWT_SECRET', value: config.jwt.secret },
    { key: 'JWT_REFRESH_SECRET', value: config.jwt.refreshSecret },
    { key: 'DB_HOST', value: config.db.host },
    { key: 'DB_NAME', value: config.db.database },
  ];

  const missing = required.filter(item => !item.value);
  
  if (missing.length > 0) {
    console.error('Error: Faltan las siguientes variables de entorno requeridas:');
    missing.forEach(item => console.error(`- ${item.key}`));
    process.exit(1);
  }
};

// Validar configuraciones al iniciar
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config;
