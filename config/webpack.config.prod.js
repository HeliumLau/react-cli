const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const HappyPack = require('happypack');
const os = require('os');

const paths = require('./paths');
const externals = require('./externals.js');
const alias = require('./alias');

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const extractCSS = new ExtractTextPlugin({ filename: 'static/stylesheets/[name]-css-[chunkhash:8].css', allChunks: true });
const extractLESS = new ExtractTextPlugin({ filename: 'static/stylesheets/[name]-less-[chunkhash:8].css', allChunks: true });

module.exports = {
	// Don't attempt to continue if there are any errors.
	bail: true,
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	devtool: 'source-map',
	// In production, we only want to load the polyfills and the app code.
	entry: {
		app: [ paths.appIndexJs ]
	},
	output: {
		// The build folder.
		path: paths.appBuild,
		// Generated JS file names (with nested folders).
		// There will be one main bundle, and one file per asynchronous chunk.
		// We don't currently advertise code splitting but Webpack supports it.
		filename: 'static/js/[name].[chunkhash:8].js',
		chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
		// We inferred the "public path" (such as / or /my-project) from homepage.
		publicPath: '/',
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
		extensions: ['.js', '.json', '.jsx'],
		alias: alias,
		plugins: [
			// Prevents users from importing files from outside of src/ (or node_modules/).
			// This often causes confusion because we only process files within src/ with babel.
			// To fix this, we prevent you from importing files out of src/ -- if you'd like to,
			// please link the files into your node_modules/ and let module-resolution kick in.
			// Make sure your source files are compiled, as they will not be processed in any way.
			new ModuleScopePlugin(paths.appSrc)
		]
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				exclude: [
					/\.html$/,
					/\.md$/,
					/\.(js|jsx)$/,
					/\.css$/,
					/\.less$/,
					/\.json$/,
					/\.bmp$/,
					/\.gif$/,
					/\.jpe?g$/,
					/\.png$/
				],
				loader: 'file-loader',
				options: {
					name: 'static/media/[name].[ext]'
				}
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
				include: paths.appSrc,
				exclude: /node_modules/,
				loader: 'happypack/loader?id=happyBabel',
			},
			{
				test: /\.less$/i,
				include: paths.appSrc,
				exclude: /node_modules/,
				use: extractLESS.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true,
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: [require('autoprefixer')('last 100 versions')]
							},
						}
					],
				}),
			},
			{
				test: /\.css$/,
				loader: extractCSS.extract({
					fallback: 'style-loader',
					use: 'happypack/loader?id=css'
				})
			},
		]
	},
	plugins: [
		new DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production'),
				BABEL_ENV: JSON.stringify('production'),
			}
		}),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new ProgressBarPlugin(),
		extractCSS,
		extractLESS,
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
			filename: 'index.html',
			hash: true,
			minify: false,
			chunks: ['app'],
			chunksSortMode: function (entry1, entry2) {
				return 1; // <-- your fancy array sort method goes here :)
			}
		}),
		new UglifyJSPlugin({
			cache: true,
			parallel: true,
			sourceMap: true,
			uglifyOptions: {
				output: {
					comments: false
				},
				compress: {
					warnings: false
				}
			}
		}),
		new HappyPack({
			id: 'happyBabel',
			loaders: [{
				loader: 'babel-loader?cacheDirectory=true',
			}],
			threadPool: happyThreadPool,
			verbose: true,
		}),
		// Generate a manifest file which contains a mapping of all asset filenames
		// to their corresponding output file so that tools can pick it up without
		// having to parse `index.html`.
		new ManifestPlugin({
			fileName: 'asset-manifest.json'
		}),
	]
};
