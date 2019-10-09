$(document).ready( ( ) => {
	
	// Materialize for small screen devices
    $('.sidenav').sidenav();
	$('.tabs').tabs();
	$('.collapsible').collapsible();


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

		// console.log(imgOpacity)

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