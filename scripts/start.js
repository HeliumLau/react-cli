'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
	throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const webpack = require('webpack');
const chalk = require('chalk');
const WebpackDevServer = require('webpack-dev-server');
const openBrowser = require('react-dev-utils/openBrowser');
const {
	choosePort,
	createCompiler,
	prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');
const createWebpackDevServerConfig = require('../config/webpackDevServer.config');
const webpackDevConfig = require('../config/webpack.config.dev');

const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT, 10) || 3009;

// choose a port firstly
choosePort(HOST, PORT).then(port => {
	if (port === null) {
		console.error(chalk.red('You cannot choose this port!'));
		return;
	}
	const url = prepareUrls(PROTOCOL, HOST, port);
	const appName = require(paths.appPackageJson).name;
	const useYarn = fs.existsSync(paths.yarnLockFile);
	const compiler = createCompiler(webpack, webpackDevConfig, appName, url, useYarn);
	const webpackDevServerConfig = createWebpackDevServerConfig(
		undefined,
		url.lanUrlForConfig,
	);
	const devServer = new WebpackDevServer(compiler, webpackDevServerConfig);

	// launch the server
	devServer
		.listen(port, HOST, error => {
			if (error) {
				return console.error(error);
			}
			console.warn(chalk.cyan('Starting the development server...\n'));
			openBrowser(url.localUrlForBrowser);

			['SIGINT', 'SIGTERM'].forEach(function (sig) {
				process.on(sig, function () {
					devServer.close();
					process.exit();
				});
			});
		});
}).catch(error => {
	if (error && error.message) {
		console.error(error.message);
		process.exit(1);
	}
});
