import React, {Component} from 'react';
import {
  withStyles,
  Button,
  TextField,
} from '@material-ui/core';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import Compressor from 'compressorjs';
import Cookies from 'js-cookie'
//this whole page is an insult to programmers 

//Officially DEPRECATED| thank god

const styles = theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 500,
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class PostEditor extends Component {

  state = {
    loading: true,
    post: null,
    error: null,
    imageUrls: [], 
    imageIDs: [],
    strtemp : '',
    IDstrtemp: '', 
    uploadedImages: [], 
    uploading: false, 
    initlist: [], 
    initIDList: [], 
};

componentDidMount() { 
    this.getPost();
}

//utilities
async imgcompress(files) { 
  console.log('input', files)
  var compressedFiles = []
  files.forEach(file => {
    new Compressor(file, { 
      quality: 0.9, 
      maxHeight: 100, 
      maxWidth: 150, 
      success(result){ 
        compressedFiles = compressedFiles.push(result)
      }
    })
  })
  console.log('compFiles', compressedFiles)
  return compressedFiles
}

str2arr(string, checker) { 
  if(checker !== null) 
  {
    var arr = string.split(',')
  return arr; 
} 
  return [];
}

arr2str(arr) {
  var string = arr.toString()
  return string; 
}

async fetch(method, number, body) {
  if (number === 'new') { return this.state.post}; 
  try {
      const response = await fetch(`${API}/posts/${number}`, {
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
};

async getPost() {
    await this.setState({ loading: false, post: (await this.fetch('get',this.props.match.params.id))})
    if(this.state.post){ 
    var files = this.state.post.fileList;
    var idList = this.state.post.cloudIDlist; 
    console.log('db ids', idList)
    if(files !== null){
      await this.setState({strtemp: files}) //this looks inefficient 
      this.setState({initlist:this.str2arr(this.state.strtemp, this.state.imageUrls)}) 
      console.log('initial list', this.state.initlist)
    }
    if(idList != null){
      await this.setState({IDstrtemp: idList}) //this looks inefficient 
      this.setState({initIDList:this.str2arr(this.state.IDstrtemp, this.state.imageIDs)}) 
      console.log('initial ID list', this.state.initIDList)
    }
  }
  };


  onChange = async e => {
    const files = Array.from(e.target.files)
    this.setState({uploading:true })

    const formData = new FormData()

    files.forEach((file, i) => {
      formData.append(i, file)
    })

    await fetch(`${API}/image-upload`, { //add try catch 
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(images => {
        this.setState({ 
        uploading: false,
      })
      if (this.state.uploadedImages === null) {
        this.setState({uploadedImages: images})
      }
      else {
        this.setState({uploadedImages: this.state.uploadedImages.concat(images)})
      }
    })
    console.log('list of uploaded images', this.state.uploadedImages)
    this.updateUrls()
    this.updateIDs()
  }

  updateUrls() {
    this.setState({imageUrls: []})
    this.state.uploadedImages.forEach((image) =>
    this.setState({imageUrls: this.state.imageUrls.concat(image.url)})
  )
  console.log('updated urls', this.state.imageUrls)
  }

  updateIDs() {
    this.setState({imageIDs: []})
    this.state.uploadedImages.forEach((image) =>
    this.setState({imageIDs: this.state.imageIDs.concat(image.public_id)})
  )
  console.log('updated IDs', this.state.imageIDs)
  }

  removeImage = async (id,url) => { // *** when multiple files added, and first file deleted, program crashes despite working in cloud and in local arr ***
    console.log('delete id', id )
    console.log('delete url', url)
    try {
      fetch(`${API}/image-delete/${id}`, {
      method: 'DELETE',
    })
    .then( this.setState({
      uploadedImages: this.state.uploadedImages.filter(image => image.public_id !== id),
      imageUrls: this.state.imageUrls.filter(url1 => url1 !== url), 
      imageIDs: this.state.imageIDs.filter(id1 => id1 !== id),
      initlist: this.state.initlist.filter(url1 => url1 !== url),
      initIDlist: this.state.initIDList.filter(id1 => id1 !== id)
    }))
  }
    catch (error) {
      console.error(error); 
      this.setState({error}); 
    }
    console.log('after delete imageUrls', this.state.imageUrls)
    console.log('initlist', this.state.initlist)
  }

  savePost = async (post) => {
    if(this.state.initlist!==null){
    await this.setState({imageUrls: this.state.initlist.concat(this.state.imageUrls)})
    }
    if(this.state.initIDlist!=null){
      await this.setState({imageIDs: this.state.initIDlist.concat(this.state.imageIDs)})
      }
    await this.setState({strtemp: this.arr2str(this.state.imageUrls)}) 
    post.fileList = this.state.strtemp;
    await this.setState({IDstrtemp: this.arr2str(this.state.imageIDs)}) 
    post.cloudIDlist = this.state.IDstrtemp
    post.author = 'MichaelHla'
      if (post.id) {
        await this.fetch('put', `${post.id}`, post);
      } else {
        await this.fetch('post', '', post);
      }

    this.props.history.goBack();
    console.log('final list', this.state.strtemp)
    console.log('final id', this.state.IDstrtemp)
    };

    getUser = async () => { 
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
            console.log(data)
            return data.author
          })
        } catch (error) {
          console.error(error);
          this.setState({ error });
        }
      }



  render() { 
    return (
    <>
<Form initialValues={this.state.post} onSubmit={this.savePost}>
    {({ handleSubmit }) => (
        <div>
          <form onSubmit={handleSubmit}>
              <Field name="title">
                {({ input }) => <TextField label="Title" autoFocus {...input} />}
              </Field>
              <Field name="body">
                {({ input }) => (
                  <TextField
                    className= 'marginTop'
                    label="Body"
                    multiline
                    {...input}
                  />
                )}
              </Field>
              <Button size="small" color="primary" type="submit">Save</Button>
              <Button size="small" onClick={() => this.props.history.goBack()}>Cancel</Button>
        {this.state.initlist.length>0 ? (<>
          {this.state.initlist.map((url,j)=><div key = {j}>
          <button 
              onClick={() => this.removeImage(this.state.initIDList[this.state.initlist.indexOf(url)], url)} 
              className='delete'
              >
                X
              </button> 
          <img src = {url} alt = ''/> 
          </div>)}
          </>):null}
        {this.state.uploading ? (<p>uploading</p>): null}
        {this.state.uploadedImages.length > 0 ? (<div>      
            {this.state.uploadedImages.map((image, i) =><div key={i} className='fadein'>
              <button 
              onClick={() => this.removeImage(image.public_id, image.url)} 
              className='delete'
              >
                X
              </button>
              <img src={image.url} alt='' />
        </div>)}</div>): null }
        <input type='file' id='multi' onChange={this.onChange} multiple = 'multiple'/>
          </form>
        </div>
    )}
  </Form>
  </>
  )
  }

};

export default compose(
  withRouter,
  withStyles(styles),
)(PostEditor);