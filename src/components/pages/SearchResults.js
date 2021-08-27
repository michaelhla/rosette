import React from 'react'; 
import '../../App.css';
import Searchbar from '../Searchbar'
import Cards from '../Cards'
import Fuse from "fuse.js"; 

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class SearchResults extends React.Component {
    state = { 
        posts: [], 
        error: null, 
        loading: true, 
        data: []
    }

    async componentDidMount(){
        await this.getPosts()
        this.searchData(this.props.match.params.query)
    }

    searchData = (pattern) => { 
        if (!pattern) {
          this.setState({loading: false, data: []})
          return;
        }
      const fuse = new Fuse(this.state.posts, {
        keys: ["title", "text"],
      });
    
      const result = fuse.search(pattern)
      const matches = [];
      if (!result.length) {
        this.setState({loading: false, data: []})
    } else {
      result.forEach(({item}) => {
        matches.push(item);
      });
      this.setState({loading: false, data: matches});
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
        this.setState({ posts: (await this.fetch('get', '/posts')) || [] });
        console.log('posts loaded', this.state.posts)
    }

    render(){ 
    return (
    <div>
    {this.state.loading? (<p>loading</p>):
    <>
        <Searchbar 
            placeholder = "Search articles, researchers, institutions..."
            onChange={(e) => console.log(e.target.value)}
            defaultText = {this.props.match.params.query}
        />
        <Cards header = {`search results for "${this.props.match.params.query}"`} posts = {this.state.data}/>
    </>
         }   
     </div>
    )
      }
}
export default SearchResults; 