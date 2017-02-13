// Import standardized modules
const sequelize		= require ('sequelize')
const express 		= require ('express')
const bodyParser 	= require ('body-parser')
const bcrypt 		= require ('bcrypt-nodejs')
const session 		= require ('express-session')
// const googlemaps	= require ('googlemaps')
const router  		= express.Router ( )

let db = require(__dirname + '/../modules/database')

router.get('/register', (req, res) => {
	let message = req.query.message
	if(req.session.emailadress) {
		res.redirect('/profile')
	}
	else {
		res.render('register', {message: message})
	}
})

router.post('/register', (req, res) => {
	if (req.body.email !== 0) {
		db.User.findOne({
			where: {
				emailadress: req.body.email.toLowerCase()
			}
		}).then( (user) => {
			if(user) {
				res.redirect('/register?message=' + encodeURIComponent('Sorry, this emailadress is taken'))
			}

			if (!user) {
				bcrypt.hash(req.body.password, null, null, function (error, hash ) {
					if(error) throw error
					db.User.create({
						emailadress: req.body.email.toLowerCase(),
						password: hash,
						phonenumber: req.body.phonenumber,
						lat: req.body.lat,
						lng: req.body.lng,
						city: req.body.city,
						medium: req.body.medium,
						sentmessages: 0,
						maxmessages: req.body.frequency,
						contactdays: req.body.day,
						sunAlertsReceived: 0
					})
				})
			}
		}).then( () => {
			db.conn.sync().then( () => {
				console.log('user added')
				res.redirect('/index?message=' + encodeURIComponent('Cool, you now recieve messages!'))
			})
		})
	}
})

module.exports = router



	// let geocodeParams = {
	//   "address":    "Valkhof 201, Amsterdam",
	//   "components": "components=country:NL"
	// }
	// if(req.body.email !== 0) {
	// 	googleAPI.geocode(geocodeParams, (error, result) => {
	// 		if(error) {
	// 			console.log(error)
	// 		}
	// 		else {
	// 			console.log(JSON.stringify(result))
	// 		}
	// 	}).then ( ( ) => {
	// 		db.User.findOne({
	// 			where: {
	// 				emailadress: req.body.email.toLowerCase()
	// 			}
	// 		}).then( ( user ) => {
	// 			if(user) {
	// 				console.log('This emailadress is taken')
	// 			}
	// 			if(!user) {
	// 				console.log('Make the user')
	// 			}
	// 		}).then ( ( ) => {
	// 			console.log('yaaay')
	// 		})
	// 	})
	// }

	// if(req.body.email !== 0) {
	// 	for (var i = 0; i < req.body.day.length; i++) {
	// 		dayArray.push(req.body.day[i])
	// 	}
	// 	googleAPI.geocode(geocodeLoc, function(error, result) {
	// 		if (error) {
	// 			console.log(error)
	// 		}
	// 		else {
	// 			console.log("this is result: " + result)
	// 		}
	// 	}).then( ( ) => { 
	// 		db.User.findOne({
	// 			where: {
	// 				emailadress: req.body.email.toLowerCase() 
	// 			}
	// 		}).then( (user) => {
	// 			if(user) {
	// 				res.redirect('/register?message=' + encodeURIComponent('Sorry, this emailadress is taken'))
	// 			}
	// 			else {
	// 				bcrypt.hash(req.body.password, null, null, function (error, hash ) {
	// 					if(error) throw error
	// 					db.User.create({
	// 						emailadress: req.body.email.toLowerCase(),
	// 						password: hash,
	// 						phonenumber: req.body.phonenumber,
	// 						lat: '',
	// 						long: '',
	// 						medium: req.body.medium,
	// 						frequency: req.body.frequency,
	// 						contactdays: dayArray
	// 					})
	// 				})
	// 			}
	// 		})
	// 	}).then( () => {
	// 		db.conn.sync().then( ( ) => {
	// 			console.log('User added')
	// 			res.redirect('/index')
	// 		})
	// 	})
	// }
	// else {
	// 	res.redirect('/register?message=' + encodeURIComponent('Please fill in every field!') )
	// }

