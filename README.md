# Discord Bot

## Overview

This discord bot is a personal project. It is implemented using the Discord.js/Commando
library and the Node.js framework using Typescript.

Currently, this application is being migrated from Discord.js/Commando to the standard Discord.js library v12. This is in preparation to upgrade from v12 of the library to v13.

# Installation

This project uses the Node.js framework. Download and install node at the following link: https://nodejs.org/en/

This project involves several dependencies managed by npm. Get npm by following
this link: https://www.npmjs.com/get-npm

Within the root folder of the project, install the dependencies

    $ npm install

## Environment

Create your .env file from the .env.tpl file and populate the token fields.
Some fields are used for authentication while others are used for setting up aspects of the bot.

```
PREFIX="!"  // What to type in front of a command to activate it
TOKEN=""  // The unique token of the bot in order for it log in to the associated Discord Application (https://discord.com/developers/applications)
GIF_TOKEN=""  // To be removed, GIF token for authentication to Giphy API
GOOGLE_APPLICATION_CREDENTIALS_JSON=''  // GCP Service Account JSON String for say command
GOOGLE_APPLICATION_CREDENTIALS=googleApplicationCredentials.json  // DO NOT CHANGE
NICKNAME_CYCLE_GUILD_IDS=  // Guild/Server Id's for nicknames cycle to be registered (separated by '/')
NICKNAME_CYCLE_NAMES=  // Nicknames for each Guild/Server Id's nickname cycle (names separated by ',' servers separated by '/')
```

## Running the application locally

Run the application using the following command:

    $ npm run clean
    $ npm run build
    $ npm start

Stop the application by terminating the process. On bash: `CTRL-C`.

## Deployment

One instance of this bot is deployed using Heroku. Every time the master branch is updated, Heroku will automatically deploy once the Continuous Integration checks have passed. Perhaps in the future, github actions can be used instead.

# Project Notes

## Logging

Logs are implemented using the `winston` library. The logs are set to output to the console. When deployed to Heroku, the application logs will hold all of the console outputs. The documentation for the `winston` library can be seen in the following link.

https://www.npmjs.com/package/winston

## FFMPEG changes

Buildpacks for `ffmpeg` have been replaced by using the npm package `ffmpeg-static`. This was in response to issues with the ultra command.
This was the following buildpack added on the heroku settings page.
The other buildpacks can be found in the commit history within the `.buildpacks` file."
https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
