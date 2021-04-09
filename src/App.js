import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Loading from './components/loading';
const StudyBrowser = lazy(() => import('./studyBrowser'));
const SeriesTable = lazy(() => import('./components/seriesTable'));

class App extends Component {
  render() {
    return (
      <Suspense fallback={<Loading />}>
        <Router>
          <Switch>
            <Route exact path="/" component={StudyBrowser} />
            <Route path="/viewer/:uid" component={SeriesTable} />
          </Switch>
        </Router>
      </Suspense>
    );
  }
}
export default App;
