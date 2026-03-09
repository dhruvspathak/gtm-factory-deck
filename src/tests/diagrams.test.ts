import { describe, it, expect, beforeEach } from "vitest";
import DiagramEngine from "../../src/diagrams/diagramEngine.js";

describe("DiagramEngine", () => {
  let diagramEngine: DiagramEngine;

  beforeEach(() => {
    diagramEngine = new DiagramEngine();
  });

  it("should generate flow diagram", async () => {
    const diagram = await diagramEngine.generateArchitectureDiagram(
      "DevSecOps pipeline flow",
      "Checkmarx"
    );

    expect(diagram).toBeDefined();
    expect(diagram).toContain("graph");
  });

  it("should generate architecture diagram", async () => {
    const diagram = await diagramEngine.generateArchitectureDiagram(
      "System architecture overview",
      "Checkmarx"
    );

    expect(diagram).toBeDefined();
    expect(diagram).toContain("graph");
  });

  it("should generate integration diagram", async () => {
    const diagram = await diagramEngine.generateArchitectureDiagram(
      "Third-party integrations and ecosystem",
      "Checkmarx"
    );

    expect(diagram).toBeDefined();
    expect(diagram).toContain("graph");
  });

  it("should generate sequence diagram", () => {
    const diagram = diagramEngine.generateSequenceDiagram(
      ["Developer", "System", "Database"],
      [
        "Developer->>System: Request",
        "System->>Database: Query",
        "Database-->>System: Result",
        "System-->>Developer: Response",
      ]
    );

    expect(diagram).toContain("sequenceDiagram");
    expect(diagram).toContain("Developer");
    expect(diagram).toContain("System");
  });

  it("should generate deployment diagram", () => {
    const diagram = diagramEngine.generateDeploymentDiagram("kubernetes");

    expect(diagram).toBeDefined();
    expect(diagram).toContain("graph");
    expect(diagram).toContain("Kubernetes");
  });

  it("should generate Mermaid URL", () => {
    const mermaidCode = "graph LR\nA[Start] --> B[End]";
    const url = diagramEngine.generateMermaidUrl(mermaidCode);

    expect(url).toContain("https://mermaid.live");
    expect(url).toContain("pako:");
  });
});
