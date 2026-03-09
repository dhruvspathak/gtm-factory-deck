import express from "express";
import { logger } from "./utils/logger.js";
import DeckOrchestrator from "./orchestrator/deckOrchestrator.js";
import MCPServer from "./mcp/mcpServer.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Create orchestrator instance
const orchestrator = new DeckOrchestrator();

// Health check endpoint
app.get("/health", (_req, res) => {
  const status = orchestrator.getStatus();
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    ...status,
  });
});

// Create presentation endpoint
app.post("/api/presentations", async (req, res) => {
  try {
    logger.info("Presentation creation request received", {
      ip: req.ip,
      body: req.body,
    });

    const design = await orchestrator.generatePresentation(req.body);

    res.json({
      success: true,
      design,
      stats: orchestrator.getStats(),
    });
  } catch (error) {
    logger.error("Presentation creation failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(400).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown | error occurred",
    });
  }
});

// Get available brands endpoint
app.get("/api/brands", (_req, res) => {
  const brands = orchestrator.getAvailableBrands();
  res.json({ brands });
});

// Get server status endpoint
app.get("/api/status", (_req, res) => {
  const status = orchestrator.getStatus();
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    ...status,
  });
});

// Export presentation endpoint
app.post("/api/presentations/:designId/export", async (req, res) => {
  try {
    const { designId } = req.params;
    const { format = "pdf" } = req.body;

    const url = await orchestrator.exportPresentation(designId, format);

    res.json({
      success: true,
      designId,
      format,
      url,
    });
  } catch (error) {
    logger.error("Export failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(400).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Export failed",
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error("Server error", {
      error: err instanceof Error ? err.message : String(err),
    });

    res.status(500).json({
      error: "Internal server error",
    });
  }
);

// Start server
function startServer(): void {
  app.listen(port, () => {
    logger.info(`GTM Deck Factory API server listening on port ${port}`);
    logger.info(
      "Available endpoints:\n" +
        "  POST /api/presentations - Create presentation\n" +
        "  GET /api/brands - Get available brands\n" +
        "  GET /api/status - Get server status\n" +
        "  POST /api/presentations/:designId/export - Export presentation\n" +
        "  GET /health - Health check"
    );
  });
}

// Determine mode
const mode = process.env.MCP_MODE || "api";

if (mode === "mcp") {
  // Start as MCP server
  logger.info("Starting in MCP mode");
  const mcpServer = new MCPServer();
  mcpServer.start().catch((error) => {
    logger.error("Failed to start MCP server", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
} else {
  // Start as REST API server
  logger.info("Starting in API mode");
  startServer();
}

export default app;
