import './App.css';
import Navbar from './components/Navbar';
import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/pages/Home';
import Article from './components/pages/Article';
import People from './components/pages/People';
import Profile from './components/pages/Profile';
import PostManager from './components/pages/PostManager';
import PostEditor from './components/pages/PostEditor';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup'; 
import SearchResults from './components/pages/SearchResults';
import TextEditor from './components/pages/TextEditor'

class App extends Component {
  render() {
  return (
    <>
    <Router>
      <Navbar/>
      <Switch>
        <Route path = '/' exact component = {Home}/>
        <Route path = '/article/:id' component = {Article}/>
        <Route path = '/people' component = {People}/>
        <Route path = '/profile/:author' component = {Profile}/>
        <ProtectedRoute path = '/postmanager' component = {PostManager} />
        <Route path= '/posteditor/:id' component = {PostEditor} />
        <Route path = '/signup' component = {Signup}/>
        <Route path = '/login' component = {Login}/>
        <Route path = '/search/:query' component = {SearchResults}/>
        <Route path = '/editor/:id' component = {TextEditor}/>
      </Switch>
      </Router>
    </>
  );
  }
}

export default App;
