import { inject, singleton } from "tsyringe";
import { config } from "../../../config";
import axios, { AxiosResponse } from "axios";
import { LoggerProvider } from "../../../providers/logger.provider";

@singleton()
export class SpotifyService {
  private accessToken: string;
  constructor(@inject(LoggerProvider) private readonly logger: LoggerProvider) {
    this.accessToken = "initialAccessToken";
    this.logger.setName(SpotifyService.name);
  }

  /**
   * If an access token is invalid or expired, use this method
   * to retrieve a new token and refresh this client's authorization.
   */
  async refreshAccessToken(): Promise<void> {
    this.logger.log("Access token needs to be refreshed...");

    this.logger.log("Loading clientId and clientSecret from environment...");
    const clientId = config.spotifyClientId;
    const clientSecret = config.spotifyClientSecret;
    if (clientId === undefined || clientSecret === undefined) {
      throw new Error(
        "Unable to load client credentials from environment. " +
          "Please set the SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables",
      );
    }

    const url = "https://accounts.spotify.com/api/token";
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const form = "grant_type=client_credentials";

    const { data } = await axios.post(url, form, {
      headers: headers,
    });
    this.accessToken = data.access_token;
    this.logger.log("Access token refreshed!");
  }

  /**
   * Fulfill's a given request with the provided parameters.
   * Tries to get a response and if it fails due to an access
   * token related error, then it will refresh the access token before the second try.
   *
   * Any errors returned by the Spotify API will throw an error.
   *
   * @returns Spotify API response
   */
  async fulfillRequest(url: string) {
    let response: AxiosResponse;
    response = await axios.get(url, {
      validateStatus: () => true,
      headers: {
        Accept: "*/*",
        "User-Agent": "No Hands Discord Bot",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // Access token related errors should call for a refresh and retry
    if (response.status === 401) {
      await this.refreshAccessToken();

      // retrying with new access token, throws error if this fails
      this.logger.log("Retrying...");
      response = await axios.get(url, {
        validateStatus: () => true,
        headers: {
          Accept: "*/*",
          "User-Agent": "No Hands Discord Bot",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    }

    // If response was an error, then throw an error
    if (response.status !== 200) {
      throw new Error(
        `API returned an errored response. ${JSON.stringify(response.data)}`,
      );
    }

    return response.data;
  }

  /**
   * Returns if the track url is valid
   *
   * Follows the format of https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl
   * @param trackUrl the track url to check
   * @returns true if the track url is valid, false otherwise
   */
  isValidTrackUrl(trackUrl: string): boolean {
    const regex = /^https:\/\/open.spotify.com\/track\/\w{22}/;
    return regex.test(trackUrl);
  }

  /**
   * Returns if the album url is valid
   *
   * Follows the format of https://open.spotify.com/album/4cJ8qhE71x97swkaMQhGcr
   * @param albumUrl the album url to check
   * @returns true if the album url is valid, false otherwise
   */
  isValidAlbumUrl(albumUrl: string): boolean {
    const regex = /^https:\/\/open.spotify.com\/album\/\w{22}/;
    return regex.test(albumUrl);
  }

  /**
   * Returns if the playlist url is valid
   *
   * Follows the format of https://open.spotify.com/playlist/5R66Rzmvlh7ZQAYYZGeOzM
   * @param playlistUrl the playlist url to check
   * @returns true if the playlist url is valid, false otherwise
   */
  isValidPlaylistUrl(playlistUrl: string): boolean {
    const regex = /^https:\/\/open.spotify.com\/playlist\/\w{22}/;
    return regex.test(playlistUrl);
  }

  /**
   * Extracts the id of whatever kind of url it is
   *
   * @returns the extracted id as a string
   */
  getId(url: string): string {
    return url
      .replace(/https:\/\/open.spotify.com\/\w+\//, "")
      .replace(/\?.+/, "");
  }

  /**
   * Fetches the track
   * @param trackUrl the url of the track
   * @returns a track
   */
  async getTrack(trackUrl: string) {
    const trackId = this.getId(trackUrl);
    const response: SpotifyApi.TrackObjectFull = await this.fulfillRequest(
      `https://api.spotify.com/v1/tracks/${trackId}`,
    );
    return {
      album: response.album.name,
      artist: response.artists.map((artist) => artist.name).join(", "),
      title: response.name,
    };
  }

  /**
   * Fetches all the tracks in a given playlist
   * @param albumUrl The url of the playlist
   * @returns A list of tracks
   */
  async getPlaylistTracks(playlistUrl: string) {
    const playlistId = this.getId(playlistUrl);

    const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const response: SpotifyApi.PlaylistTrackResponse =
      await this.fulfillRequest(endpoint);
    const spotifyTracks = response.items
      .map((item) => item.track)
      .map((track) => ({
        title: track?.name,
        artist: track?.artists.map((artist) => artist.name).join(", "),
        album: track?.album.name,
      }));
    return spotifyTracks;
  }

  /**
   * Fetches all the tracks in a given album
   * @param albumUrl The url of the album
   * @returns A list of tracks
   */
  async getAlbumTracks(albumUrl: string) {
    const albumId = this.getId(albumUrl);
    const endpoint = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
    this.logger.log(`Fetching ${endpoint}`);
    const response: SpotifyApi.AlbumTracksResponse =
      await this.fulfillRequest(endpoint);
    const spotifyTracks = response.items.map((track) => ({
      title: track?.name,
      artist: track?.artists.map((artist) => artist.name).join(", "),
    }));
    return spotifyTracks;
  }
}
