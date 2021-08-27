import React from 'react';
import './Cards.css';
import CardItem from './CardItem';


class Cards extends React.Component{
  constructor(props) {
    super(props);
    this.state = {posts: []};
  }
  
  static getDerivedStateFromProps(nextProps, prevState){
    return {
       posts: nextProps.posts
   };
 }

  str2arr(string) { 
    if(string !== null) 
    {
      var arr = string.split(',')
    return arr; 
  } 
    return [];
  }

  render(){
  return (
    <div className='cards'>
      <h1>{this.props.header || 'Top Results'}</h1>
      {this.state.posts.length>0 ? (
      <div className='cards__container'>
        <div className='cards__wrapper'>
        <ul className='cards__items'>
          {this.state.posts.map((post,i) => (
            <CardItem
            src= {this.str2arr(post.fileList)[0]}
            text={post.title}
            path = {`/article/${post.id}`}
            key = {i}
            author = {post.author}
          />
          ))}
          </ul>
        </div>
      </div>) : (<p></p>)}
    </div>
  );
  }
}

export default Cards;