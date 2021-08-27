import React, {Component} from 'react'; 
import '../../App.css';
import 'medium-draft/lib/index.css';
import PropTypes from 'prop-types'
import {
  Editor,
  createEditorState,
  rendererFn, 
  Block,
} from 'medium-draft';

const API = process.env.REACT_APP_API || 'http://localhost:3001';

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

class Article extends Component{
state = {
    loading: true,
    post: null,
    error: null,
    readerState: createEditorState(), 
    refsEditor: React.createRef()
};

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

onChange() {console.log('work')}

async componentDidMount() { 
    //this.state.refsEditor.current.focus();
    await this.getPost();
    this.setState({editorState: createEditorState(JSON.parse(this.state.post.body))})
    this.setState({loading: false})
}

async fetch(number, body) {
    try {
      const response = await fetch(`${API}/posts/${number}`, {
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

async getPost() {
    this.setState({ post: (await this.fetch(this.props.match.params.id))});
    console.log(this.state.post);
  };

 render() { 
    return (
        <div>
        {!this.state.loading ? (<div>
          {this.state.post != null ? (
        <div className ='article-container'>
        <h1 style = {{paddingTop: 20}}>{this.state.post.title}</h1>
        <h1 style = {{fontSize:18}}>{this.state.post.author}</h1>
        <Editor
          ref={this.state.refsEditor}
          editorState={this.state.editorState}
          onChange={this.onChange}
          editorEnabled = {false}
          rendererFn = {this.rendererFn}/>
        </div>) : (<p>article not found</p>)}
        </div>) : (<p>loading</p>)}
        </div>
    )
}
}
export default Article; 