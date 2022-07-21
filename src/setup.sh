#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cp "$SCRIPT_DIR/files/coreaudio.c" "$SCRIPT_DIR/../node_modules/speaker/deps/mpg123/src/output/coreaudio.c"
cd "$SCRIPT_DIR/node_modules/speaker"
node-gyp build