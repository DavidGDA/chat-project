const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const Sequelize = require('sequelize');
const SessionStore = require('connect-session-sequelize')(session.Store);

const router = express.Router();

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite', // Aquí es donde especificas explícitamente el dialecto
	storage: 'database.sqlite3', // Asegúrate de que esta es la ruta correcta a tu base de datos
});

const Session = sequelize.define('Session', {
	sid: {
		type: Sequelize.STRING,
		primaryKey: true,
	},
	expires: {
		type: Sequelize.DATE,
	},
	data: {
		type: Sequelize.TEXT,
	},
	createdAt: {
		type: Sequelize.DATE,
	},
	updatedAt: {
		type: Sequelize.DATE,
	},
});

router.route('/login').post(async function (req, res) {
	const username = req.body.username;
	const password = req.body.password;
	const db = new sqlite3.Database('database.sqlite3');
	const query = 'SELECT * FROM users WHERE username = ?';
	try {
		const data = await new Promise((resolve, reject) => {
			db.get(query, [username], (err, data) => {
				if (err) reject(err);
				resolve(data);
			});
		});
		if (data) {
			const compare = bcrypt.compare(password, data.password);

			if (!compare) {
				return res.status(401).send('Incorrect password');
			}
			console.log('Correct password');
			req.session.username = username;
			req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 Day

			Session.sync();
			return res.redirect('/');
		} else {
			console.log('Usuario no encontrado');
			return res.redirect('/accounts/singup');
		}
	} catch (err) {
		console.error('Error en la base de datos:', err);
		res.status(500).send('Error en la base de datos');
	} finally {
		db.close();
	}
});

router.route('/logout').get((req, res) => {
	req.session.destroy(err => {
		if (err) {
			return console.log(err);
		}
		res.clearCookie('Session');
		res.redirect('/');
	});
});

module.exports = router;
