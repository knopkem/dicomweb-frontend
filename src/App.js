import React, { Component } from 'react'
import NavBar from './components/Navbar'
import DataTable from "./components/DataTable"
class App extends Component {
  render() {
    return (
      <div>
        <NavBar />
        <DataTable />
      </div>
    )
  }
}
export default App
