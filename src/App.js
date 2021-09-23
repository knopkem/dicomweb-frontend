import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Loading from './components/loading';
const SeriesViewer = lazy(() => import('./components/SeriesViewer'));

import StudyBrowser from './studyBrowser';

function App() {
  return (
    <Suspense fallback={<Loading />}>
        <Router>
          <Switch>
            <Route exact path="/" component={StudyBrowser} />
            <Route path="/viewer/:uid" component={SeriesViewer} />
          </Switch>
        </Router>
      </Suspense>
  );
}

export default App;
