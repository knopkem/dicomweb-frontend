import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Loading from './components/loading';
import { QueryClient, QueryClientProvider } from 'react-query';
const StudyBrowser = lazy(() => import('./studyBrowser'));
const SeriesTable = lazy(() => import('./components/seriesTable'));
const queryClient = new QueryClient();

class App extends Component {
  render() {
    return (
      <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <Router>
          <Switch>
            <Route exact path="/" component={StudyBrowser} />
            <Route path="/viewer/:uid" component={SeriesTable} />
          </Switch>
        </Router>
      </Suspense>
      </QueryClientProvider>
    );
  }
}
export default App;
