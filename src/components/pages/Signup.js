import React from 'react'; 
import '../../App.css';

class Signup extends React.Component {
    render() {
    return (
      <form id="signup" name="signup" method="post" action="http://localhost:3001/signup">
      <label htmlFor="email">Email Address</label>
      <input className="text" name="email" type="email" required = "required"/>
      <label htmlFor="firstname">Firstname</label>
      <input name="firstname" type="text" required = "required"/>
      <label htmlFor="lastname">Lastname</label>
      <input name="lastname" type="text" required = "required"/>
      <label htmlFor="password">Password</label>
      <input name="password" type="password" required = "required"/>
      <input className="btn" type="submit" value="Sign Up" />
  </form>
    ); 
    } 
}
export default Signup;