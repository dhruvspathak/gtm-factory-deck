# Deployment Guide

## Pre-Deployment Checklist

- [ ] Node.js 20+ installed
- [ ] Canva API credentials obtained
- [ ] Environment variables configured
- [ ] Tests passing locally
- [ ] Security audit completed
- [ ] Docker image built and tested
- [ ] Webhooks configured (if applicable)

## Local Development Deployment

### 1. Setup Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/gtm-deck-factory.git
cd gtm-deck-factory

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with development values
```

### 2. Run Development Server

```bash
# Watch mode with auto-reload
npm run dev

# Server will be available at http://localhost:3000
```

### 3. Run Tests

```bash
# Run full test suite
npm run test

# Run specific test file
npm run test -- src/tests/brand.test.ts

# Generate coverage report
npm run test:coverage
```

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### Build Image

```bash
npm run docker:build
# Or manually:
docker build -t gtm-deck-factory:latest .
```

#### Run Container

```bash
# With environment file
npm run docker:run

# Or manually:
docker run \
  -p 3000:3000 \
  --env-file .env \
  -v ./logs:/app/logs \
  gtm-deck-factory:latest

# With docker-compose
docker-compose up --build
```

#### Environment Variables

Create `.env.production`:

```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
CANVA_API_KEY=your_production_key
CANVA_API_BASE_URL=https://api.canva.com
MCP_PORT=3001
```

#### Health Check

```bash
# Verify container health
docker ps

# Should show: (healthy) status
```

### Option 2: Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Docker image pushed to registry

#### Create ConfigMap and Secret

```bash
# ConfigMap for non-sensitive configuration
kubectl create configmap gtm-deck-factory \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info

# Secret for sensitive data
kubectl create secret generic gtm-deck-factory-secrets \
  --from-literal=CANVA_API_KEY=your_key
```

#### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gtm-deck-factory
  labels:
    app: gtm-deck-factory
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: gtm-deck-factory
  template:
    metadata:
      labels:
        app: gtm-deck-factory
    spec:
      containers:
      - name: gtm-deck-factory
        image: your-registry/gtm-deck-factory:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
          name: api
        - containerPort: 3001
          name: mcp
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: gtm-deck-factory
              key: NODE_ENV
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: gtm-deck-factory
              key: LOG_LEVEL
        - name: CANVA_API_KEY
          valueFrom:
            secretKeyRef:
              name: gtm-deck-factory-secrets
              key: CANVA_API_KEY
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: gtm-deck-factory
  labels:
    app: gtm-deck-factory
spec:
  type: LoadBalancer
  ports:
  - name: api
    port: 80
    targetPort: 3000
  - name: mcp
    port: 3001
    targetPort: 3001
  selector:
    app: gtm-deck-factory
```

#### Deploy to Kubernetes

```bash
kubectl apply -f deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get svc

# View logs
kubectl logs -f deployment/gtm-deck-factory

# Scale deployment
kubectl scale deployment gtm-deck-factory --replicas=5
```

### Option 3: Cloud Platforms

#### AWS Lambda (Serverless)

```bash
# Build for Lambda
npm run build

# Package for deployment
zip -r lambda-deployment.zip dist/ node_modules/ package.json

# Deploy via AWS Console or CLI
aws lambda create-function \
  --function-name gtm-deck-factory \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ROLE \
  --handler dist/index.handler \
  --zip-file fileb://lambda-deployment.zip
```

#### Azure App Service

```bash
# Create App Service Plan
az appservice plan create \
  --name gtm-deck-factory-plan \
  --resource-group your-rg \
  --sku B2

# Create Web App
az webapp create \
  --resource-group your-rg \
  --plan gtm-deck-factory-plan \
  --name gtm-deck-factory \
  --runtime "node|20"

# Deploy
az webapp deployment source config-zip \
  --resource-group your-rg \
  --name gtm-deck-factory \
  --src deploy.zip
```

#### Digital Ocean App Platform

```bash
# Create app.yaml
cat > app.yaml <<EOF
name: gtm-deck-factory
services:
- name: api
  github:
    repo: yourusername/gtm-deck-factory
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 3000
  envs:
  - key: NODE_ENV
    value: production
  - key: CANVA_API_KEY
    value: \${CANVA_API_KEY}
EOF

# Deploy
doctl apps create --spec app.yaml
```

## Configuration Management

### Environment Variables

```bash
# API Configuration
PORT=3000
NODE_ENV=production

# Canva API
CANVA_API_KEY=xxx
CANVA_API_BASE_URL=https://api.canva.com

# MCP
MCP_PORT=3001
MCP_MODE=false

# Logging
LOG_LEVEL=info

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Optional
OTEL_ENABLED=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

### Configuration Files

Store non-sensitive config in `config/` directory:

```yaml
# config/production.yaml
server:
  port: 3000
  timeout: 30000

