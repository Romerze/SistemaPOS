const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const ApiResponse = require('./apiResponse');

// Directorio para almacenar archivos subidos
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Asegurarse de que el directorio de subidas exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

// Tamaño máximo de archivo en bytes (por defecto 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Genera un nombre de archivo único
 * @param {string} originalName - Nombre original del archivo
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {string} - Nuevo nombre de archivo
 */
const generateUniqueFilename = (originalName, mimeType) => {
  const extension = ALLOWED_MIME_TYPES[mimeType] || path.extname(originalName).slice(1) || 'bin';
  const uniqueId = uuidv4();
  return `${uniqueId}.${extension}`;
};

/**
 * Middleware para manejar la carga de archivos
 * @param {string} fieldName - Nombre del campo del formulario que contiene el archivo
 * @param {Array} [allowedTypes] - Tipos MIME permitidos (opcional, por defecto todos los permitidos)
 * @param {number} [maxSize] - Tamaño máximo en bytes (opcional, por defecto 5MB)
 * @returns {Function} - Middleware de Express
 */
const fileUploadMiddleware = (
  fieldName,
  allowedTypes = Object.keys(ALLOWED_MIME_TYPES),
  maxSize = MAX_FILE_SIZE
) => {
  return (req, res, next) => {
    try {
      if (!req.files || !req.files[fieldName]) {
        return next(); // No hay archivo para subir
      }

      const file = req.files[fieldName];
      
      // Validar tipo de archivo
      if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
        return ApiResponse.error(
          res,
          `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
          400
        );
      }

      // Validar tamaño de archivo
      if (file.size > maxSize) {
        return ApiResponse.error(
          res,
          `El archivo es demasiado grande. Tamaño máximo permitido: ${maxSize / (1024 * 1024)}MB`,
          400
        );
      }

      // Generar nombre de archivo único
      const filename = generateUniqueFilename(file.name, file.mimetype);
      const filePath = path.join(UPLOAD_DIR, filename);

      // Mover el archivo al directorio de subidas
      file.mv(filePath, (err) => {
        if (err) {
          logger.error('Error al guardar el archivo', { error: err.message });
          return ApiResponse.error(
            res,
            'Error al procesar el archivo',
            500
          );
        }

        // Adjuntar información del archivo al objeto de solicitud
        req.uploadedFile = {
          originalName: file.name,
          filename,
          path: filePath,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${filename}`,
        };

        next();
      });
    } catch (error) {
      logger.error('Error en el middleware de carga de archivos', { error: error.message });
      return ApiResponse.error(
        res,
        'Error al procesar el archivo',
        500,
        process.env.NODE_ENV === 'development' ? error : null
      );
    }
  };
};

/**
 * Elimina un archivo del sistema de archivos
 * @param {string} filePath - Ruta del archivo a eliminar
 * @returns {Promise<boolean>} - True si se eliminó correctamente, false en caso contrario
 */
const deleteFile = async (filePath) => {
  try {
    if (!filePath) return false;
    
    const fullPath = path.join(__dirname, '../../', filePath);
    
    // Verificar si el archivo existe
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error al eliminar el archivo', { filePath, error: error.message });
    return false;
  }
};

module.exports = {
  fileUploadMiddleware,
  deleteFile,
  UPLOAD_DIR,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
