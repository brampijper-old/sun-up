//Import modules
require('dotenv').config();
const sequelize = require('sequelize')
const express = require ('express')
const bcrypt = require ('bcrypt-nodejs')

const db = {}

// Connect to database
db.conn = new sequelize ('sunup', process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

//Define Database Models
db.User = db.conn.define('user', {
	emailadress: sequelize.STRING,
	password: sequelize.STRING,
	phonenumber: sequelize.STRING,
	lat: sequelize.STRING,
	lng: sequelize.STRING,
	city: sequelize.STRING,
	medium: sequelize.STRING,
	maxmessages: sequelize.INTEGER,
	sentmessages: sequelize.INTEGER,
	contactdays: sequelize.ARRAY(sequelize.TEXT),
	sunAlertsReceived: sequelize.INTEGER
})

//sync with the database
db.conn.sync( {force:true}).then( () => {
	
	//Create a sample user
	bcrypt.hash('a', null, null, function (error, hash) {
		if(error) throw error

		// db.User.create({
		// 	emailadress: 'bramm-@hotmail.com',
		// 	password: hash,
		// 	phonenumber: '0620702024',
		// 	lat: '-43.285919', 
		// 	lng: '172.807513',
		// 	city: 'Wellington',
		// 	medium: 'email',
		// 	sentmessages: 0, 
		// 	maxmessages: 5,
		// 	contactdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
		// 	sunAlertsReceived: 13
		// })

		// db.User.create({
		// 	emailadress: 'selmadorrestein@gmail.com',
		// 	password: hash,
		// 	phonenumber: '31618145253',
		// 	lat: '52.380398', 
		// 	lng: '4.882814',
		// 	city: 'Eindhoven',
		// 	medium: 'text',
		// 	sentmessages: 0, 
		// 	maxmessages: 5,
		// 	contactdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
		// 	sunAlertsReceived: 3
		// })

		db.User.create({
			emailadress: 'brampijper@gmail.com',
			password: hash,
			phonenumber: '0620702024',
			lat: '52.369079', 
			lng: '4.912339',
			city: 'Amsterdam',
			medium: 'email',
			sentmessages: 0, 
			maxmessages: 5,
			contactdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
			sunAlertsReceived: 7
		})

		// db.User.create({
		// 	emailadress: 'brumpie@hotmail.com',
		// 	password: hash,
		// 	phonenumber: '49585843',
		// 	lat: '-33.922459', 
		// 	lng: '18.436301',
		// 	city: 'Capetown',
		// 	medium: 'email',
		// 	sentmessages: 0, 
		// 	maxmessages: 4,
		// 	contactdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
		// 	sunAlertsReceived: 57
		// })

		// db.User.create({
		// 	emailadress: 'test@gmail.com',
		// 	password: hash,
		// 	phonenumber: '49585843',
		// 	lat: '52.380398', 
		// 	lng: '4.882814',
		// 	city: 'Amsterdam',
		// 	medium: 'email',
		// 	sentmessages: 0,
		// 	maxmessages: 4,
		// 	contactdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
		// 	sunAlertsReceived: 32
		// })
	})
	console.log('Synced with the DB:)')
})

//export defined module
module.exports = db