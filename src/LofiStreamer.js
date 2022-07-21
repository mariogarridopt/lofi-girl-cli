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
    volume: new Volume(),
    speakerStream: new Speaker(),
    play: function() {
        const url = this.getStream().url

        if(ytdl.validateURL(url)) {

            let ytStream = ytdl(url, {
                audioonly: true
            });

            let decoderStream = lame.Decoder();
        
            let stream = new PassThrough();

            let ffmpeg = new FFmpeg(ytStream);
        
            ffmpeg.on('error', (error) => {
                console.log(error);
            });
    
            ffmpeg.format('mp3').pipe(stream);
            stream.pipe(decoderStream).pipe(this.volume).pipe(this.speakerStream);
        } else {
            console.log("Invalid URL: " + url);
        }
    },
    nextStream: function() {
        this.urlId++;

        if(this.urlId >= streamUrl.length) {
            this.urlId = 0
        }

        // TODO: stop and play the new url
    },
    prevStream: function() {
        this.urlId--;

        if(this.urlId < 0) {
            this.urlId = streamUrl.length - 1
        }

        // TODO: stop and play the new url
    },
    volumeUp: function() {
        if (this.volume.volume + volumeOffset <= 1) {
            this.volume.setVolume(this.volume.volume + volumeOffset);
        }else {}
    },
    volumeDown: function() {
        if (this.volume.volume - volumeOffset >= 0) {
            this.volume.setVolume(this.volume.volume - volumeOffset);
        }
    },
    getVolume: function() {
        return this.volume.volume;
    },
    setVolume: function(vol) {
        this.volume.setVolume(vol);
    },
    getStream: function() {
        return streamUrl[this.urlId];
    }
}


module.exports = LofiStreamer;
