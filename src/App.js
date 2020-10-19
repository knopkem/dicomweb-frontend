import React, { Component } from 'react';
import StudyBrowser from './StudyBrowser';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import SeriesTable from './components/SeriesTable';

class App extends Component {
  render() {
    return (
        <Router>
            <div>
            <Switch>
                <Route exact path="/" component={StudyBrowser} />
                <Route path="/viewer/:uid" component={SeriesTable} />
            </Switch>
            </div>
        </Router>
    )
  }
}
export default App
