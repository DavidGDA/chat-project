// const { DataTypes } = require('sequelize'); descomentar si hay errores de tipos de datos
const { databaseModel } = require('../config/database');

const users = databaseModel.define('users', {
	id: {
		type: INTEGER,
		primaryKey: true,
	},
	username: {
		type: STRING,
		allowNull: false,
	},
	password: {
		type: STRING,
		allowNull: false,
	},
});
