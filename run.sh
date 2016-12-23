#!/usr/bin/env sh
./node_modules/.bin/yarn install
./node_modules/.bin/polpetta . 0.0.0.0:31337&
sleep 3 && open "http://localhost:31337/"
