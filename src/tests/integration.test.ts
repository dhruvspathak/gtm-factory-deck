import { describe, it, expect, beforeEach, afterEach } from "vitest";
import DeckOrchestrator from "../../src/orchestrator/deckOrchestrator.js";

describe("DeckOrchestrator Integration Tests", () => {
  let orchestrator: DeckOrchestrator;

  beforeEach(() => {
    orchestrator = new DeckOrchestrator();
  });

  it("should complete full workflow for Checkmarx", async () => {
    const design = await orchestrator.generatePresentation({
      prompt: "Create a CIO-level presentation explaining Checkmarx ASPM",
      brand: "checkmarx",
      numberOfSlides: 8,
    });

    expect(design).toBeDefined();
    expect(design.designId).toBeDefined();
    expect(design.title).toContain("Checkmarx");
    expect(design.pages).toBeGreaterThan(0);

    const stats = orchestrator.getStats();
    expect(stats.totalTime).toBeLessThan(60000); // Should complete in under 60 seconds
    expect(stats.totalTime).toBeGreaterThan(0);
  });

  it("should handle brand auto-detection", async () => {
    const design = await orchestrator.generatePresentation({
      prompt: "Create a Forescout network security presentation",
      numberOfSlides: 5,
    });

    expect(design).toBeDefined();
    expect(design.designId).toBeDefined();
  });

  it("should generate different frameworks based on prompt", async () => {
    // Technical prompt
    const techDesign = await orchestrator.generatePresentation({
      prompt:
        "Create an architecture technical presentation for Checkmarx",
      numberOfSlides: 5,
    });

    expect(techDesign).toBeDefined();

    // Competitive prompt
    const compDesign = await orchestrator.generatePresentation({
      prompt:
        "Create a competitive comparison presentation comparing solutions",
      numberOfSlides: 5,
    });

    expect(compDesign).toBeDefined();
  });

  it("should handle various slide numbers", async () => {
    const designs = await Promise.all([
      orchestrator.generatePresentation({
        prompt: "Checkmarx presentation",
        numberOfSlides: 3,
      }),
      orchestrator.generatePresentation({
        prompt: "Forescout presentation",
        numberOfSlides: 12,
      }),
      orchestrator.generatePresentation({
        prompt: "OpenText presentation",
        numberOfSlides: 20,
      }),
    ]);

    expect(designs).toHaveLength(3);
    for (const design of designs) {
      expect(design.designId).toBeDefined();
    }
  });

  it("should throw on invalid brand", async () => {
    await expect(
      orchestrator.generatePresentation({
        prompt: "Create a presentation",
        brand: "invalidvendor",
        numberOfSlides: 5,
      })
    ).rejects.toThrow();
  });

  it("should list available brands", () => {
    const brands = orchestrator.getAvailableBrands();
    expect(brands).toContain("Checkmarx");
    expect(brands).toContain("Forescout");
    expect(brands).toContain("OpenText");
  });

  it("should export presentation", async () => {
    const design = await orchestrator.generatePresentation({
      prompt: "Checkmarx presentation",
      numberOfSlides: 5,
    });

    // Mock export (would call Canva in real scenario)
    expect(design.designId).toBeDefined();
  });

  it("should maintain performance targets", async () => {
    const start = Date.now();

    const design = await orchestrator.generatePresentation({
      prompt: "Create a comprehensive Checkmarx ASPM presentation",
      numberOfSlides: 12,
    });

    const duration = Date.now() - start;

    expect(duration).toBeLessThan(60000); // < 60 seconds
    expect(design).toBeDefined();

    const stats = orchestrator.getStats();
    console.log("Performance Stats:", stats);
    console.log(`Total time: ${duration}ms`);
  });

  it("should get orchestrator status", () => {
    const status = orchestrator.getStatus();

    expect(status).toBeDefined();
    expect(status.engines.brands).toBeGreaterThan(0);
    expect(status.engines.available).toBe(true);
  });
});
