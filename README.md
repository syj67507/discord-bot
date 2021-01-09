# Discord Bot

## Overview

This discord bot is a personal project. It is implemented using the Discord.js/Commando
library and the Node.js framework using Typescript.

## Installation

This project uses the Node.js framework. Download and install node at the following link: https://nodejs.org/en/

This project involves several dependencies managed by npm. Get npm by following
this link: https://www.npmjs.com/get-npm

Within the root folder of the project, install the dependencies

    $ npm install

Create your .env file from the .env.tpl file and populate the token fields.
More information in the Authentication section.

## Authentication

Authentication tokens for the Discord Bot and the API's that the Bot uses are specified
within a local `.env` file.

### Tokens

-   Bot token

    -   https://discord.com/developers/applications

-   Giphy developer account
    -   https://developers.giphy.com/

## Running the application locally

Run the application using the following command:

    $ npm start

Stop the application by terminating the process. On bash: `CTRL-C`.

## Deployment

One instance of this bot is deployed using Heroku. Every time the master branch is updated, Heroku will automatically deploy once the Continuous Integration checks have passed.

## Logging

Logs are implemented using the `winston` library. The logs are set to output to the console. When deployed to Heroku, the application logs will hold all of the console outputs. The documentation for the `winston` library can be seen in the following link.

https://www.npmjs.com/package/winston

### Notes

Buildpacks for `ffmpeg` have been replaced by using the npm package `ffmpeg-static`. This was in response to issues with the ultra command.
This was the following buildpack added on the heroku settings page.
The other buildpacks can be found in the commit history within the `.buildpacks` file."
https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
