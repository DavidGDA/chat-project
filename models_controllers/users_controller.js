const { users, syncUserModel } = require('../models/users');

async function createNewUser(username, password, email) {
	try {
		const newUser = await users.create({
			username: username,
            password: password,
            email: email
		});

		return newUser;
	} catch (error) {
		console.error('Error al crear usuario en el controlador: ', error);
	}
}

module.exports = { createNewUser };
