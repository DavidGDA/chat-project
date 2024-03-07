const { INTEGER, STRING, DATE, TEXT } = require('sequelize');
const { databaseModel } = require('../config/database');

const messages = databaseModel.define('Messages', {
	message_id: {
		type: INTEGER,
		primaryKey: true,
	},
	content: {
		type: TEXT,
		allowNull: false,
	},
	date: {
		type: DATE,
		allowNull: false,
	},
	time: {
		type: DATETIME,
		allowNull: false,
	},
});

module.exports = { messages };
