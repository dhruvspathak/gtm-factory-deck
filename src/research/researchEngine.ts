import { logger } from "../utils/logger.js";

interface ResearchSource {
  type: "documentation" | "whitepaper" | "casestudy" | "rfpanswer";
  title: string;
  content: string;
  vendor: string;
}

/**
 * Research Engine - Retrieves and processes relevant information
 */
export class ResearchEngine {
  private cache: Map<string, ResearchSource[]> = new Map();
  private mockSources: Map<string, ResearchSource[]> = new Map();

  constructor() {
    this.initializeMockSources();
  }

  /**
   * Initialize mock research sources (placeholder for real integrations)
   */
  private initializeMockSources(): void {
    // Mock Checkmarx sources
    this.mockSources.set("checkmarx", [
      {
        type: "documentation",
        title: "Checkmarx ASPM Overview",
        content:
          "Application Security Posture Management provides comprehensive visibility and control over application security",
        vendor: "checkmarx",
      },
      {
        type: "whitepaper",
        title: "ASPM for Enterprise",
        content:
          "Enterprise organizations require integrated, automated application security management",
        vendor: "checkmarx",
      },
    ]);

    // Mock Forescout sources
    this.mockSources.set("forescout", [
      {
        type: "documentation",
        title: "Forescout NAC Platform",
        content:
          "Network Access Control for identifying, authenticating, and managing all connected devices",
        vendor: "forescout",
      },
      {
        type: "casestudy",
        title: "Healthcare Network Security",
        content:
          "Leading healthcare provider implemented NAC for comprehensive device visibility",
        vendor: "forescout",
      },
    ]);

    // Mock OpenText sources
    this.mockSources.set("opentext", [
      {
        type: "documentation",
        title: "OpenText Cybersecurity Platform",
        content:
          "Unified cybersecurity and IT operations management platform for enterprises",
        vendor: "opentext",
      },
      {
        type: "rfpanswer",
        title: "Security Compliance Requirements",
        content: "OpenText supports all major compliance frameworks and standards",
        vendor: "opentext",
      },
    ]);

    logger.info("Mock research sources initialized", {
      vendors: this.mockSources.size,
    });
  }

  /**
   * Research information for a vendor and topic
   */
  async research(vendor: string, topic: string): Promise<ResearchSource[]> {
    const cacheKey = `${vendor}:${topic}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      logger.debug("Research cache hit", { vendor, topic });
      return this.cache.get(cacheKey) || [];
    }

    logger.info("Researching", { vendor, topic });

    // Get mock sources (replace with real API calls)
    const sources = this.getMockSources(vendor.toLowerCase());

    // In production, this would call real APIs
    const results = this.filterSourcesByTopic(sources, topic);

    // Cache results
    this.cache.set(cacheKey, results);

    logger.debug("Research completed", {
      vendor,
      topic,
      resultsCount: results.length,
    });

    return results;
  }

  /**
   * Get mock sources
   */
  private getMockSources(vendor: string): ResearchSource[] {
    return this.mockSources.get(vendor) || [];
  }

  /**
   * Filter sources by relevance to topic
   */
  private filterSourcesByTopic(
    sources: ResearchSource[],
    topic: string
  ): ResearchSource[] {
    const topicLower = topic.toLowerCase();
    return sources.filter(
      (source) =>
        source.title.toLowerCase().includes(topicLower) ||
        source.content.toLowerCase().includes(topicLower)
    );
  }

  /**
   * Extract key points from research sources
   */
  extractKeyPoints(sources: ResearchSource[]): string[] {
    const keyPoints: string[] = [];

    for (const source of sources) {
      // Simple sentence extraction (in production, use NLP)
      const sentences = source.content.split(". ");
      for (const sentence of sentences.slice(0, 2)) {
        if (sentence.length > 20) {
          keyPoints.push(sentence.trim());
        }
      }
    }

    return keyPoints.slice(0, 5); // Return top 5 key points
  }

  /**
   * Generate research summary
   */
  generateSummary(sources: ResearchSource[]): string {
    if (sources.length === 0) {
      return "No relevant research sources found.";
    }

    let summary = "Research Summary:\n";

    const byType = new Map<string, ResearchSource[]>();
    for (const source of sources) {
      if (!byType.has(source.type)) {
        byType.set(source.type, []);
      }
      byType.get(source.type)!.push(source);
    }

    for (const [type, typeSources] of byType.entries()) {
      summary += `\n${this.formatType(type)} (${typeSources.length}):\n`;
      for (const source of typeSources) {
        summary += `  • ${source.title}\n`;
      }
    }

    return summary;
  }

  /**
   * Format source type for display
   */
  private formatType(type: string): string {
    const typeMap: Record<string, string> = {
      documentation: "Documentation",
      whitepaper: "Whitepapers",
      casestudy: "Case Studies",
      rfpanswer: "RFP Answers",
    };
    return typeMap[type] || type;
  }

  /**
   * Add custom research source
   */
  addSource(source: ResearchSource): void {
    const vendor = source.vendor.toLowerCase();
    if (!this.mockSources.has(vendor)) {
      this.mockSources.set(vendor, []);
    }
    this.mockSources.get(vendor)!.push(source);
    logger.info("Research source added", { vendor, title: source.title });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.debug("Research cache cleared");
  }
}

export default ResearchEngine;
