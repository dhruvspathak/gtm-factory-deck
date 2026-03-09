import { logger } from "../utils/logger.js";
import {
  PresentationRequest,
  validatePresentationRequest,
  CanvaDesign,
} from "../security/validation.js";
import BrandEngine from "../brand/brandEngine.js";
import StoryEngine from "../narrative/storyEngine.js";
import DiagramEngine from "../diagrams/diagramEngine.js";
import ResearchEngine from "../research/researchEngine.js";
import CanvaClient from "../canva/canvaClient.js";
import PresentationService from "../canva/presentationService.js";

interface DeckGenerationStats {
  totalTime: number;
  narrativeTime: number;
  brandingTime: number;
  diagramTime: number;
  canvaTime: number;
}

/**
 * Deck Orchestrator - Main orchestration engine for presentation generation
 */
export class DeckOrchestrator {
  private brandEngine: BrandEngine;
  private storyEngine: StoryEngine;
  private diagramEngine: DiagramEngine;
  private researchEngine: ResearchEngine;
  private canvaClient: CanvaClient;
  private presentationService: PresentationService;
  private stats: DeckGenerationStats = {
    totalTime: 0,
    narrativeTime: 0,
    brandingTime: 0,
    diagramTime: 0,
    canvaTime: 0,
  };

  constructor() {
    this.brandEngine = new BrandEngine();
    this.storyEngine = new StoryEngine();
    this.diagramEngine = new DiagramEngine();
    this.researchEngine = new ResearchEngine();
    this.canvaClient = new CanvaClient();
    this.presentationService = new PresentationService(
      this.canvaClient,
      this.brandEngine
    );
  }

  /**
   * Generate complete presentation from prompt
   */
  async generatePresentation(rawRequest: any): Promise<CanvaDesign> {
    const startTime = Date.now();
    logger.info("Starting presentation generation");

    try {
      // Validate request
      const request = validatePresentationRequest(rawRequest);
      logger.debug("Request validated", request);

      // Detect brand if not specified
      let brand = request.brand;
      if (!brand) {
        const detectedBrand = this.brandEngine.detectBrand(request.prompt);
        if (!detectedBrand) {
          throw new Error(`Could not detect brand from prompt`);
        }
        brand = detectedBrand;
        logger.info("Brand detected", { brand });
      }

      // Verify brand exists
      const brandProfile = this.brandEngine.getBrandProfile(brand);
      if (!brandProfile) {
        throw new Error(`Unknown brand: ${brand}`);
      }

      // Step 1: Research (optional, parallel execution)
      const researchStart = Date.now();
      const researchSources = await this.researchEngine.research(
        brand,
        request.prompt
      );
      logger.debug("Research completed", { sources: researchSources.length });

      // Step 2: Generate narrative with brand context
      const narrativeStart = Date.now();
      let slides = await this.storyEngine.generateSlides(
        request.prompt,
        brandProfile.vendorName,
        request.numberOfSlides
      );

      // Apply brand styling to slides
      const brandingStart = Date.now();
      slides = this.brandEngine.applyStyling(slides, brandProfile);
      this.stats.brandingTime = Date.now() - brandingStart;

      // Step 3: Generate diagram for slides that need it
      const diagramStart = Date.now();
      for (const slide of slides) {
        if (slide.layout === "diagram") {
          const diagramMermaid = this.diagramEngine.generateArchitectureDiagram(
            slide.content,
            brandProfile.vendorName
          );
          slide.elements = slide.elements || [];
          slide.elements.push({
            type: "image",
            position: { x: 50, y: 30 },
            content: diagramMermaid,
          });
        }
      }
      this.stats.diagramTime = Date.now() - diagramStart;

      logger.info("Slides prepared", {
        count: slides.length,
        brand: brandProfile.vendorName,
      });

      // Step 4: Build presentation in Canva
      const canvaStart = Date.now();
      const design = await this.presentationService.buildPresentation(
        `${brandProfile.vendorName} - ${request.prompt.substring(0, 50)}`,
        slides,
        brand
      );
      this.stats.canvaTime = Date.now() - canvaStart;

      // Calculate statistics
      this.stats.totalTime = Date.now() - startTime;
      this.stats.narrativeTime = narrativeStart - researchStart + brandingStart - narrativeStart;

      logger.info("Presentation generated successfully", {
        designId: design.designId,
        slides: slides.length,
        brandProfile: brandProfile.vendorName,
        timeMs: this.stats.totalTime,
        stats: this.stats,
      });

      return design;
    } catch (error) {
      logger.error("Failed to generate presentation", {
        error: error instanceof Error ? error.message : String(error),
        totalTimeMs: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Get generation statistics
   */
  getStats(): DeckGenerationStats {
    return this.stats;
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    engines: {
      brands: number;
      available: boolean;
    };
  } {
    return {
      engines: {
        brands: this.brandEngine.getAvailableBrands().length,
        available: true,
      },
    };
  }

  /**
   * List available brands
   */
  getAvailableBrands(): string[] {
    return this.brandEngine.getAvailableBrands();
  }

  /**
   * Export presentation
   */
  async exportPresentation(
    designId: string,
    format: "pdf" | "png" = "pdf"
  ): Promise<string> {
    logger.info("Exporting presentation", { designId, format });
    if (format === "pdf") {
      return await this.presentationService.exportToPDF(designId);
    } else {
      return await this.presentationService.exportToPNG(designId);
    }
  }
}

export default DeckOrchestrator;
