# Lavalink Usage

This project is using lavalink as the tool that handles searching and playback of tracks for the discord client.

This folder contains the lavalink configurations and the following command is how you can spin up the lavalink server locally through docker.

```
docker run -d \
    -p 2333:2333 \
    -e _JAVA_OPTIONS="-Xmx512M" \
    -e LAVALINK_PASSWORD="<enter lavalink password>" \
    -e LAVALINK_PLUGIN_YOUTUBE_REFRESH_TOKEN="<enter oauth token>" \
    -e LAVALINK_PLUGIN_SPOTIFY_CLIENT_ID="<enter spotify client id>" \
    -e LAVALINK_PLUGIN_SPOTIFY_CLIENT_SECRET="<enter spotify client secret>" \
    -v ./lavalink/application.yml:/opt/Lavalink/application.yml \
    --name lavalink \
    ghcr.io/lavalink-devs/lavalink:efed40d-alpine
```
