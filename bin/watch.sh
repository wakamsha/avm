#!/usr/bin/env bash

# Clean
rm nohup.out 2>/dev/null
rm -rf public
mkdir public

# Compile Pug sources
nohup pug example -o public -w &
pug_pid=$!
trap "kill -15 $pug_pid &>/dev/null" 2 15

# Compile Stylus sources
nohup stylus example -o public -m -w &
stylus_pid=$!
trap "kill -15 $stylus_pid &>/dev/null" 2 15

# Compile TypeScript sources
nohup watchify -d ./example/main.ts -p [ tsify --noUnusedLocals=false --noUnusedParameters=false ] -o public//main.js &
watchify_pid=$!
trap "kill -15 $watchify_pid $>/dev/null" 2 15

# Compile Haxe sources
nohup watch "haxe compile.hxml" src/ &
watch_pid=$!
trap "kill -15 $watch_pid &>/dev/null" 2 15

# Run Server
nohup browser-sync start --config bs-config.js &
browserSync_pid=$!
trap "kill -15 $browserSync_pid &>/dev/null" 2 15

tail -f nohup.out
