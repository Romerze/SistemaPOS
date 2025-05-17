import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import { createNamespace } from 'cls-hooked';

// Configurar el namespace para transacciones
const namespace = createNamespace('sequelize-namespace');
Sequelize.useCLS(namespace);

// Configuración de Sequelize para migraciones
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  }
);

// Función para cargar un modelo
async function loadModel(modelPath, modelName) {
  const modelModule = await import(modelPath);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  console.log(`✅ Modelo ${modelName} cargado correctamente.`);
  return model;
}

// Función para ejecutar migraciones
async function runMigrations() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    console.log('🔄 Cargando modelos...');
    
    // Cargar modelos en el orden correcto para evitar problemas de dependencia
    const Role = await loadModel('../models/role.model.js', 'Role');
    const Permission = await loadModel('../models/permission.model.js', 'Permission');
    const User = await loadModel('../models/user.model.js', 'User');
    const RefreshToken = await loadModel('../models/refreshToken.model.js', 'RefreshToken');
    
    console.log('🔄 Estableciendo asociaciones...');
    
    // Establecer asociaciones manualmente
    User.belongsToMany(Role, {
      through: 'user_roles',
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles'
    });

    Role.belongsToMany(User, {
      through: 'user_roles',
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users'
    });

    Role.belongsToMany(Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });

    Permission.belongsToMany(Role, {
      through: 'role_permissions',
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles'
    });

    User.hasMany(RefreshToken, {
      foreignKey: 'user_id',
      as: 'refreshTokens'
    });

    RefreshToken.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    console.log('✅ Asociaciones establecidas correctamente.');
    
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ alter: true });
    
    console.log('✅ Migraciones ejecutadas correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
  }
}

// Ejecutar migraciones
runMigrations();
