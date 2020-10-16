import React, { Component } from 'react';
import StudyBrowser from './StudyBrowser';
import VTKLoadImageDataExample from './VTKLoadImageDataExample';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import NavBar from './components/Navbar';

class App extends Component {
  render() {
    return (
        <Router>
            <div>
            <Switch>
                <Route exact path="/" component={StudyBrowser} />

                <Route path="/viewer/:uid" component={VTKLoadImageDataExample} />} />
            </Switch>
            </div>
        </Router>
    )
  }
}
export default App
