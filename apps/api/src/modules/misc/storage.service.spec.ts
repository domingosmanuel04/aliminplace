import { describe, expect, it } from "vitest";
import { buildStorageKey, normalizeFileName } from "./storage.service";

describe("storage service", () => {
  it("normalizes uploaded filenames safely", () => {
    expect(normalizeFileName("../../../../evil.mp4")).toBe("evil.mp4");
    expect(normalizeFileName("Aula 01 - Intro.mp4")).toBe(
      "Aula_01_-_Intro.mp4",
    );
  });

  it("creates a stable object key for media files", () => {
    const key = buildStorageKey("videos", "Aula 01 - Intro.mp4");
    expect(key).toMatch(/^videos\//);
    expect(key).toMatch(/Aula_01_-_Intro\.mp4$/);
  });
});
