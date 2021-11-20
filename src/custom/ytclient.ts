import ytdl from "ytdl-core";
import ytsr from "ytsr";
import ytpl from "ytpl";
import { Track } from "./music-manager";

export class YTClient {
    constructor() {
        // Do nothing
    }

    async search(searchString: string): Promise<Track> {
        let filters;
        try {
            filters = await ytsr.getFilters(searchString);
        } catch (error) {
            const e = new Error("Search API returned an error with filters.");
            if (error instanceof Error) {
                e.message = e.message + ` ${error.message}`;
            }
            throw e;
        }

        const typeFilters = filters.get("Type");
        if (!typeFilters) {
            throw new Error("Unable to get search filters: Type");
        }

        const videoFilters = typeFilters.get("Video");
        if (!videoFilters) {
            throw new Error("Unable to get search filters: Video");
        }

        let searchResults;
        try {
            searchResults = await ytsr(videoFilters!.url!, {
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
            duration: duration ? duration : "--:--",
        };
    }

    async getVideo(linkOrId: string): Promise<Track> {
        const videoId = ytdl.getVideoID(linkOrId);
        console.log(videoId);

        const response = await ytdl.getBasicInfo(videoId);
        const { title, video_url, lengthSeconds } = response.videoDetails;

        return {
            title,
            link: video_url,
            duration: this.createDurationString(lengthSeconds),
        };
    }

    async getPlaylist(linkOrId: string): Promise<Track[]> {
        const playlistId = await ytpl.getPlaylistID(linkOrId);

        const response = await ytpl(playlistId);
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

    async test() {
        console.log(
            await this.getPlaylist("https://www.youtube.com/watch?v=P6ODTQKhaXk")
        );
        console.log("asdf");
    }
}
