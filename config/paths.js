const fs = require('fs');
const path = require('path');
const url = require('url');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

const ensureSlash = (path, needsSlash) => {
	const hasSlash = path.endsWith('/');
	if (hasSlash && !needsSlash) {
		return path.substr(path, path.length - 1);
	} else if (!hasSlash && needsSlash) {
		return `${path}/`;
	}
	return path;
};

const getPublicUrl = appPackageJson =>
	envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath (appPackageJson) {
	const publicUrl = getPublicUrl(appPackageJson);
	const servedUrl =
		envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
	return ensureSlash(servedUrl, true);
}

module.exports = {
	appIndexJs: resolveApp('src/index.js'),
	appBuild: resolveApp('dist'),
	appPublic: resolveApp('public'),
	appSrc: resolveApp('src'),
	appNodeModules: resolveApp('node_modules'),
	appHtml: resolveApp('public/index.html'),
	yarnLockFile: resolveApp('yarn.lock'),
	appPackageJson: resolveApp('package.json'),
	servedPath: getServedPath(resolveApp('package.json')),
};
