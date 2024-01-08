import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
const socket = io();

const form = document.getElementById('chat-form')
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (messageInput.value) {
        socket.emit('message', messageInput.value)
        messageInput.value = ''
    }
})
socket.on('error', err => {
    console.log(err);
})

socket.on('message', function (msg) {
	var item = document.createElement('p');
	item.textContent = msg;
	messages.appendChild(item);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconexión exitosa después de', attemptNumber, 'intentos');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});