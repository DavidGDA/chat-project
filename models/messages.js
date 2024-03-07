const { INTEGER, DATE, TEXT, TIME } = require('sequelize');
const { databaseModel } = require('../config/database');

const messages = databaseModel.define('Messages', {
	message_id: {
		type: INTEGER,
		primaryKey: true,
	},
	user_id: {
		type: INTEGER,
		allowNull: false,
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

(async () => {
	await databaseModel.sync();
})();

module.exports = { messages };
