# GTM AI Deck Factory - Architecture Documentation

## System Design Overview

The GTM AI Deck Factory is built on a modular, layered architecture designed for extensibility, maintainability, and enterprise reliability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API / MCP Interface                      │
│  REST API (Express) | MCP Server (Model Context Protocol)  │
└──────────────────────────┬──────────────────────────────────┘
                          │
┌──────────────────────────▼──────────────────────────────────┐
│              Deck Orchestrator                              │
│  (Workflow Coordinator & State Management)                  │
└────┬─────────┬──────────┬──────────┬──────────┬──────────────┘
     │         │          │          │          │
┌────▼─┐   ┌──▼──┐   ┌───▼──┐  ┌───▼──┐  ┌────▼────┐
│Brand │   │Story│   │Diagram│  │Research│ │Canva    │
│Engine│   │Engine   │Engine │  │Engine   │ │Service  │
└──────┘   └──────┘   └───────┘  └────────┘ └─────────┘
     │         │          │          │          │
└────┴─────────┴──────────┴──────────┴──────────┘
              │
              ├── Security Layer (Validation, Rate Limiting)
              ├── Logging Layer (Winston)
              └── Cache Layer (In-Memory)
              │
┌─────────────▼──────────────────────────────────────┐
│         External Services                          │
│  • Canva API                                       │
│  • Research APIs (Optional)                        │
│  • Configuration Services                          │
└────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Deck Orchestrator (`orchestrator/deckOrchestrator.ts`)

**Responsibility**: Main workflow coordinator

**Key Functions**:
- Validate incoming requests
- Detect vendor brand from prompt
- Coordinate narrative generation
- Apply branding
- Generate diagrams
- Build Canva presentation

**Dependencies**:
- BrandEngine
- StoryEngine
- DiagramEngine
- ResearchEngine
- CanvaClient
- PresentationService

**Performance Characteristics**:
- Execution time: < 60 seconds target
- Stateless design (stores stats per session)
- Parallel capability for independent operations

### 2. Brand Engine (`brand/brandEngine.ts`)

**Responsibility**: Vendor brand management and styling

**Key Functions**:
```typescript
interface BrandEngine {
  detectBrand(prompt: string): string | null;
  getBrandProfile(brand: string): BrandProfile | null;
  applyStyling(slides: any[], brandProfile: BrandProfile): any[];
  generateBrandCSS(brandProfile: BrandProfile): string;
  registerCustomBrand(brandProfile: BrandProfile): void;
  getAvailableBrands(): string[];
}
```

**Data Structure** (`brands.json`):
```json
{
  "checkmarx": {
    "vendorName": "Checkmarx",
    "primaryColor": "#0066CC",
    "logoAssetId": "checkmarx-logo-official",
    "logoPosition": "bottom-left",
    "fontFamily": "Inter, sans-serif",
    ...
  }
}
```

**Initialization**:
- Loads brand profiles at startup
- Creates vendor name and key lookups
- Validates all profiles via Zod

### 3. Story Engine (`narrative/storyEngine.ts`)

**Responsibility**: Presales narrative generation

**Key Functions**:
```typescript
interface StoryEngine {
  generateSlides(
    prompt: string,
    vendorName: string,
    numberOfSlides: number
  ): Promise<SlideDefinition[]>;
  setClientContext(clientId: string, context: any): void;
  getClientContext(clientId: string): any;
}
```

**Narrative Frameworks**:

1. **Standard Presales** (Default)
   - 14 predefined slide types
   - Suitable for most GTM scenarios

2. **Technical Architecture**
   - 12 slides focused on technical details
   - Triggered by "architecture" or "technical" keywords

3. **Competitive**
   - 12 slides emphasizing differentiation
   - Triggered by "vs" or "competitive" keywords

