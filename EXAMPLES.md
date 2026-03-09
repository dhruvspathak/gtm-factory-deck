# Example Requests

## Basic Presentation Creation

### Using cURL

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a 12-slide CIO-level presentation explaining Checkmarx ASPM for BFSI enterprises.",
    "brand": "checkmarx",
    "numberOfSlides": 12,
    "tone": "executive"
  }'
```

### Using JavaScript

```javascript
const response = await fetch('http://localhost:3000/api/presentations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a 12-slide CIO-level presentation explaining Checkmarx ASPM for BFSI enterprises.',
    brand: 'checkmarx',
    numberOfSlides: 12,
    tone: 'executive'
  })
});

const result = await response.json();
console.log('Design ID:', result.design.designId);
```

### Using Python

```python
import requests

response = requests.post(
  'http://localhost:3000/api/presentations',
  json={
    'prompt': 'Create a 12-slide CIO-level presentation explaining Checkmarx ASPM for BFSI enterprises.',
    'brand': 'checkmarx',
    'numberOfSlides': 12,
    'tone': 'executive'
  }
)

result = response.json()
print(f"Design ID: {result['design']['designId']}")
```

## Brand Detection (Auto-detection)

```bash
# No explicit brand - system detects from prompt
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a presales presentation for Forescout NAC platform targeting healthcare networks."
  }'
```

## Different Narrative Tones

### Technical Tone

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a technical deep-dive presentation on OpenText Cybersecurity architecture.",
    "tone": "technical",
    "numberOfSlides": 15
  }'
```

### Mixed Tone

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain Checkmarx ASPM solution for security teams.",
    "tone": "mixed",
    "numberOfSlides": 10
  }'
```

## Competitive Presentations

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a competitive analysis presentation comparing Checkmarx and Forescout for enterprise security.",
    "numberOfSlides": 12
  }'
```

## Export Presentation

```bash
# Export as PDF
curl -X POST http://localhost:3000/api/presentations/design_123/export \
  -H "Content-Type: application/json" \
  -d '{"format": "pdf"}'

# Export as PNG
curl -X POST http://localhost:3000/api/presentations/design_123/export \
  -H "Content-Type: application/json" \
  -d '{"format": "png"}'
```

## Get Available Brands

```bash
curl http://localhost:3000/api/brands
```

Response:

```json
{
  "brands": ["Checkmarx", "Forescout", "OpenText"]
}
```

## Server Status

```bash
curl http://localhost:3000/api/status
```

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

## Health Check

```bash
curl http://localhost:3000/health
```

## Advanced Examples

### Industry-Specific Presentation

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a healthcare-specific presentation on Forescout NAC solution addressing HIPAA compliance requirements, network segmentation, and medical device security. Target: CISO audience. Focus on risk mitigation and operational efficiency.",
    "brand": "forescout",
    "numberOfSlides": 15,
    "tone": "executive"
  }'
```

### Large Presentation

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a comprehensive 30-slide presentation on Checkmarx ASPM for enterprise application security program. Include executive summary, technical architecture, implementation roadmap, best practices, and ROI analysis.",
    "numberOfSlides": 30,
    "tone": "mixed"
  }'
```

### Quick Presentation

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a 5-slide executive summary on OpenText Cybersecurity Platform.",
    "numberOfSlides": 5,
    "tone": "executive"
  }'
```

## Using with Node.js SDK

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 60000
});

async function createPresentation() {
  try {
    const response = await client.post('/api/presentations', {
      prompt: 'Create a presales deck on Checkmarx security solutions',
      brand: 'checkmarx',
      numberOfSlides: 12,
      tone: 'executive'
    });

    const { design, stats } = response.data;

    console.log('Presentation created!');
    console.log(`Design ID: ${design.designId}`);
    console.log(`URL: ${design.url}`);
    console.log(`Generation time: ${stats.totalTime}ms`);

    // Export presentation
    const exportResponse = await client.post(
      `/api/presentations/${design.designId}/export`,
      { format: 'pdf' }
    );

    console.log(`PDF Export: ${exportResponse.data.url}`);
  } catch (error) {
    console.error('Failed:', error.response?.data || error.message);
  }
}

createPresentation();
```

## Using with TypeScript Orchestrator Directly

```typescript
import DeckOrchestrator from './src/orchestrator/deckOrchestrator';

async function main() {
  const orchestrator = new DeckOrchestrator();

  const design = await orchestrator.generatePresentation({
    prompt: 'Create a Checkmarx ASPM presentation for enterprise security teams',
    brand: 'checkmarx',
    numberOfSlides: 12,
    tone: 'executive'
  });

  console.log('Design created:', design);
  console.log('Stats:', orchestrator.getStats());
}

main().catch(console.error);
```

