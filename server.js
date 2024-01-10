const express = require('express');
const ejs = require('ejs');
const { join } = require('path');
const { json, urlencoded } = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { compare, genSalt, hash } = require('bcrypt');
const appAuth = require('./routes/login_auth_session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { Sequelize } = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const nodeHTTP = require('node:http');
const WebSocketIO = require('socket.io');

const app = express();
const server = nodeHTTP.createServer(app);
const io = new WebSocketIO.Server(server, {
	connectionStateRecovery: {
		maxDisconnectionDuration: 6000,
	},
});

io.engine.on('connection_error', err => {
	console.log(err);
});

// On user connection

io.on('connection', socket => {
	console.log('connected');

	// On message

	socket.on('message', async (message, user_id) => {
		const username = socket.handshake.auth.username

		const db = new sqlite3.Database('database.sqlite3');
		const query = 'INSERT INTO messages (user_id, username, content) VALUES(?, ?, ?)';
		try {
			db.run(query, [user_id, username, message], function (err) {
				if (err) {
					console.log('Error on message query: ' + err);
				}
			});
			io.emit('message', message, username);
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('last_messages', async () => {
		const db = new sqlite3.Database('database.sqlite3');

		const getMessages = () => {
			return new Promise((resolve, reject) => {
				const messages = [];

				db.each(
					'SELECT * FROM messages',
					(err, row) => {
						if (err) {
							reject(err);
						} else {
							messages.push({username: row.username, content: row.content});
						}
					},
					(err) => {
						if (err) {
							reject(err);
						} else {
							resolve(messages);
						}
					}
				);
			});
		};


		const get_last_msg = await getMessages();
		io.emit('last_messages', get_last_msg);
		db.close();
	});

	socket.on('disconnect', () => {
		console.log('disconnected');
	});
});

const PORT = 3000;
dotenv.config();

const sequelize = new Sequelize('database', 'username', 'password', {
	dialect: 'sqlite',
	storage: 'database.sqlite3',
});

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static('public'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.NAMESPACE_UUID,
		resave: false,
		saveUninitialized: false,
		store: new SequelizeStore({
			db: sequelize,
			checkExpirationInterval: 24 * 60 * 60 * 1000, // The interval at which to cleanup expired sessions (1 minute)
			expiration: 24 * 60 * 60 * 1000, // 1 Day, this is declared on maxAge session cookie
		}),
	})
);

// Definición de rutas
app.get('/', (req, res) => {
	if (req.session.username) {
		res.render('index', { title: 'Página Principal', session: req.session });
	} else {
		res.render('index', { title: 'Página Principal', session: null });
	}
});

app.use('/accounts', appAuth);

app.route('/accounts/login').get(function (req, res) {
	res.render('login', { title: 'Login' });
});

app.route('/accounts/singup')
	.get(function (req, res) {
		res.render('register', { title: 'Singup' });
	})
	.post(async function (req, res) {
		const username = req.body.username;
		const email = req.body.email;
		const form_password = req.body.password;

		const salt = await bcrypt.genSalt();
		const hashed_password = await bcrypt.hash(form_password, salt);

		const db = new sqlite3.Database('database.sqlite3');
		const query = 'INSERT INTO users (username, email, password) VALUES(?, ?, ?)';
		db.run(query, [username, email, hashed_password], function (err) {
			if (err) {
				return res.status(500).send('Error on database');
			}
		});
		db.close();

		res.redirect('/accounts/login');
	});

app.get('/dashboard/chat', function (req, res) {
	if (req.session.username) {
		res.render('chat', { title: 'Chat' });
	} else {
		res.redirect('/accounts/login');
	}
});

app.post('/api/helpers/userchat', function (req, res) {
	if (req.session.id) {
		const db = new sqlite3.Database('database.sqlite3');
		const query = 'SELECT user_id FROM users WHERE username = ?';
		db.get(query, [req.session.username], (err, row) => {
			if (err) {
				console.log('Database error on obtain user_id: ' + err);
			}
			res.json({ username: req.session.username, user_id: row.user_id });
		});
	} else {
		res.json({ username: 'no-user', user_id: undefined });
	}
});

app.get('/dashboard/marketplace', (req, res) => {
	if (req.session.username) {
		res.render('marketplace', { title: 'Marketplace' });
	} else {
		res.redirect('/accounts/login');
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
