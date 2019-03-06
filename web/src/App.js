import React, { Component } from 'react';
import './App.css';

let socket = require('socket.io-client')('http://localhost:3001');

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      battery: undefined,
      disk: undefined,
      id: undefined,
      memory: undefined,
      user: undefined
    }
  }

  componentDidMount() {
    socket.on('0', (data) => {
      console.log('Recieved: ' + data)
      this.setState({
        battery: data.battery,
        disk: data.disk,
        id: data.id,
        memory: data.memory,
        user: data.user
      })
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        Node Test <br />
        Node: {this.state.id} Battery: {this.state.battery}% Disk: {this.state.disk} Memory: {this.state.memory}% User: {this.state.user}
        </header>
      </div>
    );
  }
}

export default App;
