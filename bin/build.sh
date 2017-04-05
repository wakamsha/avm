#!/usr/bin/env bash

haxe compile.hxml
mkdir dist
cp ./public/*.swf ./dist/avm.swf
