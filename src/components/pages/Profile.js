import React from 'react'; 
import '../../App.css';
import ProfilePic from '../ProfilePic';
import Cards from '../Cards'; 

const API = process.env.REACT_APP_API || 'http://localhost:3001';


class Profile extends React.Component {
    state = { 
        posts: [], 
        loading: true, 
    }

    componentDidMount() { 
        this.getUserPosts();
    }

    async fetch(endpoint, author, body) {
        try {
          const response = await fetch(`${API}${endpoint}/${author}`, {
            method: 'get',
            body: body && JSON.stringify(body),
            headers: {
              'content-type': 'application/json',
              accept: 'application/json',
              //authorization: `Bearer ${await this.props.auth.getAccessToken()}`,
            },
          });
          return await response.json();
        } catch (error) {
          console.error(error);
          this.setState({ error });
        }
    };

    async getUserPosts() { 
        this.setState({posts: await this.fetch('/posts', this.props.match.params.author)})
    }

    render() {
        console.log(this.state.posts)
        return (
            <>
            <ProfilePic size = {150}/>
            <h1> MichaelHla </h1>
            <p> Massachusetts General Hospital </p>
            <Cards posts = {this.state.posts}/> 
            </>
          
        )
    }
}
export default Profile; 