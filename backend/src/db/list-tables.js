import { Pool } from 'pg';
import config from '../config/config.js';

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: config.db.username,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

async function listTables() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    const client = await pool.connect();
    
    console.log('📋 Tablas en la base de datos:');
    const { rows: tables } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.length === 0) {
      console.log('ℹ️  No se encontraron tablas en la base de datos');
    } else {
      console.log('📊 Tablas encontradas:');
      tables.forEach(({ table_name }) => console.log(`   - ${table_name}`));
      
      // Mostrar estructura de cada tabla
      for (const { table_name } of tables) {
        console.log(`\n🔍 Estructura de la tabla ${table_name}:`);
        try {
          const { rows: columns } = await client.query(
            `SELECT column_name, data_type, is_nullable, column_default 
             FROM information_schema.columns 
             WHERE table_name = $1 
             ORDER BY ordinal_position`,
            [table_name]
          );
          
          if (columns.length === 0) {
            console.log(`   ℹ️  No se encontraron columnas en la tabla ${table_name}`);
          } else {
            console.table(columns);
          }
        } catch (error) {
          console.error(`❌ Error al obtener la estructura de la tabla ${table_name}:`, error.message);
        }
      }
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar la función para listar tablas
listTables();
