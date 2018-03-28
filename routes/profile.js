const sequelize		= require ('sequelize')
const express 		= require ('express')
const bodyParser 	= require ('body-parser')
const bcrypt 		= require ('bcrypt-nodejs')
const session 		= require ('express-session')
const router  		= express.Router ( )
const cron			= require('node-cron')

let db 				= require(__dirname + '/../modules/database')
let checkSunrise 	= require(__dirname + '/../modules/check-weather')

// require the sun Calc package to calculate sunset/rise
const SunCalc 		= require('suncalc')

// Require the dark sky API
const Forecast 		= require ('forecast')

// Require the sendgrid libraries
let sg 				= require('sendgrid')(process.env.SENDGRID_API_KEY)
const helper 		= require ('sendgrid').mail

// Set-up the sendgrid variables that don't change
let from_email 	= new helper.Email('brampijper@gmail.com')
let subject 	= 'Sun Alert'
let content 	= new helper.Content('text/plain', 'The sun is currently shining!' + ' Do you have time to take a 5 minute break to go outside?')

//Get current weekday
let date 	= new Date()
let weekday = new Array(7)
weekday[0] 	= "sunday"
weekday[1] 	= "monday"
weekday[2] 	= "tuesday"
weekday[3] 	= "wednesday"
weekday[4] 	= "thursday"
weekday[5] 	= "friday"
weekday[6] 	= "saturday"
let currentDay = weekday[date.getDay()];

// Initialize forecast api
let forecast = new Forecast({
	service: 'darksky',
	key: '849e25a126ed4beac13ef877c8a1fabb',
	units: 'celcius',
	cache: true,
	ttl: {
		minutes: 30,
		seconds: 1
	}
})

router.get('/profile', (req, res) => {
	let email = req.session.emailadress 
	if(email) {
		db.User.findOne({
			where: {
				emailadress: email
			}
		}).then( (user) => {
			res.render('profile', {
				message: req.query.message,
				currentUser: user
			})
		})
	}
	else {
		res.redirect('/index')
	}
})

//Update current email adress
router.post('/newemail', (req, res) => {
	//In case frontend validation breaks, backend validation to make sure form is not empty
	if (req.body.newemail !== 0) {
		//Check to find out if the new email adress already exists in the database, assigned to a different user
		db.User.findOne({
			where: {
				emailadress: req.body.newemail.toLowerCase()
			}
		}).then( (user) => {
			//If it already exists, it can not be changed
			if(user) {
				res.redirect('/profile?message=' + encodeURIComponent('Sorry, this emailadress already exists. Please choose another or login.'))
				return
				//Otherwise: change it!
			} else {
				//Since the username never changes, request users from the database that have the same username as the current user.
				db.User.findOne({
					where: {
						emailadress: req.session.emailadress
					}
				}).then( (user) => {
					// console.log(user)
					user.updateAttributes({
						emailadress: req.body.newemail.toLowerCase(),
					}).then( (user) => {
						console.log(user)
						req.session.emailadress = user.emailadress
						res.redirect('profile?message=' + encodeURIComponent("Emailadres updated!"));
						return
					})
				})
			}
		})
	}
})

//Update a new password
router.post('/newpassword', (req, res) => {
	//In case front end validation breaks, make sure new password is at least 8 characters
	if(req.body.newpassword.length <= 5) {
		res.redirect('profile?message=' + encodeURIComponent("Your password should be at least 8 characters long. Please try again."));
		return;
		//Then check whether user didn't make a typo in choosing a new password
	} else if(req.body.newpassword !== req.body.newpassword2) {
		res.redirect('profile?message=' + encodeURIComponent("Your passwords did not match. Please try again."));
		return;
	} else {
		//Since the username never changes, request users from the database that have the same username as the current user.
		db.User.findOne({
			where: {
				emailadress: req.session.emailadress
			}
			//Since changing a password is a heavy change, first the old password is required. The old password needs to match the one in the database.
		}).then( (user) => {
			bcrypt.compare(req.body.oldpassword, user.password, (err, result) => {
				if(result) {
					//If the user succesfully passed all this validation, a new hashed password will be made.
					bcrypt.hash(req.body.newpassword, null, null, function(err, hash) {
						if (err) throw (err)
							user.updateAttributes({
								password: hash,
							})
					})
					req.session.emailadress = user.emailadress
					res.redirect('/profile?message=' + encodeURIComponent('Your password has been changed.'))
					return
				} else {
					res.redirect('/profile?message=' + encodeURIComponent('Your old password is incorrect. Please try again.'))
					return
				}
			})
		})
	}
})

