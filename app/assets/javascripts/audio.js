var frequencyAmplitudeArray;
var lastSoundCloud;
var streamUrl;
var audio_global;
var javascriptNode;
var createAudio;
var stopMusic;
// Music playing?

var music_playing = false;

stopMusic = function () {
  audio_global.pause();
  audio_global.currentTime = 0;
  javascriptNode.onaudioprocess = null;
  music_playing = false;
}


// Browser support hacks

window.AudioContext = (function() {
  return window.AudioContext
})();

$(document).ready(function() {

  // Define default formUrl
  var formUrl;

  // Handle the form submit event to load the new URL
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if ( lastSoundCloud === $("#input").val() ) {
      return;
    }

    if ( streamUrl !== undefined ) {
      stopMusic();
    }

    lastSoundCloud = $('#input').val();
    formUrl = lastSoundCloud;
    if (formUrl === "") {
      formUrl = "https://soundcloud.com/the-avener/fade-out-lines-original-mix";
      $('#input').val(formUrl);
      lastSoundCloud = formUrl;
    }
    searchSoundCloud(formUrl).then(checkError);
    // Add error checking for empty/dudd form(URL)
  });

  $(form).trigger('submit');
  // The AudioContext is the primary 'container' for all your audio node objects.
  try {
    audioContext = new AudioContext();
  } catch (e) {
    alert('Web Audio API is not supported in this browser');
  };

  var searchSoundCloud = function(trackUrl) {
    var soundCloudUrl = 'http://api.soundcloud.com/resolve.json?';

    return $.getJSON(soundCloudUrl, {
      url: trackUrl,
      client_id: 'c6407cab6ee52bfb52b2dc922c512b07'
    });
  };

  var checkError = function(result) {
    if (result.errors) {
      // Do something like pop up a message
    } else {
      databaseEntry(result);
      createAudio(result.stream_url);
    }
  };

  // Enter the audio entry into the database
  var databaseEntry = function(result) {
    $.ajax('/tracks', {
      type: 'post',
      dataType: 'json',
      data: {
        "track[soundcloud_id]": result.id,
        "track[title]": result.title,
        "track[stream_url]": result.stream_url,
        "track[artist_name]": result.user.username,
        "track[artwork_url]": result.artwork_url,
        "track[video_url]": result.video_url
      }
    });
  };

  createAudio = function(stream_url) {

    // Refresh "Choose track..." menu
    tracksMenu.loadTracks();

    // Define sreamUrl
    streamUrl = stream_url;

    // Creating an Audio object.
    var audio0 = new Audio(),
      source,
      // `stream_url` you'd get from 
      // requesting http://api.soundcloud.com/tracks/165133010.json
      url = streamUrl + '?client_id=c6407cab6ee52bfb52b2dc922c512b07';

    audio0.src = url;
    audio0.crossOrigin="anonymous";
    audio0.controls = true;
    audio0.autoplay = false;
    audio0.loop = true;

    audio_global = audio0;

    // Passing the Audio object into the sourceNode.
    var sourceNode = audioContext.createMediaElementSource(audio0);

    // Initalising the Analyser Node object.
    var analyserNode = audioContext.createAnalyser();
    // Setting the bin count (number of data bands).
    analyserNode.fftSize = 1024; // Must be ** 2, and min 32.
    //
    analyserNode.smoothingTimeConstant = 0.7; //
    // number of samples to collect before analyzing data.
    sampleSize = 1024

    // Creates a ScriptProcessorNode used for direct audio processing.
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Connecting the nodes
    /// AnalyserNode needs to be connected to both the destination (speakers)!
    /// Javascript node needs to be connected from the analyserNode and to the
    /// destination!
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    analyserNode.connect(audioContext.destination);
    javascriptNode.connect(audioContext.destination);

    // Uint8Array = Unsigned Integer 8bit byte Array
    // Values between 0-255 will be pushed into this array
    // Which represent -1 to +1 (in audio terms)
    // Note that this is a global
    frequencyAmplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // Copies the current time-domain (waveform) data into the passed frequencyAmplitudeArray.
    var getFrequencies = function() {
      analyserNode.getByteFrequencyData(frequencyAmplitudeArray);
      return frequencyAmplitudeArray;
    };

    // Play sound
    music_playing = true; 
    audio0.play();

    // An event listener which is called periodically for audio processing.
    javascriptNode.onaudioprocess = function() {
      // Get the Time Domain data for this sample
      analyserNode.getByteFrequencyData(frequencyAmplitudeArray);
    }

    // Stop sound & visualise
    $("#stop").on('click', function() {
      lastSoundCloud = "";
      stopMusic();
    });
  };

});
