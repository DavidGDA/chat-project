import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
const socket = io();

const form = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

form.addEventListener('submit', e => {
	e.preventDefault();
  const message = messageInput.value;

	if (messageInput.value) {
    messageInput.value = '';
    fetch(location.protocol + '//' + location.hostname + '/helpers/username', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((response) => response.json())
		.then(data => {
			// Manipula los datos recibidos del servidor
      socket.emit('message', message, data.username);
		})
		.catch(error => console.error('Error al obtener datos:', error));
	}
});
socket.on('error', err => {
	console.log(err);
});

socket.on('message', function (msg, username) {
	const item = document.createElement('p');
	item.textContent = username + ': ' + msg;
	messages.appendChild(item);
});

socket.on('reconnect', attemptNumber => {
	console.log('Reconexión exitosa después de', attemptNumber, 'intentos');
});

socket.on('disconnect', () => {
	console.log('Desconectado del servidor');
});
