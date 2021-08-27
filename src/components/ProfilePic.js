import React from 'react'; 
import { Link } from 'react-router-dom';

const ProfilePic = (props) => {
    return ( 
        <Link to = '/postmanager'>
        <img 
        src = {props.url}
        style = {{height: props.size, width: props.size, borderRadius: props.size, paddingTop: 10}}
        alt = 'profilepic'

        />
        </Link>
    )
}

export default ProfilePic; 