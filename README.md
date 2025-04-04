# Discord Bot

## Overview

This discord bot is a personal project. It is implemented using Node.js, TypeScript, discord.js, tsyringe, and vitest.

# Installation

This project uses the Node.js framework. You can download and install node at the following link: https://nodejs.org/en/

Within the root folder of the project, install the dependencies

    $ npm install

## Environment

Create an .env file at the root of the repository and populate it with the following fields.

Some fields are used for authentication while others are used for setting up aspects of the bot.

```
DISCORD_TOKEN= // The unique token of the bot in order for it log in to the associated Discord Application (https://discord.com/developers/applications)
DISCORD_CLIENT_ID= // The Client Id of the discord bot
DISCORD_GUILD_ID= // The server/guild Id of the server you wish to connect this discord bot to
```

## Running the application locally

To run the application for local development, use the following command:

    $ npm run dev

Stop the application by terminating the process. On bash: `CTRL-C`.

## Testing

This project uses the `vitest` framework for unit testing. Use the following command to run tests locally:

    $ npm run test

You can view an HTML coverage report in the browser by opening up the html file that gets generated in the coverage folder after running tests.

# Project Notes

## vitest and tsyringe limitation

There were some limitation to setting up a container and having dependencies resolved in unit tests with vitest.

The simplest workaround I have found is to have the `@inject()` decorator for each of the dependencies in the constructor for the respective classes. That is why you will see these injectors when they would otherwise not be needed.
