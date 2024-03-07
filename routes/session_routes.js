/*  Claramente, aqui se expone el algoritmo de hashing de contraseñas,
	pero como este es un repositorio de prueba, he decidido dejar uno basico  */

const { Router } = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const { Sequelize, STRING, DATE, TEXT } = require('sequelize');
const { createNewUser } = require('../models_controllers/users_controller');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { databaseModel, testDatabaseConnection } = require('../config/database');
const dotenv = require('dotenv');
const { compare, genSalt, hash } = require('bcrypt');
const { users, syncUserModel } = require('../models/users');

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
	.route('/singup')
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
		const singupNewUser = await createNewUser(username, hashed_password);

		res.redirect('/accounts/login');
	});

authRouter
	.route('/login')
	.get(async function (req, res) {
		const usersQuery = await users.findAll();
		console.log('All users:', JSON.stringify(usersQuery, null, 2));
		res.render('login', { title: 'Login' });
	})
	.post(async function (req, res) {
		const username = req.body.username;
		const password = req.body.password;
		// const db = new sqlite3.Database('database.sqlite3');
		// const query = 'SELECT * FROM users WHERE username = ?';
		// try {
		// 	const data = await new Promise((resolve, reject) => {
		// 		db.get(query, [username], (err, data) => {
		// 			if (err) reject(err);
		// 			resolve(data);
		// 		});
		// 	});
		// 	if (data) {
		// 		const compare_password = compare(password, data.password);

		// 		if (!compare_password) {
		// 			return res.status(401).send('Incorrect password');
		// 		}
		// 		console.log('Correct password');
		// 		req.session.username = username;
		// 		req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 Day

		// 		Session.sync();
		// 		return res.redirect('/');
		// 	} else {
		// 		console.log('Usuario no encontrado');
		// 		return res.redirect('/accounts/singup');
		// 	}
		// } catch (err) {
		// 	console.error('Error en la base de datos:', err);
		// 	res.status(500).send('Error en la base de datos');
		// } finally {
		// 	db.close();
		// }
	});

authRouter.route('/logout').get((req, res) => {
	req.session.destroy(err => {
		if (err) {
			return console.log(err);
		}
		res.clearCookie('Session');
		res.redirect('/');
	});
});

module.exports = { authRouter, sessionStorage };
