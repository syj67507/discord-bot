# Discord Bot

## Overview

This discord bot is a personal project. It is implemented using the Discord.js
library and the Node.js framework.

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

    $ node .

Stop the application by terminating the process. On bash: `CTRL-C`.

## Deployment

One instance of this bot is deployed using Heroku. Every time the master branch is updated, Heroku will automatically deploy once the Continuous Integration checks have passed.