**Slide Types**:
```typescript
enum SlideType {
  TITLE_SLIDE,
  EXECUTIVE_HOOK,
  INDUSTRY_PROBLEM,
  SECURITY_LANDSCAPE,
  CUSTOMER_CHALLENGES,
  SOLUTION_OVERVIEW,
  ARCHITECTURE_DIAGRAM,
  KEY_CAPABILITIES,
  DIFFERENTIATORS,
  CUSTOMER_VALUE,
  ROI_ANALYSIS,
  CASE_STUDY,
  IMPLEMENTATION_APPROACH,
  NEXT_STEPS,
  FEATURE_DEEP_DIVE,
}
```

**Client Context**:
- Stores industry, company size, department info
- Used for personalization in future releases
- Enables cross-request state tracking

### 4. Diagram Engine (`diagrams/diagramEngine.ts`)

**Responsibility**: Architecture and technical diagram generation

**Key Functions**:
```typescript
interface DiagramEngine {
  generateArchitectureDiagram(description: string, vendor: string): Promise<string>;
  generateSequenceDiagram(actors: string[], interactions: string[]): string;
  generateDeploymentDiagram(environment: string): string;
  generateMermaidUrl(mermaidCode: string): string;
}
```

**Supported Diagram Types**:

1. **Flow/Pipeline Diagrams**
   - DevSecOps pipelines
   - Multi-stage processes
   - Tool integrations

2. **Architecture Diagrams**
   - System component layout
   - Data flow between components
   - Subgraph grouping

3. **Integration Diagrams**
   - Ecosystem relationships
   - Third-party connections
   - API integrations

4. **Deployment Diagrams**
   - Kubernetes clusters
   - Cloud infrastructure
   - High availability setup

**Implementation Details**:
- Uses Mermaid.js syntax
- Auto-detects diagram type from description
- Generates Mermaid Live Editor URLs
- Integrates with Canva via image upload

### 5. Research Engine (`research/researchEngine.ts`)

**Responsibility**: Information retrieval and synthesis

**Key Functions**:
```typescript
interface ResearchEngine {
  research(vendor: string, topic: string): Promise<ResearchSource[]>;
  extractKeyPoints(sources: ResearchSource[]): string[];
  generateSummary(sources: ResearchSource[]): string;
  addSource(source: ResearchSource): void;
  clearCache(): void;
}
```

**Source Types**:
- Documentation
- Whitepapers
- Case Studies
- RFP Answers

**Currently**: Mock implementation with extensible design
**Future**: Real API integrations (documentation portals, knowledge bases)

**Caching**:
- In-memory cache with `vendor:topic` keys
- TTL-based automatic cleanup
- Manual cache clearing support

### 6. Canva Integration

#### CanvaClient (`canva/canvaClient.ts`)

**Responsibility**: Low-level Canva API interactions

**Key Methods**:
```typescript
interface CanvaClient {
  createDesign(title: string, templateId?: string): Promise<CanvaDesign>;
  addText(designId: string, pageId: string, text: string, style?: Record<string, any>): Promise<void>;
  addImage(designId: string, pageId: string, assetId: string, position?: {x, y}): Promise<void>;
  createSlide(designId: string): Promise<string>;
  applyTemplate(designId: string, templateId: string): Promise<void>;
  exportDesign(designId: string, format: "pdf" | "png" | "mp4"): Promise<string>;
  getDesign(designId: string): Promise<CanvaDesign>;
  listDesigns(): Promise<CanvaDesign[]>;
}
```

**Error Handling**:
- Axios interceptors for request/response logging
- Exponential backoff for retries
- Comprehensive error messages

**Authentication**:
- Bearer token via environment variable
- Request header injection
- Automatic token validation on init

#### PresentationService (`canva/presentationService.ts`)

**Responsibility**: High-level presentation management

**Key Methods**:
```typescript
interface PresentationService {
  buildPresentation(title: string, slides: SlideDefinition[], brand: string): Promise<CanvaDesign>;
  exportToPDF(designId: string): Promise<string>;
  exportToPNG(designId: string): Promise<string>;
  getPresentation(designId: string): Promise<CanvaDesign>;
  listPresentations(): Promise<CanvaDesign[]>;
}
```

