import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { YouTubeClient } from "./youtube.client";

describe("YouTubeClient", () => {
  it("should return a youtube client", () => {
    expect(new YouTubeClient()).toBeDefined();
  });

  it.each([
    {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      expectedResult: true,
    },
    {
      url: "http://youtube.com/watch?v=dQw4w9WgXcQ",
      expectedResult: true,
    },
    {
      url: "https://youtu.be/dQw4w9WgXcQ",
      expectedResult: true,
    },
    {
      url: "youtu.be/dQw4w9WgXcQ",
      expectedResult: true,
    },
    {
      url: "other",
      expectedResult: false,
    },
  ])("should return $expectedResult for $url", ({ url, expectedResult }) => {
    const client = new YouTubeClient();
    const result = client.isValidYouTubeUrl(url);
    expect(result).toBe(expectedResult);
  });
});
