const express = require('express');
const { join } = require('path');
const { json, urlencoded } = require('body-parser');
const { sessionStorage, authRouter } = require('./routes/session_routes');
const { createMessage, getMessages } = require('./models_controllers/messages_controller');
const { users } = require('./models/users');
const nodeHTTP = require('node:http');
const WebSocketIO = require('socket.io');

// Creando la aplicacion express
const app = express();
const server = nodeHTTP.createServer(app);

const PORT = 3000;

// Configuración de la app Express
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static('public'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(sessionStorage);

// Creacion de el servidor websocket
const socketIOServer = new WebSocketIO.Server(server, {
	connectionStateRecovery: {
		maxDisconnectionDuration: 6000,
	},
});

// al haber un error, se ve en consola la fuente de este
socketIOServer.engine.on('connection_error', err => {
	console.log('Error al conectarse al servidor websocket: ' + err);
});

// Al recibir la conexion de un usuario al socket de chat
socketIOServer.on('connection', socket => {
	// Al recibir un mensaje
	socket.on('message', async message => {
		const username = socket.handshake.auth.username;
		try {
			createMessage(username, message);
			socketIOServer.emit('message', message, username);
		} catch (error) {
			console.log('Error al recibir mensaje: ' + error);
		}
	});

	// Evento para recuperar mensajes desde la base de datos
	socket.on('last_messages', async () => {
		const get_last_msg = await getMessages();
		socketIOServer.to(socket.id).emit('last_messages', get_last_msg);
	});

	// Por el momento, estas funciones son de depuracion
	socket.on('disconnect', () => {
		console.log('disconnected');
	});

	socket.on('reconnect', () => {
		console.log('reconnected');
	});
});

// Definición de rutas
app.get('/', (req, res) => {
	if (req.session.username) {
		res.render('index', { title: 'Página Principal', session: req.session });
	} else {
		res.render('index', { title: 'Página Principal', session: null });
	}
});

app.use('/accounts', authRouter);

app.route('/dashboard/chat').get(async (req, res) => {
	if (req.session.username) {
		res.render('chat', { title: 'Chat' });
	} else {
		res.redirect('/accounts/login');
	}
});

app.get('/api/getuser', async (req, res) => {
	if (req.session.username) {
		const userQuery = await users.findOne({ where: { id: req.session.user_id } });
		try {
			return res.json({ username: userQuery.get('username'), user_id: userQuery.get('id') });
		} catch (error) {
			console.error('Hubo un error al obtener datos en la query de userAPI: ' + error);
			res.json({ username: 'user-server-get-error', user_id: undefined });
		}
	} else {
		res.json({ username: 'no-user', user_id: undefined });
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
