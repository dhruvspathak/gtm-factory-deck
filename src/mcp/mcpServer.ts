import {
  Server,
  Tool,
  CallToolRequest,
  TextContent,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger } from "../utils/logger.js";
import DeckOrchestrator from "../orchestrator/deckOrchestrator.js";
import RateLimiter from "../security/rateLimiter.js";
import { validatePresentationRequest } from "../security/validation.js";

/**
 * MCP Server - Exposes deck generation tools via Model Context Protocol
 */
export class MCPServer {
  private server: Server;
  private orchestrator: DeckOrchestrator;
  private rateLimiter: RateLimiter;
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.server = new Server({
      name: "gtm-deck-factory",
      version: "1.0.0",
    });

    this.orchestrator = new DeckOrchestrator();
    this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

    this.setupTools();
    this.setupHandlers();
  }

  /**
   * Setup all available tools
   */
  private setupTools(): void {
    // Tool 1: Create Presentation
    this.tools.set("create_presentation", {
      name: "create_presentation",
      description:
        "Generate a professional presales presentation using AI-powered narrative generation and Canva integration",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: {
            type: "string",
            description:
              "Detailed prompt describing the presentation content. Should include vendor name if known.",
            example:
              "Create a CIO-level presentation explaining Checkmarx ASPM for BFSI enterprises.",
          },
          brand: {
            type: "string",
            description:
              "Optional vendor brand name. Will be auto-detected if not provided.",
            enum: ["checkmarx", "forescout", "opentext"],
          },
          numberOfSlides: {
            type: "number",
            description: "Number of slides to generate (3-50). Default: 12",
            minimum: 3,
            maximum: 50,
          },
          tone: {
            type: "string",
            description:
              'Presentation tone. Default: "executive"',
            enum: ["executive", "technical", "mixed"],
          },
        },
        required: ["prompt"],
      },
    });

    // Tool 2: Get Available Brands
    this.tools.set("get_available_brands", {
      name: "get_available_brands",
      description:
        "Get list of available vendor brands for presentation generation",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    });

    // Tool 3: Export Presentation
    this.tools.set("export_presentation", {
      name: "export_presentation",
      description: "Export a generated presentation in various formats",
      inputSchema: {
        type: "object" as const,
        properties: {
          designId: {
            type: "string",
            description: "Canva design ID of the presentation to export",
          },
          format: {
            type: "string",
            description: "Export format",
            enum: ["pdf", "png"],
          },
        },
        required: ["designId"],
      },
    });

    // Tool 4: Get Generation Stats
    this.tools.set("get_generation_stats", {
      name: "get_generation_stats",
      description: "Get statistics from the last presentation generation",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    });

    // Tool 5: Get Server Status
    this.tools.set("get_server_status", {
      name: "get_server_status",
      description: "Get the status of the GTM Deck Factory server",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    });

    logger.info("MCP tools registered", { count: this.tools.size });
  }

  /**
   * Setup MCP handlers
   */
  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler("tools/list", async () => {
      return {
        tools: Array.from(this.tools.values()),
      };
    });

    // Call tool handler
    this.server.setRequestHandler("tools/call", async (request) => {
      return await this.handleToolCall(request as CallToolRequest);
    });
  }

  /**
   * Handle tool calls
   */
  private async handleToolCall(
    request: CallToolRequest
  ): Promise<
    | { content: TextContent[] }
    | { _meta?: Record<string, unknown>; content: TextContent[] }
  > {
    const clientId = "default-client";
    const toolName = request.name;

    // Check rate limit
    if (!this.rateLimiter.isAllowed(clientId)) {
      throw new McpError(
        ErrorCode.RequestLimitExceeded,
        "Rate limit exceeded. Maximum 100 requests per minute."
      );
    }

    logger.info("Tool called", { tool: toolName, args: request.arguments });

    try {
      switch (toolName) {
        case "create_presentation":
          return await this.handleCreatePresentation(request.arguments);

        case "get_available_brands":
          return this.handleGetAvailableBrands();

        case "export_presentation":
          return await this.handleExportPresentation(request.arguments);

        case "get_generation_stats":
          return this.handleGetGenerationStats();

        case "get_server_status":
          return this.handleGetServerStatus();

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
      }
    } catch (error) {
      logger.error("Tool call failed", {
        tool: toolName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Handle create_presentation tool
   */
  private async handleCreatePresentation(args: any): Promise<{
    content: TextContent[];
  }> {
    const request = validatePresentationRequest(args);

    const design = await this.orchestrator.generatePresentation(request);

    return {
      content: [
        {
          type: "text",
          text: `Presentation created successfully!\n\nDesign ID: ${design.designId}\nTitle: ${design.title}\nPages: ${design.pages}\nURL: ${design.url}`,
        },
      ],
    };
  }

  /**
   * Handle get_available_brands tool
   */
  private handleGetAvailableBrands(): {
    content: TextContent[];
  } {
    const brands = this.orchestrator.getAvailableBrands();

    return {
      content: [
        {
          type: "text",
          text: `Available brands:\n${brands.map((b) => `• ${b}`).join("\n")}`,
        },
      ],
    };
  }

  /**
   * Handle export_presentation tool
   */
  private async handleExportPresentation(args: any): Promise<{
    content: TextContent[];
  }> {
    const { designId, format = "pdf" } = args;

    if (!designId) {
      throw new McpError(ErrorCode.InvalidParams, "designId is required");
    }

    const url = await this.orchestrator.exportPresentation(designId, format);

    return {
      content: [
        {
          type: "text",
          text: `Presentation exported successfully!\n\nFormat: ${format}\nURL: ${url}`,
        },
      ],
    };
  }

  /**
   * Handle get_generation_stats tool
   */
  private handleGetGenerationStats(): {
    content: TextContent[];
  } {
    const stats = this.orchestrator.getStats();

    return {
      content: [
        {
          type: "text",
          text: `Generation Statistics:\n\nTotal Time: ${stats.totalTime}ms\nNarrative Time: ${stats.narrativeTime}ms\nBranding Time: ${stats.brandingTime}ms\nDiagram Time: ${stats.diagramTime}ms\nCanva API Time: ${stats.canvaTime}ms`,
        },
      ],
    };
  }

  /**
   * Handle get_server_status tool
   */
  private handleGetServerStatus(): {
    content: TextContent[];
  } {
    const status = this.orchestrator.getStatus();

    return {
      content: [
        {
          type: "text",
          text: `Server Status: Operational\n\nAvailable Brands: ${status.engines.brands}\nEngines: Running`,
        },
      ],
    };
  }

  /**
   * Start MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info("MCP server started and listening on stdio");
  }
}

// Main entry point
if (process.env.MCP_MODE === "true") {
  const mcpServer = new MCPServer();
  mcpServer.start().catch((error) => {
    logger.error("Failed to start MCP server", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
}

export default MCPServer;
