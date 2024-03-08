import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const user = async () => {
	const res = await fetch(location.protocol + '//' + location.hostname + ':' + location.port + '/api/helpers/getuser', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const user_info = await res.json();
	return { username: user_info.username, user_id: user_info.user_id };
};

const user_info = await user();

const socket = io({
	auth: {
		username: user_info.username,
	},
});

socket.emit('last_messages');

const form = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

function scrollAdjust() {
	messages.scrollTop = messages.scrollHeight;
}

window.onload = scrollAdjust;

form.addEventListener('submit', e => {
	e.preventDefault();
	const message = messageInput.value;

	if (messageInput.value) {
		messageInput.value = '';
		socket.emit('message', message, user_info.user_id);
	}
});
socket.on('error', err => {
	console.log(err);
});

socket.on('message', function (msg, username) {
	const item = document.createElement('p');
	item.textContent = username + ': ' + msg;
	messages.appendChild(item);
	scrollAdjust();
	console.log(socket.auth.chat_offset);
});

socket.on('last_messages', function (messages_chat) {
	const stringMessages = JSON.parse(messages_chat);

	stringMessages.forEach(message => {
		const item = document.createElement('p');
		item.textContent = message.user_id + ': ' + message.content;
		messages.appendChild(item);
		scrollAdjust();
	});
});

socket.on('reconnect', attemptNumber => {
	console.log('Reconexión exitosa después de', attemptNumber, 'intentos');
});

socket.on('disconnect', () => {
	console.log('Desconectado del servidor');
});
