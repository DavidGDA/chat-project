const express = require('express');
const { join } = require('path');
const { json, urlencoded } = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { sessionStorage, authRouter } = require('./routes/session_routes');
const { createMessage, getMessages } = require('./models_controllers/messages_controller')
const nodeHTTP = require('node:http');
const WebSocketIO = require('socket.io');
const app = express();
const server = nodeHTTP.createServer(app);
const io = new WebSocketIO.Server(server, {
	connectionStateRecovery: {},
});

io.engine.on('connection_error', err => {
	console.log(err);
});

// On user connection

io.on('connection', socket => {
	console.log('connected');

	// On message

	socket.on('message', async (message, user_id) => {
		const username = socket.handshake.auth.username;
		try {
			createMessage(username, message);
			io.emit('message', message, username);
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('last_messages', async () => {
		const get_last_msg = await getMessages();
		io.to(socket.id).emit('last_messages', get_last_msg);
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

app.post('/api/helpers/userchat', function (req, res) {
	if (req.session.id) {
		const db = new sqlite3.Database('database.sqlite3');
		const query = 'SELECT id FROM users WHERE username = ?';
		db.get(query, [req.session.username], (err, row) => {
			if (err) {
				console.log('Database error on obtain user_id: ' + err);
			}
			return res.json({ username: req.session.username, user_id: row.user_id });
		});
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
