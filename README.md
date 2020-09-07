# Discord Bot

## Overview

This discord bot is a personal project. It is implemented using the Discord.js
library and the Node.js framework.

## Installation

This project involves several dependencies managed by npm. Get npm by following
this link: https://www.npmjs.com/get-npm

Within the root folder of the project, install the dependencies

    $ npm install

Create your config.json file from the config.json.tpl file and populate the token fields.
More information in the Authentication section.

## Authentication

You will need to create a bot application: https://discord.com/developers/applications

You will need to create a giphy developer account: https://developers.giphy.com/

Authentication tokens for the Discord Bot and the API's that the Bot uses are specified
within a local `config.json` file. Copy the `config.json.tpl` file, rename it to
`config.json`, and fill in the fields with the respective tokens.

## Running the application

Run the application using the following command:

    $ node .

Stop the application by terminating the process. On bash: `CTRL-C`.
