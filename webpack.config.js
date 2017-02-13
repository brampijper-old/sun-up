module.exports = { 
	entry: __dirname + '/static/javascript/main.js',
	output: {
		filename: __dirname + '/static/client/bundle.js'
	},
	module: {
		loaders: [{
			test: /\.scss$/,
			loaders: ["style", "css", "sass"]
		}]
 	}
}