require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');

// Inicializar la aplicación Express
const app = express();

// Configuración de middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Importar rutas
const healthRoutes = require('./routes/health.routes');

// Rutas de la API
app.use('/api/health', healthRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Puerto del servidor
const PORT = process.env.PORT || 3001;

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
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Servidor iniciado en modo ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Estado: http://localhost:${PORT}/api/health`);
      console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
