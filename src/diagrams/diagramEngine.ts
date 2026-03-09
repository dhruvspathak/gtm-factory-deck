import { logger } from "../utils/logger.js";

/**
 * Diagram Engine - Generates architecture diagrams using Mermaid
 */
export class DiagramEngine {
  /**
   * Generate architecture diagram from description
   */
  async generateArchitectureDiagram(
    description: string,
    vendor: string
  ): Promise<string> {
    logger.info("Generating architecture diagram", { vendor });

    const mermaidCode = this.descriptionToMermaid(description, vendor);
    logger.debug("Mermaid diagram generated", {
      vendor,
      lines: mermaidCode.split("\n").length,
    });

    return mermaidCode;
  }

  /**
   * Convert description to Mermaid syntax
   */
  private descriptionToMermaid(description: string, vendor: string): string {
    const lowerDesc = description.toLowerCase();

    // Detect diagram type
    if (
      lowerDesc.includes("pipeline") ||
      lowerDesc.includes("flow") ||
      lowerDesc.includes("process")
    ) {
      return this.generateFlowDiagram(description, vendor);
    } else if (lowerDesc.includes("architecture")) {
      return this.generateArchitectureDiagram(description, vendor);
    } else if (
      lowerDesc.includes("integration") ||
      lowerDesc.includes("ecosystem")
    ) {
      return this.generateIntegrationDiagram(description, vendor);
    }

    return this.generateGenericDiagram(description, vendor);
  }

  /**
   * Generate flow diagram
   */
  private generateFlowDiagram(description: string, vendor: string): string {
    return `graph LR
    A["Developer"] -->|Push Code| B["Version Control<br/>GitHub/GitLab"]
    B -->|Trigger| C["${vendor} SAST/SCA"]
    C -->|Analysis| D["Security Scan"]
    D -->|Results| E["CI/CD Pipeline"]
    E -->|Deploy| F["Kubernetes Cluster"]
    F -->|Running| G["Production Environment"]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#fce4ec
    style E fill:#e0f2f1
    style F fill:#fff9c4
    style G fill:#c8e6c9`;
  }

  /**
   * Generate architecture diagram
   */
  private generateArchitectureDiagram(
    description: string,
    vendor: string
  ): string {
    return `graph TB
    subgraph "Presentation Layer"
      UI["Web UI / Dashboard"]
    end
    
    subgraph "API Layer"
      API["REST API"]
      WS["WebSocket"]
    end
    
    subgraph "Application Layer"
      AUTH["Authentication"]
      SCAN["Scanning Engine"]
      REPORT["Reporting"]
    end
    
    subgraph "Data Layer"
      DB["PostgreSQL"]
      CACHE["Redis Cache"]
    end
    
    subgraph "External Integration"
      GIT["Git Integration"]
      REG["Container Registry"]
    end
    
    UI --> API
    UI --> WS
    API --> AUTH
    API --> SCAN
    API --> REPORT
    AUTH --> DB
    SCAN --> CACHE
    REPORT --> DB
    GIT --> SCAN
    REG --> SCAN
    
    style UI fill:#e1f5ff
    style API fill:#fff3e0
    style AUTH fill:#f3e5f5
    style SCAN fill:#fce4ec
    style REPORT fill:#e0f2f1
    style DB fill:#fff9c4
    style CACHE fill:#c8e6c9`;
  }

  /**
   * Generate integration diagram
   */
  private generateIntegrationDiagram(
    description: string,
    vendor: string
  ): string {
    return `graph LR
    A["Enterprise<br/>System"] --> B["${vendor}<br/>Platform"]
    C["SIEM"] --> B
    D["SOAR"] --> B
    E["Ticketing<br/>System"] --> B
    F["Vulnerability<br/>Scanner"] --> B
    
    B --> G["Threat<br/>Intelligence"]
    B --> H["Remediation<br/>Engine"]
    B --> I["Reporting<br/>Dashboard"]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0,stroke:#ff9800,stroke-width:3px
    style C fill:#f3e5f5
    style D fill:#fce4ec
    style E fill:#e0f2f1
    style F fill:#fff9c4
    style G fill:#c8e6c9
    style H fill:#b3e5fc
    style I fill:#c8e6c9`;
  }

  /**
   * Generate generic diagram
   */
  private generateGenericDiagram(description: string, vendor: string): string {
    return `graph TB
    A["Input"] --> B["Processing<br/>${vendor}"]
    B --> C["Analysis"]
    C --> D["Output"]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0,stroke:#ff9800,stroke-width:3px
    style C fill:#f3e5f5
    style D fill:#c8e6c9`;
  }

  /**
   * Generate sequence diagram for interactions
   */
  generateSequenceDiagram(actors: string[], interactions: string[]): string {
    let diagram = "sequenceDiagram\n";

    for (const actor of actors) {
      diagram += `participant ${actor}\n`;
    }

    for (const interaction of interactions) {
      diagram += `${interaction}\n`;
    }

    return diagram;
  }

  /**
   * Generate deployment diagram
   */
  generateDeploymentDiagram(environment: string): string {
    return `graph TB
    subgraph "Cloud Provider"
      subgraph "Kubernetes Cluster"
        POD1["Pod 1<br/>Replica-1"]
        POD2["Pod 2<br/>Replica-2"]
        POD3["Pod 3<br/>Replica-3"]
      end
      
      subgraph "Storage"
        PV["Persistent<br/>Volume"]
      end
      
      subgraph "Networking"
        LB["Load Balancer"]
        INGRESS["Ingress Controller"]
      end
    end
    
    LB --> INGRESS
    INGRESS --> POD1
    INGRESS --> POD2
    INGRESS --> POD3
    POD1 --> PV
    POD2 --> PV
    POD3 --> PV
    
    style POD1 fill:#e1f5ff
    style POD2 fill:#e1f5ff
    style POD3 fill:#e1f5ff
    style PV fill:#fff3e0
    style LB fill:#f3e5f5
    style INGRESS fill:#fce4ec`;
  }

  /**
   * Export diagram as URL (for Mermaid Live Editor)
   */
  generateMermaidUrl(mermaidCode: string): string {
    const encoded = Buffer.from(mermaidCode).toString("base64");
    return `https://mermaid.live/edit#pako:${encoded}`;
  }
}

export default DiagramEngine;
