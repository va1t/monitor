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
          id: undefined,
          battery: undefined,
          disk: undefined,
          memory: undefined,
          user: undefined,
          ip: undefined
        }
      ]
    }
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
          <ul>
            {
              this.state.nodes.map(node => {
                return <li key={node.id} style={{'list-style': 'none'}}> Node: {node.id} {node.battery === null || node.battery === undefined ? '' : 'Battery:'} {node.battery} {node.battery === null || node.battery === undefined ? '' : '%'} Disk: {node.disk} Memory: {node.memory}% User: {node.user} IP: {node.ip}</li>
              })
            }
          </ul>
        </header>
      </div>
    );
  }
}

export default App;
