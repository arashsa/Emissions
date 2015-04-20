const React = require('react');

var player;
function onYouTubeIframeAPIReady() {
    console.log('onYouTubeIframeAPIReady');
    player = new YT.Player('player', {
        events: {
            'onReady': onPlayerReady
        }
    });
}

function playVideo(){
    player.seekTo(96);
    player.playVideo();

    // stop video after ten seconds
    setTimeout(() => {
        player.stopVideo(player)
        playVideo();
    },10E3);
}

function onPlayerReady(event) {
    //event.target.mute();
    player.mute();
    playVideo();
}


window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

module.exports = React.createClass({

    /* https://developers.google.com/youtube/iframe_api_reference#Getting_Started */
    componentDidMount() {
        console.log('componentDidMount');
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    },

    render() {
        var rickRolled = 'http://www.youtube.com/embed/oHg5SJYRHA0?autoplay=1';
        var origin = location.protocol + '//' + location.host
        var solarStorm = 'http://www.youtube.com/embed/DU4hpsistDk?&start=96&enablejsapi=1&origin=' + origin;
        var video = solarStorm;

        //return <div />
        return (
        <iframe id='player'
                    style={{ position:'absolute', top: 0, right: 0, width:"100%", height:"100%"}}
                    src={video}
                    frameBorder="0" allowFullScreen />
        );
    }

});