**Workflow**:
1. Create Canva design
2. Apply brand styling
3. For each slide:
   - Create page
   - Add title (with brand colors)
   - Add content text
   - Add elements (images, shapes)
4. Apply template
5. Return design reference

### 7. Security Layer

#### Validation (`security/validation.ts`)

**Zod Schemas**:
- `PresentationRequestSchema` - Input validation
- `SlideDefinitionSchema` - Slide structure
- `NarrativeSchema` - Complete narrative
- `BrandProfileSchema` - Brand configuration
- `CanvaDesignSchema` - Design reference

**Validation Functions**:
```typescript
function validatePresentationRequest(data: unknown): PresentationRequest;
function validateNarrative(data: unknown): Narrative;
function validateBrandProfile(data: unknown): BrandProfile;
```

#### Rate Limiting (`security/rateLimiter.ts`)

**Implementation**:
- In-memory hash map per client
- Time window sliding
- Automatic expiration cleanup

**Configuration**:
- Default: 100 requests/minute per client
- Configurable window size
- Per-client tracking

**Usage**:
```typescript
const limiter = new RateLimiter(100, 60000); // 100 req/min
if (limiter.isAllowed(clientId)) {
  // Process request
} else {
  // Return 429 Too Many Requests
}
```

### 8. Logging System (`utils/logger.ts`)

**Winston Configuration**:
```typescript
transports: [
  new Console(), // Colored console output
  new File({ filename: "error.log", level: "error" }),
  new File({ filename: "combined.log" }),
]
```

**Log Levels**: error, warn, info, http, debug

**Structured Format**:
```json
{
  "timestamp": "2026-03-09 10:30:00",
  "level": "info",
  "message": "Presentation generated",
  "designId": "design_123",
  "service": "gtm-deck-factory"
}
```

### 9. MCP Server (`mcp/mcpServer.ts`)

**Protocol**: Model Context Protocol (Anthropic standard)

**Exposed Tools**:
1. `create_presentation` - Generate presentation
2. `get_available_brands` - List brands
3. `export_presentation` - Export to PDF/PNG
4. `get_generation_stats` - Performance metrics
5. `get_server_status` - System health

**Tool Schema**:
```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}
```

**Error Handling**:
- McpError with standardized error codes
- Rate limit enforcement
- Validation error propagation

## Data Flow

### Presentation Generation Workflow

```
1. User submits prompt
   ↓
2. Validate request (Zod)
   ↓
3. Detect/verify brand
   ↓
4. [Parallel] Research & Narrative Generation
   ├── Research engine retrieves information
   └── Story engine generates slides
   ↓
5. Apply brand styling to slides
   ↓
6. Generate diagrams for diagram slides
   ↓
7. Build Canva presentation
   ├── Create design
   ├── For each slide:
   │  ├── Create page
   │  ├── Add text elements
   │  ├── Add images/diagrams
   │  └── Apply branding
   └── Export/serve design
   ↓
8. Return design reference & stats
```

### Request Validation Flow

```
Raw Request
   ↓
Type Check
   ↓
Schema Validation (Zod)
   ├── Success → Validated object
   └── Error → Throw ZodError
   ↓
Business Logic Validation
   ├── Brand verification
   ├── Constraint checking
   └── Dependency validation
   ↓
Processing
```

## Deployment Architecture

### REST API Mode

```
Client → Express Server → Orchestrator → Canva API
                      ↓
                  Logger
                      ↓
                  File System
```

### MCP Mode

```
AI Agent → MCP Client → stdio transport → MCP Server
                                    ↓
                            Orchestrator → Canva API
```

### containerized Deployment

```
┌─────────────────────────────────┐
│      Docker Container           │
├─────────────────────────────────┤
│  Node.js 20 Alpine              │
│  ├─ Application Code            │
│  ├─ Dependencies                 │
│  └─ Logs Directory               │
└─────┬──────────────┬─────────────┘
      │              │
 Port 3000      Port 3001
  (REST API)    (MCP Server)
```

