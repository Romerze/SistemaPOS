const bcrypt = require('bcryptjs');
const logger = require('./logger');

// Número de rondas de sal para el hashing (mayor es más seguro pero más lento)
const SALT_ROUNDS = 10;

/**
 * Encripta una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error('No se proporcionó una contraseña para hashear');
    }
    
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    logger.error('Error al hashear contraseña', { error: error.message });
    throw new Error('Error al procesar la contraseña');
  }
};

/**
 * Compara una contraseña en texto plano con un hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash de la contraseña almacenada
 * @returns {Promise<boolean>} - True si coinciden, false en caso contrario
 */
const comparePasswords = async (password, hash) => {
  try {
    if (!password || !hash) {
      throw new Error('Faltan credenciales para la comparación');
    }
    
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    logger.error('Error al comparar contraseñas', { error: error.message });
    throw new Error('Error al verificar la contraseña');
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
};
