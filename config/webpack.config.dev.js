const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const paths = require('./paths');
const externals = require('./externals');
const alias = require('./alias');

module.exports = {
	// enhance debugging process
	devtool: 'cheap-module-source-map',
	entry: {
		app: [
			'react-dev-utils/webpackHotDevClient',
			paths.appIndexJs,
		]
	},
	output: {
		path: paths.appBuild,
		pathinfo: true,
		// This does not produce a real file. It's just the virtual path that is
		// served by WebpackDevServer in development. This is the JS bundle
		// containing code from all our entry points, and the Webpack runtime.
		filename: 'static/js/[name].bundle.js',
		// There are also additional JS chunk files if you use code splitting.
		chunkFilename: 'static/js/[name].chunk.js',
		// This is the URL that app is served from. We use "/" in development.
		publicPath: '/',
		// Point sourcemap entries to original disk location (format as URL on Windows)
		devtoolModuleFilenameTemplate: info =>
			path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
	},
	externals,
	resolve: {
		// This allows you to set a fallback for where Webpack should look for modules.
		// We placed these paths second because we want `node_modules` to "win"
		// if there are any conflicts. This matches Node resolution mechanism.
		// https://github.com/facebookincubator/create-react-app/issues/253
		modules: ['node_modules', paths.appNodeModules, paths.appSrc].concat(
			// It is guaranteed to exist because we tweak it in `env.js`
			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		),
		// These are the reasonable defaults supported by the Node ecosystem.
		// We also include JSX as a common component filename extension to support
		// some tools, although we do not recommend using it, see:
		// https://github.com/facebookincubator/create-react-app/issues/290
		// `web` extension prefixes have been added for better support
		// for React Native Web.
		extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
		alias: alias,
		plugins: [
			// Prevents users from importing files from outside of src/ (or node_modules/).
			// This often causes confusion because we only process files within src/ with babel.
			// To fix this, we prevent you from importing files out of src/ -- if you'd like to,
			// please link the files into your node_modules/ and let module-resolution kick in.
			// Make sure your source files are compiled, as they will not be processed in any way.
			new ModuleScopePlugin(paths.appSrc)
		],
	},
	module: {
		// makes missing exports an error instead of warning
		strictExportPresence: true,
		rules: [
			{
				loader: 'file-loader',
				options: { name: 'static/media/[name].[ext]' },
				exclude: [
					/\.html$/, /\.md$/, /\.(js|jsx)$/, /\.css$/,
					/\.less$/, /\.json$/, /\.bmp$/, /\.gif$/,
					/\.jpe?g$/, /\.png$/
				]
			},
			// "url" loader works like "file" loader except that it embeds assets
			// smaller than specified limit in bytes as data URLs to avoid requests.
			// A missing `test` is equivalent to a match.
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'static/media/[name].[hash:8].[ext]'
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: paths.appSrc,
				exclude: /node_modules/,
				query: {
					presets: ['react']
				}
			},
			{
				test: /\.ts(x?)$/,
				use: [
					{
						loader: 'awesome-typescript-loader',
						options: {

						}
					}
				]
			},
			{
				test: /\.less$/i,
				include: paths.appSrc,
				exclude: /node_modules/,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: [require('autoprefixer')('last 100 versions')]
						}
					},
					'less-loader',   // compiles Less to CSS
				],
			},
			{
				test: /\.css$/,
				use: 'happypack/loader?id=css'
			},
		]
	},
	plugins: [
		new DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development'),
				BABEL_ENV: JSON.stringify('development'),
			}
		}),
		// Generates an `index.html` file with the <script> injected.
		new HtmlWebpackPlugin({
			chunksSortMode: function (entry1, entry2) {
				return 1; // <-- your fancy array sort method goes here :)
			},
			inject: true,
			template: paths.appHtml,
			filename: 'index.html',
			chunks: ['app']
		}),
		// If you require a missing module and then `npm install` it, you still have
		// to restart the development server for Webpack to discover it. This plugin
		// makes the discovery automatic so you don't have to restart.
		// See https://github.com/facebookincubator/create-react-app/issues/186
		new WatchMissingNodeModulesPlugin(paths.appNodeModules),
	]
};
