const { Sequelize } = require('sequelize');
const path = require('path');

// ruta al archivo de la base de datos (tiene que coincidir con: [ruta-desde-disco-sistema]\chat-project\database.sqlite3)
const dbPath = path.resolve(__dirname, 'database.sqlite3');

// configuracion de la base de datos
const databaseModel = new Sequelize({
	dialect: 'sqlite',
	storage: dbPath,
	logging: false,
});

// funcion para conectar a bd
async function databaseConnection() {
	try {
		await databaseModel.authenticate();
		console.log('Conexión a la base de datos establecida correctamente.');
	} catch (error) {
		console.error('Error al conectar con la base de datos:', error);
	}
}

module.exports = { databaseModel, databaseConnection }