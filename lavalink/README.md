# Lavalink Usage

This project is using lavalink as the tool that handles searching and playback of tracks for the discord client.

This folder contains the lavalink configurations and the following command is how you can spin up the lavalink server locally through docker.

## Local Usage

When running this locally, you will want to make sure that the port that the discord bot is connecting to for lavalink is available on a port other than 443. Lavalink will be running on port 443 inside the container, but should be mapped to a different port on the host machine.

The following command maps the host machines port 2333 to port 443 that lavalink is exposing its service to inside the container.
```
docker run -p 2333:443 --env-file lavalink/lavalink.env ghcr.io/lavalink-devs/lavalink:efed40d-alpine
```

You should then configure the port that the discord bot uses to connect to lavalink to 2333.

## Remote Usage / Deployment notes

Railway exposes its domain on https, so the lavalink port of 443 inside the container should be mapped to the port that Railway exposes with 443.

The discord bot should then be configured to connect to lavalink with a port of 443, the port that railway is mapping to the port that lavalink is exposed to from within the container.
