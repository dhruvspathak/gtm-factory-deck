import { logger } from "../utils/logger.js";
import { SlideDefinition } from "../security/validation.js";

/**
 * Story Engine - Generates professional presales narrative
 */
export class StoryEngine {
  private clientContext: Map<string, any> = new Map();

  /**
   * Generate slides from narrative framework
   */
  async generateSlides(
    prompt: string,
    vendorName: string,
    numberOfSlides: number = 12
  ): Promise<SlideDefinition[]> {
    logger.info("Generating narrative slides", { vendorName, numberOfSlides });

    const slides: SlideDefinition[] = [];
    const framework = this.selectNarrativeFramework(prompt, numberOfSlides);

    for (const [index, slideTemplate] of framework.entries()) {
      const slide = await this.generateSlide(
        index + 1,
        slideTemplate,
        prompt,
        vendorName
      );
      slides.push(slide);
    }

    logger.info("Narrative slides generated", { count: slides.length });
    return slides;
  }

  /**
   * Select narrative framework based on content
   */
  private selectNarrativeFramework(
    prompt: string,
    numberOfSlides: number
  ): string[] {
    const isArchitectureFocused =
      prompt.toLowerCase().includes("architecture") ||
      prompt.toLowerCase().includes("technical");
    const isCompetitive =
      prompt.toLowerCase().includes("competitor") ||
      prompt.toLowerCase().includes("vs");

    if (isCompetitive) {
      return this.getCompetitiveFramework(numberOfSlides);
    } else if (isArchitectureFocused) {
      return this.getTechnicalArchitectureFramework(numberOfSlides);
    } else {
      return this.getStandardPresalesFramework(numberOfSlides);
    }
  }

  /**
   * Standard presales framework
   */
  private getStandardPresalesFramework(numberOfSlides: number): string[] {
    const framework = [
      "TITLE_SLIDE",
      "EXECUTIVE_HOOK",
      "INDUSTRY_PROBLEM",
      "SECURITY_LANDSCAPE",
      "CUSTOMER_CHALLENGES",
      "SOLUTION_OVERVIEW",
      "ARCHITECTURE_DIAGRAM",
      "KEY_CAPABILITIES",
      "DIFFERENTIATORS",
      "CUSTOMER_VALUE",
      "ROI_ANALYSIS",
      "CASE_STUDY",
      "IMPLEMENTATION_APPROACH",
      "NEXT_STEPS",
    ];

    // Adjust to requested number of slides
    if (numberOfSlides < framework.length) {
      return framework.slice(0, numberOfSlides);
    } else if (numberOfSlides > framework.length) {
      // Duplicate some high-impact slides
      const extended = [...framework];
      while (extended.length < numberOfSlides) {
        extended.push("FEATURE_DEEP_DIVE");
      }
      return extended.slice(0, numberOfSlides);
    }

    return framework;
  }

  /**
   * Technical architecture framework
   */
  private getTechnicalArchitectureFramework(numberOfSlides: number): string[] {
    const framework = [
      "TITLE_SLIDE",
      "ARCHITECTURE_OVERVIEW",
      "SYSTEM_COMPONENTS",
      "DATA_FLOW",
      "INTEGRATION_POINTS",
      "SCALABILITY",
      "PERFORMANCE",
      "SECURITY_ARCHITECTURE",
      "DEPLOYMENT_OPTIONS",
      "MONITORING",
      "BEST_PRACTICES",
      "NEXT_STEPS",
    ];

    return framework.slice(0, Math.min(numberOfSlides, framework.length));
  }

  /**
   * Competitive positioning framework
   */
  private getCompetitiveFramework(numberOfSlides: number): string[] {
    const framework = [
      "TITLE_SLIDE",
      "MARKET_CONTEXT",
      "COMPARISON_MATRIX",
      "CAPABILITY_COMPARISON",
      "PRICING_COMPARISON",
      "ADVANTAGE_1",
      "ADVANTAGE_2",
      "ADVANTAGE_3",
      "IMPLEMENTATION_EASE",
      "TCO_ANALYSIS",
      "CUSTOMER_PROOF",
      "NEXT_STEPS",
    ];

    return framework.slice(0, Math.min(numberOfSlides, framework.length));
  }

  /**
   * Generate individual slide
   */
  private async generateSlide(
    slideNumber: number,
    slideType: string,
    prompt: string,
    vendorName: string
  ): Promise<SlideDefinition> {
    const content = this.generateSlideContent(slideType, prompt, vendorName);

    return {
      slideNumber,
      title: content.title,
      content: content.body,
      layout: content.layout as any,
      notes: content.notes,
      elements: content.elements,
    };
  }

