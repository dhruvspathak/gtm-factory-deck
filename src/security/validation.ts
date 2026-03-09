import { z } from "zod";
import { logger } from "../utils/logger.js";

// Validation schemas
export const PresentationRequestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  brand: z.string().min(1).max(50),
  numberOfSlides: z.number().min(3).max(50).optional().default(12),
  tone: z
    .enum(["executive", "technical", "mixed"])
    .optional()
    .default("executive"),
  language: z.string().optional().default("en"),
});

export const SlideDefinitionSchema = z.object({
  slideNumber: z.number(),
  title: z.string(),
  content: z.string(),
  layout: z.enum([
    "title",
    "content",
    "twoColumn",
    "diagram",
    "caseStudy",
    "quote",
  ]),
  notes: z.string().optional(),
  elements: z
    .array(
      z.object({
        type: z.enum(["text", "image", "shape", "icon"]),
        position: z.object({ x: z.number(), y: z.number() }),
        content: z.string().optional(),
      })
    )
    .optional(),
});

export const NarrativeSchema = z.object({
  title: z.string(),
  description: z.string(),
  slides: z.array(SlideDefinitionSchema),
  keyMessages: z.array(z.string()),
  callToAction: z.string(),
});

export const BrandProfileSchema = z.object({
  vendorName: z.string(),
  companyName: z.string(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  logoAssetId: z.string(),
  logoUrl: z.string().url(),
  slideTemplate: z.string(),
  logoPosition: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]),
  fontFamily: z.string(),
  backgroundStyle: z.enum(["solid", "gradient", "pattern"]),
  backgroundColor: z.string(),
});

export const CanvaDesignSchema = z.object({
  designId: z.string(),
  title: z.string(),
  url: z.string().url(),
  pages: z.number(),
});

export type PresentationRequest = z.infer<typeof PresentationRequestSchema>;
export type SlideDefinition = z.infer<typeof SlideDefinitionSchema>;
export type Narrative = z.infer<typeof NarrativeSchema>;
export type BrandProfile = z.infer<typeof BrandProfileSchema>;
export type CanvaDesign = z.infer<typeof CanvaDesignSchema>;

/**
 * Validate presentation request
 */
export function validatePresentationRequest(
  data: unknown
): PresentationRequest {
  try {
    return PresentationRequestSchema.parse(data);
  } catch (error) {
    logger.error("Validation error for presentation request", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Validate narrative structure
 */
export function validateNarrative(data: unknown): Narrative {
  try {
    return NarrativeSchema.parse(data);
  } catch (error) {
    logger.error("Validation error for narrative", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Validate brand profile
 */
export function validateBrandProfile(data: unknown): BrandProfile {
  try {
    return BrandProfileSchema.parse(data);
  } catch (error) {
    logger.error("Validation error for brand profile", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
