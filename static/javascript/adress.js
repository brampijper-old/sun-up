let input = document.getElementById("inputAdress");
let lat = document.getElementById('lat')
let lng = document.getElementById('lng')
let city = document.getElementById('city')

function setupBaseURL() {
	const url=`https://photon.komoot.de/api/?q=${input.value}&limit=1`;
	receiveAdressInfo(url)
}

function receiveAdressInfo(url) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url);
	Http.send();
	
	Http.onreadystatechange=function() {
		if(this.readyState==4 && this.status==200) {
			const json = JSON.parse(Http.responseText);
			const data = json.features[0];
			displayAdress(data)
		}
	}
}

function getCurrentLoc() {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(function(position) {
			const lon = position.coords.longitude
			const lat = position.coords.latitude
			const url=`https://photon.komoot.de/reverse?lon=${lon}&lat=${lat}`; 
			receiveAdressInfo(url);
		})
	} else {
		console.log('geolocation is not available');
	}
}

function displayAdress(data) {
	const cityName = data.properties.city ? data.properties.city : data.properties.name; 

	city.value = cityName;
	lng.value = data.geometry.coordinates[0];
	lat.value = data.geometry.coordinates[1];

	input.value = cityName + ', ' + data.properties.country;
}