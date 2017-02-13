const sequelize		= require ('sequelize')
const express 		= require ('express')
const bodyParser 	= require ('body-parser')
const bcrypt 		= require ('bcrypt-nodejs')
const session 		= require ('express-session')
const router  		= express.Router ( )

// Require the Nexmo Texting API
const Nexmo 		= require ('nexmo')

// Require the Dark Sky API
const Forecast 		= require ('forecast')

// Require the sendgrid libraries (email)
let sg 				= require('sendgrid')(process.env.SENDGRID_API_KEY)
const helper 		= require ('sendgrid').mail

// require the sun Calc package to calculate sunset/rise
const SunCalc 		= require('suncalc')

let db 				= require(__dirname + '/../modules/database')

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

//Get current weekday
let date = new Date()
let weekday = new Array(7)
weekday[0] = "sunday"
weekday[1] = "monday"
weekday[2] = "tuesday"
weekday[3] = "wednesday"
weekday[4] = "thursday"
weekday[5] = "friday"
weekday[6] = "saturday"
let currentDay = weekday[date.getDay()];

// Set-up the sendgrid variables that don't change
let from_email = new helper.Email('brampijper@gmail.com')
let subject = 'The sun is currently shining!'
let content = new helper.Content('text/plain', 'Maybe take a quick break and go outside? :) ')

function checkSunrise() {
	db.User.findAll({
		where: {
			contactdays: {$contains: [currentDay]},
		}
	}).then( (user) => {

		user.forEach(function(person, index) {

			let times = SunCalc.getTimes(new Date(), person.lat, person.lng)

			if (times.sunrise < date && times.sunset > date) {
				checkWeather(person)
			}

			else {
				console.log('the sun is currently under')
			}
		})
	})	
}

function checkWeather(person) {

	if(person.sentmessages <= person.maxmessages) {
		
		forecast.get([person.lat, person.lng], (err, weather) => {
			console.log(weather.currently.icon)
			if (weather.currently.icon == 'clear-day' || weather.currently.icon == 'partly-cloudy-day') {
				
				if(person.medium == 'email') {
					sendEmail(person)
				}

				if(person.medium == 'text') {
					sendText(person)
				}
			}
			else {
				console.log('the weather is not that great')
			}
		})
	}
	else {
		console.log(person.emailadress + 'received max messages')
	}
}

function sendEmail(person) {

	// set the user's email to his emailadress
	let to_email = new helper.Email(person.emailadress)
	
	//define the mail properties
	let mail = new helper.Mail(from_email, subject, to_email, content)

	// Define the request
	let request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: mail.toJSON(),
	})
	
	// Sends the request
	sg.API(request, function(error, response) {
		if(error) {
			console.log('Error response received')
		}

		console.log(response.statusCode)
		console.log(response.body)
		console.log(response.headers)

		if(!error && response.statusCode == 202) {
			console.log('email succesfully send to: ' + person.emailadress + ' ' + ' in: ' + person.city)
			person.updateAttributes({
				sentmessages: sequelize.literal('sentmessages +1')
				// sunAlertsReceived: sequelize.literal('sunAlertsReceived +1') 
			})
		}
	})
}

// Setting the API key as environment variables
let nexmo = new Nexmo({
	apiKey: (process.env.NEXMO_API_KEY),
	apiSecret: (process.env.NEXMO_API_SECRET)
})

// hardcoded var's at the moment
let sender = 31620702024
// let recipient = 31618145253
let message = 'The sun is currently shining! :happyface '

function sendText(person) {
	nexmo.message.sendSms(sender, person.phonenumber, message, (err, responseData) => {
		if(err) console.log(err)
			if (responseData) {
				console.log(responseData)
				person.updateAttributes({
					sentmessages: sequelize.literal('sentmessages +1')
					// sunAlertsReceived: sequelize.literal('sunAlertsReceived +1')
				}).then( () => {
					console.log('frequency updated')
				})
			}
			else {
				console.log('text message was not send')
			}
	})
}

//export defined module
module.exports = checkSunrise