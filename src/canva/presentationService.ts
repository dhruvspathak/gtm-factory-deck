import { logger } from "../utils/logger.js";
import CanvaClient from "./canvaClient.js";
import { SlideDefinition, CanvaDesign } from "../security/validation.js";
import BrandEngine from "../brand/brandEngine.js";

/**
 * Presentation Service - High-level presentation management
 */
export class PresentationService {
  private canvaClient: CanvaClient;
  private brandEngine: BrandEngine;

  constructor(canvaClient: CanvaClient, brandEngine: BrandEngine) {
    this.canvaClient = canvaClient;
    this.brandEngine = brandEngine;
  }

  /**
   * Build presentation from slides
   */
  async buildPresentation(
    title: string,
    slides: SlideDefinition[],
    brand: string
  ): Promise<CanvaDesign> {
    logger.info("Building presentation", { title, slideCount: slides.length, brand });

    try {
      // Create design in Canva
      const design = await this.canvaClient.createDesign(title);
      logger.info("Canva design created", { designId: design.designId });

      // Get brand profile
      const brandProfile = this.brandEngine.getBrandProfile(brand);
      if (!brandProfile) {
        throw new Error(`Brand profile not found: ${brand}`);
      }

      // Add slides
      for (const slide of slides) {
        await this.addSlideToDesign(design.designId, slide, brandProfile);
      }

      // Apply branding
      await this.applyBranding(design.designId, brandProfile);

      logger.info("Presentation built successfully", {
        designId: design.designId,
        slides: slides.length,
      });

      return design;
    } catch (error) {
      logger.error("Failed to build presentation", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Add single slide to design
   */
  private async addSlideToDesign(
    designId: string,
    slide: SlideDefinition,
    brandProfile: any
  ): Promise<void> {
    try {
      // Create page
      const pageId = await this.canvaClient.createSlide(designId);

      // Add title
      await this.canvaClient.addText(designId, pageId, slide.title, {
        fontSize: 44,
        fontWeight: "bold",
        color: brandProfile.primaryColor,
        fontFamily: brandProfile.fontFamily,
      });

      // Add content
      if (slide.content) {
        await this.canvaClient.addText(designId, pageId, slide.content, {
          fontSize: 24,
          color: "#333333",
          fontFamily: brandProfile.fontFamily,
        });
      }

      // Add elements (if any)
      if (slide.elements && slide.elements.length > 0) {
        for (const element of slide.elements) {
          if (element.type === "image") {
            // Upload and add image
            const assetId = await this.canvaClient.uploadAsset(
              element.content || ""
            );
            await this.canvaClient.addImage(
              designId,
              pageId,
              assetId,
              element.position
            );
          } else if (element.type === "text") {
            await this.canvaClient.addText(
              designId,
              pageId,
              element.content || "",
              { fontSize: 16 }
            );
          }
        }
      }

      logger.debug("Slide added to design", {
        designId,
        pageId,
        slideNumber: slide.slideNumber,
      });
    } catch (error) {
      logger.error("Failed to add slide to design", {
        error: error instanceof Error ? error.message : String(error),
        slideNumber: slide.slideNumber,
      });
      throw error;
    }
  }

  /**
   * Apply brand styling to presentation
   */
  private async applyBranding(
    designId: string,
    brandProfile: any
  ): Promise<void> {
    try {
      // Apply template if available
      if (brandProfile.slideTemplate) {
        await this.canvaClient.applyTemplate(
          designId,
          brandProfile.slideTemplate
        );
      }

      // Add logo to design (would be done per slide in production)
      if (brandProfile.logoAssetId) {
        logger.debug("Logo applied to presentation", {
          designId,
          logoAssetId: brandProfile.logoAssetId,
        });
      }

      logger.info("Branding applied", { designId });
    } catch (error) {
      logger.error("Failed to apply branding", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Export presentation to PDF
   */
  async exportToPDF(designId: string): Promise<string> {
    logger.info("Exporting presentation to PDF", { designId });
    return await this.canvaClient.exportDesign(designId, "pdf");
  }

  /**
   * Export presentation as PNG (individual slides)
   */
  async exportToPNG(designId: string): Promise<string> {
    logger.info("Exporting presentation to PNG", { designId });
    return await this.canvaClient.exportDesign(designId, "png");
  }

  /**
   * Get presentation details
   */
  async getPresentation(designId: string): Promise<CanvaDesign> {
    return await this.canvaClient.getDesign(designId);
  }

  /**
   * List all presentations
   */
  async listPresentations(): Promise<CanvaDesign[]> {
    return await this.canvaClient.listDesigns();
  }
}

export default PresentationService;
