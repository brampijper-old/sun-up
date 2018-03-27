$(document).ready( ( ) => {
	
	// Materialize for small screen devices
    $('.sidenav').sidenav();
    $('.tabs').tabs();

	//Call on function when user wants to get his current loc
	$('#loc').click(function() {
		if($('#loc').is(':checked')) {
			getCurrentLoc()
		}
	})

	//Show input field when user chooses for phonenumber
	$('input:radio').change(function() {
		if($('#textmsg').is(':checked')) {
			document.getElementById('phonenumber').style.display = 'block'
		}
		if($('#email').is(':checked')) {
			document.getElementById('phonenumber').style.display = 'none'
			$('#phonenumber').removeAttr('required')
		}
	})
	
	//disable day selection when the checkbox: everyday is marked
	$('#everyday').click(function() {
		if($('#everyday').is(':checked')) {
			$('input:checkbox').not(this).prop('checked', this.checked)
		}
		// if every day is not checked anymore then remove the everyday marker check.
		else {
			$('input:checkbox').not(this).prop('checked', false)
		}
	})

	$('.daygroup').click(function() {
		if(!$('#monday').is(':checked') || !$('#tuesday').is(':checked') || !$('#wednesday').is(':checked') || !$('#thursday').is(':checked')
		|| !$('#friday').is(':checked') || !$('#saturday').is(':checked') || !$('#sunday').is(':checked')) { 
			$('#everyday').not(this).prop('checked', false)
		} else {
			$('input:checkbox').not(this).prop('checked', this.checked)
		}
	})

	//Store picture path in an array to load a random picture.
	let imgClouds = ['pictures/cloud1.png','pictures/cloud2.png','pictures/cloud3.png','pictures/cloud4.png','pictures/cloud5.png']

	//Function needs to be called once to keep looping over. 
	getRandomNumbers()

	//Everytime this function runs random numbers will be picked
	function getRandomNumbers() {
		
		let picNr = parseInt((Math.random() * 4) + 0)
		let speed = parseInt(8000 + Math.random()*15000, 10)
		let imgHeight = parseInt((Math.random() * 35) + 1)
		let imgOpacity = parseFloat((Math.random() * 0.8) + 0.3)

		console.log(imgOpacity)

		//Pass the variables to the animation function
		mainCloudAnimation(picNr, imgHeight, imgOpacity, speed)
	}

	//Animating the clouds in the header on random height, speed and image. 
	function mainCloudAnimation(picNr, imgHeight, imgOpacity, speed) {

		var cloudImg = $("#cloud1")

		cloudImg.attr('src', imgClouds[picNr])
		cloudImg.css('top', imgHeight + '%')
		cloudImg.css('opacity', imgOpacity)

		//get current window.width
		width = cloudImg.get(0).width
		screenWidth = $(window).width()

		//animation from the left side of the screen. 
		cloudImg.css('left', -width)
		.animate({
			'left': screenWidth
		},speed, 'linear', getRandomNumbers)
	}
})


let input = document.getElementById("inputAdress");
let lat = document.getElementById('lat')
let lng = document.getElementById('lng')
let city = document.getElementById('city')
let geocoder = new google.maps.Geocoder()

function checkGeoLoc() {
	let latlng = {lat: '', lng: ''}
	geocoder.geocode({'address': input.value}, function(results, status){
		if (status === google.maps.GeocoderStatus.OK && results.length > 0 ) {
			console.log(results[0])
			latlng = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}
			lat.value = latlng.lat
			lng.value = latlng.lng
			input.value = results[0].formatted_address


			var address = results[0].address_components
			for (var p = address.length-1; p >= 0; p--) {
				if (address[p].types.indexOf("locality") != -1) {
      				console.log(address[p].short_name)
      				city.value = address[p].long_name
      			}
      			// if (address[p].types.indexOf("country") != -1) {
      			// 	console.log(address[p].short_name + address[p].long_name)
      			// 	city.value = address[p].short_name + address[p].long_name
      			// }
      		}

		}
		else {
			alert("invalid adress")
		}
	})
}

//radiobuttion currentlocation
function getCurrentLoc () {
	console.log('function runs')
	locationInput = document.getElementById('locationField').innerHTML
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition)
	} else {
		input.value = 'Your browser does not support Geolocation'
	}
}

//show adress in input field
function showPosition (position) {
	let latlng = {lat: position.coords.latitude, lng: position.coords.longitude}
	lat.value = latlng.lat
	lng.value = latlng.lng
	console.log(latlng.lng)
	geocoder.geocode({'location' : latlng}, function (results, status) {
		if(status === 'OK') {
			input.value = results[0].formatted_address

			var address = results[0].address_components
			for (var p = address.length-1; p >= 0; p--) {
      			// if (address[p].types.indexOf("country") != -1) {
      			// 	console.log(address[p].short_name + address[p].long_name)
      			// }
      			if (address[p].types.indexOf("locality") != -1) {
      				console.log(address[p].short_name)
      				city.value = address[p].short_name
      			}
      		}
		}

		else {
			window.alert('Not a valid adress')
		}
	})
}