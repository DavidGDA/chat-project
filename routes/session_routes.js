/*  Claramente, aqui se expone el algoritmo de hashing de contraseñas,
	pero como este es un proyecto de practica, he decidido dejar uno basico  */

const { Router } = require('express');
const session = require('express-session');
const { createNewUser } = require('../models_controllers/users_controller');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { databaseModel, testDatabaseConnection } = require('../config/database');
const dotenv = require('dotenv');
const { compare, genSalt, hash } = require('bcrypt');
const { users } = require('../models/users');
const { sessions } = require('../models/sessions');

const authRouter = Router();
dotenv.config();

const sessionStorage = session({
	secret: process.env.NAMESPACE_UUID,
	resave: false,
	saveUninitialized: false,
	store: new SequelizeStore({
		db: databaseModel,
		checkExpirationInterval: 24 * 60 * 60 * 1000, // The interval at which to cleanup expired sessions (1 minute)
		expiration: 24 * 60 * 60 * 1000, // 1 Day, this is declared on maxAge session cookie
	}),
});

authRouter
	.route('/register')
	.get(function (req, res) {
		res.render('register', { title: 'Singup' });
	})
	.post(async function (req, res) {
		const username = req.body.username;
		const email = req.body.email;
		const form_password = req.body.password;

		const salt = await genSalt();
		const hashed_password = await hash(form_password, salt);

		await testDatabaseConnection();
		await createNewUser(username, hashed_password, email);

		res.redirect('/accounts/login');
	});

authRouter
	.route('/login')
	.get(async function (req, res) {
		res.render('login', { title: 'Login' });
	})
	.post(async function (req, res) {
		const username = req.body.username;
		const password = req.body.password;
		try {
			const usersQuery = await users.findOne({ where: { username: username } });
			if (usersQuery === null) {
				console.log('Usuario no encontrado');
				return res.redirect('/accounts/singup');
			}

			const valid_password = async () => {
				return compare(password, usersQuery.get('password'));
			};

			const validate = await valid_password();

			if (!validate) {
				return res.status(401).send('Incorrect password');
			}
			req.session.username = username;
			req.session.user_id = usersQuery.get('id');
			req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 dia

			sessions.sync();
			return res.redirect('/');
		} catch (err) {
			console.error('Error en login: ' + err);
		}
	});

authRouter.route('/logout').get((req, res) => {
	req.session.destroy(err => {
		if (err) {
			return console.log('Error en logout: ' + err);
		}
		res.clearCookie('Session');
		res.redirect('/');
	});
});

module.exports = { authRouter, sessionStorage };
