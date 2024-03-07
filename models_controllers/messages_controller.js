const { messages } = require('../models/messages');

async function createMessage(content) {
	try {
		const newMessage = await messages.create({
			content: content,
			// date: new Date(), cualquier fallo en el guardado, revisar esto
			// time: new Date().getTime
		});

		return newMessage;
	} catch (error) {
		console.error('Error al crear mensaje en el controlador: ', error);
	}
}

module.exports = { createMessage };
