const { Router } = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const router = Router();

router.route('/').get(async (req, res) => {
	if (req.session.username) {
		// Obtain the products from one API consult
		const db = new sqlite3.Database('database.sqlite3');
		const query = 'SELECT * FROM products';
        // Select all the products and then, return one array with all the products info
		const get_products_query = () => {
			return new Promise((resolve, reject) => {
                // array that contains all the products
				let products = [];
				db.each(
					query,
					(err, rows) => {
						if (err) {
							reject(err);
						}
                        // add all the products on the array (one product is an bject)
						products.push({ id: rows.id, seller_id: rows.seller_id, name: rows.name, description: rows.description, price: rows.price });
					},
					err => {
						if (err) {
							reject(err);
						}
						resolve(products);
					}
				);
			});
		};
		const get_products = await get_products_query();
        get_products.forEach(product => {
		    console.log(product);
        });

		res.render('marketplace', { title: 'Marketplace', products: get_products});
	} else {
		res.redirect('/accounts/login');
	}
});

router.route('/api/products').get(async (req, res) => {
	// const db = new sqlite3.Database('database.sqlite3');
	// const query = 'SELECT * FROM products';
	// const get_products_query = () => {
	// 	return new Promise((resolve, reject) => {
	// 		let products = [];
	// 		db.each(
	// 			query,
	// 			(err, rows) => {
	// 				if (err) {
	// 					reject(err);
	// 				}
	// 				products.push({ id: rows.id, seller_id: rows.seller_id, name: rows.name, description: rows.description, price: rows.price });
	// 			},
	// 			err => {
	// 				if (err) {
	// 					reject(err);
	// 				}
	// 				resolve(products);
	// 			}
	// 		);
	// 	});
	// };
	// const get_products = await get_products_query();
	// res.json({ products: get_products });
});

module.exports = router;
