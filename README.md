# GTM AI Deck Factory with Canva MCP Integration

A production-ready AI-assisted presentation generation platform that automatically produces high-quality customer-facing presentations using Canva, featuring Model Context Protocol (MCP) integration for AI agent support.

## Overview

The GTM AI Deck Factory behaves like a senior presales engineer, understanding:

- Enterprise security architecture
- Storytelling for executives
- Product positioning
- Customer value messaging

Instead of generating random slides, the system produces a **complete presales narrative** and converts it into a professional branded presentation in under 60 seconds.

## Features

- 🎯 **AI-Powered Narrative Generation** - Professional presales storytelling frameworks
- 🎨 **Automatic Brand Styling** - Vendor branding enforced automatically
- 📊 **Architecture Diagrams** - Auto-generated Mermaid diagrams
- 🔌 **MCP Integration** - Tools for AI agents via Model Context Protocol
- 📦 **Canva Integration** - Branded presentations ready for enterprise GTM teams
- 🔒 **Enterprise Security** - Input validation, rate limiting, secret management
- 📈 **Performance** - Presentation generation in < 60 seconds
- 🧪 **Comprehensive Testing** - Jest/Vitest coverage
- 🐳 **Docker Support** - Production-ready containerization
- 📝 **Structured Logging** - Winston logging with observability

## Quick Start

### Prerequisites

- Node.js v20+
- npm or yarn
- Canva API credentials

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gtm-deck-factory.git
cd gtm-deck-factory
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env
# Edit .env with your Canva API credentials
```

4. Build the project:

```bash
npm run build
```

### Running the Server

#### API Mode (Default)

```bash
npm start
# Server running on http://localhost:3000
```

#### MCP Mode

```bash
MCP_MODE=true npm start
```

#### Development Mode

```bash
npm run dev
```

## API Endpoints

### Create Presentation

**POST** `/api/presentations`

Request:

```json
{
  "prompt": "Create a 12-slide CIO-level presentation explaining Checkmarx ASPM for BFSI enterprises.",
  "brand": "checkmarx",
  "numberOfSlides": 12,
  "tone": "executive"
}
```

Response:

```json
{
  "success": true,
  "design": {
    "designId": "design_123",
    "title": "Checkmarx - Create a 12-slide...",
    "url": "https://canva.com/design/...",
    "pages": 12
  },
  "stats": {
    "totalTime": 45000,
    "narrativeTime": 10000,
    "brandingTime": 5000,
    "diagramTime": 8000,
    "canvaTime": 22000
  }
}
```

### Get Available Brands

**GET** `/api/brands`

Response:

```json
{
  "brands": ["Checkmarx", "Forescout", "OpenText"]
}
```

### Get Server Status

**GET** `/api/status`

Response:

```json
{
  "status": "running",
  "timestamp": "2026-03-09T10:30:00.000Z",
  "engines": {
    "brands": 3,
    "available": true
  }
}
```

### Export Presentation

**POST** `/api/presentations/:designId/export`

Request:

```json
{
  "format": "pdf"
}
```

Response:

```json
{
  "success": true,
  "designId": "design_123",
  "format": "pdf",
  "url": "https://export.canva.com/..."
}
```

### Health Check

**GET** `/health`

Response:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-09T10:30:00.000Z",
  "engines": {
    "brands": 3,
    "available": true
  }
}
```

## MCP Tools

When running in MCP mode, the following tools are available to AI agents:

### create_presentation

Generates a professional presales presentation with automated narrative and branding.

**Parameters:**

- `prompt` (string, required) - Detailed prompt describing the presentation content
- `brand` (string, optional) - Vendor brand name (will be auto-detected if not provided)
- `numberOfSlides` (number, optional) - Number of slides to generate (3-50, default: 12)
- `tone` (string, optional) - Presentation tone: "executive", "technical", or "mixed" (default: "executive")

### get_available_brands

Returns list of supported vendor brands.

### export_presentation

Exports a presentation in various formats (PDF, PNG).

**Parameters:**

- `designId` (string, required) - Canva design ID
- `format` (string, optional) - Export format: "pdf" or "png" (default: "pdf")

### get_generation_stats

Returns statistics from the last presentation generation operation.

### get_server_status

Returns current server status and available engines.

## Architecture

### System Components

```
User Prompt
    ↓
AI Orchestrator (DeckOrchestrator)
    ├── Brand Engine (Brand Detection & Styling)
    ├── Narrative Engine (Presales Storytelling)
    ├── Diagram Engine (Architecture Diagram Generation)
    ├── Research Engine (Information Retrieval)
    └── Canva Integration
        ├── Canva Client (API Interactions)
        └── Presentation Service (High-level Operations)
    ↓
Finished Presentation (Canva Design)
```

### Project Structure

