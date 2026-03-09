# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-09

### Added

- Initial release of GTM AI Deck Factory
- **Core Features**
  - AI-powered narrative generation with multiple frameworks
  - Automatic vendor brand detection and styling
  - Architecture diagram generation using Mermaid
  - Canva integration for professional presentations
  - Model Context Protocol (MCP) server for AI agent integration

- **Brand Engines**
  - Checkmarx brand profile (ASPM focus)
  - Forescout brand profile (NAC focus)
  - OpenText brand profile (Cybersecurity platform)
  - Custom brand registration support

- **Narrative Frameworks**
  - Standard presales framework (14 slide types)
  - Technical architecture framework (12 slides)
  - Competitive positioning framework (12 slides)

- **Diagram Types**
  - Flow/pipeline diagrams (DevSecOps, processes)
  - Architecture diagrams (system components, data flow)
  - Integration diagrams (ecosystems, third-party connections)
  - Deployment diagrams (Kubernetes, cloud infrastructure)
  - Sequence diagrams
  - Mermaid Live Editor URL generation

- **API Endpoints**
  - POST /api/presentations - Create presentation
  - GET /api/brands - List available brands
  - GET /api/status - Server status
  - POST /api/presentations/:designId/export - Export presentation
  - GET /health - Health check

- **MCP Tools**
  - create_presentation - Generate presentations
  - get_available_brands - List brands
  - export_presentation - Export to PDF/PNG
  - get_generation_stats - Performance metrics
  - get_server_status - System health

- **Security**
  - Zod input validation
  - Rate limiting (100 requests/minute default)
  - Environment variable secret management
  - API key security

- **Observability**
  - Winston structured logging
  - Console and file-based logging
  - JSON log format
  - Error tracking

- **Testing**
  - Unit tests for all core engines
  - Integration tests for full workflow
  - Validation tests using Zod schemas
  - Vitest with coverage reporting

- **Deployment**
  - Docker multi-stage builds
  - Docker Compose support
  - Kubernetes deployment manifests
  - GitHub Actions CI/CD pipeline
  - Health check endpoints

- **Documentation**
  - README with features and quick start
  - ARCHITECTURE.md with technical design
  - DEPLOYMENT.md with deployment guides
  - CONTRIBUTING.md for contributors
  - EXAMPLES.md with usage patterns
  - This CHANGELOG

### Technical Stack

- Runtime: Node.js 20+
- Language: TypeScript
- API Framework: Express.js
- Protocol: Model Context Protocol (MCP)
- Testing: Vitest
- Linting: ESLint
- Logging: Winston
- Validation: Zod
- Container: Docker, Docker Compose
- CI/CD: GitHub Actions

### Performance

- Presentation generation target: < 60 seconds
- Story generation: < 10 seconds
- Diagram generation: < 10 seconds
- Canva operations: < 30 seconds

### Project Structure

```
src/
├── brand/          # Brand management & styling
├── narrative/      # Presales narrative generation
├── diagrams/       # Architecture diagram generation
├── research/       # Information retrieval (extensible)
├── canva/          # Canva API client & service
├── orchestrator/   # Main workflow coordinator
├── mcp/            # MCP server & tools
├── security/       # Validation & rate limiting
├── utils/          # Logging & utilities
└── tests/          # Comprehensive test suite
```

## Future Roadmap

### Planned Features

- [ ] Salesforce CRM integration for deal-specific presentations
- [ ] RFP answer automation and integration
- [ ] Internal knowledge base integration
- [ ] Real-time collaboration features
- [ ] Advanced analytics and engagement tracking
- [ ] Multi-language support
- [ ] Custom brand profile management UI
- [ ] Presentation versioning and history
- [ ] OpenTelemetry integration for distributed tracing
- [ ] Prometheus metrics export

### Potential Integrations

- Salesforce Commerce Cloud
- Slack notifications
- Microsoft Teams integration
- Google Drive/OneDrive backup
- AWS S3 for presentation storage
- Stripe for future monetization

### Infrastructure Improvements

- Redis caching layer
- PostgreSQL database for persistence
- Message queue (RabbitMQ/AWS SQS)
- Microservices architecture
- API Gateway
- GraphQL API layer

## Compatibility

- **Supported Platforms**: Linux, macOS, Windows
- **Node.js**: 20.0.0 and above
- **Container Runtime**: Docker 20.0+, Kubernetes 1.24+
- **Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Known Issues

None at this time.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- GitHub Issues for bug reports and features
- GitHub Discussions for questions and ideas
- Email: support@example.com for general inquiries

---

**Note**: Version 1.0.0 represents the initial release with core functionality. Future versions will build upon this foundation with additional features and integrations.
