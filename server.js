const express = require('express');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const appAuth = require('./routes/login_auth_session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const nodeHTTP = require('node:http');
const WebSocketIO = require('socket.io');

const app = express();
const server = nodeHTTP.createServer(app);
const io = new WebSocketIO.Server(server);

io.engine.on('connection_error', err => {
	console.log(err);
});
io.on('connection', socket => {
	console.log('connected');

	socket.on('message', message => {
		io.emit('message', message);
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
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
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

app.get('/dashboard/chat', (req, res) => {
	if (req.session.username) {
		res.render('chat', {title: 'Chat'});
	} else {
		res.redirect('/accounts/login');
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
