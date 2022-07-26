const ytdl = require('ytdl-core');
const FFmpeg = require('fluent-ffmpeg');
const stream = require('stream');
const lame = require('lame');
const Speaker = require('speaker');
const Volume = require('pcm-volume');

const PassThrough = stream.PassThrough;

const streamUrl = require('./files/streams.json');
const volumeOffset = 0.1;

const LofiStreamer = {
    urlId: 0,
    volume: null,
    ytStream: null,
    play: function(vol = 1) {
        const url = this.getStream().url

        if(ytdl.validateURL(url)) {

            this.ytStream = ytdl(url, {
                audioonly: true
            });

            let decoderStream = lame.Decoder();
        
            let stream = new PassThrough();

            let speakerStream = new Speaker()

            this.volume = new Volume(vol)

            let ffmpeg = new FFmpeg(this.ytStream);
        
            ffmpeg.on('error', (error) => {
                console.log('There has been an error playing the stream url.')
                console.log(error.message);
            });
    
            ffmpeg.format('mp3').pipe(stream);
            stream.pipe(decoderStream).pipe(this.volume).pipe(speakerStream);
        } else {
            console.log("Invalid URL: " + url);
        }
    },
    nextStream: function() {
        let vol = this.getVolume();
        this.urlId++;

        if(this.urlId >= streamUrl.length) {
            this.urlId = 0
        }

        this.setVolume(0);
        this.ytStream.destroy();
        this.play(vol);
    },
    prevStream: function() {
        let vol = this.getVolume();
        this.urlId--;

        if(this.urlId < 0) {
            this.urlId = streamUrl.length - 1
        }

        this.setVolume(0);
        this.ytStream.destroy();
        this.play(vol);
    },
    volumeUp: function() {
        currVol = this.getVolume();
        if (currVol + volumeOffset <= 1) {
            this.volume.setVolume(currVol + volumeOffset);
        }
    },
    volumeDown: function() {
        currVol = this.getVolume();
        if (currVol - volumeOffset >= 0) {
            this.volume.setVolume(currVol - volumeOffset);
        }
    },
    getVolume: function() {
        return Number(parseFloat(this.volume.volume).toFixed(2));
    },
    setVolume: function(vol) {
        this.volume.setVolume(vol);
    },
    getStream: function() {
        return streamUrl[this.urlId];
    }
}


module.exports = LofiStreamer;
