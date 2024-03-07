const { users, syncUserModel } = require('../models/users');

async function createNewUser(username, password) {
	try {
		const newUser = await users.create({
			username: username,
            password: password
		});

		return newUser;
	} catch (error) {
		console.error('Error al crear usuario en el controlador: ', error);
	}
}

module.exports = { createNewUser };
