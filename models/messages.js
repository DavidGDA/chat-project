const { INTEGER, DATE, TEXT, TIME } = require('sequelize');
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
		type: TIME,
		allowNull: false,
	},
	
});

module.exports = { messages };
