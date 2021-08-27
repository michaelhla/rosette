import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Cookies from 'js-cookie'

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class ProtectedRoute extends Component {
    constructor(){
        super()
        this.state = { 
            isAuth: false, 
            error: null, 
            loading: true, 
        }
    }
    async fetchAuthState() {
    const token = {token: Cookies.get('token')}

    if(token.token===undefined){
      this.setState({loading:false})
        return
    }
    try{ 
        fetch(`${API}/isAuth`,{
            method: 'post',
            body: token && JSON.stringify(token), 
            headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            }
        }).then(res=>res.json())
        .then(data => {
          this.setState({isAuth : data.loggedIn, loading:false})
          console.log(data)
        })
    }
    catch(err){
        console.log(err)
        this.setState({loading:false})
        return
    }
    };

      componentDidMount() {
          this.fetchAuthState()
      }

    render() {
      const { component: Component, ...props } = this.props
      return (
          <>
        {this.state.loading ? (<p>loading</p>): (<Route 
            {...props} 
            render={props => (
              this.state.isAuth ?
                <Component {...props} /> :
                <Redirect to='/login' />
            )} 
          />)}
          </>
      )
    }
  }

  export default ProtectedRoute; 