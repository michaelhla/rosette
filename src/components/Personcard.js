import React from 'react';
import { Link } from 'react-router-dom';
import ProfilePic from './ProfilePic';

function Personcard(props) {
  return (
    <>
      <li className='pcards__item'>
        <Link className='pcards__item__link' to={props.path}>
            <ProfilePic size = {115} url = {props.id}/>
          <div className = 'pcards__item__info'> 
            <h5 className='pcards__item__text'>{props.text}</h5>
            <p className = 'pcards__item__text'>{props.group}</p>
          </div>
        </Link>
      </li>
    </>
  );
}

export default Personcard;
