// js
import React from 'react';
import YouTube from 'react-youtube';
import getYouTubeId from 'get-youtube-id'

import useWindowDimensions from "../functions/useWindowDimensions";

export default function YoutubeVideo({url}){
      
      const { width } = useWindowDimensions();

      const opts = {
        height: width>600 ? 900/2 : (width-20)/1.7,
        width: width>600 ? 1600/2 : width-20,
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 0,
          loop: 1
        },
      };
      const id = getYouTubeId(url)
      
      function _onReady(event) {
        // access to player in all event handlers via event.target
        event.target.pauseVideo();
      }

    return <YouTube videoId={id} opts={opts} onReady={_onReady} />;


}