## Performance Optimization

### Timeline Target: < 60 seconds

1. **Story Generation** (< 10s)
   - Template selection: ~100ms
   - Slide generation: ~50-100ms per slide
   - Parallel feasibility: High

2. **Branding** (< 5s)
   - Profile lookup: ~10ms
   - Styling application: ~20-50ms per slide
   - Asset loading: ~500ms

3. **Diagram Generation** (< 10s)
   - Type detection: ~50ms
   - Mermaid code generation: ~100-500ms
   - Image conversion: ~2-5s

4. **Canva Operations** (< 30s)
   - Design creation: ~1-2s
   - Slide creation (per slide): ~500-1000ms
   - Text/image adding (per element): ~200-500ms
   - Template application: ~1-2s

### Optimization Strategies

1. **Async/Parallel Execution**
   - Research and narrative generation in parallel
   - Multiple slide creation parallelization

2. **Caching**
   - Brand profile preload
   - Research results caching
   - Diagram template caching

3. **Connection Pooling**
   - Axios connection reuse
   - Keep-alive for Canva API

4. **Lazy Loading**
   - Load only needed brand profiles
   - On-demand research retrieval

## Extensibility

### Adding New Brands

```typescript
const newBrand: BrandProfile = {
  vendorName: "NewCompany",
  companyName: "New Company Inc.",
  primaryColor: "#FF0000",
  // ... other properties
};

brandEngine.registerCustomBrand(newBrand);
```

### Adding New Narrative Frameworks

Extend `StoryEngine`:
```typescript
private getCustomFramework(numberOfSlides: number): string[] {
  return [/* slide types */];
}
```

### Adding New Diagram Types

Extend `DiagramEngine`:
```typescript
private generateCustomDiagram(description: string): string {
  return `graph TB\n...`;
}
```

### Adding New Research Sources

Extend `ResearchEngine`:
```typescript
async research(vendor: string, topic: string): Promise<ResearchSource[]> {
  // Call your API
  // Process results
  // Return sources
}
```

## Error Handling Strategy

### Levels

1. **Validation Errors** (400)
   - Invalid schema
   - Missing required fields
   - Type mismatches

2. **Business Logic Errors** (400)
   - Unknown brand
   - Invalid configuration
   - Constraint violations

3. **API Errors** (500)
   - Canva API failures
   - Network timeouts
   - Rate limit exceeded

4. **System Errors** (500)
   - Database issues
   - File system problems
   - Unexpected exceptions

### Recovery Mechanisms

- Exponential backoff for API retries
- Fallback templates for missing resources
- Graceful degradation for optional features
- Circuit breaker pattern for external APIs

## Security Considerations

### Input Security

- All inputs validated with Zod
- Size limits enforced
- Sanitization of text content
- XSS prevention in slide text

### API Security

- Bearer token authentication
- Environment variable secrets
- HTTPS enforced in production
- API key rotation support

### Rate Limiting

- Per-client request throttling
- DDoS mitigation
- Fair resource allocation

### Logging Security

- No secrets logged
- No PII in logs
- Structured logging format
- Log rotation policies

## Monitoring and Observability

### Metrics

- Request latency percentiles (p50, p95, p99)
- Error rates by type
- Cache hit rates
- API response times

### Tracing

- Request ID propagation
- Call flow visualization
- Performance bottleneck identification

### Alerts

- Error rate threshold
- Response time SLA violations
- API quota approaching

## Future Architecture Enhancements

1. **Microservices**
   - Separate services for each engine
   - Event-driven orchestration

2. **Database Layer**
   - Presentation history tracking
   - User preferences storage
   - Analytics data

3. **Caching Layer**
   - Redis for distributed caching
   - Template memoization

4. **Message Queue**
   - Async presentation generation
   - Job scheduling and management

5. **ML Integration**
   - Content quality scoring
   - Personalization models
   - Anomaly detection
