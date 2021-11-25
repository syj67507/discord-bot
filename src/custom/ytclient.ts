import ytdl from "ytdl-core";
import ytsr from "ytsr";
import ytpl from "ytpl";
import { Track } from "./music-manager";

export const ytsrWrapper = {
    ytsr,
    getFilters: ytsr.getFilters,
};

export const ytplWrapper = {
    ytpl,
    getPlaylistID: ytpl.getPlaylistID,
};

/**
 * YTClient provides a set of utility functions that aid in
 * communicating with all YouTube APIs.
 */
export class YTClient {
    /**
     * YTClient provides a set of utility functions that aid in
     * communicating with all YouTube APIs.
     */
    constructor() {
        // Do nothing
    }

    /**
     * Search YouTube with a provided search string and return the first
     * video result as a Track.
     * @param searchString The search string value to look through YouTube
     * @returns Track
     */
    async search(searchString: string): Promise<Track> {
        let filters;
        try {
            filters = await ytsrWrapper.getFilters(searchString);
        } catch (error) {
            const e = new Error("Search API returned an error with filters.");
            if (error instanceof Error) {
                e.message = e.message + ` ${error.message}`;
            }
            throw e;
        }

        const videoFilters = filters.get("Type")?.get("Video");
        if (!videoFilters) {
            throw new Error("Unable to get search filters: Video");
        }

        let searchResults;
        try {
            searchResults = await ytsrWrapper.ytsr(videoFilters.url!, {
                limit: 1,
            });
        } catch (error) {
            const e = new Error("Search API returned an error with final search.");
            if (error instanceof Error) {
                e.message = e.message + ` ${error.message}`;
            }
            throw e;
        }

        let { title, url, duration } = searchResults.items[0] as ytsr.Video;
        return {
            title: title,
            link: url,
            duration: duration ? duration : "--:--:--",
        };
    }

    /**
     * Takes a direct YouTube link or YouTube video ID and returns a Track
     * @param linkOrId Direct YouTube link or YouTube Video ID
     * @returns Track
     */
    async getVideo(linkOrId: string): Promise<Track> {
        const videoId = ytdl.getVideoID(linkOrId);

        const response = await ytdl.getBasicInfo(videoId);
        const { title, video_url, lengthSeconds } = response.videoDetails;

        return {
            title,
            link: video_url,
            duration: this.createDurationString(lengthSeconds),
        };
    }

    /**
     * Takes a YouTube link and tries parsing it for a YouTube playlist.
     * If successful, it returns an array of Tracks, with each Track representing a
     * YouTube video
     * @param linkOrId Direct YouTube link or ID of YouTube playlist
     * @returns Track[]
     */
    async getPlaylist(linkOrId: string): Promise<Track[]> {
        const playlistId = await ytplWrapper.getPlaylistID(linkOrId);

        const response = await ytplWrapper.ytpl(playlistId);
        const playlist = response.items.map((item) => {
            const { title, url, duration } = item;
            return {
                title,
                link: url,
                duration,
            };
        });
        return playlist;
    }

    private createDurationString(lengthSeconds: string): string {
        const lengthSecondsInt = parseInt(lengthSeconds);
        const hours = Math.floor(lengthSecondsInt / 3600);
        const minutes = Math.floor((lengthSecondsInt - hours * 3600) / 60);
        const seconds = Math.floor((lengthSecondsInt - hours * 3600 - minutes * 60) % 60);
        let result = `${this.padDurationNumbers(hours)}:${this.padDurationNumbers(
            minutes
        )}:${this.padDurationNumbers(seconds)}`;
        return result;
    }

    private padDurationNumbers(num: number): string {
        return num.toString().padStart(2, "0");
    }
}