```
gtm-deck-factory/
├── src/
│   ├── brand/
│   │   ├── brandEngine.ts
│   │   └── profiles/
│   │       └── brands.json
│   ├── narrative/
│   │   └── storyEngine.ts
│   ├── diagrams/
│   │   └── diagramEngine.ts
│   ├── research/
│   │   └── researchEngine.ts
│   ├── canva/
│   │   ├── canvaClient.ts
│   │   └── presentationService.ts
│   ├── orchestrator/
│   │   └── deckOrchestrator.ts
│   ├── mcp/
│   │   └── mcpServer.ts
│   ├── security/
│   │   ├── validation.ts
│   │   └── rateLimiter.ts
│   ├── utils/
│   │   └── logger.ts
│   ├── tests/
│   │   ├── brand.test.ts
│   │   ├── narrative.test.ts
│   │   ├── diagrams.test.ts
│   │   └── validation.test.ts
│   └── index.ts
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
├── .env.example
├── .gitignore
└── README.md
```

## Supported Brands

The system currently supports the following vendor brands:

### Checkmarx

- **Colors**: Primary: `#0066CC`, Secondary: `#00A3E0`, Accent: `#FF6B35`
- **Focus**: Application Security Posture Management (ASPM)

### Forescout

- **Colors**: Primary: `#003366`, Secondary: `#0066CC`, Accent: `#FF9900`
- **Focus**: Network Access Control (NAC)

### OpenText

- **Colors**: Primary: `#003E73`, Secondary: `#00B0FF`, Accent: `#FF6B35`
- **Focus**: Cybersecurity Platform

## Narrative Frameworks

The system supports multiple narrative templates:

### Standard Presales Framework (Default)

1. Title Slide
2. Executive Hook
3. Industry Problem
4. Security Landscape
5. Customer Challenges
6. Solution Overview
7. Architecture Diagram
8. Key Capabilities
9. Differentiators
10. Customer Value
11. ROI Analysis
12. Case Study
13. Implementation Approach
14. Next Steps

### Technical Architecture Framework

Focuses on technical details, system components, integration points, and deployment options.

### Competitive Framework

Emphasizes competitive differentiation, capability comparison, pricing analysis, and TCO.

## Security

The system implements enterprise-grade security practices:

### Input Validation

- All inputs validated using Zod schemas
- Request size limits enforced
- Parameterized API calls

### Rate Limiting

- 100 requests per minute per client
- In-memory rate limiter with automatic cleanup
- Graceful error responses

### Secret Management

- Environment variables for sensitive data
- Never log secrets or API keys
- Credential validation on startup

### API Security

- Bearer token authentication for Canva API
- HTTPS recommended for production
- CORS headers configurable

## Logging and Observability

Structured logging via Winston:

- Console output for development
- File-based logging for production
- Error and combined logs
- Structured JSON format

Example log:

```json
{
  "timestamp": "2026-03-09 10:30:00",
  "level": "info",
  "message": "Presentation generated successfully",
  "designId": "design_123",
  "slides": 12,
  "brandProfile": "Checkmarx",
  "timeMs": 45000,
  "service": "gtm-deck-factory"
}
```

## Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- Unit tests for core modules (Brand, Narrative, Diagram engines)
- Validation tests using Zod schemas
- Mock implementations for external APIs
- Integration tests for orchestrator workflow

## CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

1. **Lint & Test** - Code quality and unit tests
2. **Security Scan** - npm audit and CodeQL analysis
3. **Build** - TypeScript compilation and Docker build
4. **Deploy** - Automated deployment (requires manual trigger)

Run individually:

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
npm run test        # Run tests
npm run build       # Build TypeScript
```

## Docker

### Build Image

```bash
npm run docker:build
```

### Run Container

```bash
npm run docker:run
```

### Using Docker Compose

```bash
docker-compose up --build
```

### Production Dockerfile Features

- Multi-stage build for minimal image size
- Non-root user for security
- Health check endpoint
- Production Node environment
- Alpine Linux base image

## Performance

Target performance metrics:

- Story generation: < 10 seconds
- Diagram generation: < 10 seconds
- Canva operations: < 30 seconds
- **Total generation time: < 60 seconds**

## Configuration

### Environment Variables

```
NODE_ENV=production
PORT=3000

# Canva API
CANVA_API_KEY=your_canva_api_key_here
CANVA_API_BASE_URL=https://api.canva.com

# MCP
MCP_PORT=3001
MCP_HOST=localhost
MCP_MODE=false

# Logging
LOG_LEVEL=info

# Optional: OpenTelemetry
OTEL_ENABLED=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## Example Usage

### Creating a Checkmarx Presentation via API

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a CIO-level presentation explaining Checkmarx ASPM for BFSI enterprises with focus on threat detection and remediation",
    "brand": "checkmarx",
    "numberOfSlides": 15,
    "tone": "executive"
  }'
```

### Creating a Competitive Presentation

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate a competitive presentation comparing Checkmarx and Forescout for enterprise security",
    "numberOfSlides": 12,
    "tone": "technical"
  }'
```

## Future Enhancements

Planned features for future releases:

- [ ] Salesforce CRM integration for deal-specific presentations
- [ ] RFP answer automation
- [ ] Internal knowledge base integration
- [ ] Real-time collaboration features
- [ ] Advanced analytics and engagement tracking
- [ ] Multi-language support
- [ ] Custom brand profile management UI
- [ ] Presentation versioning and history
- [ ] OpenTelemetry integration
- [ ] Prometheus metrics export

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:

- Open an issue on GitHub
- Email: support@example.com
- Documentation: https://docs.example.com

## Acknowledgments

- Canva for their comprehensive API
- Model Context Protocol specification
- Enterprise presales methodologies and best practices
