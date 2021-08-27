import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Fab,
  IconButton,
  Paper,
  List, 
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { orderBy } from 'lodash';
import { compose } from 'recompose';
import Cookies from 'js-cookie'

import ErrorSnackbar from '../ErrorSnackbar';

const styles = theme => ({
  posts: {
    marginTop: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class PostsManager extends Component {
  state = {
    loading: true,
    posts: [],
    error: null,
  };

  componentDidMount() {
    this.getPosts();
    this.getUser(); 
  }

  async fetch(method, endpoint, body) {
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
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
  }

  async getPosts() {
    this.setState({ loading: false, posts: (await this.fetch('get', '/posts')) || [] });
  }

  savePost = async (post) => {
    if (post.id) {
      await this.fetch('put', `/posts/${post.id}`, post);
    } else {
      await this.fetch('post', '/posts', post);
    }

    this.props.history.goBack();
    this.getPosts();
  }

  async deletePost(post) {
    if (window.confirm(`Are you sure you want to delete "${post.title}"`)) {
      await this.fetch('delete', `/posts/${post.id}`);
      this.getPosts();
    }
  }

  async getUser() { 
    const token = {token: Cookies.get('token')}
    if(token.token===undefined){
      this.setState({loading:false})
        return
    }
        try {
           await fetch(`${API}/getUser`, {
            method: 'post',
            body: token && JSON.stringify(token),
            headers: {
              'content-type': 'application/json',
              accept: 'application/json',
              //authorization: `Bearer ${await this.props.auth.getAccessToken()}`,
            },
          }).then(res=>res.json())
          .then(data => {
            console.log(data.author)
            return data.author
          })
        } catch (error) {
          console.error(error);
          this.setState({ error });
        }
      }


  /*renderPostEditor = ({ match: { params: { id } } }) => {
    if (this.state.loading) return null;
    const post = find(this.state.posts, { id: Number(id) });

    if (!post && id !== 'new') return <Redirect to="/posts" />;

    return <PostEditor post={post} onSave={this.savePost} />;
  };*/

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">Posts Manager</Typography>
        {this.state.posts.length > 0 ? (
          <Paper elevation={1} className={classes.posts}>
            <List>
              {orderBy(this.state.posts, ['updatedAt', 'title'], ['desc', 'asc']).map(post => (
                <ListItem key={post.id} button component={Link} to={`/editor/${post.id}`}>
                  <ListItemText
                    primary={post.title}
                    secondary={post.updatedAt && `Updated ${moment(post.updatedAt).fromNow()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.deletePost(post)} color="inherit">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          !this.state.loading && <Typography variant="subtitle1">No posts to display</Typography>
        )}
        <Fab
          color="secondary"
          aria-label="add"
          className={classes.fab}
          component={Link}
          to="/editor/new"
        >
          <AddIcon />
        </Fab>
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(PostsManager);