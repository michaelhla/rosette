import React from 'react'; 
import { Link } from 'react-router-dom';
import '../../App.css';


class Login extends React.Component {
    render() {
    return (
      <>
      <form id="signin" name="signin" method="post" action="http://localhost:3001/signin">
      <label htmlFor="email">Email Address</label>
      <input className="text" name="email" type="text" required = "required"/>
      <label htmlFor="password">Password</label>
      <input name="password" type="password" required = "required"/>
      <input className="btn" type="submit" value="Sign In" />
      </form>
      <Link to = 'signup'> Sign Up</Link>
      </>
    ); 
    } 
}
export default Login;