#!/usr/bin/env node
const LofiStreamer = require('./LofiStreamer');
const Interface = require('./Interface');

const main = function() {
    // start music stream
    LofiStreamer.play();

    // start interface
    new Interface(LofiStreamer);
}

main();
