import axios, { AxiosInstance } from "axios";
import { logger } from "../utils/logger.js";
import { CanvaDesign } from "../security/validation.js";

// Note: CanvaSlide interface used for type definitions
export interface CanvaSlide {
  pageId: string;
  title: string;
  elements: CanvaElement[];
}

interface CanvaElement {
  type: string;
  content: string;
  position?: { x: number; y: number };
  style?: Record<string, any>;
}

/**
 * Canva API Client - Handles all Canva API interactions
 */
export class CanvaClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(
    apiKey: string = process.env.CANVA_API_KEY || "",
    baseUrl: string = process.env.CANVA_API_BASE_URL || "https://api.canva.com"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for logging and error handling
   */
  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug("Canva API Request", {
          method: config.method,
          url: config.url,
        });
        return config;
      },
      (error) => {
        logger.error("Canva API Request Error", {
          error: error instanceof Error ? error.message : String(error),
        });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug("Canva API Response", { status: response.status });
        return response;
      },
      (error) => {
        logger.error("Canva API Response Error", {
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new design/presentation
   */
  async createDesign(title: string, templateId?: string): Promise<CanvaDesign> {
    try {
      const payload = {
        title,
        ...(templateId && { template_id: templateId }),
      };

      const response = await this.client.post("/v1/designs", payload);

      const design: CanvaDesign = {
        designId: response.data.id,
        title: response.data.title,
        url: response.data.url,
        pages: 1,
      };

      logger.info("Design created", { designId: design.designId });
      return design;
    } catch (error) {
      logger.error("Failed to create design", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Add text to slide
   */
  async addText(
    designId: string,
    pageId: string,
    text: string,
    style?: Record<string, any>
  ): Promise<void> {
    try {
      const payload = {
        element: {
          type: "text",
          content: text,
          style: style || { fontSize: 24, color: "#000000" },
        },
      };

      await this.client.post(
        `/v1/designs/${designId}/pages/${pageId}/elements`,
        payload
      );

      logger.debug("Text added to slide", { designId, pageId });
    } catch (error) {
      logger.error("Failed to add text", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Upload asset (image)
   */
  async uploadAsset(filePath: string): Promise<string> {
    try {
      const formData = new FormData();
      // In production, read file and append to FormData
      formData.append("file", filePath);

      const response = await this.client.post("/v1/assets/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      logger.info("Asset uploaded", { assetId: response.data.asset_id });
      return response.data.asset_id;
    } catch (error) {
      logger.error("Failed to upload asset", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Add image to slide
   */
  async addImage(
    designId: string,
    pageId: string,
    assetId: string,
    position?: { x: number; y: number }
  ): Promise<void> {
    try {
      const payload = {
        element: {
          type: "image",
          asset_id: assetId,
          position: position || { x: 0, y: 0 },
        },
      };

      await this.client.post(
        `/v1/designs/${designId}/pages/${pageId}/elements`,
        payload
      );

      logger.debug("Image added to slide", { designId, pageId, assetId });
    } catch (error) {
      logger.error("Failed to add image", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create new slide/page
   */
  async createSlide(designId: string): Promise<string> {
    try {
      const response = await this.client.post(
        `/v1/designs/${designId}/pages`,
        {}
      );

      const pageId = response.data.id;
      logger.debug("Slide created", { designId, pageId });
      return pageId;
    } catch (error) {
      logger.error("Failed to create slide", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Apply template/styling
   */
  async applyTemplate(
    designId: string,
    templateId: string
  ): Promise<void> {
    try {
      await this.client.put(`/v1/designs/${designId}`, {
        template_id: templateId,
      });

      logger.debug("Template applied", { designId, templateId });
    } catch (error) {
      logger.error("Failed to apply template", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Export design
   */
  async exportDesign(
    designId: string,
    format: "pdf" | "png" | "mp4" = "pdf"
  ): Promise<string> {
    try {
      const response = await this.client.post(
        `/v1/designs/${designId}/exports`,
        {
          format,
        }
      );

      const exportUrl = response.data.url;
      logger.info("Design exported", { designId, format, url: exportUrl });
      return exportUrl;
    } catch (error) {
      logger.error("Failed to export design", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get design details
   */
  async getDesign(designId: string): Promise<CanvaDesign> {
    try {
      const response = await this.client.get(`/v1/designs/${designId}`);

      return {
        designId: response.data.id,
        title: response.data.title,
        url: response.data.url,
        pages: response.data.pages?.length || 1,
      };
    } catch (error) {
      logger.error("Failed to get design", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * List designs
   */
  async listDesigns(): Promise<CanvaDesign[]> {
    try {
      const response = await this.client.get("/v1/designs");

      return response.data.designs.map((design: any) => ({
        designId: design.id,
        title: design.title,
        url: design.url,
        pages: design.pages?.length || 1,
      }));
    } catch (error) {
      logger.error("Failed to list designs", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export default CanvaClient;
