import { describe, it, expect, beforeEach } from "vitest";
import BrandEngine from "../../src/brand/brandEngine.js";

describe("BrandEngine", () => {
  let brandEngine: BrandEngine;

  beforeEach(() => {
    brandEngine = new BrandEngine();
  });

  it("should load brand profiles", () => {
    const brands = brandEngine.getAvailableBrands();
    expect(brands.length).toBeGreaterThan(0);
  });

  it("should detect brand from prompt", () => {
    const detected = brandEngine.detectBrand(
      "Create a presentation for Checkmarx security"
    );
    expect(detected).toBeDefined();
    expect(detected?.toLowerCase()).toContain("checkmarx");
  });

  it("should get brand profile", () => {
    const profile = brandEngine.getBrandProfile("checkmarx");
    expect(profile).toBeDefined();
    expect(profile?.vendorName).toBe("Checkmarx");
    expect(profile?.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("should apply styling to slides", () => {
    const profile = brandEngine.getBrandProfile("checkmarx");
    const slides = [
      {
        slideNumber: 1,
        title: "Test",
        content: "Test content",
        layout: "title",
      },
    ];

    const styled = brandEngine.applyStyling(slides, profile!);

    expect(styled[0].styling).toBeDefined();
    expect(styled[0].styling.primaryColor).toBe(profile!.primaryColor);
    expect(styled[0].branding).toBeDefined();
  });

  it("should generate brand CSS", () => {
    const profile = brandEngine.getBrandProfile("checkmarx");
    const css = brandEngine.generateBrandCSS(profile!);

    expect(css).toContain("--primary-color");
    expect(css).toContain(profile!.primaryColor);
  });

  it("should return available brands list", () => {
    const brands = brandEngine.getAvailableBrands();
    expect(brands).toContain("Checkmarx");
    expect(brands).toContain("Forescout");
    expect(brands).toContain("OpenText");
  });
});
