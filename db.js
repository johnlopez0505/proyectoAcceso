const fs = require('fs');
const mysql = require('mysql2');
const util = require('util');

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  port: 33308,
  user: 'root',
  password: 's83n38DGB8d72',
  database: 'gestion',
});

const queryAsync = util.promisify(db.query).bind(db);

// Leer el contenido de los archivos SQL
const createDatabaseScript = fs.readFileSync('bbdb.sql', 'utf8');
const insertDataScript = fs.readFileSync('data.sql', 'utf8');
const createTriggersScript = fs.readFileSync('disparadores.sql', 'utf8');

// Ejecutar las instrucciones SQL
async function executeScripts() {
  try {
    // Separar las instrucciones SQL por punto y coma
    const createDatabaseStatements = createDatabaseScript.split(';').filter(statement => statement.trim() !== '');
    const insertDataStatements = insertDataScript.split(';').filter(statement => statement.trim() !== '');
    const createTriggersStatements = createTriggersScript.split('//').filter(statement => statement.trim() !== '');
    
    // Ejecutar cada instrucción SQL por separado
    for (const statement of createDatabaseStatements) {
      await queryAsync(statement);
    }

    await queryAsync('USE gestion');


    for (const statement of insertDataStatements) {
      await queryAsync(statement);
    }

    // Ejecutar cada instrucción SQL por separado
    for (const statement of createTriggersStatements) {
        await queryAsync(statement);
      }


    console.log('Scripts SQL ejecutados exitosamente.');
  } catch (error) {
    console.error('Error al ejecutar los scripts SQL:', error);
  } finally {
    // Cerrar la conexión a la base de datos después de ejecutar los scripts
    db.end();
  }
}

module.exports = executeScripts;
