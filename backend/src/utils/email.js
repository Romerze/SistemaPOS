const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const config = require('../config/config');
const logger = require('./logger');

class EmailService {
  constructor() {
    // Configuración del transporte de correo
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // true para 465, false para otros puertos
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      tls: {
        // No fallar en certificados inválidos (útil para desarrollo)
        rejectUnauthorized: process.env.NODE_ENV !== 'production',
      },
    });

    // Verificar la conexión al servicio de correo
    this.verifyConnection();
  }

  /**
   * Verifica la conexión con el servidor SMTP
   */
  async verifyConnection() {
    try {
      const isConnected = await this.transporter.verify();
      if (isConnected) {
        logger.info('Conexión con el servidor SMTP establecida correctamente');
      }
    } catch (error) {
      logger.error('Error al conectar con el servidor SMTP', { error: error.message });
    }
  }

  /**
   * Renderiza una plantilla de correo electrónico
   * @param {string} templateName - Nombre del archivo de plantilla (sin extensión)
   * @param {Object} data - Datos para renderizar en la plantilla
   * @returns {Promise<string>} - HTML renderizado
   */
  async renderTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(__dirname, `../views/emails/${templateName}.ejs`);
      const template = await fs.readFile(templatePath, 'utf-8');
      return ejs.render(template, { ...data, config });
    } catch (error) {
      logger.error('Error al renderizar la plantilla de correo', { 
        templateName, 
        error: error.message 
      });
      throw new Error('Error al procesar la plantilla de correo');
    }
  }

  /**
   * Envía un correo electrónico
   * @param {Object} options - Opciones del correo
   * @param {string|Array} options.to - Destinatario(s)
   * @param {string} options.subject - Asunto del correo
   * @param {string} options.template - Nombre de la plantilla
   * @param {Object} options.context - Datos para la plantilla
   * @param {Array} options.attachments - Archivos adjuntos
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendEmail({
    to,
    subject,
    template,
    context = {},
    attachments = [],
  }) {
    try {
      // Renderizar la plantilla de correo
      const html = await this.renderTemplate(template, context);
      
      // Configuración del correo
      const mailOptions = {
        from: config.smtp.from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments,
      };

      // Enviar el correo
      const info = await this.transporter.sendMail(mailOptions);
      
      // Registrar el envío exitoso
      logger.info('Correo electrónico enviado correctamente', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject,
      });

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      // Registrar el error
      logger.error('Error al enviar el correo electrónico', {
        to,
        subject,
        error: error.message,
        stack: error.stack,
      });

      throw new Error('Error al enviar el correo electrónico');
    }
  }

  /**
   * Envía un correo de bienvenida
   * @param {string} to - Correo del destinatario
   * @param {string} name - Nombre del usuario
   * @param {string} [token] - Token de verificación (opcional)
   */
  async sendWelcomeEmail(to, name, token = null) {
    const subject = `¡Bienvenido a ${config.app.name}!`;
    const verificationLink = token 
      ? `${config.app.url}/verificar-email?token=${token}`
      : null;

    return this.sendEmail({
      to,
      subject,
      template: 'welcome',
      context: { 
        name, 
        verificationLink,
        appName: config.app.name,
        supportEmail: config.smtp.from,
      },
    });
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   * @param {string} to - Correo del destinatario
   * @param {string} name - Nombre del usuario
   * @param {string} token - Token para restablecer la contraseña
   */
  async sendPasswordResetEmail(to, name, token) {
    const resetLink = `${config.app.url}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to,
      subject: `Restablecer tu contraseña en ${config.app.name}`,
      template: 'password-reset',
      context: { 
        name, 
        resetLink,
        appName: config.app.name,
        supportEmail: config.smtp.from,
      },
    });
  }

  /**
   * Envía un correo de notificación
   * @param {string} to - Correo del destinatario
   * @param {string} subject - Asunto del correo
   * @param {string} message - Mensaje de notificación
   * @param {string} [actionUrl] - URL de acción (opcional)
   * @param {string} [actionText] - Texto del botón de acción (opcional)
   */
  async sendNotificationEmail(to, subject, message, actionUrl = null, actionText = null) {
    return this.sendEmail({
      to,
      subject,
      template: 'notification',
      context: { 
        message,
        actionUrl,
        actionText,
        appName: config.app.name,
        supportEmail: config.smtp.from,
      },
    });
  }
}

// Exportar una instancia del servicio de correo
module.exports = new EmailService();
