// Import standardized modules
const sequelize		= require('sequelize')
const express 		= require ('express')
const bodyParser 	= require('body-parser')
const bcrypt 		= require ('bcrypt-nodejs')
const session 		= require('express-session')
const router  		= express.Router ( )

let db = require(__dirname + '/../modules/database')

router.get('/index', (req, res) => {
	let message = req.query.message
	if(req.session.emailadress) {
		res.redirect('/profile')
	}
	else {
		res.render('index', {
			message: req.query.message
		})
	}
})

router.post('/login', (req, res) => {
	if(req.body.email === 0) {
		res.redirect('/login?message=' + encodeURIComponent('Please fill in your email.'))
		return
	}

	else if(req.body.password === 0) {
		res.redirect('/login?message=' + encodeURIComponent('Please fill in your password.'))
		return
	}
	
	else {
		db.User.findOne({
			where: {
				emailadress: req.body.email.toLowerCase()
			}
		}).then( (user) => {
			if (user) {
				bcrypt.compare(req.body.password, user.password, (err, result) => {
					if(result) {
						req.session.emailadress = user.emailadress
						console.log('succesfully logged in')
						res.redirect('/profile?message=' + encodeURIComponent('You are now logged-in.'))
					} else {
						res.redirect('/index?message=' + encodeURIComponent('Wrong Password'))
						return
					}
				})
			} else {
				res.redirect('/index?message=' + encodeURIComponent('Wrong Email'))
				return
			}
		})
	}
})

module.exports = router