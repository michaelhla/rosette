import React from 'react';
import '../../App.css';
import Cards from '../Cards';
import Searchbar from '../Searchbar'; 
import Fuse from "fuse.js"; 

const API = process.env.REACT_APP_API || 'http://localhost:3001';

export default class Home extends React.Component {
  constructor(props) { 
    super(props) 
    this.state = { 
        posts: [], 
        loading: true, 
        error: null, 
        data: [],
    }
    }

  componentDidMount() {
    this.getPosts();
  }

  searchData = (pattern) => { 
    if (!pattern) {
      this.setState({data: this.state.posts})
      return;
    }

  const fuse = new Fuse(this.state.data, {
    keys: ["title", "body"],
  });

  const result = fuse.search(pattern)
  const matches = [];
  if (!result.length) {
    this.setState({data: []})
} else {
  result.forEach(({item}) => {
    matches.push(item);
  });
  this.setState({data: matches});
  }
}

  async fetch(method, endpoint, body) {
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: body && JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          //authorization: `Bearer 1`, //${await this.props.auth.getAccessToken()}
        },
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      this.setState({ error });
    }
  }

  async getPosts() { 
    this.setState({ loading: false, posts: (await this.fetch('get', '/posts')) || [] });
    this.setState({data: this.state.posts})
    console.log(this.state.posts)
  }

  render() {
  return (
    <>
    <Searchbar 
      placeholder = "Search articles, researchers, institutions..."
      onChange={(e) => this.searchData(e.target.value)}
    />
      <Cards posts= {this.state.posts}/>
      <Cards posts = {this.state.data}/>
    </> 
  );
  }
}
