const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @route   GET /api/
 * @desc    Ruta raíz de la API
 * @access  Público
 */
router.get('/', (req, res) => {
  const apiInfo = {
    name: 'SistemaPOS API',
    version: '1.0.0',
    description: 'API para el Sistema de Punto de Venta',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      sales: '/api/v1/sales',
      customers: '/api/v1/customers',
    },
    documentation: '/api-docs',
  };

  logger.info('Acceso a la raíz de la API');
  
  return res.status(200).json({
    success: true,
    data: apiInfo,
  });
});

// Importar y configurar rutas de autenticación
// const authRoutes = require('./auth.routes');
// router.use('/auth', authRoutes);

// Importar y configurar rutas de usuarios
// const userRoutes = require('./user.routes');
// router.use('/users', userRoutes);

// Importar y configurar rutas de productos
// const productRoutes = require('./product.routes');
// router.use('/products', productRoutes);

// Importar y configurar rutas de categorías
// const categoryRoutes = require('./category.routes');
// router.use('/categories', categoryRoutes);

// Importar y configurar rutas de ventas
// const saleRoutes = require('./sale.routes');
// router.use('/sales', saleRoutes);

// Importar y configurar rutas de clientes
// const customerRoutes = require('./customer.routes');
// router.use('/customers', customerRoutes);

module.exports = router;