//updated the sent messages frequency
router.post('/newfreq', (req, res) => {
	if(req.body.newfreq < 5 || req.body.newfreq > 0) {
		res.redirect('/profile?message=' + encodeURIComponent("You can only receive between 1 and 5 messages a day!"))
		return
	}

	else {
		console.log(req.body.frequency)
		db.User.findOne({
			where: {
				emailadress: req.session.emailadress
			}
		}).then ( (user) => {
			user.updateAttributes({
				maxmessages: req.body.frequency
			}).then( (user) => {
				req.session.emailadress = user.emailadress
				res.redirect('/profile?message=' + encodeURIComponent('Your messages frequency has been changed.'))
			})
		})
	}

})

//update contactdays
router.post('/newcontactday', (req, res) => {
	let myContactDays = req.body.day
	if(typeof myContactDays == 'undefined') {
		res.redirect('/profile?message=' + encodeURIComponent("Please choose at least one day"))
		return
	}
	
	if(req.body.day.length >= 0) {
		db.User.findOne({
			where: {
				emailadress: req.session.emailadress
			}
		}).then( (user) => {
			user.updateAttributes({
				contactdays: req.body.day
			}).then( (user) => {
				req.session.emailadress = user.emailadress
				res.redirect('/profile?message=' + encodeURIComponent('Your contact days has been updated'))
			})
		})
	}

})

//Update Location
router.post('/newloc', (req, res) => {
	//back-end validation needs to be better.
	if(req.body.adress > 2) {
		res.redirect('/profile?message=' + encodeURIComponent("Please give a longer location"))
		return
	}

	else {
		db.User.findOne({
			where: {
				emailadress: req.session.emailadress
			}
		}).then ( (user) => {
			user.updateAttributes({
				lat: req.body.lat,
				lng: req.body.lng,
				city: req.body.city
			}).then ( (user) => {
				req.session.emailadress = user.emailadress
				res.redirect('/profile?message=' + encodeURIComponent('New location set!'))
			})

		})
	}
})



module.exports = router


// router.get('/profile', (req, res) => {
// 	let email = req.session.emailadress
// 	if(email) {
// 		db.User.findOne({
// 			where: {
// 				emailadress: email
// 			}
// 		}).then( (user) => {

// 			//Check sunset/rise times
// 			let times = SunCalc.getTimes(new Date(), user.lat, user.lng)

// 			//Only run the nesseciary functions if the sun is currently up
// 			if (times.sunrise < date && times.sunset > date) {
// 				console.log(date)
				
// 				forecast.get([user.lat, user.lng], function(err, weather) {
// 					if(err) throw err

// 					if(weather.currently.icon == 'clear-day') {
// 						console.log('Yes the sun shines atm')

// 						for (var i = 0; i < user.contactdays.length; i++) {
// 							if(user.contactdays[i] == currentDay) {
// 								console.log(currentDay)
// 								if(user.medium == 'email') {
// 									sendEmail(user, weather, req, res)
// 								}
// 								if(user.medium == 'text') {
// 									sendText(user, weather, req, res)
// 								}
// 							}
// 						}
// 					}
// 					else {
// 						console.log('The sun is hiding it self')
// 						console.log(weather.currently.icon)
// 						res.render('profile', {
// 							message: req.query.message,
// 							weather: weather.currently.icon
// 						})
// 					}
// 				})
// 			}
// 			else {
// 				res.render('profile', {
// 					message: req.query.message,
// 					weather: 'The sun is currently under, tomorrow is a new day full of opportunities!'
// 				})
// 			}
// 		})
// 	}
// 	else {
// 		res.redirect('/index')
// 	}
// })



