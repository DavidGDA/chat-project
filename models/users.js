const { INTEGER, STRING } = require('sequelize');
const { databaseModel } = require('../config/database');

const users = databaseModel.define('Users', {
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

module.exports = { users };
