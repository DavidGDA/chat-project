const express = require('express');
const { join } = require('path');
const { json, urlencoded } = require('body-parser');
const { sessionStorage, authRouter } = require('./routes/session_routes');
const { createMessage, getMessages } = require('./models_controllers/messages_controller');
const { users } = require('./models/users');
const nodeHTTP = require('node:http');
const WebSocketIO = require('socket.io');
const app = express();
const server = nodeHTTP.createServer(app);
const socketIOServer = new WebSocketIO.Server(server, {
	connectionStateRecovery: {},
});

socketIOServer.engine.on('connection_error', err => {
	console.log(err);
});

// On user connection

socketIOServer.on('connection', socket => {
	// Al recibir un mensaje
	socket.on('message', async message => {
		const username = socket.handshake.auth.username;
		try {
			createMessage(username, message);
			socketIOServer.emit('message', message, username);
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('last_messages', async () => {
		const get_last_msg = await getMessages();
		socketIOServer.to(socket.id).emit('last_messages', get_last_msg);
	});

	socket.on('disconnect', () => {
		console.log('disconnected');
	});
});

const PORT = 3000;

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static('public'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(sessionStorage);

// Definición de rutas
app.get('/', (req, res) => {
	if (req.session.username) {
		res.render('index', { title: 'Página Principal', session: req.session });
	} else {
		res.render('index', { title: 'Página Principal', session: null });
	}
});

app.use('/accounts', authRouter);

app.route('/dashboard/chat').get(function (req, res) {
	if (req.session.username) {
		res.render('chat', { title: 'Chat' });
	} else {
		res.redirect('/accounts/login');
	}
});

app.post('/api/helpers/getuser', async function (req, res) {
	if (req.session.id) {
		const userQuery = await users.findByPk(req.session.user_id);
		return res.json({ username: userQuery.get('username'), user_id: userQuery.get('id') });
	} else {
		return res.json({ username: 'no-user', user_id: undefined });
	}
});

app.use((err, req, res, next) => {
	res.status(404).send('404 not found');
	console.error(err.stack);
});

// Iniciar el servidor
server.listen(PORT, () => {
	console.log(`server: http://localhost:${PORT}`);
});
