import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Loading from './components/loading';
import StudyBrowser from './studyBrowser';
const SeriesViewer = lazy(() => import('./components/SeriesViewer'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Switch>
          <Route exact path="/" component={StudyBrowser} />
          <Route path="/viewer/:studyUid/:seriesUid" component={SeriesViewer} />
        </Switch>
      </Router>
    </Suspense>
  );
}

export default App;
