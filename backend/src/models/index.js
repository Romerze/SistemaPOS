import { fileURLToPath } from 'url';
import { dirname, basename } from 'path';
import { readdirSync } from 'fs';
import { sequelize } from '../config/database.js';
import { Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = {};

// Importar todos los modelos
const files = readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename(__filename) &&
      file.slice(-9) === '.model.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// Importar dinámicamente todos los modelos
for (const file of files) {
  const modelModule = await import(`./${file}`);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Asociar modelos si existen
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