  /**
   * Generate slide content based on type
   */
  private generateSlideContent(
    slideType: string,
    _prompt: string,
    vendorName: string
  ): any {
    const templates: Record<string, any> = {
      TITLE_SLIDE: {
        title: `${vendorName} Presales Deck`,
        body: "Enterprise Security Solution Overview",
        layout: "title",
        notes: "Opening slide with vendor branding",
        elements: [
          {
            type: "text",
            position: { x: 50, y: 30 },
            content: vendorName,
          },
        ],
      },
      EXECUTIVE_HOOK: {
        title: "Today's Business Challenge",
        body: "Enterprise organizations face increasing security threats and compliance requirements",
        layout: "content",
        notes: "Hook that captures executive attention with key pain point",
        elements: [
          {
            type: "text",
            position: { x: 10, y: 20 },
            content: "• Increasing threat landscape",
          },
          {
            type: "text",
            position: { x: 10, y: 35 },
            content: "• Compliance complexity",
          },
        ],
      },
      INDUSTRY_PROBLEM: {
        title: "Industry Context",
        body: "Security posture management has become critical for enterprise organizations",
        layout: "content",
        notes: "Set context around industry trends",
        elements: [],
      },
      SECURITY_LANDSCAPE: {
        title: "The Security Landscape",
        body: "Modern enterprises need comprehensive visibility and control across their attack surface",
        layout: "content",
        notes: "Discuss current security landscape",
        elements: [],
      },
      CUSTOMER_CHALLENGES: {
        title: "Customer Challenges",
        body: `${vendorName} customers often struggle with: visibility, control, and remediation`,
        layout: "content",
        notes: "Articulate key customer pain points",
        elements: [],
      },
      SOLUTION_OVERVIEW: {
        title: `${vendorName} Solution`,
        body: "A unified platform providing enterprise-grade security posture management",
        layout: "content",
        notes: "Introduce core solution",
        elements: [],
      },
      ARCHITECTURE_DIAGRAM: {
        title: "System Architecture",
        body: "Modular, scalable architecture supporting enterprise deployments",
        layout: "diagram",
        notes: "Show technical architecture",
        elements: [],
      },
      KEY_CAPABILITIES: {
        title: "Key Capabilities",
        body: "Comprehensive feature set addressing enterprise security needs",
        layout: "content",
        notes: "Deep dive into key features",
        elements: [],
      },
      DIFFERENTIATORS: {
        title: "Why Choose Us",
        body: `${vendorName} stands apart through innovation, integration, and customer success`,
        layout: "content",
        notes: "Competitive differentiation",
        elements: [],
      },
      CUSTOMER_VALUE: {
        title: "Customer Value Proposition",
        body: "Measurable business outcomes and security improvements",
        layout: "content",
        notes: "Value delivery mechanisms",
        elements: [],
      },
      ROI_ANALYSIS: {
        title: "Return on Investment",
        body: "Customers realize significant ROI through reduced risks and operational efficiency",
        layout: "content",
        notes: "Financial justification",
        elements: [],
      },
      CASE_STUDY: {
        title: "Customer Success Story",
        body: "Real-world example of ${vendorName} implementation and results",
        layout: "caseStudy",
        notes: "Social proof through customer example",
        elements: [],
      },
      IMPLEMENTATION_APPROACH: {
        title: "Implementation Path",
        body: "Proven deployment methodology ensuring success",
        layout: "content",
        notes: "How we implement",
        elements: [],
      },
      NEXT_STEPS: {
        title: "Next Steps",
        body: "Clear call-to-action for engaging with our solution",
        layout: "content",
        notes: "Closing and CTA",
        elements: [],
      },
      FEATURE_DEEP_DIVE: {
        title: "Feature Detail",
        body: "In-depth look at specific capabilities",
        layout: "content",
        notes: "Optional deep-dive slide",
        elements: [],
      },
    };

    return (
      templates[slideType] || {
        title: "Slide",
        body: "Slide content",
        layout: "content",
        notes: "",
        elements: [],
      }
    );
  }

  /**
   * Set client context for personalization
   */
  setClientContext(clientId: string, context: any): void {
    this.clientContext.set(clientId, context);
  }

  /**
   * Get client context
   */
  getClientContext(clientId: string): any {
    return this.clientContext.get(clientId);
  }
}

export default StoryEngine;
