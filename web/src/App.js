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
          ip: undefined,
          cpu: undefined,
          userID: 0
        }
      ]
    }
  }

  componentDidMount() {
    socket.on('connected', () => {

      if(this.state.userID !== undefined ) {
        socket.emit('login', {
            "googleId" : this.state.userID
          },(response) => {
            console.log(response)    
          })
      }
    })
  }



  responseGoogle = (response) => {
    console.log(response);

    if(response.googleId) {
      
      this.setState({
        userID: response.googleId
      })
      
      socket.emit('login', response, (response) => {
        console.log(response)
      })

      socket.on(response.googleId, (data) => {

        this.setState({
         nodes : data
        })

      })
    }
  }

  renderCPU(node) {

    return (
      <ul>
        {
         Object.keys(JSON.parse(node.cpu)).map((processor, index) => (
           <li key={index} style={{'list-style': 'none'}}>{processor}<br/> 
              <ul>
              {
                Object.keys(JSON.parse(node.cpu)[processor]).map((core, index) => (
                  <li key={index} style={{'list-style': 'none'}}>{core}   :   {JSON.parse(node.cpu)[processor][core].value}&#176;C</li>
                ))
              }
              </ul>
           </li>
         ))
        }
      </ul>
    )
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
          { this.state.userID ? '' : this.renderLogin() }
          Node Test <br />
          <ul>
            {
              this.state.nodes.map(node => {
                return <li key={node.id} style={{'list-style': 'none'}}> Node: {node.id} {node.battery === null || node.battery === undefined ? '' : 'Battery:'} {node.battery} {node.battery === null || node.battery === undefined ? '' : '%'} Disk: {node.disk} Memory: {node.memory}% User: {node.user} IP: {node.ip} { node.cpu ? this.renderCPU(node) : ''}</li>
              })
            }
          </ul>
        </header>
      </div>
    );
  }
}

export default App;
