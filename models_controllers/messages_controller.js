const { messages } = require('../models/messages');

async function createMessage(user_id, content) {
	try {
		const newMessage = await messages.create({
			user_id: user_id,
			content: content,
		});

		return newMessage;
	} catch (error) {
		console.error('Error al crear mensaje en el controlador: ', error);
	}
}

async function getMessages() {
	try {
		const fetchedMessages = await messages.findAll();
		const JSONObjectMessages = JSON.stringify(fetchedMessages);
		return JSONObjectMessages;
	} catch (error) {
		console.error('Error al crear mensaje en el controlador: ', error);
	}
}

module.exports = { createMessage };
