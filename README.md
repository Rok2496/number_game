# Horror Game - Docker and Kubernetes Deployment

This repository contains a horror-themed game with Docker and Kubernetes configurations for deployment.

## Docker Deployment

### Local Development

1. Build and run using Docker Compose:
```bash
docker-compose up --build
```

2. Access the application:
- Frontend: http://localhost:3000
- Redis: localhost:6379

### Production Build

1. Build the Docker image:
```bash
docker build -t horror-game-frontend:latest ./frontend
```

2. Run the container:
```bash
docker run -p 80:80 horror-game-frontend:latest
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (e.g., minikube, Docker Desktop Kubernetes, or cloud provider)
- kubectl configured to access your cluster
- Helm (optional, for package management)

### Deployment Steps

1. Create the namespace:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Deploy Redis:
```bash
kubectl apply -f k8s/redis-pvc.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/redis-service.yaml
```

3. Deploy the frontend:
```bash
kubectl apply -f k8s/nginx-configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

4. Verify the deployment:
```bash
kubectl get all -n horror-game
```

### Accessing the Application

1. Get the LoadBalancer IP/port:
```bash
kubectl get svc horror-game-frontend -n horror-game
```

2. Access the application using the external IP provided.

## Configuration

### Environment Variables

- `NODE_ENV`: Set to 'development' or 'production'
- Additional environment variables can be configured in the Kubernetes deployment files

### Resource Limits

The application is configured with the following resource limits:

Frontend:
- CPU: 100m-300m
- Memory: 128Mi-256Mi

Redis:
- CPU: 100m-200m
- Memory: 128Mi-256Mi

### Scaling

To scale the frontend deployment:
```bash
kubectl scale deployment horror-game-frontend -n horror-game --replicas=5
```

## Monitoring

Health check endpoints:
- Frontend: `/health`
- Redis: TCP check on port 6379

## Troubleshooting

1. Check pod status:
```bash
kubectl get pods -n horror-game
```

2. View pod logs:
```bash
kubectl logs -f <pod-name> -n horror-game
```

3. Check deployment events:
```bash
kubectl describe deployment <deployment-name> -n horror-game
```

## Security

The deployment includes:
- NGINX security headers
- Resource limits
- Readiness/liveness probes
- Persistent storage for Redis
- Network policies (implicit)

## Maintenance

1. Update images:
```bash
kubectl set image deployment/horror-game-frontend frontend=horror-game-frontend:new-tag -n horror-game
```

2. Rolling restarts:
```bash
kubectl rollout restart deployment horror-game-frontend -n horror-game
```

3. Monitor rollout status:
```bash
kubectl rollout status deployment horror-game-frontend -n horror-game
``` 