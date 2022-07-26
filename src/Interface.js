const blessed = require('blessed');
const fs = require('fs');
const path = require("path");

const keys = {
    VOLUME_DOWN: 'left',
    VOLUME_UP: 'right',
    NEXT_STREAM: 'down',
    PREV_STREAM: 'up',
    EXIT: 'C-c',
    EXIT_Q: 'q'
}

function Interface (lofiStream) {
    "use strict";

    this.lofiStream = lofiStream;

    this.localData = this.getLocalStorage();

    if('volume' in this.localData) {
        this.lofiStream.setVolume(this.localData.volume);
    }

    this.screen = blessed.screen({
        smartCSR: true,
        grabKeys: true
    });

    this.screen.title = 'lofi-girl-cli'

    const title = blessed.text({
        left: 'center',
        tags: true,
        content: ' {bold}LOFI{/bold}',
        align: 'center',
        style: {
            bg: '#0d3370'
        }
    });

    this.box = blessed.box({
        width: '100%',
        height: '100%',
        tags: true,
        style: {
            fg: 'white',
            bg: '#0d3370'
        },
        content: this.createText()
    });

    this.screen.append(this.box)
    this.screen.append(title)
    this.screen.render()

    this.screen.on('keypress', onKeyPress(this))
}

var _prototype = Interface.prototype;

_prototype.getVolumeBars = function(volume) {
    return Array.from(
        Array(Math.floor(volume * 10)))
        .reduce((acc, curr) => acc.concat('=='), '')
        .concat(
            Array.from(Array(10 - Math.floor(volume * 10))).reduce((acc, curr) => acc.concat('  '), '')
        );
}

_prototype.createText = function () {
    let volume = this.lofiStream.getVolume();
    let currentStream = this.lofiStream.getStream().name;
    return '\n\n'
        .concat(`{bold}Volume{/bold} [{#11A5AD-fg}{bold}${this.getVolumeBars(volume)}{/}]`)
        .concat(`\n{bold}Stream{/bold}: ${currentStream || 'L or R arrow to switch station'}`)
        .concat(`\n[Volume: left/right | Station: up/down]`);
}

_prototype.updateScreen = function() {
    this.box.content = this.createText();
    this.screen.render();
}

const onKeyPress = (Interface) => (ch, key) => {
    switch (key.full) {
        case keys.VOLUME_DOWN:
            Interface.lofiStream.volumeDown();
            Interface.updateScreen();
            Interface.setLocalStorage('volume', Interface.lofiStream.getVolume());

            try{
                Interface.setLocalStorage('volume', Interface.lofiStream.getVolume());
            }catch{}
            break;
        case keys.VOLUME_UP:
            Interface.lofiStream.volumeUp();
            Interface.updateScreen();
            try{
                Interface.setLocalStorage('volume', Interface.lofiStream.getVolume());
            }catch{}
            break;
        case keys.NEXT_STREAM:
            Interface.lofiStream.nextStream();
            Interface.updateScreen();
            break;
        case keys.PREV_STREAM:
            Interface.lofiStream.prevStream();
            Interface.updateScreen();
            break;
        case keys.EXIT:
        case keys.EXIT_Q:
            Interface.screen.destroy();
            process.exit(1);
        }
}

_prototype.setLocalStorage = function(key, value) {
    this.localData[key] = value;

    var data = JSON.stringify(this.localData);

    filePath = path.join(__dirname, 'files/localstorage.json');
    fs.writeFile(filePath, data, function (err) {
    if (err) {
        console.log('There has been an error saving your configuration data.');
        console.log(err.message);
        return;
    }
    });
}

_prototype.getLocalStorage = function() {
    filePath = path.join(__dirname, 'files/localstorage.json');
    var data = fs.readFileSync(filePath), myObj;

    try {
        myObj = JSON.parse(data);
        return myObj;
    } catch {
        return {};
    }
}

module.exports = Interface