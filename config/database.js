const { Sequelize } = require('sequelize');
const path = require('path');

// Ruta al archivo de la base de datos
const dbPath = path.resolve(__dirname, 'database.sqlite3');

// Configuración de la base de datos
const databaseModel = new Sequelize({
	dialect: 'sqlite',
	storage: dbPath,
	logging: false,
});

async function databaseConnection() {
	try {
		await sequelize.authenticate();
		console.log('Conexión a la base de datos establecida correctamente.');
	} catch (error) {
		console.error('Error al conectar con la base de datos:', error);
	}
}

module.exports = { databaseModel, databaseConnection }