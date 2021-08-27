
import React, { useState, useEffect } from 'react';
import { LoginButton } from './LoginButton';
import {LogoutButton} from './LogoutButton'
import ProfilePic from './ProfilePic'
import { Link } from 'react-router-dom';
import './Navbar.css';
import Cookies from 'js-cookie'

const API = process.env.REACT_APP_API || 'http://localhost:3001';

function Navbar() {
  const [click, setClick] = useState(false);
  const [isAuth, setAuth] = useState(false); 
  const [loading, setLoading] = useState(true)
  
  async function fetchAuthState() {
      const token = {token: Cookies.get('token')}
  
      if(token.token===undefined){
        setLoading(false)
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
            setAuth(data.loggedIn)
            setLoading(false)
            console.log(data)
          })
      }
      catch(err){
          console.log(err)
          setLoading(false)
          return
      }
      };
  
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  useEffect(() => {
    fetchAuthState();
  }, []);

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            Rosette
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          {loading? (<p>checking auth</p>): 
          (<> 
          {!isAuth && <LoginButton buttonStyle='btn--outline'>Login</LoginButton>}
          {isAuth && <ProfilePic size = {150}/>}
          {isAuth && <LogoutButton buttonStyle='btn--outline'>Logout</LogoutButton>}
          </>)}
        </div>
      </nav>
    </>
  );
}

export default Navbar;

/*          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/people' className='nav-links' onClick={closeMobileMenu}>
                People
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/topics'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Topics
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/groups'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Groups
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/about'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                About
              </Link>
            </li>

          </ul>
          
            const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };
  */