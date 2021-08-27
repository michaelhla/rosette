import React from 'react';
import './Persongrid.css';
import Personcard from './Personcard';

function Persongrid() {
  return (
    <div className='pcards'>
      <div className='pcards__container'>
        <div className='pcards__wrapper'>
          <ul className='pcards__items'>
          <Personcard
            text = 'Michael Hla' 
            group = 'Massachusetts General Hospital' 
            path = '/profile' 
            id = 'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg'/>
            <Personcard
            text = 'Michael Hla' 
            group = 'Massachusetts General Hospital' 
            path = '/postmanager' 
            id = 'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg'/>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Persongrid;