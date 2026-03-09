import { describe, it, expect } from "vitest";
import {
  validatePresentationRequest,
  validateNarrative,
  validateBrandProfile,
} from "../../src/security/validation.js";

describe("Validation", () => {
  describe("PresentationRequest", () => {
    it("should validate correct presentation request", () => {
      const request = {
        prompt:
          "Create a 12-slide CIO-level presentation explaining Checkmarx",
        brand: "checkmarx",
        numberOfSlides: 12,
      };

      expect(() => validatePresentationRequest(request)).not.toThrow();
    });

    it("should fail with short prompt", () => {
      const request = {
        prompt: "Short",
      };

      expect(() => validatePresentationRequest(request)).toThrow();
    });

    it("should fail with missing required fields", () => {
      const request = {};

      expect(() => validatePresentationRequest(request)).toThrow();
    });

    it("should set defaults for optional fields", () => {
      const request = {
        prompt: "Create a presentation for Checkmarx ASPM platform",
      };

      const validated = validatePresentationRequest(request);
      expect(validated.numberOfSlides).toBe(12);
      expect(validated.tone).toBe("executive");
    });
  });

  describe("BrandProfile", () => {
    it("should validate correct brand profile", () => {
      const profile = {
        vendorName: "Checkmarx",
        companyName: "Checkmarx Ltd.",
        primaryColor: "#0066CC",
        secondaryColor: "#00A3E0",
        accentColor: "#FF6B35",
        logoAssetId: "checkmarx-logo",
        logoUrl: "https://example.com/logo.png",
        slideTemplate: "checkmarx-template",
        logoPosition: "bottom-left" as const,
        fontFamily: "Inter, sans-serif",
        backgroundStyle: "gradient" as const,
        backgroundColor: "#F5F7FA",
      };

      expect(() => validateBrandProfile(profile)).not.toThrow();
    });

    it("should fail with invalid color format", () => {
      const profile = {
        vendorName: "Checkmarx",
        companyName: "Checkmarx Ltd.",
        primaryColor: "0066CC", // Missing #
        secondaryColor: "#00A3E0",
        accentColor: "#FF6B35",
        logoAssetId: "checkmarx-logo",
        logoUrl: "https://example.com/logo.png",
        slideTemplate: "checkmarx-template",
        logoPosition: "bottom-left",
        fontFamily: "Inter, sans-serif",
        backgroundStyle: "gradient",
        backgroundColor: "#F5F7FA",
      };

      expect(() => validateBrandProfile(profile)).toThrow();
    });
  });

  describe("Narrative", () => {
    it("should validate correct narrative", () => {
      const narrative = {
        title: "Checkmarx Presales Narrative",
        description: "Complete presales narrative for Checkmarx ASPM",
        slides: [
          {
            slideNumber: 1,
            title: "Title Slide",
            content: "Opening slide",
            layout: "title",
          },
        ],
        keyMessages: ["Security first", "Every application matters"],
        callToAction: "Let's discuss your security needs",
      };

      expect(() => validateNarrative(narrative)).not.toThrow();
    });
  });
});
