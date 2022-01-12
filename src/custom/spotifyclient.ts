import axios, { AxiosResponse } from "axios";
import "dotenv/config";

function allowAllStatuses(): boolean {
    return true;
}

class SpotifyClient {
    /** access_token field needed for Spotify API authorization */
    private accessToken: string;

    constructor() {
        console.log("Constructed SpotifyClient");
        this.accessToken = "initialAccessToken";
    }

    /**
     * Returns a copy of this client's access token
     * @returns {string} The spotify client's current access token
     */
    getAccessToken(): string {
        return this.accessToken;
    }

    /**
     * If an access token is invalid or expired, use this method
     * to retrieve a new token and refresh this client's authorization.
     */
    async refreshAccessToken(): Promise<void> {
        console.log("Access token needs to be refreshed...");

        console.log("Loading clientId and clientSecret from environment...");
        const clientId: string = process.env.SPOTIFY_CLIENT_ID!;
        const clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET!;
        if (clientId === undefined || clientSecret === undefined) {
            throw new SpotifyClientError(
                "Unable to load client credentials from environment. " +
                    "Please set the SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables"
            );
        }

        const url = "https://accounts.spotify.com/api/token";
        const headers = {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
                "base64"
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
        };
        const form = "grant_type=client_credentials";

        const { data } = await axios.post(url, form, {
            headers: headers,
        });
        this.accessToken = data.access_token;
        console.log("Access token refreshed!");
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
        // try {
        response = await axios.get(url, {
            validateStatus: allowAllStatuses,
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
            console.log("Retrying...");
            response = await axios.get(url, {
                validateStatus: allowAllStatuses,
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
            throw new SpotifyClientError("API returned an errored response.", response);
        }

        return response.data;
    }

    /**
     * Fetches a Spotify playlist by it's identifier and returns an array of strings
     * containing each track's artists and title.
     *
     * Ex: Linkin Park - Don't Stay
     *
     * Internally calls the fulfillRequest method, refreshing tokens if needed
     *
     * @param playlistId The Spotify playlist identifier
     * @returns A Spotify API playlist object
     */
    async getPlaylist(playlistId: string): Promise<string[]> {
        const playlist: string[] = [];

        let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        while (url) {
            console.log(`Fetching... ${url}`);
            const data = await this.fulfillRequest(url);
            for (const item of data.items) {
                const artists = item.track.artists
                    .map((artist: any) => artist.name)
                    .join(", ");
                playlist.push(`${artists} - ${item.track.name}`);
            }
            url = data.next;
        }

        return playlist;
    }
}

export class SpotifyClientError extends Error {
    apiResponse: any;
    /**
     * Constructs a SpotifyClientError for when the Spotify API returned an error response.
     *
     * @param spotifyAPIResponse The response returned from the Spotify API
     */
    constructor(errMessage: string, spotifyAPIResponse?: AxiosResponse) {
        let outputMessage = `SpotifyClientError: ${errMessage}.`;
        if (spotifyAPIResponse) {
            const { status, message } = spotifyAPIResponse.data.error;
            outputMessage += ` ${status} - ${message}`;
        }
        super(outputMessage);
        if (spotifyAPIResponse) {
            this.apiResponse = {
                data: spotifyAPIResponse.data,
                config: spotifyAPIResponse.config,
            };
        }
    }
}

export default new SpotifyClient();

/**
 * All code inside of this object is intended to be used strictly for testing.
 * Avoid using this code directly.
 */
export const testing = {
    allowAllStatuses,
};
