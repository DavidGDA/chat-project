const sessions = sequelize.define('Session', {
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
