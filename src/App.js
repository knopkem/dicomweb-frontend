import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Loading from './components/Loading';
const StudyBrowser = lazy(() => import('./StudyBrowser'));
const SeriesTable = lazy(() => import('./components/SeriesTable'));

class App extends Component {
  render() {
    return (
        <Suspense fallback={<Loading/>}>
        <Router>
                <Switch>
                    <Route exact path="/" component={StudyBrowser} />
                    <Route path="/viewer/:uid" component={SeriesTable} />
                </Switch>
        </Router>
        </Suspense>
    )
  }
}
export default App
