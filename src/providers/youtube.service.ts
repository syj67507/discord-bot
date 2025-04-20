import { injectable } from "tsyringe";
import yts from "yt-search";
import { Readable } from "stream";
import ytdl from "@distube/ytdl-core";

export interface FetchAutocompleteOptions {
  /** The number of results to return at most */
  count: number;
}

/**
 * A client to hold all YouTube related API calls in one place.
 */
@injectable()
export class YouTubeService {
  constructor() {}

  /**
   * Fetches a list of options based on the search string and an optional parameter
   * for how many to return. By default it will return at most 10 videos
   *
   * @param input - The search string or the url of the YouTube video
   * @returns `yts.VideoSearchResult[]`
   */
  async search(
    input: string,
    options?: FetchAutocompleteOptions,
  ): Promise<yts.VideoSearchResult[]> {
    const count = options?.count || 10;

    const searchResults = await yts(input);
    return searchResults.videos.slice(0, count);
  }

  getAudioStream(url: string): Readable {
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25, // helps with buffering
    });

    return stream;
  }
}
