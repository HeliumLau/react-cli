import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './routes/Home';

class Root extends React.Component {
	render () {
		return (
			<Router>
				<div>
					<Switch>
						<Route path="/" component={Home} />
					</Switch>
				</div>
			</Router>
		);
	}
}

render(<Root />, document.getElementById('root'));
