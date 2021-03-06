const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	publicPath: "/",
	pages: {
		index: {
			entry:"src/main.js",
			filename:"index.html"
		},
	},
	configureWebpack: config => {
		config.optimization = {
			minimize: (process.env.NODE_ENV=="production"),
			minimizer: []
		}
	}
}
