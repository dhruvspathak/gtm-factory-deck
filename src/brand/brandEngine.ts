import { BrandProfile, validateBrandProfile } from "../security/validation.js";
import { logger } from "../utils/logger.js";
import brandsData from "./profiles/brands.json" assert { type: "json" };

/**
 * Brand Engine - Manages vendor branding and styling
 */
export class BrandEngine {
  private brands: Map<string, BrandProfile> = new Map();

  constructor() {
    this.loadBrands();
  }

  /**
   * Load brand profiles from JSON
   */
  private loadBrands(): void {
    try {
      for (const [key, brandData] of Object.entries(brandsData)) {
        const profile = validateBrandProfile(brandData);
        this.brands.set(key.toLowerCase(), profile);
        this.brands.set(profile.vendorName.toLowerCase(), profile);
      }
      logger.info("Brand profiles loaded", { count: this.brands.size });
    } catch (error) {
      logger.error("Failed to load brand profiles", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Detect brand from prompt
   */
  detectBrand(prompt: string): string | null {
    const lowerPrompt = prompt.toLowerCase();

    for (const brandName of this.brands.keys()) {
      if (lowerPrompt.includes(brandName)) {
        return brandName;
      }
    }

    return null;
  }

  /**
   * Get brand profile
   */
  getBrandProfile(brand: string): BrandProfile | null {
    const key = brand.toLowerCase();
    return this.brands.get(key) || null;
  }

  /**
   * Get all available brands
   */
  getAvailableBrands(): string[] {
    const unique = new Set<string>();
    for (const brand of this.brands.values()) {
      unique.add(brand.vendorName);
    }
    return Array.from(unique).sort();
  }

  /**
   * Apply brand styling to slide definitions
   */
  applyStyling(
    slides: any[],
    brandProfile: BrandProfile
  ): any[] {
    return slides.map((slide) => ({
      ...slide,
      styling: {
        primaryColor: brandProfile.primaryColor,
        secondaryColor: brandProfile.secondaryColor,
        accentColor: brandProfile.accentColor,
        fontFamily: brandProfile.fontFamily,
        backgroundColor: brandProfile.backgroundColor,
      },
      branding: {
        logo: {
          assetId: brandProfile.logoAssetId,
          url: brandProfile.logoUrl,
          position: brandProfile.logoPosition,
        },
        templateName: brandProfile.slideTemplate,
      },
    }));
  }

  /**
   * Generate brand CSS
   */
  generateBrandCSS(brandProfile: BrandProfile): string {
    return `
      :root {
        --primary-color: ${brandProfile.primaryColor};
        --secondary-color: ${brandProfile.secondaryColor};
        --accent-color: ${brandProfile.accentColor};
        --font-family: ${brandProfile.fontFamily};
        --bg-color: ${brandProfile.backgroundColor};
      }

      body {
        font-family: var(--font-family);
        background-color: var(--bg-color);
      }

      .slide {
        border-top: 4px solid var(--primary-color);
      }

      .slide-title {
        color: var(--primary-color);
        font-weight: bold;
      }

      .accent-text {
        color: var(--accent-color);
      }

      .brand-logo {
        position: ${brandProfile.logoPosition};
      }
    `;
  }

  /**
   * Register custom brand
   */
  registerCustomBrand(brandProfile: BrandProfile): void {
    const validated = validateBrandProfile(brandProfile);
    const key = validated.vendorName.toLowerCase();
    this.brands.set(key, validated);
    logger.info("Custom brand registered", { brand: validated.vendorName });
  }
}

export default BrandEngine;
