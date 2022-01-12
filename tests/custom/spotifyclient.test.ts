import axios, { AxiosResponse } from "axios";
import SpotifyClient, {
    SpotifyClientError,
    testing,
} from "../../src/custom/spotifyclient";

describe("SpotifyClient tests", () => {
    let axiosSpy: jest.SpyInstance;
    const successfulPlaylistResponse: AxiosResponse = {
        status: 200,
        statusText: "",
        headers: {},
        config: {},
        data: {
            items: [
                {
                    track: {
                        name: "name",
                        artists: [
                            {
                                name: "artistName",
                            },
                        ],
                    },
                },
            ],
        },
    };

    const refreshAccessTokenResponse: AxiosResponse = {
        status: 200,
        statusText: "",
        headers: {},
        config: {},
        data: {
            access_token: "this is a mock access token",
        },
    };

    function createMockErrorResponse(status: number): AxiosResponse {
        return {
            status: status,
            statusText: "",
            headers: {},
            config: {},
            data: {
                error: {
                    status: status,
                    message: "mock error",
                },
            },
        };
    }

    beforeEach(() => {
        jest.restoreAllMocks();

        // mock the environment variables needed for this client's authentication
        process.env.SPOTIFY_CLIENT_ID = "SPOTIFY_CLIENT_ID";
        process.env.SPOTIFY_CLIENT_SECRET = "SPOTIFY_CLIENT_SECRET";

        // mock Axios
        axiosSpy = jest.spyOn(axios, "get").mockImplementation(jest.fn());

        // mocking the access token refresh
        jest.spyOn(axios, "post").mockImplementation(
            async (): Promise<AxiosResponse<any>> => {
                return refreshAccessTokenResponse;
            }
        );
    });

    it("Should cover the validateStatus function for axios calls", () => {
        expect(testing.allowAllStatuses()).toBe(true);
    });

    it("Should refresh the access token if an access related token error was received (401 errors)", async () => {
        // mock a 401 error followed by a successful call after access token refresh
        axiosSpy
            .mockImplementationOnce(async (): Promise<AxiosResponse<any>> => {
                return createMockErrorResponse(401);
            })
            .mockImplementationOnce(async (): Promise<AxiosResponse<any>> => {
                return successfulPlaylistResponse;
            });

        const refreshSpy = jest.spyOn(SpotifyClient, "refreshAccessToken");

        await SpotifyClient.fulfillRequest("");

        expect(refreshSpy).toHaveBeenCalledTimes(1);
        expect(SpotifyClient.getAccessToken()).toEqual(
            refreshAccessTokenResponse.data.access_token
        );
    });

    it("Should throw a SpotifyClientError if any request returned any error not related to access tokens", async () => {
        axiosSpy.mockImplementation(async (): Promise<AxiosResponse<any>> => {
            return createMockErrorResponse(500);
        });

        return expect(SpotifyClient.fulfillRequest("")).rejects.toThrow(
            SpotifyClientError
        );
    });

    it("Should successfully get a playlist", async () => {
        axiosSpy.mockImplementation(async (): Promise<AxiosResponse<any>> => {
            return successfulPlaylistResponse;
        });

        const playlist = await SpotifyClient.getPlaylist("playlistId");

        expect(playlist).toEqual(["artistName - name"]);
    });

    it("Should throw an error if unable to retrieve a playlist", async () => {
        axiosSpy.mockImplementation(async (): Promise<AxiosResponse<any>> => {
            return createMockErrorResponse(500);
        });

        return expect(SpotifyClient.getPlaylist("playlistId")).rejects.toThrow(
            SpotifyClientError
        );
    });
});
