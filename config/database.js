const { Sequelize } = require('sequelize');
const path = require('path');

// configuracion de la base de datos
const databaseModel = new Sequelize({
	dialect: 'sqlite',
	storage: '../database.sqlite3',
	logging: false,
	define: {
		freezeTableName: true,
	},
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