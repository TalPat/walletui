import axios from 'axios';
import { decode } from 'jsonwebtoken';
import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import './skeleton.css';


class Index extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userName: '',
      userId: '',
      accounts: []
    }
    let token = sessionStorage.getItem('token')
    if (token) {
      axios.get('http://192.168.60.148:3000/users/'+decode(token).authData.id, {
        headers: {
          'Authorization': 'bearer '+ token
        }
      }).then(response => {
        console.log(response)
        this.setState({
          userName: response.data.userName,
          userId: response.data.id
        })


        console.log('http://192.168.60.148:3000/accounts/?owner='+response.data.id)
        axios.get('http://192.168.60.148:3000/accounts/?owner='+response.data.id, {
          headers: {
            'Authorization': 'bearer '+ token
          }
        }).then(response => {
          console.log(response)
          this.setState({
            accounts: response.data.map((step, move) => {
              const active = step.deletedAt ? 'inactive' : 'active'
              return (
                <li key={move}>
                  {step.name + ' ' + active}
                </li>
              );
            })
          })
        })


      }).catch(error => {
        window.location.href = "/login";
      })
    } else {
      window.location.href = "/login";
    }
  }


  
  render() {
    return (
      <div>
        <h2>Home</h2>
        <p>Logged in as: {this.state.userName}</p>
        <ol>{this.state.accounts}</ol>
      </div>
    )
  }
}

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      response: '',
      status: '',
    };
    this.handleCheck = this.handleCheck.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleCheck () {
    axios.post('http://192.168.60.148:3000/token', {
      userName: this.state.username,
      pssword: this.state.password
    })
    .then(response => {
      this.setState({
        "response": response,
        "status": ''
      })
      sessionStorage.setItem('token', this.state.response.data.token)
      window.location.href = "/";
    })
    .catch(error => {
      console.log(error);
      this.setState({
        "status": "Invalid login"
      })
      console.log(this.state.status)
    })

  }

  handleChange (event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    console.log({
      [name]: value 
    });
    

    this.setState({
      [name]: value 
    })
  }

  render() {
    return (
      <div>
          <h2>Wallet Login</h2>
          <input
            name = 'username'
            type = 'text'
            placeholder = "Username"
            value={this.state.value}
            onChange={this.handleChange}
          /><br/>
          <input
            name = 'password'
            type = 'password'
            placeholder = "Password"
            value={this.state.value}
            onChange={this.handleChange}
          /><br/>
          <button
            onClick={this.handleCheck}
          >Login</button><br></br>
          <p>{this.state.status}</p>
      </div>
    );
  }
}

class Users extends React.Component {
  render() {
    return (
      <h2>Users</h2>
    )
  }
}

class View extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userList: [],
      transactionList: [],
      accountList: [],
      userName: '',
      userId: '',
      token: ''
    };
    let token = sessionStorage.getItem('token')
    if (token) {
      axios.get('http://192.168.60.148:3000/users/'+decode(token).authData.id, {
        headers: {
          'Authorization': 'bearer '+ token
        }
      }).then(response => {
        console.log(response)
        this.setState({
          userName: response.data.userName,
          userId: response.data.id,
          token: token
        })


        axios.get('http://192.168.60.148:3000/users/', {
          headers: {
            'Authorization': 'bearer '+ token
          }
        }).then(response => {
          console.log(response)
          this.setState({
            userList: response.data.map((data, index) => {
              console.log(data)
              return (
                <li 
                  key={index}
                  userid={data.id}
                  onClick={() => this.selectUser(data.id)}
                >
                  {'username: '+data.userName}
                </li>
              );
            })
          })
        })


      }).catch(error => {
        window.location.href = "/login";
      })
    } else {
      window.location.href = "/login";
    }
    this.selectAccount = this.selectAccount.bind(this)
    this.selectUser = this.selectUser.bind(this)
  }

  selectAccount(account) {
    console.log('http://192.168.60.148:3000/transactions/?account='+account)
    axios.get('http://192.168.60.148:3000/transactions/?account='+account, {
      headers: {
        'Authorization': 'bearer '+ this.state.token
      }
    }).then(response => {
      console.log(response)
      this.setState({
        transactionList: response.data.map((data, index) => {
          console.log(data)
          return (
            <li 
              key={index}
            >
              <div className="row">
                <div className="eight columns">{data.debitAccountId===account ? data.creditAccountId : account}</div>
                <div className="two columns">{data.debitAccountId===account ? '-'+data.amount : '_'}</div>
                <div className="two columns">{data.debitAccountId===account ? '_' : data.amount}</div>
              </div>
            </li>
          );
        })
      })
    })
    .catch(error => {
      this.setState({
        transactionList: "Unable to fetch data"
      })
    })
  }

  selectUser(id) {
    console.log('http://192.168.60.148:3000/accounts/?owner='+id)
    axios.get('http://192.168.60.148:3000/accounts/?owner='+id, {
      headers: {
        'Authorization': 'bearer '+ this.state.token
      }
    }).then(response => {
      console.log(response)
      this.setState({
        accountList: response.data.map((data, index) => {
          console.log(data)
          return (
            <li 
              key={index}
              accountid={data.id}
              onClick={() => this.selectAccount(data.id)}
            >
              {'account name: '+data.name}
            </li>
          );
        }),
        transactionList: []
      })
    })
    .catch(error => {
      this.setState({
        accountList: "Unable to fetch data"
      })
    })
  }

  render() {
    return (
      <div className="container">
        <h2>View</h2>
        <div className="row">
          <div className="three columns"><h4>Users</h4></div>
          <div className="three columns"><h4>Accounts</h4></div>
          <div className="six columns"><h4>Transactions</h4></div>
        </div>
        <div className="row">
          <div className="three columns">{this.state.userList}</div>
          <div className="three columns">{this.state.accountList}</div>
          <div className="six columns">{this.state.transactionList}</div>
        </div>
      </div>
    )
  }
}

class AppRouter extends React.Component {
  logout() {
    sessionStorage.clear()
  }

  render () {
    return(
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/view">View</Link>
              </li>
              <li>
                <Link to="/login/">Login</Link>
              </li>
              <li>
                <Link to="/users/">Users</Link>
              </li>
              <li
                onClick={this.logout}
              >
                <Link to="/login/">Logout</Link>
              </li>
            </ul>
          </nav>

          <Route path="/" exact component={Index} />
          <Route path="/login/" component={Login} />
          <Route path="/users/" component={Users} />
          <Route path="/view/" component={View} />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<AppRouter/>, document.getElementById('root'))
