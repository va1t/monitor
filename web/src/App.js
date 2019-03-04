import React, { Component } from 'react';
import './App.css';

let socket = require('socket.io-client')('http://localhost:3001');

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
        test
        </header>
      </div>
    );
  }
}

export default App;
