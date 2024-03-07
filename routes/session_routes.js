const { Router } = require('express');
const sqlite3 = require('sqlite3').verbose();
const { compare } = require('bcrypt');
const session = require('express-session');
const { Sequelize, STRING, DATE, TEXT } = require('sequelize');
const SessionStore = require('connect-session-sequelize')(session.Store);

const router = Router();

router
	.route('/singup')
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

router
	.route('/login')
	.get(function (req, res) {
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
