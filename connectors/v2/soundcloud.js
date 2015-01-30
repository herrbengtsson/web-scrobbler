
var SoundcloudConnector = window.SoundcloudConnector || function () {

   /**
    * Store the id retrieve from the Soundcloud event
    *
    * @type {object}
    */
   var id = null;

   /**
    * Store the metadata retrieve from the Soundcloud event
    *
    * @type {object}
    */
   var metadata = null;
   
};

Connector.playerSelector = 'div.playControls__wrapper';

Connector.isPlaying = function() {
	return $('div.playControls__wrapper button.playControl').hasClass('playing');
};

Connector.getDuration = function () {
   return Math.round(SoundcloudConnector.metadata.duration / 1000);
};

Connector.getCurrentTime = function () {
   var current = parseInt($("div.playControls__wrapper div.playbackTitle__progress").attr("aria-valuenow"));
   return Math.round(current / 1000);
};

Connector.getArtistTrack = function () {
   if (SoundcloudConnector.metadata == null) return {artist: null, track: null};
   
   var text = SoundcloudConnector.metadata.title;
   var separator = this.findSeparator(text);

   var artist = null;
   var track = null;

   if (separator !== null) {
      artist = text.substr(0, separator.index);
      track = text.substr(separator.index + separator.length);
   }
   else {
      artist = SoundcloudConnector.metadata.user.username;
      track = SoundcloudConnector.metadata.title;
   }

   return this.cleanArtistTrack(artist, track);
};

Connector.getUniqueID = function () {
   return SoundcloudConnector.id;
};

Connector.getArtistThumbUrl = function () {
   return SoundcloudConnector.metadata.artwork_url;
};

/**
 * Run at initialisation; add dom script and attach events.
 */
(function() {

    // Exit if already attached.
    if (window._ATTACHED) return;
    
    // Inject script to extract events from the Soundcloud API event-bus.
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('connectors/soundcloud-dom-inject.js');
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);

    // Trigger functions based on message type.
    function eventHandler(e) {
        switch (e.data.type) {
            case 'SC_PLAY':
                if (SoundcloudConnector.id != e.data.id) {
                    SoundcloudConnector.id = e.data.id;
                    SoundcloudConnector.metadata = e.data.metadata;
                    //stateChangedWorker();
                }
                break;
            case 'SC_PAUSE':
            default:
                break;
        }
    }

    // Attach listener for message events.
    window.addEventListener('message', eventHandler);
    window._ATTACHED = true;

    // Add reset event trigger.
    $(window).unload(function() {
        chrome.runtime.sendMessage({
            type: 'reset'
        });
        return true;
    });
})();