api:
  rateLimit:
    maxRequests: 100
    windowMs: 60000

logging:
  level: info
  format: json
```

## Scaling Considerations

### Vertical Scaling

```bash
# Increase container resources
docker run \
  -m 2g \
  --cpus 2 \
  gtm-deck-factory:latest
```

### Horizontal Scaling

```bash
# Docker Swarm
docker swarm init
docker service create \
  --replicas 3 \
  --name gtm-deck-factory \
  gtm-deck-factory:latest

# Kubernetes
kubectl scale deployment gtm-deck-factory --replicas=5
```

### Load Balancing

```nginx
# nginx.conf
upstream gtm_factory {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://gtm_factory;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring and Logging

### Log Aggregation

#### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# With docker-compose
docker-compose -f docker-compose.yml \
               -f docker-compose.elk.yml \
               up
```

#### Loki + Grafana

```yaml
# loki-config.yaml
auth_enabled: false
server:
  http_listen_port: 3100
  log_level: info

ingester:
  chunk_idle_period: 3m
  max_chunk_age: 1h
```

### Metrics Collection

```bash
# Prometheus scrape config
scrape_configs:
  - job_name: 'gtm-deck-factory'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

## Backup and Disaster Recovery

### Data Backup Strategy

```bash
# Backup logs and data
tar -czf backup-$(date +%Y%m%d).tar.gz ./logs ./data

# Upload to S3
aws s3 cp backup-*.tar.gz s3://your-bucket/backups/
```

### Presentation Export

```bash
# Export all presentations
curl http://localhost:3000/api/presentations \
  -H "Authorization: Bearer ${TOKEN}" | \
  jq '.presentations[] | .designId' | \
  xargs -I {} \
  curl "http://localhost:3000/api/presentations/{}/export" \
    -d '{"format":"pdf"}'
```

## Security Hardening

### SSL/TLS Configuration

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### API Key Rotation

```bash
# Update secrets without downtime
kubectl patch secret gtm-deck-factory-secrets \
  -p '{"data":{"CANVA_API_KEY":"'$(echo -n "new_key" | base64)'"}'

# Verify
kubectl rollout restart deployment/gtm-deck-factory
```

### Network Security

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Performance Tuning

### Node.js Optimization

```bash
# Increase max listeners
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Enable clustering
NODE_CLUSTER=true npm start
```

### Database Connection Pooling

```typescript
// Already configured in CanvaClient via Axios
// Connection reuse via Keep-Alive headers
```

### Caching Strategy

```bash
# Redis caching layer (future)
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### Common Issues

#### Container won't start

```bash
# Check logs
docker logs container_id

# Verify environment variables
docker inspect container_id | grep -A 20 Env

# Test startup locally
npm start
```

#### High memory usage

```bash
# Check process
ps aux | grep node

# Monitor in real-time
top -p $(pgrep node)

# Increase heap
NODE_OPTIONS="--max-old-space-size=4096"
```

#### API rate limiting

```bash
# Adjust rate limiter in security/rateLimiter.ts
const rateLimiter = new RateLimiter(200, 60000); // 200/min

# Or via environment
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW=60000
```

#### Canva API errors

```bash
# Check API key validity
curl -H "Authorization: Bearer ${CANVA_API_KEY}" \
  https://api.canva.com/v1/designs

# Check rate limits in response headers
grep "X-RateLimit" response.headers

# Log Canva responses
LOG_LEVEL=debug npm start
```

## Rollback Procedures

### Container Rollback

```bash
# List image versions
docker images gtm-deck-factory

# Revert to previous version
docker run gtm-deck-factory:previous-version
```

### Kubernetes Rollback

```bash
# Check rollout history
kubectl rollout history deployment/gtm-deck-factory

# Rollback to previous revision
kubectl rollout undo deployment/gtm-deck-factory

# Rollback to specific revision
kubectl rollout undo deployment/gtm-deck-factory --to-revision=2
```

## Maintenance Windows

### Blue-Green Deployment

```bash
# Deploy new version as "green"
kubectl set image deployment/gtm-deck-factory-green \
  gtm-deck-factory=gtm-deck-factory:v2.0.0

# Verify new version
kubectl get pods -l version=green

# Switch traffic
kubectl patch service gtm-deck-factory \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Keep blue for quick rollback
```

## Performance Benchmarking

```bash
# Load testing
npm run load-test

# Generates reports in ./reports/
```

## Documentation

For more information:
- See [README.md](README.md) for overview
- See [ARCHITECTURE.md](ARCHITECTURE.md) for technical design
- Check [examples/](examples/) for usage patterns
