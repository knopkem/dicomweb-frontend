import { CssBaseline } from '@mui/material';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Loading from './components/Loading';
import StudyBrowser from './StudyBrowser';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();
const SeriesViewer = lazy(() => import('./components/SeriesViewer'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Suspense fallback={<Loading />}>
          <Router>
            <Switch>
              <Route exact path="/" component={StudyBrowser} />
              <Route path="/viewer/:studyUid/:seriesUid" component={SeriesViewer} />
            </Switch>
          </Router>
        </Suspense>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
