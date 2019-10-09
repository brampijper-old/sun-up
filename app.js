//Require Libraries
const express = require ('express')
const sequelize = require('sequelize')
const bodyParser = require('body-parser')
const bcrypt = require ('bcrypt-nodejs')
const session = require('express-session')
const pg = require ('pg')
const cron = require('node-cron')

//Initialize App
const app = express ( )

//Set the standard folder to static
app.use(express.static(__dirname + "/static"))

//Make the bodyParser work
app.use(bodyParser.urlencoded({extended: true}))

//Make a session for the user
app.use(session({
	secret: 'this is a passphrase or something so ladieda',
	resave: false,
	saveUninitialized: false
}))


let db 				= require(__dirname + '/modules/database')
let checkSunrise 	= require(__dirname + '/modules/check-weather')

// require the sun Calc package to calculate sunset/rise
const SunCalc 		= require('suncalc')

//Set view engine to pug
app.set ('view engine', 'pug')
app.set ('views', __dirname + '/views')

//require routes
let registerRouter	= require (__dirname + '/routes/register')
let loginRouter 	= require (__dirname + '/routes/index')
let profileRouter 	= require (__dirname + '/routes/profile')
let logoutRouter 	= require (__dirname + '/routes/logout')

//Make the routes work on '/'
app.use ('/', registerRouter)
app.use ('/', loginRouter)
app.use ('/', profileRouter)
app.use ('/', logoutRouter)

app.get('/index', (req, res ) => {
	res.render('index')
})

// // Check if the sun shines.
// cron.schedule('*/20 * * * * *', function() {
// 	checkSunrise()
// })

// // After sunset reset sendmessages. (check every 2 hrs) 
// cron.schedule('* * 2 * * *', function() {
// 	resetSendMessages()
// })

function resetSendMessages(){
	db.User.findAll({
		where: {
			sentmessages: {$gt: 0}
		}
	}).then( (user) => {
		user.forEach(function(person, index) {
			let times = SunCalc.getTimes(new Date(), person.lat, person.lng)
			if (times.sunrise < date && times.sunset > date) {
				console.log('no reset is happening, cause the sun is still up')
			}
			else {
				console.log(person)
				person.updateAttributes({
					sentmessages: 0
				}).then( (user) => {
					console.log('user freq updated' + user)
				})
			}
		})
	})
}

app.listen (8080, ( ) => {
	console.log('The server is running')
})