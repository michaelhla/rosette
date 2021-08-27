import React from 'react'; 
import ReactPlayer from 'react-player'; 
import './VideoPlayer.css';

const VideoPlayer = () => {
      return (
        <div className='player-wrapper'>
          <ReactPlayer
            className='react-player'
            url='https://www.youtube.com/watch?v=w_5zQzIb5Uc'
            width='50%'
            height='50%'
            controls={true}
          />
        </div>
      )
  }

  export default VideoPlayer; 