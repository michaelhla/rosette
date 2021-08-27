import React from 'react';
import PropTypes from 'prop-types'
import 'medium-draft/lib/index.css';
import {
  Editor,
  ImageSideButton,
  Block,
  addNewBlock,
  createEditorState,
  rendererFn
} from 'medium-draft';
import {convertToRaw, AtomicBlockUtils, EditorState} from 'draft-js';
import { Form, Field } from 'react-final-form';
import {
    Button,
    TextField,
  } from '@material-ui/core';
import {withRouter} from 'react-router-dom'  
import imageCompression from 'browser-image-compression'
import Cookies from 'js-cookie'

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class EmbedSideButton extends React.Component {
  
    constructor(props) {
      super(props);
      this.onClick = this.onClick.bind(this);
      this.addEmbedURL = this.addEmbedURL.bind(this);
    }
  
    onClick() {
      const url = window.prompt('Enter a URL', 'https://www.youtube.com/');
      this.props.close();
      if (!url) {
        return;
      }
      this.addEmbedURL(url);
    }
  
    addEmbedURL(url) {
      let editorState = this.props.getEditorState();
      const content = editorState.getCurrentContent();
      const contentWithEntity = content.createEntity('embed', 'IMMUTABLE', {url});
      const entityKey = contentWithEntity.getLastCreatedEntityKey();
      editorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
      this.props.setEditorState(
        AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          'E'
        )
      );
    }
  
    render() {
      return (
        <button
          className="md-sb-button md-sb-img-button"
          type="button"
          title="Add an Embed"
          onClick={this.onClick}
        >
          <i className="fa fa-code" />
        </button>
      );
    }
}  

class AtomicEmbedComponent extends React.Component {

    static propTypes = {
      data: PropTypes.object.isRequired,
    }
  
    constructor(props) {
      super(props);
  
      this.state = {
        showIframe: false,
      };
  
      this.enablePreview = this.enablePreview.bind(this);
    }
  
    componentDidMount() {
      this.renderEmbedly();
    }
  
    componentDidUpdate(prevProps, prevState) {
      if (prevState.showIframe !== this.state.showIframe && this.state.showIframe === true) {
        this.renderEmbedly();
      }
    }
  
    getScript() {
      const script = document.createElement('script');
      script.async = 1;
      script.src = '//cdn.embedly.com/widgets/platform.js';
      script.onload = () => {
        window.embedly();
      };
      document.body.appendChild(script);
    }
  
    renderEmbedly() {
      if (window.embedly) {
        window.embedly();
      } else {
        this.getScript();
      }
    }
  
    enablePreview() {
      this.setState({
        showIframe: true,
      });
    }
    render() {
        const { url } = this.props.data;
        const innerHTML = `<div><a class="embedly-card" href="${url}" data-card-controls="0" data-card-theme="dark">Embedded ― ${url}</a></div>`;
        return (
          <div className="md-block-atomic-embed">
            <div dangerouslySetInnerHTML={{ __html: innerHTML }} />
          </div>
        );
      }
}  

class CloudImageSideButton extends ImageSideButton { 

    async onChange(e){ 
        const files = Array.from(e.target.files)
        const formData = new FormData()
        const options = {
            maxSizeMB: 5,
            maxWidthOrHeight: 1280,
          }
        for(let i = 0; i< files.length; i++){ 
            var file = files[i]
            const compressedFile = await imageCompression(file, options)  
            formData.append(i, compressedFile)
        }
        try{ 
        await fetch(`${API}/image-upload`, { 
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(images => {
            images.forEach(image=> {
                this.props.setEditorState(addNewBlock(
                this.props.getEditorState(),
                Block.IMAGE, {
                    src: image.url ,
                })) 
            })
        })
    }
    catch(error){ 
        console.log(error)
    }
    this.props.close()
    }
}

const AtomicBlock = (props) => {
    const { blockProps, block } = props;
    const content = blockProps.getEditorState().getCurrentContent();
    const entity = content.getEntity(block.getEntityAt(0));
    const data = entity.getData();
    const type = entity.getType();
    if (blockProps.components[type]) {
      const AtComponent = blockProps.components[type];
      return (
        <div className={`md-block-atomic-wrapper md-block-atomic-wrapper-${type}`}>
          <AtComponent data={data} />
        </div>
      );
    }
    return <p>Block of type <b>{type}</b> is not supported.</p>;
  };

class TextEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        editorState: createEditorState(), 
        post : [],
        error: null, 
    };

    this.sideButtons = [{ 
        title: 'Image',
        component: CloudImageSideButton, 
    }, 
    {
        title: 'Embed', 
        component: EmbedSideButton, 
    }]

    this.savePost = this.savePost.bind(this)

    this.onChange = (editorState) => {
      this.setState({ editorState: editorState});
    };
    this.refsEditor = React.createRef();
  }

  rendererFn(setEditorState, getEditorState, ...args) {
    const atomicRenderers = {
      embed: AtomicEmbedComponent,
    };
    const rFnOld = rendererFn(setEditorState, getEditorState, ...args);
    const rFnNew = (contentBlock) => {
      const type = contentBlock.getType();
      switch(type) {
        case Block.ATOMIC:
          return {
            component: AtomicBlock,
            editable: false,
            props: {
              components: atomicRenderers,
              getEditorState,
            },
          };
        default: return rFnOld(contentBlock);
      }
    };
    return rFnNew;
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

  async savePost(post){ 
    const currentState = convertToRaw(this.state.editorState.getCurrentContent());
    post.body = JSON.stringify(currentState)
    var rawText = "";
    currentState.blocks.forEach((block) => rawText = rawText + block.text + " ")
    console.log("rawText", rawText)
    post.text = rawText
    post.author = this.getUser()
    console.log('blocks', post.body)
    if (post.id) {
        await this.fetch('put', `${post.id}`, post);
      } else {
        await this.fetch('post', '', post);
      }
      window.location.href = '/postmanager'
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
            var strdata = JSON.stringify(data)
            return strdata.author
          })
        } catch (error) {
          console.error(error);
          this.setState({ error });
        }
      }


  async componentDidMount() {
    this.refsEditor.current.focus();
    this.setState({ post: (await this.fetch('get',this.props.match.params.id))})
    if(this.state.post !== []){ 
      this.setState({editorState: createEditorState(JSON.parse(this.state.post.body)), loading: false})
    }
    else{ 
      this.setState({editorState: createEditorState(), loading: false})
    }
    console.log(this.state.editorState)
  }

  render() {
    return (
    <Form initialValues = {this.state.post} onSubmit = {this.savePost}>
    {({handleSubmit})=> (
        <form onSubmit = {handleSubmit}>
            <Field name="title">
                {({ input }) => <TextField label="Title" autoFocus {...input} />}
            </Field>
            <Field name = "body">
                {() => 
                    <Editor
                    ref={this.refsEditor}
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    sideButtons = {this.sideButtons}
                    rendererFn = {this.rendererFn}/>
                }
            </Field>
            <Button size="small" color="primary" type="submit">Save</Button>
            <Button size="small" onClick={() => this.props.history.goBack()}>Cancel</Button>
        </form>
    )}
    </Form> 
    );
  }
};
 export default withRouter(TextEditor);