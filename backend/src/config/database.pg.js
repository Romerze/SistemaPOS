const { Pool } = require('pg');
const config = require('./config');

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
});

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Base de datos conectada correctamente');
    
    // Verificar la conexión con una consulta simple
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('🔍 Tablas disponibles en la base de datos:');
    const { rows: tables } = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.length === 0) {
      console.log('ℹ️  No se encontraron tablas en la base de datos');
    } else {
      tables.forEach(({ table_name }) => console.log(`   - ${table_name}`));
    }
    
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    console.error('🔧 Asegúrate de que la base de datos esté en ejecución y las credenciales sean correctas');
    process.exit(1);
  }
};

// Función para realizar consultas SQL
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Consulta ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en la consulta:', { text, error: error.message });
    throw error;
  }
};

module.exports = {
  connectDB,
  query,
  pool,
};
