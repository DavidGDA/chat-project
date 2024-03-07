const { STRING, DATE, TEXT } = require('sequelize');
const { databaseModel } = require('../config/database');

const sessions = databaseModel.define('Sessions', {
	sid: {
		type: STRING,
		primaryKey: true,
	},
	expires: {
		type: DATE,
	},
	data: {
		type: TEXT,
	},
	createdAt: {
		type: DATE,
	},
	updatedAt: {
		type: DATE,
	},
});

(async () => {
	await databaseModel.sync();
})();

module.exports = { sessions };
