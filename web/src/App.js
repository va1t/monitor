import React, { Component } from 'react';
import './App.css';
import GoogleLogin from 'react-google-login';

let socket = require('socket.io-client')('http://localhost:3001');

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nodes: [
        {
          id: '1',
          battery: 0,
          disk: 0,
          memory: 0,
          user: 'pmaxcy',
          ip: '12.25.25.25'
        }
      ]
    }
    this.listNodes = this.state.nodes.map((node) => {
      console.log('test')
      return(
        <li key={node.id}>Node: {node.id} Battery: {node.battery} {node.battery === 'None' ? '' : '%'} Disk: {node.disk} Memory: {node.memory}% User: {node.user} IP: {node.ip}</li>
      )
    })
  }

  componentDidMount() {

  }

  responseGoogle = (response) => {
    console.log(response);

    if(response.googleId) {
      
      this.setState({
        userID: response.googleId
      })
      
      socket.emit('get_nodes', response, (response) => {
        console.log(response)
      })

      socket.on(response.googleId, (data) => {
        console.log('Recieved: ' + data)
        
        this.setState({
         nodes : data
        })
        
      })
    }
  }

  renderLogin () {
    return (<GoogleLogin
      clientId="109540024689-kj69ovv0mplqu2iern0nqqt2dgposai6.apps.googleusercontent.com"
      buttonText="Login"
      onSuccess={this.responseGoogle}
      onFailure={this.responseGoogle}
    />)
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          { this.state.userId ? this.renderLogin() : this.renderLogin()}
          Node Test <br />
          <div>
            <ul>
              {this.listNodes}
            </ul>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
