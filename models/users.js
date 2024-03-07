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
		unique: true
	},
	email: {
		type: STRING,
		allowNull: false,
		unique: true
	},
	password: {
		type: STRING,
		allowNull: false,
	},
});

(async () => {
	await databaseModel.sync();
})();

module.exports = { users };
