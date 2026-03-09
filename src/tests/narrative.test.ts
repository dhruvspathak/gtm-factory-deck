import { describe, it, expect, beforeEach } from "vitest";
import StoryEngine from "../../src/narrative/storyEngine.js";

describe("StoryEngine", () => {
  let storyEngine: StoryEngine;

  beforeEach(() => {
    storyEngine = new StoryEngine();
  });

  it("should generate slides for standard presentation", async () => {
    const slides = await storyEngine.generateSlides(
      "Create a presales presentation for Checkmarx",
      "Checkmarx",
      5
    );

    expect(slides).toBeDefined();
    expect(slides.length).toBe(5);
    expect(slides[0].slideNumber).toBe(1);
  });

  it("should generate slides with correct structure", async () => {
    const slides = await storyEngine.generateSlides(
      "Security architecture overview",
      "Checkmarx",
      3
    );

    for (const slide of slides) {
      expect(slide).toHaveProperty("slideNumber");
      expect(slide).toHaveProperty("title");
      expect(slide).toHaveProperty("content");
      expect(slide).toHaveProperty("layout");
    }
  });

  it("should detect technical framework for architecture prompts", async () => {
    const slides = await storyEngine.generateSlides(
      "Create an architecture technical presentation for Checkmarx",
      "Checkmarx",
      5
    );

    expect(slides.length).toBe(5);
    // First slide title should indicate architecture focus
    expect(slides[0].title).toBeDefined();
  });

  it("should handle competitive presentations", async () => {
    const slides = await storyEngine.generateSlides(
      "Create a competitive comparison presentation vs Forescout",
      "Checkmarx",
      5
    );

    expect(slides.length).toBe(5);
    expect(slides).toBeDefined();
  });

  it("should store and retrieve client context", () => {
    storyEngine.setClientContext("client1", { industry: "BFSI" });

    const context = storyEngine.getClientContext("client1");
    expect(context.industry).toBe("BFSI");
  });
});
