
import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';


const STYLES = ['btn--primary', 'btn--outline', 'btn--test'];

const SIZES = ['btn--medium', 'btn--large'];

export const LoginButton = ({
  children,
  type,
  buttonStyle,
  buttonSize
}) => {
  const checkButtonStyle = STYLES.includes(buttonStyle)
    ? buttonStyle
    : STYLES[0];

  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

  return <Link to= '/login'><button
  className={`btn ${checkButtonStyle} ${checkButtonSize}`} 
  type = {type}>{children}</button></Link>
  
};


export default LoginButton;