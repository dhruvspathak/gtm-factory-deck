# Contributing to GTM AI Deck Factory

Thank you for your interest in contributing to the GTM AI Deck Factory! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report issues responsibly

## Getting Started

### Prerequisites

- Node.js v20+
- npm or yarn
- Git
- Basic knowledge of TypeScript

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/yourusername/gtm-deck-factory.git
cd gtm-deck-factory
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/original/gtm-deck-factory.git
```

4. Install dependencies:

```bash
npm install
```

5. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

6. Set up environment:

```bash
cp .env.example .env.development
# Edit .env.development with your values
```

## Development Workflow

### Making Changes

1. Make your changes in your feature branch
2. Keep commits atomic and descriptive
3. Write clear commit messages:

```
feat: Add support for Salesforce integration
- Implement Salesforce API client
- Add brand detection for Salesforce
- Write unit tests

Closes #123
```

### Code Style

- Follow TypeScript strict mode
- Use ESLint for linting
- Format code with Prettier (coming soon)

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing Requirements

- Write tests for new features
- Maintain > 80% code coverage
- All tests must pass before submitting PR

```bash
# Run tests
npm run test

# Check coverage
npm run test:coverage
```

### Building

```bash
# Build TypeScript
npm run build

# Should generate dist/ directory with no errors
```

## Development Guidelines

### Architecture Principles

1. **Modularity**
   - Each engine is independent
   - Minimal coupling between modules
   - Clear interfaces

2. **Type Safety**
   - Use TypeScript strictly
   - Define interfaces for contracts
   - Validate external inputs with Zod

3. **Error Handling**
   - Explicit error types
   - Meaningful error messages
   - Proper logging

4. **Testability**
   - Write testable code
   - Use dependency injection
   - Mock external dependencies

### Adding a New Brand

1. Create brand profile in `src/brand/profiles/brands.json`:

```json
{
  "newvendor": {
    "vendorName": "New Vendor",
    "companyName": "New Vendor Inc.",
    "primaryColor": "#0066CC",
    "secondaryColor": "#00A3E0",
    "accentColor": "#FF6B35",
    "logoAssetId": "newvendor-logo",
    "logoUrl": "https://example.com/logo.png",
    "slideTemplate": "newvendor-template",
    "logoPosition": "bottom-left",
    "fontFamily": "Inter, sans-serif",
    "backgroundStyle": "gradient",
    "backgroundColor": "#F5F7FA"
  }
}
```

2. Add research sources in `src/research/researchEngine.ts`:

```typescript
this.mockSources.set("newvendor", [
  {
    type: "documentation",
    title: "New Vendor Overview",
    content: "...",
    vendor: "newvendor",
  },
]);
```

3. Add tests in `src/tests/brand.test.ts`:

```typescript
it("should detect newvendor brand", () => {
  const detected = brandEngine.detectBrand(
    "Create a presentation for New Vendor platform"
  );
  expect(detected?.toLowerCase()).toContain("newvendor");
});
```

### Adding a New Narrative Framework

1. Extend `src/narrative/storyEngine.ts`:

```typescript
private getCustomFramework(numberOfSlides: number): string[] {
  return [
    "TITLE_SLIDE",
    "YOUR_CUSTOM_SLIDE_TYPE_1",
    "YOUR_CUSTOM_SLIDE_TYPE_2",
    // ...
  ];
}
```

2. Add slide content generation:

```typescript
case "YOUR_CUSTOM_SLIDE_TYPE":
  return {
    title: "Your Title",
    body: "Your content",
    layout: "content",
    notes: "Notes",
  };
```

3. Add tests and update prompt detection logic

### Adding a New Diagram Type

1. Extend `src/diagrams/diagramEngine.ts`:

```typescript
private generateCustomDiagram(description: string, vendor: string): string {
  return `graph LR
    A[Start] --> B[Your Diagram]
    B --> C[End]`;
}
```

2. Update `descriptionToMermaid()` to detect your diagram type

3. Add tests

### Creating Tests

Use Vitest for testing:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import MyModule from "../../src/path/MyModule.js";

describe("MyModule", () => {
  let module: MyModule;

  beforeEach(() => {
    module = new MyModule();
  });

  it("should do something", () => {
    const result = module.doSomething();
    expect(result).toBeDefined();
  });
});
```

## Submitting Changes

### Before Submitting

1. Update tests to reflect your changes
2. Update documentation if needed
3. Ensure all tests pass:

```bash
npm run test
npm run lint
npm run build
```

4. Update CHANGELOG.md

### Creating a Pull Request

1. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

2. Create a Pull Request on GitHub with:
   - Clear title
   - Description of changes
   - Link to related issue
   - Screenshots/examples if applicable

3. PR Template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #123

## How Has This Been Tested?
Testing instructions

## Screenshots (if applicable)

## Checklist
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No new warnings
```

### PR Review Process

- Maintainers will review within 2-3 days
- Feedback will be provided for improvements
- Once approved, PR will be merged

## Documentation

### Updating Documentation

1. Update relevant `.md` files
2. Keep documentation consistent with code
3. Use clear, concise language
4. Include examples where appropriate

### Important Files

- `README.md` - Project overview
- `ARCHITECTURE.md` - Technical design
- `DEPLOYMENT.md` - Deployment guide
- `EXAMPLES.md` - Usage examples
- `API.md` - API documentation (to be created)

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Relevant logs

### Feature Requests

Include:
- Use case
- Proposed solution
- Alternative solutions
- Related issues

## Project Structure

```
src/
├── brand/          # Brand management
├── narrative/      # Story generation
├── diagrams/       # Diagram generation
├── research/       # Information retrieval
├── canva/          # Canva integration
├── orchestrator/   # Main workflow
├── mcp/            # MCP server
├── security/       # Validation & security
├── utils/          # Utilities & logging
└── tests/          # Test files
```

## Performance Considerations

### Performance Targets

- Story generation: < 10s
- Diagram generation: < 10s
- Canva operations: < 30s
- **Total: < 60s**

### Optimization Tips

1. Use parallelization where possible
2. Cache frequently accessed data
3. Lazy load optional features
4. Monitor for performance regressions

## Security Considerations

1. Never log secrets or API keys
2. Validate all external inputs
3. Use environment variables for config
4. Keep dependencies updated
5. Follow secure coding practices

## Dependencies

### Adding New Dependencies

- Use `npm install` (for production)
- Use `npm install --save-dev` (for dev)
- Minimize external dependencies
- Check license compatibility
- Document why dependency is needed

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update safely
npm update

# Audit for vulnerabilities
npm audit
```

## Commit Message Guidelines

Format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Build/dependency changes

Example:

```
feat(narrative): Add custom framework support

Allow users to define custom narrative frameworks
for presentation generation.

Closes #456
```

## Release Process

Maintainers handle releases. Process:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Tag release on Git
4. Publish to npm (if applicable)

## Communication

- **Issues** - Bug reports and features
- **Discussions** - Questions and ideas
- **Pull Requests** - Code changes
- **Email** - security@example.com (security issues)

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Canva API Documentation](https://www.canva.dev/)

## Frequently Asked Questions

**Q: How long does it take for a PR to be reviewed?**
A: Usually 2-3 days, depending on complexity.

**Q: What if my PR is rejected?**
A: We'll provide feedback. Feel free to reopen discussion.

**Q: Can I work on multiple features?**
A: Yes, create separate branches for each feature.

**Q: Where can I get help?**
A: Open an issue or join our discussions.

## Thank You

Thank you for contributing! Your help makes this project better for everyone.

---

Happy coding! 🚀
